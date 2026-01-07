import Link from 'next/link';
import { getMaps } from '@/server/actions/maps';
import AddMapButton from '@/components/maps/add-map-button';
import EditMapButton from '@/components/maps/edit-map-button';
import MapViewerWrapper from '@/components/maps/map-viewer-wrapper';
import { AppSidebar } from '@/components/app-sidebar';

interface HomeProps {
  searchParams: Promise<{ mapId?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const mapId = params.mapId ? parseInt(params.mapId) : undefined;

  const maps = await getMaps() || [];

  // Find the selected map
  const selectedMap = mapId
    ? maps.find(m => m.id === mapId)
    : (maps.length > 0 ? maps[0] : undefined);

  return (
    <div className="flex-1 relative flex flex-col h-full items-center justify-center w-full">
      {selectedMap ? (
        <div className="flex-1 relative h-full w-full">
          {/* 
            MapViewer expects MapOutput which has strictly typed viewport_config.
            The DB returns jsonb for viewport_config. 
            We can cast it here since we trust the data structure or it defaults safely in the viewer.
          */}
          <MapViewerWrapper
            mapData={{
              ...selectedMap,
              // Cast jsonb to the expected shape (or let it fail if invalid, though Zod validation on input helps)
              viewport_config: selectedMap.viewport_config as any
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Selecciona un mapa para ver los detalles
        </div>
      )}
    </div>
  );
}
