import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers basePath="/api/auth">
            <Navbar />
            {children}
            <Footer />
        </Providers>
    );
}
