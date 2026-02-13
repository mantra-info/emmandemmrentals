import { Providers } from "@/components/Providers";

export default function AdminLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers basePath="/api/admin/auth">
            {children}
        </Providers>
    );
}
