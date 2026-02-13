import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function UpcomingTripsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect('/');
  }

  const now = new Date();

  const bookings = await prisma.reservation.findMany({
    where: { userId },
    include: {
      listing: {
        select: {
          title: true,
          imageSrc: true,
        },
      },
    },
    orderBy: { startDate: 'asc' },
  });

  const upcomingTrips = bookings.filter((booking) => booking.endDate >= now);

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-10 md:pt-14">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Upcoming Trips</h1>
          <p className="text-gray-500">Your upcoming reservations.</p>
        </div>

        {upcomingTrips.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-sm text-gray-500">
            No upcoming trips yet.
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingTrips.map((booking) => (
              <div key={booking.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 shadow-sm">
                <img src={booking.listing?.imageSrc} alt={booking.listing?.title || 'Listing'} className="w-full md:w-24 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{booking.listing?.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {booking.startDate.toLocaleDateString()}{' -> '}{booking.endDate.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Guests: {booking.adults} Adults{booking.children ? `, ${booking.children} Children` : ''}
                  </p>
                </div>
                <div className="text-sm font-semibold text-gray-900">${booking.totalPrice.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/profile" className="text-sm font-semibold text-gray-900 underline">
            Back to Profile
          </Link>
        </div>
      </div>
    </main>
  );
}
