import React from 'react';

interface Bedroom {
  id: string;
  name: string;
  type: string;
  description: string;
  imageUrl: string;
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
    ? bedrooms.sort((a, b) => a.order - b.order)
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
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                <img
                  src={bedroom.imageUrl}
                  alt={bedroom.name}
                  className="object-cover w-full h-full hover:scale-105 transition duration-500"
                />
              </div>
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
    </section>
  );
};

export default SleepingArrangements;