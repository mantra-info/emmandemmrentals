'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ListingForm from '@/components/admin/ListingForm';
import { ArrowLeft } from 'lucide-react';

export default function ListingPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(!!id);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchListing = async () => {
                try {
                    const response = await fetch(`/api/admin/listing?id=${id}`);
                    if (!response.ok) throw new Error('Failed to fetch');
                    const data = await response.json();
                    setListing(data);
                } catch (error) {
                    console.error('Failed to load listing:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchListing();
        }
    }, [id]);


    const handleSubmit = async (data: any) => {
        setIsSaving(true);
        try {
            const payload = {
                ...data,
                ...(id && { id }),
            };

            const response = await fetch('/api/admin/listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to save');

            const savedListing = await response.json();
            router.push(`/admin/listings`);
        } catch (error) {
            console.error('Failed to save listing:', error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    };


    if (isLoading && id) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Back
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {id ? 'Edit Listing' : 'Create New Listing'}
                </h1>
                <p className="text-gray-500 mt-2">
                    {id
                        ? 'Update the details and images for this property'
                        : 'Add a new property listing with complete details and images'
                    }
                </p>
            </div>

            <ListingForm
                initialData={listing}
                onSubmit={handleSubmit}
                isLoading={isSaving}
            />

        </div>
    );
}
