import { useRef, useState } from "react";
import { PlayCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import videoAsset from "@/assets/primeiro-imovel.mp4.asset.json";

export function FirstPropertyHelpCard() {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full text-left rounded-xl border border-accent/30 bg-accent-soft/60 hover:bg-accent-soft hover:border-accent/50 transition-colors p-4 sm:p-5 flex items-center gap-4 shadow-card"
      >
        <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center group-hover:scale-105 transition-transform">
          <PlayCircle className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm sm:text-base text-foreground">
            Precisa de ajuda para criar seu primeiro imóvel?
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Assista o vídeo e veja como criar sua propriedade em menos de 5 minutos!
          </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle>Como criar seu primeiro imóvel</DialogTitle>
          </DialogHeader>
          <div className="bg-black">
            <video
              ref={videoRef}
              src={videoAsset.url}
              controls
              autoPlay
              playsInline
              className="w-full aspect-video"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
