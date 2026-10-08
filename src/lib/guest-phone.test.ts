import { describe, expect, it, vi } from "vitest";
import { forwardGuestPhone, validateGuestPhone } from "../../supabase/functions/_shared/guest-phone";
import { resolveGuestPhoneWorkspace } from "../../supabase/functions/_shared/guest-phone-workspace";

describe("confirmação de celular", () => {
  it("resolve abmnb pelo workspace sem depender de qualquer imóvel", async () => {
    const tenant = { id: "workspace-abmnb", slug: "abmnb" };
    const lookup = vi.fn().mockResolvedValue(tenant);
    const history = vi.fn();
    expect(await resolveGuestPhoneWorkspace("abmnb", lookup, history)).toEqual(tenant);
    expect(lookup).toHaveBeenCalledWith("slug", "abmnb");
    expect(history).not.toHaveBeenCalled();
  });
  it("mantém o endereço anterior ligado ao mesmo workspace", async () => {
    const tenant = { id: "workspace-abmnb", slug: "abmnb" };
    const lookup = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(tenant);
    expect(await resolveGuestPhoneWorkspace("abmnb-antigo", lookup, vi.fn().mockResolvedValue(tenant.id))).toEqual(tenant);
    expect(lookup).toHaveBeenLastCalledWith("id", tenant.id);
  });
  it("recusa endereço sem workspace ativo", async () => {
    expect(await resolveGuestPhoneWorkspace("inexistente", vi.fn().mockResolvedValue(null), vi.fn().mockResolvedValue(null))).toBeNull();
  });
  it("envia somente reserva e telefone para o webhook solicitado", async () => {
    const send = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    await expect(forwardGuestPhone({ id_reserva: " ABC123 ", telefone: "+55 (11) 99999-9999" }, send))
      .resolves.toEqual({ success: true });
    expect(send).toHaveBeenCalledWith("https://n8n.mrflow.com.br/webhook/confirmacelular", expect.objectContaining({
      method: "POST", body: JSON.stringify({ id_reserva: "ABC123", telefone: "+5511999999999" }),
    }));
  });
  it("não confirma sucesso se o webhook falhar", async () => {
    await expect(forwardGuestPhone({ id_reserva: "ABC123", telefone: "+5511999999999" },
      vi.fn().mockResolvedValue(new Response(null, { status: 500 })))).rejects.toThrow();
  });
  it("recusa reserva vazia", () => {
    expect(() => validateGuestPhone({ id_reserva: "", telefone: "+5511999999999" })).toThrow();
  });
  it("recusa telefone inválido antes de enviar", async () => {
    const send = vi.fn();
    await expect(forwardGuestPhone({ id_reserva: "ABC123", telefone: "123" }, send)).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });
});