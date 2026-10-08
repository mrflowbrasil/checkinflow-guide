export async function resolveGuestPhoneWorkspace<T>(
  slug: string,
  findTenant: (field: "slug" | "id", value: string) => Promise<T | null>,
  findPreviousTenant: (slug: string) => Promise<string | null>,
): Promise<T | null> {
  const current = await findTenant("slug", slug);
  if (current) return current;
  const tenantId = await findPreviousTenant(slug);
  return tenantId ? findTenant("id", tenantId) : null;
}