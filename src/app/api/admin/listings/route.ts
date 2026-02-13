import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const session = await getServerSession(adminAuthOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const page = Math.max(parseInt(params.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(params.get("pageSize") || "9", 10), 1), 100);
    const skip = (page - 1) * pageSize;

    const total = await prisma.listing.count();

    const listings = await prisma.listing.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc',
        },
        skip,
        take: pageSize,
    });

    return NextResponse.json({
        data: listings,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    });
}
