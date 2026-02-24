"use client";

import dynamic from "next/dynamic";
import { MapOutput } from "@/lib/validators/map";
import { Area, Category, PointOfInterest } from "@/server/db/schema";

const MapViewer = dynamic(() => import("./map-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400">
      Loading Map Viewer...
    </div>
  ),
});

interface MapViewerWrapperProps {
  mapData: MapOutput;
  pois: PointOfInterest[];
  categories: Category[];
  areas: Area[];
  readOnly?: boolean;
}

export default function MapViewerWrapper(props: MapViewerWrapperProps) {
  return <MapViewer {...props} />;
}
