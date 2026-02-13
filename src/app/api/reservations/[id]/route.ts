import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !(session.user as any).id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "Reservation ID is required" }, { status: 400 });
        }

        const reservation = await prisma.reservation.findUnique({
            where: { id },
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
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        if (!reservation) {
            return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
        }

        const userId = (session.user as any).id as string;
        if (reservation.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(reservation);
    } catch (error) {
        console.error("Get reservation error:", error);
        return NextResponse.json({ error: "Failed to fetch reservation" }, { status: 500 });
    }
}
