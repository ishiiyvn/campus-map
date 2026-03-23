import { useCallback, useRef } from "react";
import Konva from "konva";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_DURATION = 0.15;
const FRICTION = 0.96;
const MIN_VELOCITY = 0.3;

interface Velocity {
  x: number;
  y: number;
}

interface UseSmoothZoomOptions {
  scaleBy?: number;
}

export function useSmoothZoom(
  stageRef: React.RefObject<Konva.Stage | null>,
  options?: UseSmoothZoomOptions,
) {
  const scaleBy = options?.scaleBy ?? 1.25;
  const velocityRef = useRef<Velocity>({ x: 0, y: 0 });
  const animationRef = useRef<Konva.Animation | null>(null);
  const isAnimatingRef = useRef(false);

  const stopInertia = useCallback(() => {
    if (animationRef.current) {
      if (animationRef.current instanceof Konva.Animation) {
        animationRef.current.stop();
      } else {
        cancelAnimationFrame(animationRef.current as unknown as number);
      }
      animationRef.current = null;
    }
    velocityRef.current = { x: 0, y: 0 };
    isAnimatingRef.current = false;
  }, []);

  const setScale = useCallback(
    (newScale: number, animate = true) => {
      const stage = stageRef.current;
      if (!stage) return;

      const clampedScale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);
      const oldScale = stage.scaleX();

      if (!animate || Math.abs(clampedScale - oldScale) < 0.001) {
        const stageWidth = stage.width();
        const stageHeight = stage.height();
        const centerX = stageWidth / 2;
        const centerY = stageHeight / 2;
        const newPos = {
          x: centerX - (centerX - stage.x()) * (clampedScale / oldScale),
          y: centerY - (centerY - stage.y()) * (clampedScale / oldScale),
        };
        stage.position(newPos);
        stage.scale({ x: clampedScale, y: clampedScale });
        stage.batchDraw();
        return;
      }

      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const centerX = stageWidth / 2;
      const centerY = stageHeight / 2;
      const oldPos = { x: stage.x(), y: stage.y() };
      const targetPos = {
        x: centerX - (centerX - oldPos.x) * (clampedScale / oldScale),
        y: centerY - (centerY - oldPos.y) * (clampedScale / oldScale),
      };

      const anim = new Konva.Tween({
        node: stage,
        duration: ZOOM_DURATION,
        x: targetPos.x,
        y: targetPos.y,
        scaleX: clampedScale,
        scaleY: clampedScale,
        easing: Konva.Easings.EaseOut,
        onFinish: () => {
          stage.batchDraw();
        },
      });
      anim.play();
    },
    [stageRef],
  );

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      stopInertia();

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      newScale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      const anim = new Konva.Tween({
        node: stage,
        duration: ZOOM_DURATION,
        x: newPos.x,
        y: newPos.y,
        scaleX: newScale,
        scaleY: newScale,
        easing: Konva.Easings.EaseOut,
        onFinish: () => {
          stage.batchDraw();
        },
      });
      anim.play();
    },
    [stageRef, scaleBy, stopInertia],
  );

  const startInertia = useCallback(
    (velocity: Velocity) => {
      const stage = stageRef.current;
      if (!stage) return;

      stopInertia();
      velocityRef.current = { ...velocity };
      isAnimatingRef.current = true;

      let lastTime = 0;
      let frameCount = 0;

      const animate = (currentTime: number) => {
        if (!isAnimatingRef.current || !stage) return;

        if (lastTime === 0) {
          lastTime = currentTime;
          animationRef.current = requestAnimationFrame(animate) as unknown as Konva.Animation;
          return;
        }

        const rawDt = currentTime - lastTime;
        lastTime = currentTime;

        if (rawDt > 100) {
          animationRef.current = requestAnimationFrame(animate) as unknown as Konva.Animation;
          return;
        }

        const dt = rawDt / 16.667;

        const { x: velX, y: velY } = velocityRef.current;
        const speed = Math.sqrt(velX * velX + velY * velY);

        if (speed < MIN_VELOCITY) {
          stopInertia();
          return;
        }

        const frictionFactor = Math.pow(FRICTION, dt);

        stage.x(stage.x() + velX * dt);
        stage.y(stage.y() + velY * dt);

        velocityRef.current = {
          x: velX * frictionFactor,
          y: velY * frictionFactor,
        };

        animationRef.current = requestAnimationFrame(animate) as unknown as Konva.Animation;
        frameCount++;
      };

      animationRef.current = requestAnimationFrame(animate) as unknown as Konva.Animation;
    },
    [stageRef, stopInertia],
  );

  const handleDragEnd = useCallback(
    (velocityX: number, velocityY: number) => {
      const stage = stageRef.current;
      if (!stage) return;

      const inertiaVelocity = {
        x: velocityX * 5,
        y: velocityY * 5,
      };

      const speed = Math.sqrt(inertiaVelocity.x ** 2 + inertiaVelocity.y ** 2);
      if (speed > MIN_VELOCITY) {
        startInertia(inertiaVelocity);
      }
    },
    [stageRef, startInertia],
  );

  return {
    handleWheel,
    setScale,
    startInertia,
    handleDragEnd,
    stopInertia,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
  };
}
