import React from 'react';
import { Facebook, Instagram, MessageCircle, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-white pt-12 pb-48 md:pb-32 px-4 md:px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-center gap-8">

        {/* Left Side: Logo and Legal Links */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
          {/* Logo - Replace 'src' with your actual logo file path */}
          <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Emm&Emm Logo"
              width={100}
              height={50}
              className="object-contain w-full h-full"
            />
          </div>

          <div className="flex flex-row md:flex-col gap-6 md:gap-2">
            <Link href="/privacy-policy" className="text-gray-800 hover:text-black transition text-sm md:text-[15px]">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-800 hover:text-black transition text-sm md:text-[15px]">
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Right Side: Social Icons and Copyright */}
        <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
          {/* Social Icons - Using a custom pink color to match your branding */}
          <div className="flex gap-5">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[#a62d55] hover:opacity-80 transition">
              <Facebook size={22} strokeWidth={1.5} />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#a62d55] hover:opacity-80 transition">
              <Instagram size={22} strokeWidth={1.5} />
            </a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-[#a62d55] hover:opacity-80 transition">
              <MessageCircle size={22} strokeWidth={1.5} /> {/* Representing WhatsApp */}
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-[#a62d55] hover:opacity-80 transition">
              <Youtube size={24} strokeWidth={1.5} />
            </a>
          </div>

          {/* Copyright Text */}
          <div className="text-gray-900 font-bold text-xs md:text-sm tracking-tight text-center">
            <span className="mr-2">© 2026</span>
            <span>Emm&Emm | All Rights Reserved</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
