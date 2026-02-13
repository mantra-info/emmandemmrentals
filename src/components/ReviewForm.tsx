'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ReviewFormProps {
    listingId: string;
    userId?: string;
    onReviewAdded?: () => void;
}

const ReviewForm = ({ listingId, userId, onReviewAdded }: ReviewFormProps) => {
    const router = useRouter();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!userId) {
            setError('Please log in to submit a review');
            return;
        }

        if (!comment.trim()) {
            setError('Please write a comment');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Comment must be at least 10 characters');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId,
                    userId,
                    rating,
                    comment: comment.trim(),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit review');
            }

            setSuccess(true);
            setComment('');
            setRating(5);
            setIsExpanded(false);
            
            setTimeout(() => {
                setSuccess(false);
            }, 4000);
            
            if (onReviewAdded) {
                setTimeout(() => {
                    onReviewAdded();
                }, 500);
            } else {
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!userId) {
        return null;
    }

    const getRatingLabel = (rating: number) => {
        const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
        return labels[rating - 1] || 'Excellent';
    };

    return (
        <div className="my-12 md:my-16">
            <div className={`transition-all duration-300 ${
                isExpanded 
                    ? 'bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 rounded-3xl p-6 md:p-10 border border-blue-100 shadow-lg' 
                    : 'bg-white rounded-2xl p-6 md:p-8 border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all'
            }`}>
                {!isExpanded ? (
                    // Collapsed State
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="w-full flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-3 group-hover:shadow-lg transition-shadow">
                                <Star size={24} className="text-white fill-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Share Your Experience</h3>
                                <p className="text-sm text-gray-500">Help other travelers by sharing your thoughts</p>
                            </div>
                        </div>
                        <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                            →
                        </div>
                    </button>
                ) : (
                    // Expanded State
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Header */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h3>
                            <p className="text-gray-600">Your feedback helps other travelers make the right choice</p>
                        </div>

                        {/* Rating */}
                        <div className="space-y-4 bg-white rounded-2xl p-6 border border-blue-100">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-900">How would you rate this property?</label>
                                <span className="text-lg font-bold text-blue-600 bg-blue-50 px-4 py-1 rounded-full">
                                    {hoveredRating || rating}/5 - {getRatingLabel(hoveredRating || rating)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setRating(star)}
                                        className="transition-all hover:scale-125 active:scale-95"
                                    >
                                        <Star
                                            size={40}
                                            className={`transition-all ${
                                                star <= (hoveredRating || rating)
                                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-md'
                                                    : 'text-gray-300 hover:text-yellow-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="space-y-4 bg-white rounded-2xl p-6 border border-blue-100">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-900">Share your thoughts</label>
                                <span className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                                    comment.length >= 10
                                        ? 'bg-green-50 text-green-700'
                                        : comment.length > 0
                                        ? 'bg-yellow-50 text-yellow-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {comment.length}/500
                                </span>
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => {
                                    setComment(e.target.value.slice(0, 500));
                                    setError('');
                                }}
                                placeholder="Tell us about your stay... What did you love? Any suggestions for improvement?"
                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all bg-white hover:border-blue-300 text-gray-900 placeholder:text-gray-400"
                                rows={5}
                            />
                            <p className="text-xs text-gray-500">Minimum 10 characters required</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={20} className="shrink-0 flex-none" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 text-green-700 px-5 py-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                <CheckCircle size={20} className="shrink-0 flex-none" />
                                <p className="text-sm font-medium">Thank you! Your review has been posted successfully.</p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsExpanded(false);
                                    setComment('');
                                    setRating(5);
                                    setError('');
                                }}
                                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-900 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !comment.trim() || comment.trim().length < 10}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Review
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReviewForm;
