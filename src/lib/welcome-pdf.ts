import jsPDF from "jspdf";
import QRCode from "qrcode";

export type WelcomePdfMode = "color" | "bw";

export type WelcomePdfOptions = {
  propertyName: string;
  url: string;
  primaryColor: string;
  mode: WelcomePdfMode;
  tenantLogoUrl?: string | null;
  fileSlug?: string;
};

// ──────────────────────────────────────────────────────────────────────────
// Font loading (Google Fonts → base64 → jsPDF VFS), cached per session
// ──────────────────────────────────────────────────────────────────────────

type FontDef = { family: string; style: "normal" | "bold"; weight: number; url: string };

const FONTS: FontDef[] = [
  {
    family: "PlayfairDisplay",
    style: "bold",
    weight: 700,
    url: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.ttf",
  },
  {
    family: "Montserrat",
    style: "normal",
    weight: 500,
    url: "https://fonts.gstatic.com/s/montserrat/v29/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.ttf",
  },
  {
    family: "Inter",
    style: "normal",
    weight: 400,
    url: "https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.ttf",
  },
];

let fontCache: Record<string, string> | null = null;
let fontsAvailable = false;

async function ensureFontsLoaded(doc: jsPDF): Promise<boolean> {
  if (!fontCache) {
    fontCache = {};
    try {
      await Promise.all(
        FONTS.map(async (f) => {
          const res = await fetch(f.url);
          if (!res.ok) throw new Error("font fetch failed");
          const buf = await res.arrayBuffer();
          let binary = "";
          const bytes = new Uint8Array(buf);
          const chunk = 0x8000;
          for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
          }
          fontCache![`${f.family}-${f.style}`] = btoa(binary);
        })
      );
      fontsAvailable = true;
    } catch {
      fontsAvailable = false;
    }
  }
  if (!fontsAvailable || !fontCache) return false;
  for (const f of FONTS) {
    const filename = `${f.family}-${f.style}.ttf`;
    const b64 = fontCache[`${f.family}-${f.style}`];
    if (!b64) continue;
    doc.addFileToVFS(filename, b64);
    doc.addFont(filename, f.family, f.style);
  }
  return true;
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

async function loadImageAsDataUrl(url: string): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const dims: { w: number; h: number } = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = dataUrl;
    });
    return { data: dataUrl, w: dims.w, h: dims.h };
  } catch {
    return null;
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function drawCircularImage(
  doc: jsPDF,
  dataUrl: string,
  cx: number,
  cy: number,
  r: number
) {
  // Use jsPDF clipping: draw a circular path, clip, then place image inside its bbox.
  const anyDoc = doc as unknown as {
    saveGraphicsState?: () => void;
    restoreGraphicsState?: () => void;
  };
  const hasState = typeof anyDoc.saveGraphicsState === "function";
  if (hasState) anyDoc.saveGraphicsState!();
  try {
    // jsPDF circle + clip pattern
    (doc as any).circle(cx, cy, r, null);
    (doc as any).clip();
    (doc as any).discardPath?.();
    doc.addImage(dataUrl, "PNG", cx - r, cy - r, r * 2, r * 2, undefined, "FAST");
  } catch {
    // Fallback: just draw image as-is
    try {
      doc.addImage(dataUrl, "PNG", cx - r, cy - r, r * 2, r * 2, undefined, "FAST");
    } catch {
      /* ignore */
    }
  }
  if (hasState) anyDoc.restoreGraphicsState!();
}

// ──────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────

export async function generateWelcomePdf(opts: WelcomePdfOptions) {
  const { propertyName, url, primaryColor, mode, tenantLogoUrl, fileSlug } = opts;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = 210;
  const pageH = 297;
  const cx = pageW / 2;

  const customFonts = await ensureFontsLoaded(doc);
  const fTitle = customFonts ? "PlayfairDisplay" : "helvetica";
  const fTitleStyle = customFonts ? "bold" : "bold";
  const fSub = customFonts ? "Montserrat" : "helvetica";
  const fBody = customFonts ? "Inter" : "helvetica";

  const accent: [number, number, number] = mode === "color" ? hexToRgb(primaryColor) : [20, 20, 20];
  const titleColor: [number, number, number] = mode === "color" ? accent : [20, 20, 20];
  const subColor: [number, number, number] = [58, 58, 58];
  const bodyColor: [number, number, number] = [90, 90, 90];
  const mutedColor: [number, number, number] = [154, 154, 154];

  let y = 25;

  // ── Tenant logo (circular, top-center) ──
  if (tenantLogoUrl) {
    const logo = await loadImageAsDataUrl(tenantLogoUrl);
    if (logo) {
      const r = 14; // 28mm diameter
      const cy = y + r;
      drawCircularImage(doc, logo.data, cx, cy, r);
      // subtle border
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.3);
      doc.circle(cx, cy, r, "S");
      y = cy + r + 16;
    } else {
      y += 8;
    }
  } else {
    y += 8;
  }

  // ── Title ──
  doc.setFont(fTitle, fTitleStyle);
  doc.setFontSize(32);
  doc.setTextColor(...titleColor);
  doc.text("Seja bem-vindo", cx, y, { align: "center", charSpace: 0.6 });
  y += 12;

  // ── Subtitle (property name) ──
  doc.setFont(fSub, "normal");
  doc.setFontSize(15);
  doc.setTextColor(...subColor);
  const nameLines = doc.splitTextToSize(propertyName, 130);
  doc.text(nameLines, cx, y, { align: "center" });
  y += nameLines.length * 6 + 14;

  // ── QR Code ──
  const qrSize = 80;
  const qrPad = 4;
  const qrDarkHex = mode === "color" ? primaryColor : "#000000";
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 1200,
    margin: 1,
    color: { dark: qrDarkHex, light: "#FFFFFF" },
    errorCorrectionLevel: "H",
  });
  const qrX = cx - qrSize / 2;
  const qrY = y;

  doc.setDrawColor(232, 232, 232);
  doc.setLineWidth(0.3);
  doc.roundedRect(qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 3, 3, "S");
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  y = qrY + qrSize + qrPad + 16;

  // ── Micro-title ──
  doc.setFont(fSub, "normal");
  doc.setFontSize(11);
  doc.setTextColor(...accent);
  doc.text("COMO ACESSAR SEU HUB DE BOAS-VINDAS", cx, y, { align: "center", charSpace: 0.8 });
  y += 7;

  // ── Body text ──
  doc.setFont(fBody, "normal");
  doc.setFontSize(11);
  doc.setTextColor(...bodyColor);
  const body =
    "Aponte a câmera do seu celular para o QR Code acima e acesse todas as informações da sua estadia: check-in, Wi-Fi, regras da casa e dicas da região.";
  const bodyLines = doc.splitTextToSize(body, 110);
  doc.text(bodyLines, cx, y, { align: "center", lineHeightFactor: 1.6 });

  // ── Footer ──
  const footerY = pageH - 14;
  doc.setDrawColor(235, 235, 235);
  doc.setLineWidth(0.2);
  doc.line(40, footerY - 8, pageW - 40, footerY - 8);

  doc.setFont(fBody, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("Desenvolvido por: www.hub.mrflow.com.br", cx, footerY, { align: "center" });

  const slug =
    fileSlug || propertyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  doc.save(`boas-vindas-${slug || "guia"}.pdf`);
}
