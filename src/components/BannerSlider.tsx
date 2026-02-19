'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

type BannerSliderProps = {
  images: string[];
  intervalMs?: number;
};

export default function BannerSlider({ images, intervalMs = 4500 }: BannerSliderProps) {
  const sanitizedImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (sanitizedImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sanitizedImages.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, sanitizedImages.length]);

  const currentImages = sanitizedImages.length > 0 ? sanitizedImages : ['/banner.png'];

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
      <div className="relative aspect-[1440/390] w-full">
        {currentImages.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={src}
              alt="Featured property"
              fill
              priority={index === 0}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1280px"
            />
          </div>
        ))}
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
