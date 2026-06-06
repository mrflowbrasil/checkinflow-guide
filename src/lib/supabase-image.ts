/**
 * Rewrites a Supabase Storage public URL to use the image transformation
 * endpoint (`/storage/v1/render/image/public/...`) so the CDN serves a
 * resized/optimized variant.
 *
 * If the URL doesn't match the Supabase storage pattern (external image,
 * data URL, etc.), it's returned untouched.
 */
export function sbImage(
  url: string | null | undefined,
  opts: { width?: number; height?: number; quality?: number; resize?: "cover" | "contain" | "fill" } = {}
): string {
  if (!url) return "";
  const marker = "/storage/v1/object/public/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const base = url.slice(0, idx) + "/storage/v1/render/image/public/" + url.slice(idx + marker.length);
  const params = new URLSearchParams();
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  params.set("quality", String(opts.quality ?? 75));
  if (opts.resize) params.set("resize", opts.resize);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function sbImageSrcSet(
  url: string | null | undefined,
  widths: number[],
  opts: { quality?: number } = {}
): string {
  if (!url) return "";
  return widths.map((w) => `${sbImage(url, { width: w, quality: opts.quality })} ${w}w`).join(", ");
}
