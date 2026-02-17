import { calculatePricingBreakdown } from "@/lib/pricing";

export const parseDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date;
};

export const calculateNights = (startDate: Date, endDate: Date) => {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const calculatePricing = ({
    nights,
    pricePerNight,
    cleaningFee,
    serviceFee,
    taxPercentage,
    locationValue,
    taxProfile,
}: {
    nights: number;
    pricePerNight: number;
    cleaningFee: number;
    serviceFee: number;
    taxPercentage: number;
    locationValue?: string | null;
    taxProfile?: {
        id?: string;
        name?: string;
        lines?: Array<{
            id?: string;
            label: string;
            rate: number;
            appliesTo: "NIGHTLY" | "CLEANING" | "SERVICE" | "ALL";
            order?: number;
            isActive?: boolean;
        }>;
        vatRate?: number | null;
        gstRate?: number | null;
    } | null;
}) => {
    const pricing = calculatePricingBreakdown({
        nights,
        pricePerNight,
        cleaningFee,
        serviceFee,
        taxPercentage,
        locationValue,
        taxProfile,
    });
    return { subtotal: pricing.subtotal, taxAmount: pricing.taxAmount, total: pricing.total };
};
