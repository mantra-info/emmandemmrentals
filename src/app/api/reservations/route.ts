import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const parseDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date;
};

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !(session.user as any).id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userId = (session.user as any).id as string;
        const reservations = await prisma.reservation.findMany({
            where: { userId },
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        subtitle: true,
                        imageSrc: true,
                        locationValue: true,
                    },
                },
            },
            orderBy: { startDate: "desc" },
        });

        const reviewedListingIds = await prisma.review.findMany({
            where: { userId },
            select: { listingId: true },
        });

        const reviewedSet = new Set(reviewedListingIds.map((r) => r.listingId));
        const now = new Date();

        const enriched = reservations.map((reservation) => ({
            ...reservation,
            isPast: reservation.endDate < now,
            hasReview: reviewedSet.has(reservation.listingId),
        }));

        return NextResponse.json(enriched);
    } catch (error) {
        console.error("Get reservations error:", error);
        return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !(session.user as any).id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userId = (session.user as any).id as string;
        const body = await request.json();
        const {
            listingId,
            startDate,
            endDate,
            adults = 1,
            children = 0,
            infants = 0,
            pets = 0,
        } = body;

        if (!listingId || !startDate || !endDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const parsedStart = parseDate(startDate);
        const parsedEnd = parseDate(endDate);
        if (!parsedStart || !parsedEnd) {
            return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
        }

        if (parsedEnd <= parsedStart) {
            return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
        }

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: {
                id: true,
                basePricePerNight: true,
                price: true,
                cleaningFee: true,
                serviceFee: true,
                taxPercentage: true,
                minStayNights: true,
            },
        });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        const nights = Math.ceil((parsedEnd.getTime() - parsedStart.getTime()) / (1000 * 60 * 60 * 24));
        const minStay = Math.max(1, listing.minStayNights || 1);
        if (nights < minStay) {
            return NextResponse.json({ error: `Minimum stay is ${minStay} nights` }, { status: 400 });
        }

        const pricePerNight = listing.basePricePerNight ?? listing.price ?? 0;
        const cleaningFee = listing.cleaningFee ?? 0;
        const serviceFee = listing.serviceFee ?? 0;
        const taxPercentage = listing.taxPercentage ?? 0;
        const subtotal = pricePerNight * nights + cleaningFee + serviceFee;
        const taxAmount = Math.round(subtotal * (taxPercentage / 100));
        const totalPrice = subtotal + taxAmount;

        const reservation = await prisma.reservation.create({
            data: {
                userId,
                listingId,
                startDate: parsedStart,
                endDate: parsedEnd,
                nights,
                adults,
                children,
                infants,
                pets,
                pricePerNight,
                subtotal,
                cleaningFee,
                serviceFee,
                taxPercentage,
                taxAmount,
                totalPrice,
            },
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        subtitle: true,
                        imageSrc: true,
                        locationValue: true,
                    },
                },
            },
        });

        return NextResponse.json(reservation, { status: 201 });
    } catch (error) {
        console.error("Create reservation error:", error);
        return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
    }
}
