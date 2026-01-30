import { getMaps } from '@/server/actions/maps';
import AddMapButton from '@/components/maps/add-map-button';
import { MapCard } from '@/components/maps/map-card';

export default async function Dashboard() {
  const maps = await getMaps() || [];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Mapas</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tus mapas y comparte los enlaces públicos.
          </p>
        </div>
        <AddMapButton />
      </div>

      {maps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg bg-muted/50">
          <h3 className="text-xl font-semibold mb-2">No tienes mapas creados</h3>
          <p className="text-muted-foreground mb-6">Comienza creando tu primer mapa interactivo.</p>
          <AddMapButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maps.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
        </div>
      )}
    </div>
  );
}
