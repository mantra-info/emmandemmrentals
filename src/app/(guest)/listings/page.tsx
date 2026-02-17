import { MapPin, Star, Users, Bed, Bath } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ListingsPage() {
  const listings = await prisma.listing.findMany({
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1,
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const sortedListings = [...listings].sort((a: any, b: any) => {
    const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const calculateRating = (reviews: Array<{ rating: number }>) => {
    if (reviews.length === 0) return '5.0';
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return avgRating.toFixed(1);
  };

  return (
    <main className="min-h-screen bg-white pb-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
          <div className="aspect-[1440/390] w-full">
            <img
              src="/banner.png"
              alt="Featured property"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute inset-0 flex md:items-end">
            <div className="max-w-md px-5 py-4 md:px-10 pb-10">
              <h2
                className="text-lg md:text-5xl font-semibold text-white leading-tight"
                style={{ fontFamily: 'Begies, "Times New Roman", serif' }}
              >
                Luxury that
                <br />
                feels personal
              </h2>
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Explore Properties</h1>
        <p className="text-gray-500 mb-12">Discover amazing places to stay</p>

        {sortedListings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No listings available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedListings.map((listing) => {
              const imageUrl = listing.images.length > 0 ? listing.images[0].imageUrl : listing.imageSrc;
              const avgRating = calculateRating(listing.reviews);

              return (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                        ${listing.basePricePerNight ?? listing.price}/night
                      </div>
                      {listing.reviews.length > 0 && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span>{avgRating}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                        {listing.title}
                      </h3>

                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                        <MapPin size={14} />
                        <span className="line-clamp-1">{listing.locationValue}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-4 py-3 border-t border-b border-gray-100">
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{listing.guestCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed size={14} />
                          <span>{listing.roomCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath size={14} />
                          <span>{listing.bathroomCount}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-auto">
                        Hosted by <span className="font-medium text-gray-700">{listing.user.name || listing.user.email}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
