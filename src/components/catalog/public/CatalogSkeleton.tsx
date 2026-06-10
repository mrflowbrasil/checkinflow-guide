import { Skeleton } from "@/components/ui/skeleton";

export function CatalogSkeleton({ header = false }: { header?: boolean }) {
  if (header) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    );
  }
  return (
    <div className="rounded-2xl border bg-background overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
}
