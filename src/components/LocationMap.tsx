'use client';
import React from 'react';
import Link from 'next/link';
interface MapEmbedProps {
  mapIframe?: string;
  listingId?: string;
  locationLabel?: string;
}
const LocationMap = ({ mapIframe, listingId, locationLabel }: MapEmbedProps) => {
  if (!mapIframe) {
    return null;
  }

  const staticKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_STATIC_KEY;
  const extractSrc = (input: string) => {
    const match = input.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : input;
  };
  const extractCoords = (input: string) => {
    const src = extractSrc(input);
    const decoded = decodeURIComponent(src);
    const centerMatch = decoded.match(/[?&]center=([-0-9.]+),\s*([-0-9.]+)/i);
    if (centerMatch) return { lat: centerMatch[1], lng: centerMatch[2] };
    const qMatch = decoded.match(/[?&]q=([-0-9.]+),\s*([-0-9.]+)/i);
    if (qMatch) return { lat: qMatch[1], lng: qMatch[2] };
    const queryMatch = decoded.match(/[?&]query=([-0-9.]+),\s*([-0-9.]+)/i);
    if (queryMatch) return { lat: queryMatch[1], lng: queryMatch[2] };
    const embedMatch = decoded.match(/!3d([-0-9.]+)!4d([-0-9.]+)/i);
    if (embedMatch) return { lat: embedMatch[1], lng: embedMatch[2] };
    return null;
  };
  const coords = extractCoords(mapIframe);
  const hasStaticKey = Boolean(staticKey && (coords || locationLabel));
  const staticMapUrl = hasStaticKey
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
        coords ? `${coords.lat},${coords.lng}` : (locationLabel as string)
      )}&zoom=13&size=1200x600&scale=2&maptype=roadmap&key=${staticKey}`
    : null;
  
  return (
    <section className="py-12 max-w-7xl mx-auto px-6">
      {/* Header Text */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Where you'll be</h2>
        <p className="text-gray-500 mt-1">Marathon, Florida, United States</p>
      </div>

      {/* Map Container - matches the rounded corners of your image */}
      <div className="w-full h-[480px] rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
        {staticMapUrl ? (
          <img
            src={staticMapUrl}
            alt="Location map preview"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <iframe
            src={mapIframe}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Paradise Point Location"
            className="grayscale-[0.2] contrast-[1.1]"
          />
        )}
      </div>
      
      {/* Optional: Descriptive text below map as seen in some property sites */}
      {listingId && (
        <div className="mt-6">
          <Link
            href={`/listing/${listingId}/location`}
            className="text-sm font-bold text-zinc-900 underline underline-offset-4"
          >
            Show more about the location
          </Link>
        </div>
      )}
    </section>
  );
};

export default LocationMap;
