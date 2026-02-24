import { MapGridSkeleton } from '@/components/maps/cards/map-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <MapGridSkeleton />
    </div>
  );
}
