import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { listingId, userId, rating, comment } = body;

        if (!listingId || !userId || !rating || !comment) {
            return NextResponse.json(
                { error: "Missing required fields: listingId, userId, rating, comment" },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        // Verify listing exists
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            return NextResponse.json(
                { error: "Listing not found" },
                { status: 404 }
            );
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const now = new Date();
        const completedReservation = await prisma.reservation.findFirst({
            where: {
                listingId,
                userId,
                endDate: { lt: now },
            },
            select: { id: true },
        });

        if (!completedReservation) {
            return NextResponse.json(
                { error: "You can review only after completing your stay" },
                { status: 403 }
            );
        }

        const existingReview = await prisma.review.findFirst({
            where: { listingId, userId },
            select: { id: true },
        });

        if (existingReview) {
            return NextResponse.json(
                { error: "You already reviewed this property" },
                { status: 409 }
            );
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                listingId,
                userId,
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error("Create review error:", error);
        return NextResponse.json(
            { error: "Failed to create review" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const listingId = request.nextUrl.searchParams.get("listingId");

        if (!listingId) {
            return NextResponse.json(
                { error: "listingId parameter is required" },
                { status: 400 }
            );
        }

        const reviews = await prisma.review.findMany({
            where: { listingId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Get reviews error:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}
