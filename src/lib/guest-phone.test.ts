import { describe, expect, it, vi } from "vitest";
import { forwardGuestPhone, validateGuestPhone } from "../../supabase/functions/_shared/guest-phone";

describe("confirmação de celular", () => {
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