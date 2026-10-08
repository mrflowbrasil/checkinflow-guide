export const GUEST_PHONE_WEBHOOK = "https://n8n.mrflow.com.br/webhook/confirmacelular";

export function validateGuestPhone(input: { id_reserva: string; telefone: string }) {
  const id_reserva = input.id_reserva.trim();
  const telefone = input.telefone.replace(/[\s().-]/g, "");
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id_reserva)) {
    throw new Error("Informe um ID de reserva válido.");
  }
  if (!/^\+?[1-9]\d{7,14}$/.test(telefone)) {
    throw new Error("Informe um celular válido, com DDD e código do país.");
  }
  return { id_reserva, telefone };
}

export async function forwardGuestPhone(
  data: { id_reserva: string; telefone: string },
  send: typeof fetch = fetch,
) {
  const payload = validateGuestPhone(data);
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