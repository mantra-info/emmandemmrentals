'use client';

import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

interface UiContextType {
    isLoginModalOpen: boolean;
    setIsLoginModalOpen: (isOpen: boolean) => void;
    toast: { message: string; type: 'info' | 'success' | 'error' } | null;
    showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

export const UiProvider = ({ children }: { children: ReactNode }) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [toast, setToast] = useState<UiContextType['toast']>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast: UiContextType['showToast'] = (message, type = 'info') => {
        setToast({ message, type });
        if (toastTimer.current) {
            clearTimeout(toastTimer.current);
        }
        toastTimer.current = setTimeout(() => {
            setToast(null);
        }, 3200);
    };

    return (
        <UiContext.Provider value={{ isLoginModalOpen, setIsLoginModalOpen, toast, showToast }}>
            {children}
        </UiContext.Provider>
    );
};

export const useUi = () => {
    const context = useContext(UiContext);
    if (context === undefined) {
        throw new Error('useUi must be used within a UiProvider');
    }
    return context;
};
