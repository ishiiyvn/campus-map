import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';
import AddAreaButton from '@/components/areas/add-area-button';

export default async function AdminAreasPage() {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* <AreasList /> */}
      <main className="flex flex-col gap-4 max-w-7xl mx-auto p-4 md:p-24">
        <AddAreaButton />
      </main>
    </HydrationBoundary>
  )
}
