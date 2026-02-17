import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
    const session = await getServerSession(adminAuthOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const fetchAll = params.get("all") === "1";
    const page = Math.max(parseInt(params.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(params.get("pageSize") || "9", 10), 1), 100);
    const skip = (page - 1) * pageSize;

    const total = await prisma.listing.count();

    const baseQuery: Prisma.ListingFindManyArgs = {
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                }
            },
            taxProfile: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: [
            { displayOrder: 'asc' as const },
            { createdAt: 'desc' as const },
        ],
    };

    const listings = fetchAll
        ? await prisma.listing.findMany(baseQuery)
        : await prisma.listing.findMany({
            ...baseQuery,
            skip,
            take: pageSize,
        });

    return NextResponse.json({
        data: listings,
        page,
        pageSize: fetchAll ? listings.length : pageSize,
        total,
        totalPages: fetchAll ? 1 : Math.ceil(total / pageSize),
    });
}
