import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Bedroom {
  id: string;
  name: string;
  type: string;
  description: string;
  imageUrl: string | null;
  order: number;
  listingId: string;
  createdAt: string;
}

interface SleepingArrangementsProps {
  arrangements?: string[];
  bedrooms?: Bedroom[];
}

const SleepingArrangements = ({ arrangements = [], bedrooms = [] }: SleepingArrangementsProps) => {
  // Use bedrooms data if available, otherwise use arrangements
  const displayBedrooms = bedrooms.length > 0
    ? [...bedrooms].sort((a, b) => a.order - b.order)
    : arrangements.map((arr, idx) => ({
        id: `${idx}`,
        name: `Bedroom - ${idx + 1}`,
        type: arr,
        description: '',
        imageUrl: '',
        order: idx,
        listingId: '',
        createdAt: '',
      }));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const bedroomImages = useMemo(
    () => displayBedrooms.filter((bedroom) => !!bedroom.imageUrl),
    [displayBedrooms]
  );

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const prevImage = () => setLightboxIndex((i) => (i > 0 ? i - 1 : i));
  const nextImage = () => setLightboxIndex((i) => (i < bedroomImages.length - 1 ? i + 1 : i));

  return (
    <section className="py-12 max-w-7xl mx-auto px-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Where you'll sleep
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayBedrooms.map((bedroom) => (
          <div key={bedroom.id} className="flex flex-col gap-4">
            {/* Image Container */}
            {bedroom.imageUrl && (
              <button
                type="button"
                onClick={() => {
                  const imageIndex = bedroomImages.findIndex((b) => b.id === bedroom.id);
                  if (imageIndex >= 0) openLightbox(imageIndex);
                }}
                className="relative aspect-[16/10] overflow-hidden rounded-xl cursor-zoom-in"
              >
                <img
                  src={bedroom.imageUrl}
                  alt={bedroom.name}
                  className="object-cover w-full h-full hover:scale-105 transition duration-500"
                />
              </button>
            )}

            {/* Text Content */}
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-gray-900 text-[17px]">
                {bedroom.name}
              </h3>
              <p className="text-gray-500 text-sm font-medium">
                {bedroom.type}
              </p>
              {bedroom.description && (
                <p className="text-gray-600 text-sm mt-2">
                  {bedroom.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {lightboxOpen && bedroomImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
          >
            <X size={22} />
          </button>

          <button
            onClick={prevImage}
            disabled={lightboxIndex === 0}
            className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition disabled:opacity-40"
          >
            <ChevronLeft size={26} />
          </button>

          <img
            src={bedroomImages[lightboxIndex].imageUrl || ''}
            alt={bedroomImages[lightboxIndex].name}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />

          <button
            onClick={nextImage}
            disabled={lightboxIndex === bedroomImages.length - 1}
            className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition disabled:opacity-40"
          >
            <ChevronRight size={26} />
          </button>
        </div>
      )}
    </section>
  );
};

export default SleepingArrangements;
