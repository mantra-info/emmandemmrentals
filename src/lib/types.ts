import { z } from "zod";

export const ListingSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    imageSrc: z.string().min(1, "Image is required"),
    category: z.string().min(1, "Category is required"),
    roomCount: z.number().min(1, "Room count must be at least 1"),
    bathroomCount: z.number().min(1, "Bathroom count must be at least 1"),
    guestCount: z.number().min(1, "Guest count must be at least 1"),
    locationValue: z.string().min(1, "Location is required"),
    price: z.number().min(1, "Price must be at least 1"),
});

export const ReservationSchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
    listingId: z.string().min(1, "Listing ID is required"),
    totalPrice: z.number().min(1, "Total price is required"),
});

export type ListingType = z.infer<typeof ListingSchema>;
export type ReservationType = z.infer<typeof ReservationSchema>;
