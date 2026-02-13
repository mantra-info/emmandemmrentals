'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Camera, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const EditProfileModal = ({ isOpen, onClose, onUpdate }: EditProfileModalProps) => {
    const { data: session, update } = useSession();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update profile');
            }

            // Update local session
            await update({ name });

            onUpdate();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                {/* Profile Image Placeholder */}
                                <div className="flex flex-col items-center gap-4 mb-4">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-100 group-hover:border-[#f44786] transition-colors">
                                            {session?.user?.image ? (
                                                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={40} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-[#f44786] p-2 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform">
                                            <Camera size={16} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Click to change photo</p>
                                </div>

                                {/* Name Input */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Full Name</label>
                                    <div className="bg-gray-50 rounded-xl p-3 border border-transparent focus-within:border-black/5 transition-colors flex items-center gap-3">
                                        <User size={18} className="text-gray-400" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your Name"
                                            className="bg-transparent w-full outline-none text-gray-900 text-sm font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email (Read Only) */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Email (Cannot change)</label>
                                    <div className="bg-gray-100 rounded-xl p-3 border border-transparent flex items-center gap-3 opacity-60">
                                        <Mail size={18} className="text-gray-400" />
                                        <input
                                            type="email"
                                            value={session?.user?.email || ''}
                                            readOnly
                                            className="bg-transparent w-full outline-none text-gray-500 text-sm font-medium cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !name.trim()}
                                    className="w-full bg-[#f44786] hover:bg-[#d63a73] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] flex justify-center items-center gap-2 mt-4"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditProfileModal;
