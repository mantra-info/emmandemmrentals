'use client';

import { useEffect, useState } from 'react';

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [refundAmounts, setRefundAmounts] = useState<Record<string, string>>({});
    const [isRefunding, setIsRefunding] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/admin/reservations?page=${page}&pageSize=${pageSize}`);
                if (!response.ok) throw new Error('Failed to fetch reservations');
                const data = await response.json();
                setReservations(data.data || []);
                setTotalPages(data.totalPages || 1);
                setTotal(data.total || 0);
            } catch (error) {
                console.error('Failed to load reservations:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReservations();
    }, [page]);

    const formatMoney = (cents: number, currency = 'usd') => {
        const amount = cents / 100;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount);
    };

    const handleRefund = async (reservationId: string, amountCents?: number) => {
        try {
            setIsRefunding((prev) => ({ ...prev, [reservationId]: true }));
            const response = await fetch('/api/admin/refunds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reservationId,
                    amount: amountCents,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Refund failed');
            }
            setReservations((prev) => prev.map((r) => (r.id === reservationId ? data.reservation : r)));
            setRefundAmounts((prev) => ({ ...prev, [reservationId]: '' }));
        } catch (error) {
            console.error('Refund failed:', error);
            alert('Refund failed. Check console for details.');
        } finally {
            setIsRefunding((prev) => ({ ...prev, [reservationId]: false }));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
                <p className="text-gray-500">All bookings across properties.</p>
            </div>

            {reservations.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium mb-4">No reservations found yet.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        <div className="col-span-3">Property</div>
                        <div className="col-span-3">Guest</div>
                        <div className="col-span-2">Dates</div>
                        <div className="col-span-2">Payment</div>
                        <div className="col-span-2 text-right">Refunds</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {reservations.map((reservation) => (
                            <div key={reservation.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center">
                                <div className="col-span-3 flex items-center gap-3">
                                    <img src={reservation.listing?.imageSrc} alt={reservation.listing?.title} className="w-16 h-12 rounded-lg object-cover" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{reservation.listing?.title}</p>
                                        <p className="text-xs text-gray-500">{reservation.listing?.locationValue}</p>
                                    </div>
                                </div>
                                <div className="col-span-3 text-sm text-gray-600">
                                    <p className="font-medium text-gray-900">{reservation.user?.name || 'Guest'}</p>
                                    <p className="text-xs text-gray-500">{reservation.user?.email}</p>
                                </div>
                                <div className="col-span-2 text-sm text-gray-600">
                                    <p>{formatDate(reservation.startDate)} → {formatDate(reservation.endDate)}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Guests: {reservation.adults} Adults{reservation.children ? `, ${reservation.children} Children` : ''}
                                    </p>
                                </div>
                                <div className="col-span-2 text-sm text-gray-700">
                                    <p className="font-semibold text-gray-900">
                                        {reservation.amountPaid
                                            ? formatMoney(reservation.amountPaid, reservation.paymentCurrency)
                                            : `$${reservation.totalPrice.toFixed(2)}`}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {reservation.paymentStatus || 'unpaid'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {reservation.cardBrand && reservation.cardLast4
                                            ? `${reservation.cardBrand.toUpperCase()} •••• ${reservation.cardLast4}${reservation.cardExpMonth && reservation.cardExpYear ? ` · exp ${reservation.cardExpMonth}/${String(reservation.cardExpYear).slice(-2)}` : ''}`
                                            : 'Card details unavailable'}
                                    </p>
                                    <p className="text-xs text-gray-400">Account: Platform</p>
                                </div>
                                <div className="col-span-2 text-right">
                                    <p className="text-xs text-gray-500 mb-2">
                                        {reservation.refundStatus || 'none'}{reservation.refundedAmount ? ` · ${formatMoney(reservation.refundedAmount, reservation.paymentCurrency)}` : ''}
                                    </p>
                                    <div className="flex items-center justify-end gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Amount"
                                            value={refundAmounts[reservation.id] || ''}
                                            onChange={(e) => setRefundAmounts((prev) => ({ ...prev, [reservation.id]: e.target.value }))}
                                            className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-lg text-right"
                                        />
                                        <button
                                            onClick={() => {
                                                const value = refundAmounts[reservation.id];
                                                const amountCents = value ? Math.round(Number(value) * 100) : undefined;
                                                handleRefund(reservation.id, amountCents);
                                            }}
                                            disabled={isRefunding[reservation.id]}
                                            className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            {isRefunding[reservation.id] ? 'Refunding...' : 'Refund'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {total > 0 && (
                <div className="mt-8 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing page {page} of {totalPages} · {total} total reservations
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
