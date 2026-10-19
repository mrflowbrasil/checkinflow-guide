import { normalizeGuestMobile } from "./guest-phone-number.ts";

export const GUEST_PHONE_WEBHOOK = "https://n8n.mrflow.com.br/webhook/confirmacelular";

// Standard Brazilian CPF check-digit validation (modulo 11).
export function isValidCpf(rawCpf: string) {
  const digits = rawCpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
  if (((sum * 10) % 11) % 10 !== Number(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
  return ((sum * 10) % 11) % 10 === Number(digits[10]);
}

export function validateGuestPhone(input: { id_reserva: string; telefone: string; nome: string; email: string; cpf: string }) {
  const id_reserva = input.id_reserva.trim();
  const telefone = normalizeGuestMobile(input.telefone);
  const nome = input.nome.trim().replace(/\s+/g, " ");
  const email = input.email.trim().toLowerCase();
  const cpf = input.cpf.replace(/\D/g, "");
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id_reserva)) {
    throw new Error("Informe um ID de reserva válido.");
  }
  if (nome.length < 2 || nome.length > 100) {
    throw new Error("Informe seu nome completo.");
  }
  if (!/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email)) {
    throw new Error("Informe um e-mail válido.");
  }
  if (!isValidCpf(cpf)) {
    throw new Error("Informe um CPF válido.");
  }
  return { id_reserva, telefone, nome, email, cpf };
}

export type GuestPhoneWebhookContext = {
  tenant_id: string;
  tenant_name: string;
  integration: {
    system_url: string;
    public_site_url: string | null;
    credentials_encrypted: string | null;
  } | null;
};

export async function forwardGuestPhone(
  data: { id_reserva: string; telefone: string; nome: string; email: string; cpf: string },
  context: GuestPhoneWebhookContext,
  send: typeof fetch = fetch,
) {
  // Explicit allowlist: context is resolved on the server, never from guest input.
  const payload = {
    ...validateGuestPhone(data),
    tenant_id: context.tenant_id,
    tenant_name: context.tenant_name,
    integration_provider: context.integration ? "stays" : null,
    system_url: context.integration?.system_url ?? null,
    public_site_url: context.integration?.public_site_url ?? null,
    // Already stored as Base64(login:password) by integrations-connect.
    authorization: context.integration?.credentials_encrypted
      ? `Basic ${context.integration.credentials_encrypted}` : null,
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
  const response = await send(GUEST_PHONE_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
    redirect: "error",
  });
  await response.body?.cancel();
  if (!response.ok) throw new Error("Não foi possível enviar agora. Tente novamente.");
  return { success: true };
  } finally { clearTimeout(timer); }
}