import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ListingPhotosClient from '@/components/pages/ListingPhotosClient';

export const dynamic = 'force-dynamic';

export default async function ListingPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      imageSrc: true,
      images: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          imageUrl: true,
        },
      },
      gallerySections: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          order: true,
          images: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              imageUrl: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  return <ListingPhotosClient listing={listing} />;
}
