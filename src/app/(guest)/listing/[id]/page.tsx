import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ListingDetailClient from '@/components/pages/ListingDetailClient';

type Highlight = string | { title: string; description?: string };

const normalizeHighlights = (input: unknown): Highlight[] => {
  if (!Array.isArray(input)) return [];

  const highlights: Highlight[] = [];
  for (const item of input) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed) highlights.push(trimmed);
      continue;
    }

    if (item && typeof item === 'object') {
      const title = (item as { title?: unknown }).title;
      if (typeof title === 'string' && title.trim()) {
        const description = (item as { description?: unknown }).description;
        highlights.push(
          typeof description === 'string' && description.trim()
            ? { title: title.trim(), description: description.trim() }
            : { title: title.trim() }
        );
      }
    }
  }

  return highlights;
};

export const dynamic = 'force-dynamic';

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, listing] = await Promise.all([
    getServerSession(authOptions),
    prisma.listing.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        bedrooms: {
          orderBy: { order: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    }),
  ]);

  if (!listing) {
    notFound();
  }

  const serialized = {
    ...listing,
    subtitle: listing.subtitle ?? '',
    mapIframe: listing.mapIframe ?? null,
    amenities: listing.amenities ?? [],
    rules: listing.rules ?? [],
    highlights: normalizeHighlights(listing.highlights),
    reviews: listing.reviews.map((review) => ({
      ...review,
      user: {
        name: review.user.name || 'Anonymous',
        image: review.user.image,
      },
      createdAt: review.createdAt.toISOString(),
    })),
    bedrooms: listing.bedrooms.map((bedroom) => ({
      ...bedroom,
      imageUrl: bedroom.imageUrl ?? null,
      createdAt: bedroom.createdAt.toISOString(),
    })),
  };

  return (
    <ListingDetailClient
      listing={serialized}
      userId={(session?.user as { id?: string } | undefined)?.id}
    />
  );
}
