import React, { useEffect } from 'react';
import { X, Check, Info, ShieldAlert, Award, Search, Users, Waves, Star, Bed, Bath, Anchor, Waves as PoolIcon, PawPrint, Fish, Car, Bike, Utensils, MessageSquare, Coffee, Wifi, Tv, Gamepad2, Snowflake, WashingMachine } from 'lucide-react';

interface AboutSpaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    description?: string;
    title?: string;
    guestCount?: number;
    roomCount?: number;
    bathroomCount?: number;
}

const AboutSpaceModal: React.FC<AboutSpaceModalProps> = ({ 
    isOpen, 
    onClose, 
    description = '',
    title = 'Property',
    guestCount = 0,
    roomCount = 0,
    bathroomCount = 0,
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 flex-shrink-0">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 flex-1 text-center">
                        About this space
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-2"
                    >
                        <X size={20} className="text-gray-900" />
                    </button>
                </div>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                    {/* Main Description */}
                    <div className="space-y-3">
                        <p className="font-semibold text-gray-900 text-base">{title}</p>
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap break-words">
                            {description}
                        </p>
                    </div>

                    
                </div>
            </div>
        </div>
    );
};

export default AboutSpaceModal;
