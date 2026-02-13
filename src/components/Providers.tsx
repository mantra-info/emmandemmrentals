'use client';

import { SessionProvider } from "next-auth/react";
import { UiProvider } from "@/context/UiContext";
import Toast from "@/components/Toast";

export function Providers({
    children,
    basePath = "/api/auth"
}: {
    children: React.ReactNode;
    basePath?: string;
}) {
    return (
        <SessionProvider basePath={basePath}>
            <UiProvider>
                {children}
                <Toast />
            </UiProvider>
        </SessionProvider>
    );
}
