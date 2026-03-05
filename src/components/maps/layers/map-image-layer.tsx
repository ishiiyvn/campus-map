"use client";

import { Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

interface MapImageLayerProps {
  src: string;
  width: number;
  height: number;
}

export function MapImageLayer({ src, width, height }: MapImageLayerProps) {
  const [image] = useImage(src);

  return (
    <Layer>
      <KonvaImage image={image} width={width} height={height} listening={false} />
    </Layer>
  );
}
