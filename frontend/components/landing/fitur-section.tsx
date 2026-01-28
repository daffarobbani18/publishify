"use client";

import { useState } from "react";

export function FiturSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const daftarFitur = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      judul: "Editor Naskah Terintegrasi",
      deskripsi:
        "Tulis dan edit naskah Anda dengan editor yang powerful dan mudah digunakan. Simpan otomatis dan akses dari mana saja.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      judul: "Review Profesional",
      deskripsi:
        "Editor berpengalaman siap memberikan feedback dan saran untuk meningkatkan kualitas naskah Anda.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
      ),
      judul: "Penerbitan Digital",
      deskripsi:
        "Terbitkan buku digital Anda dengan mudah. Distribusi ke berbagai platform digital dalam sekali klik.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      judul: "Manajemen Royalti",
      deskripsi:
        "Lacak penjualan dan royalti Anda secara real-time. Sistem pembayaran yang transparan dan tepat waktu.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      judul: "Analitik & Laporan",
      deskripsi:
        "Monitor performa naskah Anda dengan dashboard analitik yang lengkap dan mudah dipahami.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      judul: "Kolaborasi Tim",
      deskripsi:
        "Bekerja sama dengan editor, ilustrator, dan tim lainnya dalam satu platform terintegrasi.",
    },
  ];

  return (
    <section
      id="fitur"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="text-[#14b8a6] font-semibold text-sm uppercase tracking-wider">
              Fitur Unggulan
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Fitur Lengkap untuk{" "}
            <span className="text-[#14b8a6]">Kesuksesan</span> Anda
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Publishify menyediakan semua yang Anda butuhkan untuk menerbitkan
            buku, dari menulis hingga distribusi.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {daftarFitur.map((fitur, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`p-8 bg-white rounded-2xl border-2 transition-all duration-500 cursor-pointer ${
                hoveredIndex === index
                  ? "border-[#14b8a6] shadow-2xl transform -translate-y-2 scale-105"
                  : "border-gray-100 shadow-md hover:shadow-lg"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 ${
                  hoveredIndex === index
                    ? "bg-[#14b8a6] text-white scale-110 rotate-6"
                    : "bg-teal-50 text-[#14b8a6]"
                }`}
              >
                {fitur.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {fitur.judul}
              </h3>
              <p className="text-gray-600 leading-relaxed">{fitur.deskripsi}</p>

              {/* Animated Arrow */}
              <div
                className={`mt-4 flex items-center gap-2 text-[#14b8a6] font-semibold transition-all duration-300 ${
                  hoveredIndex === index
                    ? "translate-x-2 opacity-100"
                    : "translate-x-0 opacity-0"
                }`}
              >
                <span className="text-sm">Pelajari lebih lanjut</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
