import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileClient from '@/components/pages/ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect('/');
  }

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
    orderBy: { startDate: 'desc' },
  });

  return (
    <ProfileClient
      user={{
        name: session?.user?.name,
        email: session?.user?.email,
        image: session?.user?.image,
      }}
      bookings={bookings.map((booking) => ({
        id: booking.id,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        adults: booking.adults,
        children: booking.children,
        totalPrice: booking.totalPrice,
        listing: {
          title: booking.listing?.title || 'Listing',
          imageSrc: booking.listing?.imageSrc || '',
        },
      }))}
    />
  );
}
