'use client';

import React from 'react';
import NavBar from '@/components/ui/navbar';
import { useGetHomeImages } from '@/api/useGetHomeImages';
import { HomeImageType } from '@/types/homeImage';
import HomeImageCard from './HomeImageCard';

const SPEED_PX_PER_SEC = 40;       // Ajusta la velocidad del autoscroll
const FRAME_FALLBACK_MS = 16;      // ~60fps

const VerticalSnapCarousel: React.FC = () => {
  const result: HomeImageType[] = useGetHomeImages().result ?? [];

  // Refs
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastTimeRef = React.useRef<number | null>(null);
  const pausedRef = React.useRef<boolean>(false);
  const listHeightRef = React.useRef<number>(0);

  // Mide la altura de una "lista" (no la duplicada)
  const measureListHeight = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    // Altura total del contenido de UNA pasada (no el contenedor)
    listHeightRef.current = list.scrollHeight;
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
    const oneListHeight = listHeightRef.current;

    if (oneListHeight > 0) {
      // Avanza
      container.scrollTop += delta;

      // Cuando pasamos el final de la primera lista, restamos su altura.
      // Esto crea un bucle continuo sin salto visual.
      if (container.scrollTop >= oneListHeight) {
        container.scrollTop -= oneListHeight;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

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

  // Efecto: iniciar animación y limpiar
  React.useEffect(() => {
    // Medimos tras montar y cuando cambie el contenido
    measureListHeight();
    start();

    // Re-medimos al redimensionar para mantener el bucle fino
    const onResize = () => {
      const container = containerRef.current;
      const oldOne = listHeightRef.current;
      measureListHeight();

      // Mantén la posición proporcional si cambia la altura
      const one = listHeightRef.current;
      if (container && oldOne > 0 && one > 0) {
        const ratio = container.scrollTop / oldOne;
        container.scrollTop = ratio * one;
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
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

  // Si no hay datos, renderiza vacío
  if (!result || result.length === 0) {
    return null;
  }
  // Ordena por el campo 'order' si hay datos
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
          snap-none  /* importante: sin snap para scroll continuo */
          px-4 py-24
        `}
        onMouseEnter={handleUserInteract}
        onMouseLeave={handleMouseLeave}
        onWheel={handleUserInteract}
        onTouchMove={handleUserInteract}
      >
        {/* Duplicamos la lista para lograr loop perfecto */}
        <div ref={listRef} className="flex flex-col gap-0">
          {orderedResult.map((img: HomeImageType) => (
            <HomeImageCard key={`a-${img.id ?? img.slug ?? Math.random()}`} data={img} />
          ))}
        </div>

        {/* Copia 2 — NO usar la misma ref, solo duplicar contenido */}
        <div className="flex flex-col gap-0">
          {orderedResult.map((img: HomeImageType) => (
            <HomeImageCard key={`b-${img.id ?? img.slug ?? Math.random()}`} data={img} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerticalSnapCarousel;
