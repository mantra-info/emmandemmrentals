import type { Metadata } from "next";
import "./globals.css";
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
        className="antialiased font-sans overflow-x-hidden"
      >
        {children}
      </body>
    </html>
  );
}
