const KEY_NAME = "Integração";

export type TenantApiKeyResult = {
  apiKey: string | null;
  apiKeyStatus: "new" | "existing" | "unrecoverable";
  keyId?: string;
  keyName?: string;
  keyPrefix?: string;
};

export function genApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `mrf_live_${b64}`;
}

export async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function encryptionKey(): Promise<CryptoKey> {
  const secret = Deno.env.get("TENANT_API_KEYS_ENCRYPTION_SECRET") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secret) throw new Error("missing_api_key_encryption_secret");
  const material = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`tenant-api-keys:v1:${secret}`),
  );
  return crypto.subtle.importKey("raw", material, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptApiKey(apiKey: string): Promise<string> {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(),
    new TextEncoder().encode(apiKey),
  );
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`;
}

export async function decryptApiKey(ciphertext?: string | null): Promise<string | null> {
  if (!ciphertext) return null;
  const [version, ivB64, dataB64] = ciphertext.split(".");
  if (version !== "v1" || !ivB64 || !dataB64) return null;
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(ivB64) },
      await encryptionKey(),
      base64ToBytes(dataB64),
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

export async function createTenantApiKey(admin: any, tenantId: string, name = KEY_NAME): Promise<TenantApiKeyResult> {
  const apiKey = genApiKey();
  const { data, error } = await admin
    .from("tenant_api_keys")
    .insert({
      tenant_id: tenantId,
      name,
      key_hash: await sha256(apiKey),
      key_prefix: apiKey.slice(0, 16),
      key_ciphertext: await encryptApiKey(apiKey),
    })
    .select("id, name, key_prefix")
    .single();
  if (error) throw error;
  return { apiKey, apiKeyStatus: "new", keyId: data?.id, keyName: data?.name, keyPrefix: data?.key_prefix };
}

export async function getLatestRecoverableTenantApiKey(admin: any, tenantId: string): Promise<TenantApiKeyResult> {
  const { data: existingKey, error } = await admin
    .from("tenant_api_keys")
    .select("id, name, key_prefix, key_ciphertext, created_at")
    .eq("tenant_id", tenantId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!existingKey) return createTenantApiKey(admin, tenantId);

  const apiKey = await decryptApiKey(existingKey.key_ciphertext);
  if (!apiKey) {
    return {
      apiKey: null,
      apiKeyStatus: "unrecoverable",
      keyId: existingKey.id,
      keyName: existingKey.name,
      keyPrefix: existingKey.key_prefix,
    };
  }

  return {
    apiKey,
    apiKeyStatus: "existing",
    keyId: existingKey.id,
    keyName: existingKey.name,
    keyPrefix: existingKey.key_prefix,
  };
}

export function unrecoverableApiKeyPayload(result: TenantApiKeyResult) {
  return {
    ok: false,
    error: "api_key_not_recoverable",
    message:
      "A chave ativa mais recente foi criada antes do armazenamento seguro recuperável e não pode ser reenviada automaticamente. Crie uma nova chave uma única vez no painel de Chaves de API; a partir dela, reconexões reutilizarão a mesma chave ativa sem revogar.",
    api_key_status: result.apiKeyStatus,
    key_prefix: result.keyPrefix,
  };
}