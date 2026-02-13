import Sidebar from '@/components/admin/Sidebar';
import { Providers } from "@/components/Providers";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers basePath="/api/admin/auth">
            <div className="flex min-h-screen bg-gray-50 overflow-hidden admin-text-black">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>      
        </Providers>
    );
}
