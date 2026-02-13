import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { calculateNights, calculatePricing, parseDate } from "@/lib/booking";
import { stripe } from "@/lib/stripe";

export const upsertReservationFromCheckoutSession = async (
    session: Stripe.Checkout.Session
) => {
    if (session.payment_status !== "paid") return null;
    if (!session.id) return null;

    const metadata = session.metadata || {};
    const listingId = metadata.listingId;
    const userId = metadata.userId;
    const startDate = metadata.startDate;
    const endDate = metadata.endDate;

    if (!listingId || !userId || !startDate || !endDate) return null;

    let paymentIntent: Stripe.PaymentIntent | null = null;
    if (session.payment_intent) {
        paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string, {
            expand: ["latest_charge.balance_transaction"],
        });
    }

    let charge: Stripe.Charge | null = null;
    if (paymentIntent?.latest_charge) {
        if (typeof paymentIntent.latest_charge === "string") {
            charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
        } else {
            charge = paymentIntent.latest_charge as Stripe.Charge;
        }
    }

    const card = charge?.payment_method_details?.card;
    const amountPaid = paymentIntent?.amount_received ?? charge?.amount ?? 0;
    const currency = (paymentIntent?.currency || session.currency || "usd").toLowerCase();
    const paymentStatus = paymentIntent?.status || session.payment_status || "paid";

    const existing = await prisma.reservation.findFirst({
        where: { stripeSessionId: session.id },
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
        },
    });
    if (existing) {
        const needsUpdate =
            !existing.cardBrand ||
            !existing.cardLast4 ||
            !existing.cardExpMonth ||
            !existing.cardExpYear ||
            !existing.stripeChargeId ||
            !existing.stripeBalanceTransactionId;

        if (!needsUpdate) return existing;

        const updated = await prisma.reservation.update({
            where: { id: existing.id },
            data: {
                stripePaymentIntentId: paymentIntent?.id || existing.stripePaymentIntentId,
                stripeChargeId: charge?.id || existing.stripeChargeId,
                stripeBalanceTransactionId:
                    typeof charge?.balance_transaction === "string"
                        ? charge?.balance_transaction
                        : (charge?.balance_transaction as any)?.id || existing.stripeBalanceTransactionId,
                paymentStatus: paymentStatus || existing.paymentStatus,
                paymentCurrency: currency || existing.paymentCurrency,
                amountPaid: amountPaid || existing.amountPaid,
                cardBrand: card?.brand || existing.cardBrand,
                cardLast4: card?.last4 || existing.cardLast4,
                cardExpMonth: card?.exp_month || existing.cardExpMonth,
                cardExpYear: card?.exp_year || existing.cardExpYear,
            },
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
            },
        });
        return updated;
    }

    const parsedStart = parseDate(startDate);
    const parsedEnd = parseDate(endDate);
    if (!parsedStart || !parsedEnd) return null;

    const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: {
            id: true,
            basePricePerNight: true,
            price: true,
            cleaningFee: true,
            serviceFee: true,
            taxPercentage: true,
            minStayNights: true,
        },
    });
    if (!listing) return null;

    const nights = calculateNights(parsedStart, parsedEnd);
    const minStay = Math.max(1, listing.minStayNights || 1);
    if (nights < minStay) return null;

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

    return prisma.reservation.create({
        data: {
            userId,
            listingId,
            startDate: parsedStart,
            endDate: parsedEnd,
            nights,
            adults: parseInt(metadata.adults || "1", 10),
            children: parseInt(metadata.children || "0", 10),
            infants: parseInt(metadata.infants || "0", 10),
            pets: parseInt(metadata.pets || "0", 10),
            pricePerNight,
            subtotal: pricing.subtotal,
            cleaningFee,
            serviceFee,
            taxPercentage,
            taxAmount: pricing.taxAmount,
            totalPrice: pricing.total,
            stripeSessionId: session.id,
            stripePaymentIntentId: paymentIntent?.id,
            stripeChargeId: charge?.id,
            stripeBalanceTransactionId: typeof charge?.balance_transaction === "string"
                ? charge?.balance_transaction
                : (charge?.balance_transaction as any)?.id,
            paymentStatus,
            paymentCurrency: currency,
            amountPaid,
            cardBrand: card?.brand,
            cardLast4: card?.last4,
            cardExpMonth: card?.exp_month,
            cardExpYear: card?.exp_year,
        },
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
        },
    });
};
