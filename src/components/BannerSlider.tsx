'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

type BannerSliderProps = {
  images: string[];
  intervalMs?: number;
  autoplayStartDelayMs?: number;
};

export default function BannerSlider({
  images,
  intervalMs = 4500,
  autoplayStartDelayMs = 12000,
}: BannerSliderProps) {
  const sanitizedImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [autoplayReady, setAutoplayReady] = useState(false);
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoplayDelayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sanitizedImages.length <= 1) return;
    autoplayDelayRef.current = setTimeout(() => {
      setAutoplayReady(true);
    }, autoplayStartDelayMs);

    return () => {
      if (autoplayDelayRef.current) clearTimeout(autoplayDelayRef.current);
    };
  }, [autoplayStartDelayMs, sanitizedImages.length]);

  useEffect(() => {
    if (!autoplayReady) return;
    if (sanitizedImages.length <= 1) return;
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setIsVisible(false);
      switchTimeoutRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % sanitizedImages.length);
        setIsVisible(true);
      }, 220);
    }, intervalMs);

    return () => {
      clearInterval(timer);
      if (switchTimeoutRef.current) clearTimeout(switchTimeoutRef.current);
    };
  }, [autoplayReady, intervalMs, sanitizedImages.length]);

  useEffect(() => {
    if (sanitizedImages.length <= 1) return;
    const nextIndex = (activeIndex + 1) % sanitizedImages.length;
    const prefetch = new window.Image();
    prefetch.src = sanitizedImages[nextIndex];
  }, [activeIndex, sanitizedImages]);

  const currentImages = sanitizedImages.length > 0 ? sanitizedImages : ['/banner.png'];
  const activeSrc = currentImages[activeIndex] || currentImages[0];

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
      <div className="relative aspect-[1440/390] w-full">
        <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src={activeSrc}
            alt="Featured property"
            fill
            priority={activeIndex === 0}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1280px"
          />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      <div className="absolute inset-0 flex md:items-end">
        <div className="max-w-md px-5 py-4 md:px-10 pb-10">
          <h2
            className="text-lg md:text-5xl font-semibold text-white leading-tight"
            style={{ fontFamily: 'Begies, \"Times New Roman\", serif' }}
          >
            Luxury that
            <br />
            feels personal
          </h2>
        </div>
      </div>

      {currentImages.length > 1 && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-1 backdrop-blur-sm">
          {currentImages.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
