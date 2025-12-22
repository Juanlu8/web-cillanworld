'use client';

import React from 'react';
import NavBar from '@/components/ui/navbar';
import { HomeImageType } from '@/types/homeImage';
import HomeImageCard from './HomeImageCard';

const SPEED_PX_PER_SEC = 60; // Velocidad del autoscroll
const FRAME_FALLBACK_MS = 16; // ~60fps

type Props = {
  initialImages: any; // Los datos de home-image desde Strapi
};

const VerticalSnapCarousel: React.FC<Props> = ({ initialImages }) => {
  const result: HomeImageType[] = React.useMemo(() => {
    if (!initialImages) return [];

    if (Array.isArray(initialImages)) return initialImages;

    if (initialImages.data && Array.isArray(initialImages.data)) {
      return initialImages.data;
    }

    if (initialImages.attributes) {
      const attrs = initialImages.attributes;
      if (attrs.images?.data && Array.isArray(attrs.images.data)) {
        return attrs.images.data;
      }
    }

    return [];
  }, [initialImages]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastTimeRef = React.useRef<number | null>(null);
  const pausedRef = React.useRef<boolean>(false);
  const listHeightRef = React.useRef<number>(0); // altura total de la lista
  const wrapTimeoutRef = React.useRef<number | null>(null);
  const [isWrapping, setIsWrapping] = React.useState(false);

  const measureListHeight = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    listHeightRef.current = list.scrollHeight;
  }, []);

  const getScrollMax = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return 0;
    return Math.max(0, listHeightRef.current - container.clientHeight);
  }, []);

  const stopAnim = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const tick = React.useCallback(
    (now: number) => {
      const container = containerRef.current;
      if (!container) return;

      const scrollMax = getScrollMax();

      if (pausedRef.current || scrollMax <= 0) {
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const last = lastTimeRef.current ?? now - FRAME_FALLBACK_MS;
      const dt = (now - last) / 1000; // segundos
      lastTimeRef.current = now;

      const delta = SPEED_PX_PER_SEC * dt;
      let nextTop = container.scrollTop + delta;

      if (nextTop >= scrollMax) {
        if (wrapTimeoutRef.current) {
          clearTimeout(wrapTimeoutRef.current);
          wrapTimeoutRef.current = null;
        }
        setIsWrapping(true);
        wrapTimeoutRef.current = window.setTimeout(() => {
          setIsWrapping(false);
          wrapTimeoutRef.current = null;
        }, 150);

        nextTop = 0; // vuelve al inicio para un loop continuo sin clonar
        container.scrollTop = nextTop;
        lastTimeRef.current = now;
      } else {
        container.scrollTop = nextTop;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [getScrollMax]
  );

  const start = React.useCallback(() => {
    if (rafRef.current) return;
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = React.useCallback(() => {
    stopAnim();
  }, []);

  React.useEffect(() => {
    measureListHeight();
    start();

    const onResize = () => {
      const container = containerRef.current;
      const prevHeight = listHeightRef.current;
      measureListHeight();
      const nextHeight = listHeightRef.current;

      if (container && prevHeight > 0 && nextHeight > 0 && prevHeight !== nextHeight) {
        const progress = Math.min(1, container.scrollTop / prevHeight);
        container.scrollTop = progress * nextHeight;
      }
    };
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(() => {
      const container = containerRef.current;
      const prevHeight = listHeightRef.current;
      measureListHeight();
      const nextHeight = listHeightRef.current;

      if (container && prevHeight > 0 && nextHeight > 0 && prevHeight !== nextHeight) {
        const progress = Math.min(1, container.scrollTop / prevHeight);
        container.scrollTop = progress * nextHeight;
      }
    });
    if (listRef.current) ro.observe(listRef.current);

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      if (wrapTimeoutRef.current) {
        clearTimeout(wrapTimeoutRef.current);
      }
      stop();
    };
  }, [measureListHeight, start, stop, result.length]);

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
  const listOpacityClass = isWrapping ? 'opacity-0' : 'opacity-100';

  return (
    <div className="min-h-screen flex flex-col">
      <video
        className="absolute scroll-container top-0 left-0 w-full h-full object-cover z-0"
        src="https://res.cloudinary.com/dsyvrdb00/video/upload/q_auto,f_auto/Miedos720_ydzx2l"
        autoPlay
        muted
        loop
        playsInline
      />
      <NavBar />

      <div
        ref={containerRef}
        className="
          relative h-[100vh] overflow-y-auto
          snap-none
          px-4 py-24
        "
        onMouseEnter={handleUserInteract}
        onMouseLeave={handleMouseLeave}
        onWheel={handleUserInteract}
        onTouchMove={handleUserInteract}
      >
        <div className="flex flex-col gap-0">
          <div
            ref={listRef}
            className={`flex flex-col gap-0 transition-opacity duration-300 ease-out ${listOpacityClass}`}
          >
            {orderedResult.map((img, idx) => (
              <HomeImageCard key={img.id ?? img.slug ?? `img-${idx}`} data={img} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalSnapCarousel;
