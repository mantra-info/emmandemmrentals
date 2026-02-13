'use client';

import React, { useState } from 'react';
import AboutSpaceModal from './AboutSpaceModal';

interface AboutSpaceProps {
  description?: string;
  title?: string;
}

const AboutSpace = ({ description, title }: AboutSpaceProps) => {
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

    // Use the passed description, no fallback
    const displayDescription = description || '';
    const paragraphs = displayDescription
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    const firstParagraph = paragraphs[0] || '';
    const hasMore = paragraphs.length > 1;

    if (!displayDescription) {
        return null; // Don't show if no description
    }

    return (
        <div className='w-full py-4 flex flex-col justify-center items-center'>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">About this space</h2>
            <p className='text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words'>
                {firstParagraph}
            </p>
            {hasMore && (
                <div className="mt-6">
                    <button
                        onClick={() => setIsAboutModalOpen(true)}
                        className="text-sm font-medium underline text-gray-900 hover:text-gray-600 transition decoration-1 underline-offset-4"
                    >
                        Show More
                    </button>
                </div>
            )}

            <AboutSpaceModal
                isOpen={isAboutModalOpen}
                onClose={() => setIsAboutModalOpen(false)}
                description={displayDescription}
                title={title}
            />
        </div>
    );
};

export default AboutSpace;
