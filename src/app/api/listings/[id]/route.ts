import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: "Listing ID is required" },
                { status: 400 }
            );
        }

        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: { order: "asc" },
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
                gallerySections: {
                    include: {
                        images: {
                            orderBy: { order: "asc" },
                        },
                    },
                    orderBy: { order: "asc" },
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
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
                        createdAt: "desc",
                    },
                },
            },
        });

        if (!listing) {
            return NextResponse.json(
                { error: "Listing not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(listing);
    } catch (error) {
        console.error("Get listing error:", error);
        return NextResponse.json(
            { error: "Failed to fetch listing" },
            { status: 500 }
        );
    }
}
