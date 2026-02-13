'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useUi } from '@/context/UiContext';

const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <AlertTriangle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-blue-500" />,
};

export default function Toast() {
    const { toast } = useUi();

    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-6 right-6 z-[9999] bg-white border border-gray-100 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 max-w-[320px]"
                >
                    {icons[toast.type]}
                    <div className="text-sm text-gray-700 font-medium leading-snug">
                        {toast.message}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
