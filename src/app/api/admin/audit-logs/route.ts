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
        const q = params.get("q");
        const action = params.get("action");
        const targetId = params.get("targetId");
        const dateFrom = params.get("dateFrom");
        const dateTo = params.get("dateTo");
        const page = Math.max(parseInt(params.get("page") || "1", 10), 1);
        const pageSize = Math.min(Math.max(parseInt(params.get("pageSize") || "10", 10), 1), 100);
        const skip = (page - 1) * pageSize;

        const where: any = {};
        if (action) where.action = action;
        if (targetId) where.targetId = targetId;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom);
            if (dateTo) where.createdAt.lte = new Date(dateTo);
        }
        if (q) {
            where.OR = [
                { action: { contains: q, mode: "insensitive" } },
                { targetId: { contains: q, mode: "insensitive" } },
                { admin: { email: { contains: q, mode: "insensitive" } } },
            ];
        }

        const total = await prisma.adminAuditLog.count({ where });

        const logs = await prisma.adminAuditLog.findMany({
            where,
            include: {
                admin: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        });

        const targetIds = Array.from(new Set(logs.map((l) => l.targetId).filter(Boolean))) as string[];
        const targetUsers = targetIds.length
            ? await prisma.user.findMany({
                where: { id: { in: targetIds } },
                select: { id: true, name: true, email: true },
            })
            : [];
        const targetUserMap = Object.fromEntries(targetUsers.map((u) => [u.id, u]));

        return NextResponse.json({
            data: logs.map((log) => ({
                ...log,
                targetUser: log.targetId ? targetUserMap[log.targetId] || null : null,
            })),
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error("Admin audit logs error:", error);
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
    }
}
