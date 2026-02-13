'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

type ListingPhotosData = {
  id: string;
  title: string;
  imageSrc: string;
  images: Array<{ id: string; imageUrl: string }>;
  gallerySections: Array<{
    id: string;
    title: string;
    order: number;
    images: Array<{
      id: string;
      imageUrl: string;
      order: number;
    }>;
  }>;
};

export default function ListingPhotosClient({ listing }: { listing: ListingPhotosData }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const displayImages = useMemo(
    () => (listing.images?.length ? listing.images.map((img) => img.imageUrl) : [listing.imageSrc]),
    [listing]
  );

  const sections = useMemo(() => {
    const mainSection = {
      id: 'main',
      title: 'All photos',
      images: displayImages,
    };
    const extraSections = (listing.gallerySections || []).map((section) => ({
      id: section.id,
      title: section.title,
      images: (section.images || []).map((img) => img.imageUrl),
    }));
    return [mainSection, ...extraSections].filter((s) => s.images.length > 0);
  }, [listing, displayImages]);

  const openLightbox = (images: string[], index: number, title: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const prevImage = () => setLightboxIndex((i) => (i > 0 ? i - 1 : i));
  const nextImage = () => setLightboxIndex((i) => (i < lightboxImages.length - 1 ? i + 1 : i));

  return (
    <main className="min-h-screen bg-white pb-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-8">
        <Link
          href={`/listing/${listing.id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">All photos</h1>
        <p className="text-gray-500 mb-8">{listing.title}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => openLightbox(section.images, 0, section.title)}
              className="text-left group"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-square mb-3">
                <img
                  src={section.images[0]}
                  alt={section.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="text-sm font-semibold text-gray-900">{section.title}</div>
              <div className="text-xs text-gray-500">{section.images.length} photos</div>
            </button>
          ))}
        </div>

        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.id} className="space-y-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">{section.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {section.images.map((img, idx) => (
                  <button
                    key={`${section.id}-${idx}`}
                    onClick={() => openLightbox(section.images, idx, section.title)}
                    className="relative overflow-hidden rounded-xl md:rounded-2xl aspect-square"
                  >
                    <img
                      src={img}
                      alt={`${section.title} photo`}
                      className="object-cover w-full h-full hover:scale-105 transition duration-500"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
          >
            <X size={22} />
          </button>

          <div className="absolute top-6 left-6 text-white text-sm font-semibold">{lightboxTitle}</div>

          <button
            onClick={prevImage}
            disabled={lightboxIndex === 0}
            className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition disabled:opacity-40"
          >
            <ChevronLeft size={26} />
          </button>

          <img
            src={lightboxImages[lightboxIndex]}
            alt="Photo"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />

          <button
            onClick={nextImage}
            disabled={lightboxIndex === lightboxImages.length - 1}
            className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition disabled:opacity-40"
          >
            <ChevronRight size={26} />
          </button>
        </div>
      )}
    </main>
  );
}
