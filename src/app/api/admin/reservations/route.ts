import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(adminAuthOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const params = request.nextUrl.searchParams;
        const page = Math.max(parseInt(params.get("page") || "1", 10), 1);
        const pageSize = Math.min(Math.max(parseInt(params.get("pageSize") || "10", 10), 1), 100);
        const skip = (page - 1) * pageSize;

        const total = await prisma.reservation.count();

        const reservations = await prisma.reservation.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                listing: {
                    select: { id: true, title: true, subtitle: true, imageSrc: true, locationValue: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        });

        return NextResponse.json({
            data: reservations,
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error("Admin reservations error:", error);
        return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
    }
}
