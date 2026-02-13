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

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get("status");
        const refundStatus = searchParams.get("refundStatus");
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        const q = searchParams.get("q");
        const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
        const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "10", 10), 1), 100);
        const skip = (page - 1) * pageSize;

        const where: any = {};
        if (status) where.paymentStatus = status;
        if (refundStatus) where.refundStatus = refundStatus;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom);
            if (dateTo) where.createdAt.lte = new Date(dateTo);
        }
        if (q) {
            where.OR = [
                { listing: { title: { contains: q, mode: "insensitive" } } },
                { user: { email: { contains: q, mode: "insensitive" } } },
                { stripePaymentIntentId: { contains: q, mode: "insensitive" } },
            ];
        }

        const total = await prisma.reservation.count({ where });

        const reservations = await prisma.reservation.findMany({
            where,
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
        console.error("Admin payments error:", error);
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}
