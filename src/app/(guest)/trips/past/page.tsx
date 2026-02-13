import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PastTripsClient from '@/components/pages/PastTripsClient';

export const dynamic = 'force-dynamic';

export default async function PastTripsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect('/');
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          imageSrc: true,
        },
      },
    },
    orderBy: { endDate: 'desc' },
  });

  const reviewedListingIds = await prisma.review.findMany({
    where: { userId },
    select: { listingId: true },
  });

  const reviewedSet = new Set(reviewedListingIds.map((r) => r.listingId));
  const now = new Date();

  const bookings = reservations
    .filter((booking) => booking.endDate < now)
    .map((booking) => ({
      id: booking.id,
      listingId: booking.listingId,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      hasReview: reviewedSet.has(booking.listingId),
      listing: {
        title: booking.listing?.title || 'Listing',
        imageSrc: booking.listing?.imageSrc || '',
      },
    }));

  return <PastTripsClient bookings={bookings} userId={userId} />;
}
