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
}: {
    nights: number;
    pricePerNight: number;
    cleaningFee: number;
    serviceFee: number;
    taxPercentage: number;
}) => {
    const subtotal = pricePerNight * nights + cleaningFee + serviceFee;
    const taxAmount = Math.round(subtotal * (taxPercentage / 100));
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
};
