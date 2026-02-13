'use client';
import React from 'react';
interface MapEmbedProps {
  mapIframe?: string;
}
const LocationMap = ({ mapIframe }: MapEmbedProps) => {

  if (!mapIframe) {
    return null;
  }
  
  return (
    <section className="py-12 max-w-7xl mx-auto px-6">
      {/* Header Text */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Where you'll be</h2>
        <p className="text-gray-500 mt-1">Marathon, Florida, United States</p>
      </div>

      {/* Map Container - matches the rounded corners of your image */}
      <div className="w-full h-[480px] rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        <iframe
          src={mapIframe}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Paradise Point Location"
          className="grayscale-[0.2] contrast-[1.1]" // Optional: makes the map look a bit more premium
        />
      </div>
      
      {/* Optional: Descriptive text below map as seen in some property sites */}
      <div className="mt-6">
        <button className="text-sm font-bold text-zinc-900 underline underline-offset-4">
          Show more about the location
        </button>
      </div>
    </section>
  );
};

export default LocationMap;