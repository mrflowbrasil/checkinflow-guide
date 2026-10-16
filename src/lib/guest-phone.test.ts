import { describe, expect, it, vi } from "vitest";
import { forwardGuestPhone, validateGuestPhone } from "../../supabase/functions/_shared/guest-phone";
import { resolveGuestPhoneWorkspace } from "../../supabase/functions/_shared/guest-phone-workspace";

describe("confirmação de celular", () => {
  const context = {
    tenant_id: "workspace-abmnb", tenant_name: "ABMnb",
    integration: {
      system_url: "https://example.stays.net", public_site_url: "https://example.com",
      credentials_encrypted: btoa("test-user:test-password"),
    },
  };
  const payload = { id_reserva: "ABC123", telefone: "+5511999999999", nome: "Maria Silva", email: "maria@exemplo.com", cpf: "12345678909" };
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
  it("envia o nome do workspace e os dados Stays com autorização Basic sem converter duas vezes", async () => {
    const send = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    await expect(forwardGuestPhone({ ...payload, id_reserva: " ABC123 ", telefone: "+55 (11) 99999-9999", nome: " Maria  Silva ", email: "MARIA@EXEMPLO.COM", cpf: "123.456.789-09" }, context, send))
      .resolves.toEqual({ success: true });
    expect(send).toHaveBeenCalledWith("https://n8n.mrflow.com.br/webhook/confirmacelular", expect.objectContaining({
      method: "POST", body: JSON.stringify({
        id_reserva: "ABC123", telefone: "+5511999999999", nome: "Maria Silva", email: "maria@exemplo.com",
        cpf: "12345678909",
        tenant_id: "workspace-abmnb", tenant_name: "ABMnb", integration_provider: "stays",
        system_url: "https://example.stays.net", public_site_url: "https://example.com",
        authorization: "Basic dGVzdC11c2VyOnRlc3QtcGFzc3dvcmQ=",
      }),
    }));
  });
  it("mantém confirmação sem Stays e envia campos de integração nulos", async () => {
    const send = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    await forwardGuestPhone(payload, { ...context, integration: null }, send);
    const body = JSON.parse(send.mock.calls[0][1].body);
    expect(body.tenant_name).toBe("ABMnb");
    expect(body.cpf).toBe("12345678909");
    expect(body.authorization).toBeNull();
    expect(body.system_url).toBeNull();
    expect(body.integration_provider).toBeNull();
  });
  it("não confirma sucesso se o webhook falhar", async () => {
    await expect(forwardGuestPhone(payload, context, vi.fn().mockResolvedValue(new Response(null, { status: 500 })))).rejects.toThrow();
  });
  it("recusa reserva vazia", () => {
    expect(() => validateGuestPhone({ ...payload, id_reserva: "" })).toThrow();
  });
  it("recusa nome curto", () => {
    expect(() => validateGuestPhone({ ...payload, nome: "M" })).toThrow();
  });
  it("recusa e-mail inválido", () => {
    expect(() => validateGuestPhone({ ...payload, email: "sem-arroba" })).toThrow();
  });
  it("recusa cpf com dígitos verificadores errados", () => {
    expect(() => validateGuestPhone({ ...payload, cpf: "12345678900" })).toThrow();
    expect(() => validateGuestPhone({ ...payload, cpf: "11111111111" })).toThrow();
  });
  it("recusa cpf incompleto", () => {
    expect(() => validateGuestPhone({ ...payload, cpf: "1234567890" })).toThrow();
  });
  it("recusa telefone inválido antes de enviar", async () => {
    const send = vi.fn();
    await expect(forwardGuestPhone({ ...payload, telefone: "123" }, context, send)).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });
});
