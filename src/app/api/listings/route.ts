import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const listings = await prisma.listing.findMany({
            include: {
                images: {
                    orderBy: { order: "asc" },
                    take: 1,
                },
                specifications: {
                    orderBy: { order: "asc" },
                },
                advantages: {
                    orderBy: { order: "asc" },
                },
                bedrooms: {
                    orderBy: { order: "asc" },
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
            orderBy: [
                { displayOrder: "asc" },
                { createdAt: "desc" },
            ],
        });

        return NextResponse.json(listings);
    } catch (error) {
        console.error("Get listings error:", error);
        return NextResponse.json(
            { error: "Failed to fetch listings" },
            { status: 500 }
        );
    }
}
