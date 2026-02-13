'use client';

import { useState, useEffect } from 'react';
import { Home, User, MapPin, Tag, MoreVertical, Edit, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ListingsPage() {
    const router = useRouter();
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(9);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchListings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/listings?page=${page}&pageSize=${pageSize}`);
            const data = await response.json();
            setListings(data.data || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [page]);

    // Refetch listings when returning from edit/create
    useEffect(() => {
        const handleRouterChange = () => {
            fetchListings();
        };
        
        // Listen for visibility change (when user comes back to this tab/window)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchListings();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const handleEdit = (id: string) => {
        router.push(`/admin/listings/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        setDeletingId(id);
        try {
            const response = await fetch(`/api/admin/listing/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            setListings(prev => prev.filter(l => l.id !== id));
            setOpenMenuId(null);
        } catch (error) {
            console.error('Failed to delete listing:', error);
            alert('Failed to delete listing');
        } finally {
            setDeletingId(null);
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Listing Management</h1>
                    <p className="text-gray-500">Monitor and manage property listings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 text-xs font-semibold ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 text-xs font-semibold ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            List
                        </button>
                    </div>
                    <button
                        onClick={() => router.push('/admin/listings/new')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Plus size={20} />
                        New Listing
                    </button>
                </div>
            </div>

            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow relative">
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={listing.imageSrc}
                                    alt={listing.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm border border-white/20">
                                    ${listing.basePricePerNight} / night
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{listing.title}</h3>
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === listing.id ? null : listing.id)}
                                            className="p-1 hover:bg-gray-50 rounded-lg"
                                        >
                                            <MoreVertical size={16} className="text-gray-400" />
                                        </button>

                                        {openMenuId === listing.id && (
                                            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                <button
                                                    onClick={() => {
                                                        handleEdit(listing.id);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(listing.id)}
                                                    disabled={deletingId === listing.id}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <Trash2 size={16} />
                                                    {deletingId === listing.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin size={14} />
                                        <span>{listing.locationValue}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Tag size={14} />
                                        <span>{listing.category}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <User size={14} />
                                        <span>Hosted by {listing.user?.name || listing.user?.email || 'Unknown'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex gap-3 text-xs font-medium text-gray-400">
                                        <span>{listing.roomCount} Rooms</span>
                                        <span>{listing.guestCount} Guests</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewMode === 'list' && (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        <div className="col-span-4">Property</div>
                        <div className="col-span-2">Location</div>
                        <div className="col-span-2">Pricing</div>
                        <div className="col-span-3">Details</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {listings.map((listing) => (
                            <div key={listing.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-start">
                                <div className="col-span-4 flex gap-4">
                                    <img src={listing.imageSrc} alt={listing.title} className="w-24 h-20 rounded-xl object-cover border border-gray-100" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{listing.title}</p>
                                        {listing.subtitle && <p className="text-xs text-gray-500 mt-1">{listing.subtitle}</p>}
                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{listing.description}</p>
                                    </div>
                                </div>
                                <div className="col-span-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} />
                                        <span>{listing.locationValue}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <Tag size={12} />
                                        <span>{listing.category}</span>
                                    </div>
                                </div>
                                <div className="col-span-2 text-sm text-gray-600">
                                    <div className="font-semibold text-gray-900">${listing.basePricePerNight} / night</div>
                                    <div className="text-xs text-gray-500 mt-1">Min stay: {listing.minStayNights || 1} nights</div>
                                </div>
                                <div className="col-span-3 text-xs text-gray-600 space-y-1">
                                    <div>{listing.guestCount} guests · {listing.roomCount} rooms · {listing.bathroomCount} baths</div>
                                    <div>Amenities: {listing.amenities?.length || 0}</div>
                                    <div>Rules: {listing.rules?.length || 0}</div>
                                    <div>Highlights: {listing.highlights?.length || 0}</div>
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === listing.id ? null : listing.id)}
                                            className="p-1 hover:bg-gray-50 rounded-lg"
                                        >
                                            <MoreVertical size={16} className="text-gray-400" />
                                        </button>
                                        {openMenuId === listing.id && (
                                            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                <button
                                                    onClick={() => {
                                                        handleEdit(listing.id);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(listing.id)}
                                                    disabled={deletingId === listing.id}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <Trash2 size={16} />
                                                    {deletingId === listing.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {listings.length === 0 && (
                <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Home size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400 font-medium mb-4">No listings found yet.</p>
                    <button
                        onClick={() => router.push('/admin/listings/new')}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Plus size={18} />
                        Create Your First Listing
                    </button>
                </div>
            )}

            {total > 0 && (
                <div className="mt-8 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing page {page} of {totalPages} · {total} total listings
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
