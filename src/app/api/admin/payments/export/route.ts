import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const toCsvValue = (value: any) => {
    if (value === null || value === undefined) return "";
    const text = String(value).replace(/"/g, '""');
    return `"${text}"`;
};

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

        const reservations = await prisma.reservation.findMany({
            where,
            include: {
                user: { select: { email: true, name: true } },
                listing: { select: { title: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const headers = [
            "reservation_id",
            "created_at",
            "listing_title",
            "guest_name",
            "guest_email",
            "amount_paid",
            "currency",
            "payment_status",
            "refund_status",
            "refunded_amount",
            "card_brand",
            "card_last4",
            "stripe_payment_intent_id",
            "stripe_charge_id",
        ];

        const rows = reservations.map((r) => [
            r.id,
            r.createdAt.toISOString(),
            r.listing?.title,
            r.user?.name || "",
            r.user?.email || "",
            r.amountPaid ?? "",
            r.paymentCurrency ?? "",
            r.paymentStatus ?? "",
            r.refundStatus ?? "",
            r.refundedAmount ?? "",
            r.cardBrand ?? "",
            r.cardLast4 ?? "",
            r.stripePaymentIntentId ?? "",
            r.stripeChargeId ?? "",
        ]);

        const csv = [headers.map(toCsvValue).join(","), ...rows.map((row) => row.map(toCsvValue).join(","))].join("\n");

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": "attachment; filename=payments.csv",
            },
        });
    } catch (error) {
        console.error("Admin payments export error:", error);
        return NextResponse.json({ error: "Failed to export payments" }, { status: 500 });
    }
}
