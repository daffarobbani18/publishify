"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function HeaderNavigasi() {
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  const toggleMenu = () => setMenuTerbuka(!menuTerbuka);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Publishify Logo"
              width={40}
              height={40}
              className="w-10 h-10 transition-transform group-hover:scale-110"
            />
            <span className="text-xl font-bold text-[#0d7377]">Publishify</span>
          </Link>

          {/* Desktop Navigation - Minimalis */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/katalog"
              className="text-gray-600 hover:text-[#0d7377] transition-all duration-300 font-medium"
            >
              Katalog
            </Link>
            <Link
              href="#fitur"
              className="text-gray-600 hover:text-[#0d7377] transition-all duration-300 font-medium"
            >
              Fitur
            </Link>
            <Link
              href="#tentang"
              className="text-gray-600 hover:text-[#0d7377] transition-all duration-300 font-medium"
            >
              Tentang
            </Link>
            <Link
              href="#kontak"
              className="text-gray-600 hover:text-[#0d7377] transition-all duration-300 font-medium"
            >
              Kontak
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="bg-[#14b8a6] text-white px-8 py-3 rounded-md hover:bg-[#0d9488] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              get started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-teal-50"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-[#0d7377]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuTerbuka ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuTerbuka && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <Link
                href="/katalog"
                className="text-gray-600 hover:text-[#0d7377] transition-colors font-medium"
                onClick={() => setMenuTerbuka(false)}
              >
                Katalog
              </Link>
              <Link
                href="#fitur"
                className="text-gray-600 hover:text-[#0d7377] transition-colors font-medium"
                onClick={() => setMenuTerbuka(false)}
              >
                Fitur
              </Link>
              <Link
                href="#tentang"
                className="text-gray-600 hover:text-[#0d7377] transition-colors font-medium"
                onClick={() => setMenuTerbuka(false)}
              >
                Tentang
              </Link>
              <Link
                href="#kontak"
                className="text-gray-600 hover:text-[#0d7377] transition-colors font-medium"
                onClick={() => setMenuTerbuka(false)}
              >
                Kontak
              </Link>
              <div className="pt-4 border-t border-gray-100">
                <Link
                  href="/login"
                  className="block text-center bg-[#14b8a6] text-white px-6 py-3 rounded-md hover:bg-[#0d9488] transition-colors font-semibold"
                  onClick={() => setMenuTerbuka(false)}
                >
                  get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
