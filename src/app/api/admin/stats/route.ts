import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(adminAuthOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const [userCount, listingCount, reservationCount] = await Promise.all([
        prisma.user.count(),
        prisma.listing.count(),
        prisma.reservation.count(),
    ]);

    // For revenue, we sum up all totalPrices from reservations
    const revenueResult = await prisma.reservation.aggregate({
        _sum: {
            totalPrice: true,
        }
    });

    return NextResponse.json({
        totalUsers: userCount,
        activeListings: listingCount,
        totalReservations: reservationCount,
        totalRevenue: revenueResult._sum.totalPrice || 0,
    });
}
