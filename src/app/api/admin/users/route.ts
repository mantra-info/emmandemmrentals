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
    const q = params.get("q");
    const role = params.get("role");
    const status = params.get("status");
    const page = Math.max(parseInt(params.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(params.get("pageSize") || "10", 10), 1), 100);
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (q) {
        where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phoneNumber: { contains: q, mode: "insensitive" } },
        ];
    }
    if (role) where.role = role;
    if (status) {
        if (status === "DELETED") {
            where.deletedAt = { not: null };
        } else {
            where.status = status;
            where.deletedAt = null;
        }
    } else {
        where.deletedAt = null;
    }

    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
        where,
        orderBy: {
            createdAt: 'desc',
        },
        skip,
        take: pageSize,
    });

    return NextResponse.json({
        data: users,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    });
}
