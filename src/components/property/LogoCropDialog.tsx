import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { Area, MediaSize } from "react-easy-crop";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

async function getCroppedBlob(imageSrc: string, crop: Area, outputSize = 512): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d")!;

  const sourceX = Math.max(0, crop.x);
  const sourceY = Math.max(0, crop.y);
  const sourceRight = Math.min(img.naturalWidth, crop.x + crop.width);
  const sourceBottom = Math.min(img.naturalHeight, crop.y + crop.height);
  const sourceWidth = Math.max(0, sourceRight - sourceX);
  const sourceHeight = Math.max(0, sourceBottom - sourceY);

  if (sourceWidth > 0 && sourceHeight > 0) {
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      ((sourceX - crop.x) / crop.width) * outputSize,
      ((sourceY - crop.y) / crop.height) * outputSize,
      (sourceWidth / crop.width) * outputSize,
      (sourceHeight / crop.height) * outputSize
    );
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar imagem"))), "image/png", 0.95)
  );
}

const CROP_PADDING = 64;
const MIN_CROP_DIAMETER = 280;
const MAX_CROP_DIAMETER = 420;
const LOGO_FIT_MARGIN = 0.86;

export function LogoCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onConfirm,
  busy,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  imageSrc: string | null;
  onConfirm: (blob: Blob) => void;
  busy?: boolean;
}) {
  const cropperBoxRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [cropDiameter, setCropDiameter] = useState(360);
  const [mediaSize, setMediaSize] = useState<MediaSize | null>(null);
  const [pixels, setPixels] = useState<Area | null>(null);

  const onComplete = useCallback((_: Area, p: Area) => setPixels(p), []);

  useEffect(() => {
    if (!open) return;

    const updateCropDiameter = () => {
      const box = cropperBoxRef.current;
      if (!box) return;
      const { width, height } = box.getBoundingClientRect();
      setCropDiameter(Math.round(Math.max(MIN_CROP_DIAMETER, Math.min(MAX_CROP_DIAMETER, width - CROP_PADDING, height - CROP_PADDING))));
    };

    updateCropDiameter();
    const observer = new ResizeObserver(updateCropDiameter);
    if (cropperBoxRef.current) observer.observe(cropperBoxRef.current);
    return () => observer.disconnect();
  }, [open]);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setPixels(null);
    setMediaSize(null);
    setMinZoom(1);
    setZoom(1);
  }, [imageSrc]);

  useEffect(() => {
    if (!mediaSize) return;
    const safeDiameter = cropDiameter * LOGO_FIT_MARGIN;
    const fitZoom = Math.min(safeDiameter / mediaSize.width, safeDiameter / mediaSize.height);
    const nextMinZoom = Number.isFinite(fitZoom) && fitZoom > 0 ? Math.min(1, fitZoom) : 1;
    setMinZoom(nextMinZoom);
    setCrop({ x: 0, y: 0 });
    setZoom(nextMinZoom);
  }, [cropDiameter, mediaSize]);

  const handleConfirm = async () => {
    if (!imageSrc || !pixels) return;
    const blob = await getCroppedBlob(imageSrc, pixels);
    onConfirm(blob);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajustar logo</DialogTitle>
          <DialogDescription>
            Arraste para posicionar e use o zoom para enquadrar a logo dentro do círculo.
          </DialogDescription>
        </DialogHeader>

        <div ref={cropperBoxRef} className="relative w-full h-[520px] bg-muted rounded-lg overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              minZoom={minZoom}
              maxZoom={4}
              aspect={1}
              cropSize={{ width: cropDiameter, height: cropDiameter }}
              cropShape="round"
              showGrid={false}
              objectFit="contain"
              restrictPosition={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onComplete}
              onMediaLoaded={setMediaSize}
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Zoom</label>
          <Slider value={[zoom]} min={minZoom} max={4} step={0.01} onValueChange={(v) => setZoom(v[0])} />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!pixels || busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
