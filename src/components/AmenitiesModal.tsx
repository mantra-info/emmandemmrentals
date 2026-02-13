import React from 'react';
import { X } from 'lucide-react';
import { AMENITY_CATEGORIES, getAmenityIcon, resolveAmenitySelections } from '@/lib/amenities';

interface AmenitiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    amenities?: any[];
}

const AmenitiesModal = ({ isOpen, onClose, amenities = [] }: AmenitiesModalProps) => {
    if (!isOpen) return null;

    const { included, notIncluded } = resolveAmenitySelections(amenities);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900">All Amenities ({included.length})</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-900" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12">
                    {Object.entries(AMENITY_CATEGORIES).map(([categoryKey, categoryName]) => {
                        const categoryAmenities = included.filter((a: any) => a.category === categoryKey);
                        if (categoryAmenities.length === 0) return null;

                        return (
                            <div key={categoryKey}>
                                <h3 className="text-lg font-bold text-gray-900 mb-6">{categoryName}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {categoryAmenities.map((amenity: any, idx: number) => {
                                        const IconComponent = getAmenityIcon(amenity.icon);
                                        return (
                                            <div key={idx} className="flex items-start gap-4">
                                                <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                                                    <IconComponent size={24} className="text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-700 font-medium">{amenity.name}</p>
                                                    {amenity.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{amenity.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {notIncluded.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Not included</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {notIncluded.map((amenity: any, idx: number) => {
                                    const IconComponent = getAmenityIcon(amenity.icon);
                                    return (
                                        <div key={idx} className="flex items-start gap-4 opacity-70">
                                            <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                                                <IconComponent size={24} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 font-medium line-through">{amenity.name}</p>
                                                {amenity.description && (
                                                    <p className="text-xs text-gray-400 mt-1">{amenity.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AmenitiesModal;
