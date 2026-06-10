import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
};

export function CatalogPreviewDialog({ open, onOpenChange, url }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Preview do catálogo</DialogTitle>
          <DialogDescription>
            Visualização aproximada de como o link aparece no celular do hóspede.
          </DialogDescription>
        </DialogHeader>

        <div className="mx-auto">
          <div className="rounded-[2.5rem] border-[10px] border-foreground/80 bg-foreground/80 shadow-xl">
            <div className="h-[560px] w-[280px] overflow-hidden rounded-[1.8rem] bg-background">
              {url ? (
                <iframe
                  src={url}
                  title="Preview do catálogo"
                  className="h-full w-full"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Salve seu workspace para gerar a URL.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
