import jsPDF from "jspdf";
import QRCode from "qrcode";
import mrFlowLogo from "@/assets/mrflow-logo.png";

export type WelcomePdfMode = "color" | "bw";

export type WelcomePdfOptions = {
  propertyName: string;
  url: string;
  primaryColor: string; // hex
  mode: WelcomePdfMode;
  tenantLogoUrl?: string | null;
  fileSlug?: string;
};

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

export async function generateWelcomePdf(opts: WelcomePdfOptions) {
  const { propertyName, url, primaryColor, mode, tenantLogoUrl, fileSlug } = opts;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = 210;
  const pageH = 297;
  const margin = 20;

  const accent: [number, number, number] = mode === "color" ? hexToRgb(primaryColor) : [0, 0, 0];
  const dark: [number, number, number] = [30, 30, 30];
  const muted: [number, number, number] = [90, 90, 90];

  // ── Tenant logo (top-right) ──
  if (tenantLogoUrl) {
    const logo = await loadImageAsDataUrl(tenantLogoUrl);
    if (logo) {
      const maxW = 30;
      const maxH = 25;
      const ratio = logo.w / logo.h;
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      const x = pageW - margin - w;
      const y = margin - 5;
      try {
        doc.addImage(logo.data, "PNG", x, y, w, h, undefined, "FAST");
      } catch {
        try {
          doc.addImage(logo.data, "JPEG", x, y, w, h, undefined, "FAST");
        } catch {
          /* skip */
        }
      }
    }
  }

  // ── Title ──
  let cursorY = margin + 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.setTextColor(...accent);
  doc.text("SEJA BEM-VINDO!", pageW / 2, cursorY, { align: "center", charSpace: 1.2 });

  cursorY += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(20);
  doc.setTextColor(...dark);
  const nameLines = doc.splitTextToSize(propertyName, pageW - margin * 2);
  doc.text(nameLines, pageW / 2, cursorY, { align: "center" });
  cursorY += nameLines.length * 8;

  // ── QR code ──
  const qrSize = 75;
  const qrDarkHex = mode === "color" ? primaryColor : "#000000";
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 1000,
    margin: 1,
    color: { dark: qrDarkHex, light: "#FFFFFF" },
    errorCorrectionLevel: "H",
  });
  const qrY = cursorY + 12;
  const qrX = (pageW - qrSize) / 2;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // Subtle frame around QR
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 2, 2);

  // ── Instructions ──
  let instrY = qrY + qrSize + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...accent);
  doc.text("Como acessar o seu Hub de Boas-Vindas", pageW / 2, instrY, { align: "center" });
  instrY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...muted);
  const instructions =
    "Aponte a câmera do seu celular para o QR Code acima. Você terá acesso a todas as informações sobre sua estadia: check-in, Wi-Fi, regras, dicas da região e muito mais.";
  const instrLines = doc.splitTextToSize(instructions, pageW - margin * 2 - 20);
  doc.text(instrLines, pageW / 2, instrY, { align: "center", lineHeightFactor: 1.5 });

  // ── Footer ──
  const footerY = pageH - 18;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 6, pageW - margin, footerY - 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  const footerText = "Desenvolvido por";
  const textW = doc.getTextWidth(footerText);
  const logoW = 22;
  const logoH = 6.5;
  const gap = 3;
  const totalW = textW + gap + logoW;
  const startX = (pageW - totalW) / 2;
  doc.text(footerText, startX, footerY + 1);
  try {
    doc.addImage(mrFlowLogo, "PNG", startX + textW + gap, footerY - logoH + 2, logoW, logoH, undefined, "FAST");
  } catch {
    /* ignore */
  }

  const slug = fileSlug || propertyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  doc.save(`boas-vindas-${slug || "guia"}.pdf`);
}
