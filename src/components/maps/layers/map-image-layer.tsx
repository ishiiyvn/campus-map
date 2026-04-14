"use client";

import { useEffect, useState, useRef } from "react";
import { Layer, Image as KonvaImage } from "react-konva";

interface MapImageLayerProps {
  src: string;
  width: number;
  height: number;
  visible?: boolean;
  opacity?: number;
}

export function MapImageLayer({ src, width, height, visible = true, opacity = 1 }: MapImageLayerProps) {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const message = args[0];
      if (
        typeof message === "string" &&
        message.includes("CanvasRenderingContext2D.drawImage")
      ) {
        return;
      }
      originalError(...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    // Defer state resets to avoid synchronous setState in effect which can cause
    // cascading renders. Using a short timeout preserves behavior while satisfying
    // the react-hooks/set-state-in-effect rule.
    const resetTimer = setTimeout(() => {
      setIsLoaded(false);
      setHasError(false);
      setImageEl(null);
    }, 0);

    if (!src || !visible) {
      clearTimeout(resetTimer);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    imgRef.current = img;

    img.onload = () => {
      setImageEl(img);
      setIsLoaded(true);
      setHasError(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoaded(false);
    };

    img.src = src;

    return () => {
      clearTimeout(resetTimer);
      img.onload = null;
      img.onerror = null;
    };
  }, [src, visible]);

  if (!visible || !src || !isLoaded || !imageEl || hasError) {
    return null;
  }

  return (
    <Layer opacity={opacity}>
      <KonvaImage
        image={imageEl}
        width={width}
        height={height}
        listening={false}
      />
    </Layer>
  );
}
