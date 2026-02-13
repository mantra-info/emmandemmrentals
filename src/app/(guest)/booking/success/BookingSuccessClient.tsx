'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Plane, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

type ReservationData = {
  id: string;
  startDate: string;
  endDate: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  totalPrice: number;
  listing: {
    title: string;
    imageSrc: string;
  };
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function BookingSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reservationId = searchParams.get('reservationId');
  const stripeSessionId = searchParams.get('session_id');
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = reservationId
          ? await fetch(`/api/reservations/${reservationId}`)
          : stripeSessionId
            ? await fetch(`/api/stripe/session?session_id=${stripeSessionId}`)
            : null;
        if (!response) return;
        if (!response.ok) throw new Error('Failed to fetch reservation');
        const data = await response.json();
        setReservation(data);
      } catch (error) {
        setReservation(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservation();
  }, [reservationId, stripeSessionId]);

  useEffect(() => {
    if (reservation || !stripeSessionId) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const response = await fetch(`/api/stripe/session?session_id=${stripeSessionId}`);
        if (response.ok) {
          const data = await response.json();
          setReservation(data);
          setIsLoading(false);
          clearInterval(interval);
        } else if (attempts >= 10) {
          setIsLoading(false);
          clearInterval(interval);
        }
      } catch {
        if (attempts >= 10) {
          setIsLoading(false);
          clearInterval(interval);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [reservation, stripeSessionId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </main>
    );
  }

  if (!reservation) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
          <button
            onClick={() => router.push('/')}
            className="text-sm font-semibold text-gray-900 underline"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100/70 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-16 w-72 h-72 bg-sky-100/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-20 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-12 md:pt-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur border border-gray-200 rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col md:flex-row md:items-center gap-6 mb-12"
        >
          <div className="relative">
            <img src={reservation.listing.imageSrc} alt={reservation.listing.title} className="w-24 h-24 rounded-2xl object-cover border border-white shadow-md" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-900">{reservation.listing.title}</p>
            <div className="mt-3 text-sm text-gray-600 grid grid-cols-2 gap-2">
              <div>Check-in: {formatDate(reservation.startDate)}</div>
              <div>Check-out: {formatDate(reservation.endDate)}</div>
              <div>Guests: {reservation.adults} Adults{reservation.children ? `, ${reservation.children} Children` : ''}</div>
              <div>Total: ${reservation.totalPrice.toFixed(2)}</div>
            </div>
          </div>
          <div className="md:ml-auto text-sm text-gray-500">
            Reservation ID
            <div className="font-semibold text-gray-900 mt-1">{reservation.id.slice(0, 10).toUpperCase()}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 mb-6 shadow-inner relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="absolute -top-3 -right-2 text-amber-400"
            >
              <Sparkles size={18} />
            </motion.div>
            <Plane className="text-emerald-600" size={36} />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-3">You are all set to fly</h1>
          <p className="text-gray-600 mb-8">Your booking has been completed successfully. A confirmation email will be sent shortly.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              Back to Home
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
            >
              View My Bookings
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
