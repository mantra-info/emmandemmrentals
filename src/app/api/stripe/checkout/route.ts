import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { calculateNights, calculatePricing, parseDate } from "@/lib/booking";

export const runtime = "nodejs";

const getAppUrl = (request: NextRequest) => {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (envUrl) return envUrl.replace(/\/$/, "");
    const origin = request.headers.get("origin");
    if (origin) return origin.replace(/\/$/, "");
    const host = request.headers.get("host");
    return host ? `https://${host}` : "http://localhost:3000";
};

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !(session.user as any).id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userId = (session.user as any).id as string;
        const body = await request.json();
        const {
            listingId,
            startDate,
            endDate,
            adults = 1,
            children = 0,
            infants = 0,
            pets = 0,
        } = body;

        if (!listingId || !startDate || !endDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const parsedStart = parseDate(startDate);
        const parsedEnd = parseDate(endDate);
        if (!parsedStart || !parsedEnd) {
            return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
        }

        if (parsedEnd <= parsedStart) {
            return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
        }

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: {
                id: true,
                title: true,
                imageSrc: true,
                basePricePerNight: true,
                price: true,
                cleaningFee: true,
                serviceFee: true,
                taxPercentage: true,
                minStayNights: true,
            },
        });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        const nights = calculateNights(parsedStart, parsedEnd);
        const minStay = Math.max(1, listing.minStayNights || 1);
        if (nights < minStay) {
            return NextResponse.json({ error: `Minimum stay is ${minStay} nights` }, { status: 400 });
        }

        const pricePerNight = listing.basePricePerNight ?? listing.price ?? 0;
        const cleaningFee = listing.cleaningFee ?? 0;
        const serviceFee = listing.serviceFee ?? 0;
        const taxPercentage = listing.taxPercentage ?? 0;
        const pricing = calculatePricing({
            nights,
            pricePerNight,
            cleaningFee,
            serviceFee,
            taxPercentage,
        });

        const currency = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();
        const appUrl = getAppUrl(request);

        const imageUrl = listing.imageSrc
            ? (listing.imageSrc.startsWith("http")
                ? listing.imageSrc
                : `${appUrl}${listing.imageSrc.startsWith("/") ? "" : "/"}${listing.imageSrc}`)
            : null;

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            customer_email: (session.user as any).email || undefined,
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: listing.title,
                            description: `${nights} night stay`,
                            images: imageUrl ? [imageUrl] : undefined,
                        },
                        unit_amount: Math.round(pricePerNight * 100),
                    },
                    quantity: nights,
                },
                ...(cleaningFee > 0
                    ? [{
                        price_data: {
                            currency,
                            product_data: { name: "Cleaning fee" },
                            unit_amount: Math.round(cleaningFee * 100),
                        },
                        quantity: 1,
                    }]
                    : []),
                ...(serviceFee > 0
                    ? [{
                        price_data: {
                            currency,
                            product_data: { name: "Service fee" },
                            unit_amount: Math.round(serviceFee * 100),
                        },
                        quantity: 1,
                    }]
                    : []),
                ...(pricing.taxAmount > 0
                    ? [{
                        price_data: {
                            currency,
                            product_data: { name: "Taxes" },
                            unit_amount: Math.round(pricing.taxAmount * 100),
                        },
                        quantity: 1,
                    }]
                    : []),
            ],
            success_url: `${appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/booking/${listingId}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&adults=${adults}&children=${children}&infants=${infants}&pets=${pets}`,
            metadata: {
                userId,
                listingId,
                startDate,
                endDate,
                adults: String(adults),
                children: String(children),
                infants: String(infants),
                pets: String(pets),
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
}
