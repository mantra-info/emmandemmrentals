import { Suspense } from 'react';
import BookingSuccessClient from './BookingSuccessClient';

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={(
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </main>
    )}>
      <BookingSuccessClient />
    </Suspense>
  );
}
