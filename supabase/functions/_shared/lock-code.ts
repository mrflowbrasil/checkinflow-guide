// Shared helpers for scheduled lock-code (senha da fechadura) updates.

/**
 * Accepts:
 * - Unix timestamp in SECONDS (e.g. 1787677200) — number or numeric string
 * - Unix timestamp in MILLISECONDS (auto-detected by magnitude)
 * - ISO 8601 string with timezone (e.g. "2026-08-30T15:00:00-03:00")
 */
export function parseWhen(input: unknown): Date | null {
  if (input === null || input === undefined || input === "") return null;

  if (typeof input === "number" || /^\d{9,14}$/.test(String(input).trim())) {
    const n = Number(input);
    if (!Number.isFinite(n) || n <= 0) return null;
    // >= 1e12 → milliseconds, otherwise seconds
    const ms = n >= 1e12 ? n : n * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(String(input));
  return isNaN(d.getTime()) ? null : d;
}

export function unix(d: string | Date | null | undefined): number | null {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return null;
  return Math.floor(date.getTime() / 1000);
}

export function serializeSchedule(row: any) {
  return {
    id: row.id,
    property_id: row.property_id,
    lock_code: row.lock_code,
    status: row.status,
    apply_at: row.apply_at,
    apply_at_unix: unix(row.apply_at),
    remove_at: row.remove_at,
    remove_at_unix: unix(row.remove_at),
    applied_at: row.applied_at,
    removed_at: row.removed_at,
    reference: row.reference,
    source: row.source,
    last_error: row.last_error,
    created_at: row.created_at,
  };
}

/**
 * Writes (or clears) the lock code on property_details and syncs the
 * auto-generated `password` block on the `lock_code` page.
 * Manual blocks are never touched.
 */
export async function writeLockCode(admin: any, propertyId: string, code: string | null) {
  const { error: detErr } = await admin
    .from("property_details")
    .upsert({ property_id: propertyId, lock_code: code }, { onConflict: "property_id" });
  if (detErr) throw detErr;

  const { data: page } = await admin
    .from("property_pages")
    .select("id")
    .eq("property_id", propertyId)
    .eq("page_key", "lock_code")
    .maybeSingle();
  if (!page) return;

  // Drop previous auto password block(s)
  await admin
    .from("content_blocks")
    .delete()
    .eq("page_id", page.id)
    .eq("source", "auto")
    .eq("type", "password");

  if (!code) return;

  const { data: manual } = await admin
    .from("content_blocks")
    .select("type, position")
    .eq("page_id", page.id)
    .eq("source", "manual");

  // A manually authored password block wins — don't duplicate it.
  if ((manual ?? []).some((b: any) => b.type === "password")) return;

  const startPos = (manual ?? []).reduce((m: number, b: any) => Math.max(m, (b.position ?? 0) + 1), 0);

  const { error: insErr } = await admin.from("content_blocks").insert({
    page_id: page.id,
    type: "password",
    data: { label: "Senha da fechadura", value: code },
    position: startPos,
    source: "auto",
  });
  if (insErr) throw insErr;
}
