import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "700"],  // Add more weights as needed, e.g., "300", "500", "600", "800"
});
export const metadata: Metadata = {
  title: "EMM | Exclusive Modern Mansions",
  description: "Experience the pinnacle of luxury living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${manrope.variable} antialiased font-sans overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
