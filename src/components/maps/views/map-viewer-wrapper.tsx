import { MapOutput } from "@/lib/validators/map";
import { Area, Category, PointOfInterest, Layer, Level } from "@/server/db/schema";
import { getAllLevels } from "@/server/actions/levels";
import MapViewer from "./map-viewer";

interface MapViewerWrapperProps {
  mapData: MapOutput;
  pois: PointOfInterest[];
  categories: Category[];
  areas: Area[];
  layers?: Layer[];
  readOnly?: boolean;
}

export default async function MapViewerWrapper(props: MapViewerWrapperProps) {
  // Fetch levels server-side and pass them down to the client component
  let levels: Level[] = [];
  try {
    levels = await getAllLevels();
  } catch (err) {
    // Log server-side but don't crash the render
     
    console.error("Error fetching levels in MapViewerWrapper:", err);
    levels = [];
  }

  // Pass levels as a prop to the client MapViewer
  // MapViewer remains client-only; spread props intentionally here
  return <MapViewer {...props} levels={levels} />;
}
