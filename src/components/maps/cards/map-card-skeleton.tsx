import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function MapCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-video w-full bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
      
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      
      <CardContent className="flex-1">
        <Skeleton className="h-6 w-24 rounded" />
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </CardFooter>
    </Card>
  );
}

export function MapGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <MapCardSkeleton key={i} />
      ))}
    </div>
  );
}
