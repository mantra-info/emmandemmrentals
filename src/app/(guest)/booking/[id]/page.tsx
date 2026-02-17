'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useUi } from '@/context/UiContext';
import { calculatePricingBreakdown } from '@/lib/pricing';
import Link from 'next/link';

type ListingData = {
    id: string;
    title: string;
    subtitle?: string | null;
    imageSrc: string;
    basePricePerNight?: number | null;
    price?: number | null;
    cleaningFee?: number | null;
    serviceFee?: number | null;
    taxPercentage?: number | null;
    locationValue?: string | null;
    cancellationPolicy?: string | null;
    taxProfile?: {
        id: string;
        name: string;
        vatRate?: number;
        gstRate?: number;
        lines?: Array<{
            id: string;
            label: string;
            rate: number;
            appliesTo: "NIGHTLY" | "CLEANING" | "SERVICE" | "ALL";
            order: number;
            isActive: boolean;
        }>;
    } | null;
};

const formatMoney = (value: number) => {
    return `$${value.toFixed(2)}`;
};

export default function BookingConfirmPage() {
    const params = useParams();
    const id = params?.id as string;
    const searchParams = useSearchParams();
    const router = useRouter();

    const [listing, setListing] = useState<ListingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const { data: session } = useSession();
    const { setIsLoginModalOpen, showToast } = useUi();

    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const adults = Number(searchParams.get('adults') || 1);
    const children = Number(searchParams.get('children') || 0);
    const infants = Number(searchParams.get('infants') || 0);
    const pets = Number(searchParams.get('pets') || 0);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await fetch(`/api/listings/${id}`);
                if (!response.ok) throw new Error('Failed to fetch listing');
                const data = await response.json();
                setListing(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load listing');
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchListing();
    }, [id]);

    const nights = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }, [startDate, endDate]);

    const pricing = useMemo(() => {
        if (!listing) return null;
        const pricePerNight = listing.basePricePerNight ?? listing.price ?? 0;
        const cleaningFee = listing.cleaningFee ?? 0;
        const serviceFee = listing.serviceFee ?? 0;
        const calculated = calculatePricingBreakdown({
            nights,
            pricePerNight,
            cleaningFee,
            serviceFee,
            taxPercentage: listing.taxPercentage ?? 0,
            locationValue: listing.locationValue,
            taxProfile: listing.taxProfile || undefined,
        });
        return { pricePerNight, cleaningFee, serviceFee, ...calculated };
    }, [listing, nights]);

    const cancellationText = useMemo(() => {
        if (!listing?.cancellationPolicy?.trim()) {
            return 'Free cancellation within 24 hours of booking (when booked at least 7 days before check-in), then standard policy windows apply.';
        }
        return listing.cancellationPolicy.trim();
    }, [listing?.cancellationPolicy]);

    const cancellationPreview = useMemo(() => {
        if (cancellationText.length <= 180) return cancellationText;
        return `${cancellationText.slice(0, 180)}...`;
    }, [cancellationText]);
    const hasExtendedCancellationPolicy = cancellationText.length > 180;

    const handlePay = async () => {
        if (!session) {
            showToast('Please log in to complete your booking.', 'info');
            setIsLoginModalOpen(true);
            return;
        }
        if (!listing || !startDate || !endDate || !termsAccepted || nights <= 0) return;
        setIsSubmitting(true);
        setError('');
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: listing.id,
                    startDate,
                    endDate,
                    adults,
                    children,
                    infants,
                    pets,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to start payment');
            }
            if (data.url) {
                window.location.href = data.url;
                return;
            }
            throw new Error('Stripe session missing');
        } catch (err: any) {
            setError(err.message || 'Failed to start payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </main>
        );
    }

    if (!listing || !pricing) {
        return (
            <main className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Unavailable</h2>
                    <p className="text-gray-500">{error || 'Missing booking information.'}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white pb-24">
            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-16">
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Confirm and pay</h1>
                        <div className="space-y-6">
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Proceed to payment</h3>
                                <p className="text-sm text-gray-500">Secure payment powered by Stripe.</p>
                                <label className="flex items-center gap-3 mt-6 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span>
                                        I agree to the{' '}
                                        <Link href="/terms-of-service" className="underline text-gray-900 font-medium">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/privacy-policy" className="underline text-gray-900 font-medium">
                                            Privacy Policy
                                        </Link>
                                        .
                                    </span>
                                </label>
                                {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
                                <button
                                    onClick={handlePay}
                                    disabled={!termsAccepted || isSubmitting}
                                    className="mt-6 w-full sm:w-auto bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Redirecting…' : `Pay ${formatMoney(pricing?.total || 0)}`}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[360px]">
                        <div className="border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex gap-4 pb-4 border-b border-gray-100">
                                <img src={listing.imageSrc} alt={listing.title} className="w-20 h-20 rounded-xl object-cover" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{listing.title}</p>
                                    {listing.subtitle && (
                                        <p className="text-xs text-gray-500 mt-1">{listing.subtitle}</p>
                                    )}
                                </div>
                            </div>

                            <div className="py-4 border-b border-gray-100 space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Check-in</span>
                                    <span className="font-semibold text-gray-900">{startDate}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Check-out</span>
                                    <span className="font-semibold text-gray-900">{endDate}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Guests</span>
                                    <span className="font-semibold text-gray-900">
                                        {adults} Adults{children ? `, ${children} Children` : ''}{infants ? `, ${infants} Infants` : ''}{pets ? `, ${pets} Pets` : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="py-4 text-sm text-black space-y-2 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span>{nights} nights × {formatMoney(pricing.pricePerNight)}</span>
                                    <span>{formatMoney(pricing.pricePerNight * nights)}</span>
                                </div>
                                {pricing.cleaningFee > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span>Cleaning fee</span>
                                        <span>{formatMoney(pricing.cleaningFee)}</span>
                                    </div>
                                )}
                                {pricing.serviceFee > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span>Service fee</span>
                                        <span>{formatMoney(pricing.serviceFee)}</span>
                                    </div>
                                )}
                                {pricing.taxLines.map((line) => (
                                    <div key={line.code} className="flex items-center justify-between">
                                        <span>{line.label} ({line.rate}%)</span>
                                        <span>{formatMoney(line.amount)}</span>
                                    </div>
                                ))}
                                {pricing.taxLines.length === 0 && (
                                    <div className="flex items-center justify-between">
                                        <span>Taxes</span>
                                        <span>{formatMoney(0)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 pb-2 border-b border-gray-100">
                                <p className="text-xs font-semibold text-gray-900 mb-2">Tax breakdown</p>
                                <div className="space-y-1 text-xs text-gray-600">
                                    <div className="flex items-center justify-between">
                                        <span>Taxable amount</span>
                                        <span>{formatMoney(pricing.taxableBase)}</span>
                                    </div>
                                    {pricing.taxLines.map((line) => (
                                        <div key={`formula-${line.code}`} className="flex items-center justify-between">
                                            <span>{line.label}: {line.rate}% × {formatMoney(line.taxableBase)}</span>
                                            <span>{formatMoney(line.amount)}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between font-medium text-gray-800 pt-1">
                                        <span>Total tax</span>
                                        <span>{formatMoney(pricing.taxAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex text-black items-center justify-between font-semibold">
                                <span>Total Price</span>
                                <span>{formatMoney(pricing.total)}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3 text-xs text-gray-500">
                            <ShieldCheck size={16} className="text-green-600" />
                            US taxes are shown as Sales/Lodging tax. VAT and GST are not applicable.
                        </div>

                        <div className="mt-4 border border-gray-200 rounded-2xl p-4">
                            <p className="text-xs font-semibold text-gray-900 mb-2">Cancellation policy</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{cancellationPreview}</p>
                            {hasExtendedCancellationPolicy && (
                                <button
                                    type="button"
                                    onClick={() => setShowPolicyModal(true)}
                                    className="mt-2 text-xs font-semibold text-gray-900 underline"
                                >
                                    Read more
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showPolicyModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
                    <div className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Full cancellation policy</h2>
                            <button
                                type="button"
                                onClick={() => setShowPolicyModal(false)}
                                className="p-2 rounded-lg border border-gray-200 text-gray-700"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{cancellationText}</p>
                    </div>
                </div>
            )}
        </main>
    );
}
