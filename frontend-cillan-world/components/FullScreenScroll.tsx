'use client';

import React from 'react';
import NavBar from '@/components/ui/navbar';
import { useGetHomeImages } from '@/api/useGetHomeImages';
import { HomeImageType } from '@/types/homeImage';
import HomeImageCard from './HomeImageCard';

const SPEED_PX_PER_SEC = 40;    // Velocidad del autoscroll
const FRAME_FALLBACK_MS = 16;   // ~60fps

const VerticalSnapCarousel: React.FC = () => {
  const result: HomeImageType[] = useGetHomeImages().result ?? [];

  // Refs
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastTimeRef = React.useRef<number | null>(null);
  const pausedRef = React.useRef<boolean>(false);
  const listHeightRef = React.useRef<number>(0); // altura total de la lista

  // Medir la altura de la lista
  const measureListHeight = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    listHeightRef.current = list.scrollHeight;
  }, []);

  // Máximo desplazamiento (altura scrollable)
  const getScrollMax = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return 0;
    return Math.max(0, listHeightRef.current - container.clientHeight);
  }, []);

  // Loop de animación
  const tick = React.useCallback((now: number) => {
    const container = containerRef.current;
    if (!container) return;

    if (pausedRef.current) {
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const last = lastTimeRef.current ?? now - FRAME_FALLBACK_MS;
    const dt = (now - last) / 1000; // segundos
    lastTimeRef.current = now;

    const delta = SPEED_PX_PER_SEC * dt;
    const scrollMax = getScrollMax();

    if (scrollMax > 0) {
      // Avanza
      let nextTop = container.scrollTop + delta;

      // Si llegamos (o pasamos) al final, volvemos al inicio
      if (nextTop >= scrollMax) {
        // Reinicio suave: colocamos en 0 en el siguiente frame
        nextTop = 0;
      }

      container.scrollTop = nextTop;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [getScrollMax]);

  const start = React.useCallback(() => {
    if (rafRef.current) return;
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = React.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Iniciar animación y listeners
  React.useEffect(() => {
    measureListHeight();
    start();

    // Re-medimos en resize y preservamos posición proporcional
    const onResize = () => {
      const container = containerRef.current;
      const oldScrollable = Math.max(0, listHeightRef.current - (container?.clientHeight ?? 0));
      measureListHeight();
      const newScrollable = Math.max(0, listHeightRef.current - (container?.clientHeight ?? 0));
      if (container && oldScrollable > 0 && newScrollable > 0) {
        const ratio = container.scrollTop / oldScrollable;
        container.scrollTop = ratio * newScrollable;
      }
    };
    window.addEventListener('resize', onResize);

    // Observa cambios de tamaño en la lista (imágenes cargando, etc.)
    const ro = new ResizeObserver(() => {
      const container = containerRef.current;
      const oldScrollable = Math.max(0, listHeightRef.current - (container?.clientHeight ?? 0));
      measureListHeight();
      const newScrollable = Math.max(0, listHeightRef.current - (container?.clientHeight ?? 0));
      // Mantener posición proporcional si cambia
      if (container && oldScrollable > 0 && newScrollable > 0) {
        const ratio = container.scrollTop / oldScrollable;
        container.scrollTop = ratio * newScrollable;
      }
    });
    if (listRef.current) ro.observe(listRef.current);

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      stop();
    };
  }, [measureListHeight, start, stop, result.length]);

  // Pausas por interacción del usuario
  const handleUserInteract = () => {
    pausedRef.current = true;
  };
  const handleMouseLeave = () => {
    pausedRef.current = false;
  };

  if (!result || result.length === 0) {
    return null;
  }

  const orderedResult = [...result].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Video de fondo */}
      <video
        className="absolute scroll-container top-0 left-0 w-full h-full object-cover z-0"
        src="/video/video-miedos.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <NavBar />

      <div
        ref={containerRef}
        className={`
          relative h-[100vh] overflow-y-auto
          snap-none
          px-4 py-24
        `}
        onMouseEnter={handleUserInteract}
        onMouseLeave={handleMouseLeave}
        onWheel={handleUserInteract}
        onTouchMove={handleUserInteract}
      >
        {/* UNA sola lista */}
        <div ref={listRef} className="flex flex-col gap-0">
          {orderedResult.map((img, idx) => (
            <HomeImageCard
              key={img.id ?? img.slug ?? `img-${idx}`}
              data={img}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerticalSnapCarousel;
