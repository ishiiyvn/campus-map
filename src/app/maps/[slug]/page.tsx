import { notFound } from "next/navigation";
import { getMapBySlug } from "@/server/actions/maps";
import { getPointsOfInterest } from "@/server/actions/pois";
import { getCategories } from "@/server/actions/categories";
import MapViewerWrapper from "@/components/maps/map-viewer-wrapper";
import { Metadata } from "next";

interface PublicMapPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicMapPageProps): Promise<Metadata> {
  const { slug } = await params;
  const map = await getMapBySlug(slug);

  if (!map) {
    return {
      title: "Mapa no encontrado",
    };
  }

  return {
    title: map.name,
    description: map.description,
  };
}

export default async function PublicMapPage({ params }: PublicMapPageProps) {
  const { slug } = await params;
  const map = await getMapBySlug(slug);

  if (!map) {
    notFound();
  }

  const pois = await getPointsOfInterest(); // TODO: Filter by map.id
  const categories = await getCategories();

  return (
    <div className="w-full h-screen bg-slate-100 relative">
      <MapViewerWrapper
        mapData={{
          ...map,
          // DB jsonb -> any -> ViewportConfig is handled by the wrapper/component trust
          viewport_config: map.viewport_config as unknown as { zoom: number; center: [number, number]; minzoom?: number; maxzoom?: number },
        }}
        pois={pois || []}
        categories={categories || []}
        readOnly={true}
      />
    </div>
  );
}
