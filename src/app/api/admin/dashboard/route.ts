import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const daysAgo = (days: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - days);
    return d;
};

const formatDayKey = (date: Date) => date.toISOString().slice(0, 10);

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(adminAuthOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const params = request.nextUrl.searchParams;
        const rangeDays = Math.min(Math.max(parseInt(params.get("range") || "30", 10), 7), 365);
        const start = daysAgo(rangeDays - 1);
        const end = new Date();

        const paidWhere = {
            OR: [
                { paymentStatus: { in: ["paid", "succeeded"] } },
                { stripePaymentIntentId: { not: null } },
            ],
        };

        const [userCount, activeUsers, deactivatedUsers, listingCount, reservationCount, revenueAgg] =
            await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { status: "ACTIVE", deletedAt: null } }),
                prisma.user.count({ where: { status: "DEACTIVATED" } }),
                prisma.listing.count(),
                prisma.reservation.count(),
                prisma.reservation.aggregate({
                    where: paidWhere,
                    _sum: { totalPrice: true, refundedAmount: true },
                }),
            ]);

        const reservations = await prisma.reservation.findMany({
            where: {
                createdAt: { gte: start, lte: end },
                ...paidWhere,
            },
            select: {
                createdAt: true,
                totalPrice: true,
                refundedAmount: true,
                paymentStatus: true,
                listing: {
                    select: { id: true, title: true },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        const buckets: { date: string; revenue: number; bookings: number }[] = [];
        const bucketMap = new Map<string, { revenue: number; bookings: number }>();
        for (let i = 0; i < rangeDays; i += 1) {
            const day = daysAgo(rangeDays - 1 - i);
            const key = formatDayKey(day);
            const initial = { revenue: 0, bookings: 0 };
            bucketMap.set(key, initial);
            buckets.push({ date: key, ...initial });
        }

        const listingRevenue = new Map<string, { title: string; revenue: number }>();
        let refundCount = 0;
        let paidCount = 0;

        reservations.forEach((r) => {
            const key = formatDayKey(new Date(r.createdAt));
            const bucket = bucketMap.get(key);
            if (bucket) {
                bucket.revenue += r.totalPrice;
                bucket.bookings += 1;
            }

            if (r.paymentStatus === "succeeded" || r.paymentStatus === "paid") {
                paidCount += 1;
            }
            if (r.refundedAmount && r.refundedAmount > 0) {
                refundCount += 1;
            }

            if (r.listing?.id) {
                const current = listingRevenue.get(r.listing.id) || {
                    title: r.listing.title,
                    revenue: 0,
                };
                current.revenue += r.totalPrice;
                listingRevenue.set(r.listing.id, current);
            }
        });

        const topListings = Array.from(listingRevenue.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const bucketsFinal = buckets.map((b) => ({
            date: b.date,
            revenue: bucketMap.get(b.date)?.revenue || 0,
            bookings: bucketMap.get(b.date)?.bookings || 0,
        }));

        return NextResponse.json({
            rangeDays,
            cards: {
                totalUsers: userCount,
                activeUsers,
                deactivatedUsers,
                activeListings: listingCount,
                totalReservations: reservationCount,
                totalRevenue: revenueAgg._sum.totalPrice || 0,
                refundedAmount: revenueAgg._sum.refundedAmount || 0,
                paidCount,
                refundCount,
            },
            series: bucketsFinal,
            topListings,
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
    }
}
