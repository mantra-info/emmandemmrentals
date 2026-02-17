'use client'
import React, { useState } from 'react';
import AmenitiesModal from './AmenitiesModal';
import { AMENITY_CATEGORIES, getAmenityIcon, resolveAmenitySelections } from '@/lib/amenities';

interface AmenitiesProps {
  amenities?: any[];
}

const Amenities = ({ amenities = [] }: AmenitiesProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { included } = resolveAmenitySelections(amenities);
  const prioritizedAmenities = [...included].sort((a: any, b: any) => {
    const aCustom = String(a?.id || '').startsWith('custom-');
    const bCustom = String(b?.id || '').startsWith('custom-');
    if (aCustom === bCustom) return 0;
    return aCustom ? -1 : 1;
  });
  const displayAmenities = prioritizedAmenities.slice(0, 12);

  if (displayAmenities.length === 0) {
    return null;
  }

  return (
    <>
      <div className="py-12 md:py-16 flex flex-col justify-center items-center">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">What this place offers</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
          {displayAmenities.map((amenity: any, index: number) => {
            const IconComponent = getAmenityIcon(amenity.icon);
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">
                  <IconComponent size={24} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{amenity.name || 'Custom amenity'}</p>
                  {amenity.description && (
                    <p className="text-xs text-gray-500 mt-1">{amenity.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {included.length > 12 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-8 px-8 py-3 w-full text-sm underline rounded-lg font-medium transition-colors md:w-auto text-black underline-offset-4"
          >
            Show all {included.length} amenities
          </button>
        )}
      </div>

      <AmenitiesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amenities={amenities}
      />
    </>
  );
};

export default Amenities;
