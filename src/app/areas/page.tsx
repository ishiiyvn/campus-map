import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getAreas } from '@/server/actions/areas';
import { getQueryClient } from '@/app/get-query-client';
import AddAreaButton from '@/components/areas/add-area-button';

export default async function AdminAreasPage() {
  const queryClient = getQueryClient();

  //  await queryClient.prefetchQuery({
  //    queryKey: ["areas"],
  //    queryFn: getAreas,
  //  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* <AreasList /> */}
      <main className="flex flex-col gap-4 max-w-7xl mx-auto p-4 md:p-24">
        <AddAreaButton />
      </main>
    </HydrationBoundary>
  )
}
