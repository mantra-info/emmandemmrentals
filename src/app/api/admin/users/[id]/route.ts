import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(adminAuthOptions);
        if (!session || (session.user as any).role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                reservations: {
                    include: {
                        listing: { select: { id: true, title: true, imageSrc: true, locationValue: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
                reviews: {
                    include: {
                        listing: { select: { id: true, title: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
                listings: {
                    select: { id: true, title: true, imageSrc: true, locationValue: true, createdAt: true },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const auditLogs = await prisma.adminAuditLog.findMany({
            where: { targetId: id },
            include: {
                admin: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        return NextResponse.json({
            ...user,
            auditLogs: auditLogs.map((log) => ({
                ...log,
                targetUser: { id: user.id, name: user.name, email: user.email },
            })),
        });
    } catch (error) {
        console.error("Admin user detail error:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}
