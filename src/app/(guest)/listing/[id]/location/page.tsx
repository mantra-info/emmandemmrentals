import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ListingLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      advantages: { orderBy: { order: 'asc' } },
    },
  });

  if (!listing) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Location</h1>
            <p className="text-sm text-gray-500 mt-1">{listing.locationValue}</p>
          </div>
          <Link
            href={`/listing/${listing.id}`}
            className="text-sm font-semibold text-gray-900 underline underline-offset-4"
          >
            Back to listing
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="w-full h-[420px] rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
            {listing.mapIframe ? (
              <iframe
                src={listing.mapIframe}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${listing.title} Location`}
                className="grayscale-[0.2] contrast-[1.1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                Map is unavailable for this listing.
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Area Advantages</h2>
            <p className="text-sm text-gray-500 mb-6">What makes this location special.</p>

            {listing.advantages.length === 0 ? (
              <p className="text-sm text-gray-500">No location advantages added yet.</p>
            ) : (
              <div className="space-y-4">
                {listing.advantages.map((adv) => (
                  <div key={adv.id} className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{adv.title}</h3>
                      {adv.description && (
                        <p className="text-xs text-gray-500 mt-1">{adv.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
