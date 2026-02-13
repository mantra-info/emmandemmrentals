import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const requireAdmin = async () => {
    const session = await getServerSession(adminAuthOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return null;
    }
    return session;
};

const logAudit = async (adminId: string, action: string, targetId: string, metadata?: any) => {
    await prisma.adminAuditLog.create({
        data: {
            adminId,
            action,
            targetId,
            targetType: "user",
            metadata,
        },
    });
};

export async function POST(request: NextRequest) {
    try {
        const session = await requireAdmin();
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const adminId = (session.user as any).id as string;
        const body = await request.json();
        const { action, userId, role } = body;

        if (!userId || !action) {
            return NextResponse.json({ error: "Missing action or userId" }, { status: 400 });
        }

        if (action === "set_role") {
            if (!role) return NextResponse.json({ error: "Missing role" }, { status: 400 });
            if (userId === adminId && role !== "ADMIN") {
                return NextResponse.json({ error: "You cannot remove your own admin role." }, { status: 400 });
            }
            const updated = await prisma.user.update({
                where: { id: userId },
                data: { role },
            });
            await logAudit(adminId, "set_role", userId, { role });
            return NextResponse.json(updated);
        }

        if (action === "deactivate") {
            if (userId === adminId) {
                return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
            }
            const updated = await prisma.user.update({
                where: { id: userId },
                data: { status: "DEACTIVATED", deactivatedAt: new Date() },
            });
            await logAudit(adminId, "deactivate", userId);
            return NextResponse.json(updated);
        }

        if (action === "reactivate") {
            const updated = await prisma.user.update({
                where: { id: userId },
                data: { status: "ACTIVE", deactivatedAt: null },
            });
            await logAudit(adminId, "reactivate", userId);
            return NextResponse.json(updated);
        }

        if (action === "soft_delete") {
            if (userId === adminId) {
                return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
            }
            const updated = await prisma.user.update({
                where: { id: userId },
                data: { deletedAt: new Date(), deletedById: adminId, status: "DELETED" },
            });
            await logAudit(adminId, "soft_delete", userId);
            return NextResponse.json(updated);
        }

        if (action === "hard_delete") {
            if (userId === adminId) {
                return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
            }
            await prisma.user.delete({ where: { id: userId } });
            await logAudit(adminId, "hard_delete", userId);
            return NextResponse.json({ success: true });
        }

        if (action === "revoke_sessions") {
            await prisma.session.deleteMany({ where: { userId } });
            await logAudit(adminId, "revoke_sessions", userId);
            return NextResponse.json({ success: true });
        }

        if (action === "reset_password") {
            const tempPassword = Math.random().toString(36).slice(2, 10) + "A1!";
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            const updated = await prisma.user.update({
                where: { id: userId },
                data: { hashedPassword },
            });
            await logAudit(adminId, "reset_password", userId, { method: "temp_password" });
            return NextResponse.json({ ...updated, tempPassword });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (error) {
        console.error("Admin user action error:", error);
        return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
    }
}
