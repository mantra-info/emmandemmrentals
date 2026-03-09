import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";

export default function NotFound() {
  return (
    <Providers basePath="/api/auth">
      <Navbar />
      <main className="min-h-[60vh] bg-white px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a62d55]">
            Error 404
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 md:text-5xl">
            Page Not Found
          </h1>
          <p className="mt-4 max-w-xl text-sm text-gray-500 md:text-base">
            The page you are looking for does not exist or may have been moved.
          </p>
          <Link
            href="/"
            className="mt-8 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Back To Home
          </Link>
        </div>
      </main>
      <Footer />
    </Providers>
  );
}
