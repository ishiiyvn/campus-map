"use client";

import { Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

interface MapImageLayerProps {
  src: string;
  width: number;
  height: number;
  visible?: boolean;
  opacity?: number;
}

export function MapImageLayer({ src, width, height, visible = true, opacity = 1 }: MapImageLayerProps) {
  const [image, status] = useImage(src, "anonymous");

  if (status !== "loaded" || !image || !visible) {
    return null;
  }

  return (
    <Layer opacity={opacity}>
      <KonvaImage image={image} width={width} height={height} listening={false} />
    </Layer>
  );
}
