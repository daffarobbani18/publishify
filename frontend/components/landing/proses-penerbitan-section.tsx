"use client";

import { useState } from "react";

export function ProsesPenerbitanSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const tahapanProses = [
    {
      nomor: "01",
      judul: "Tulis Naskah",
      deskripsi:
        "Mulai menulis naskah Anda dengan editor yang mudah digunakan. Simpan otomatis dan akses dari mana saja.",
    },
    {
      nomor: "02",
      judul: "Submit untuk Review",
      deskripsi:
        "Kirimkan naskah untuk direview oleh editor profesional kami yang berpengalaman.",
    },
    {
      nomor: "03",
      judul: "Revisi & Perbaikan",
      deskripsi:
        "Terima feedback dari editor dan lakukan revisi untuk meningkatkan kualitas naskah.",
    },
    {
      nomor: "04",
      judul: "Persetujuan & Terbit",
      deskripsi:
        "Setelah disetujui, naskah Anda akan diterbitkan secara digital dan tersedia untuk pembaca.",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#14b8a6] rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0d7377] rounded-full filter blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="text-[#14b8a6] font-semibold text-sm uppercase tracking-wider">
              Cara Kerja
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Proses Penerbitan yang <span className="text-[#14b8a6]">Mudah</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hanya 4 langkah sederhana untuk menerbitkan buku Anda
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tahapanProses.map((tahap, index) => (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => setActiveStep(index)}
              onMouseLeave={() => setActiveStep(null)}
            >
              {/* Connector Line - Hidden on last item */}
              {index < tahapanProses.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-full h-1 bg-gradient-to-r from-[#14b8a6] to-[#0d7377] z-0 opacity-30"></div>
              )}

              {/* Step Card */}
              <div
                className={`relative z-10 text-center transition-all duration-500 ${
                  activeStep === index ? "transform -translate-y-4" : ""
                }`}
              >
                <div
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl transition-all duration-500 ${
                    activeStep === index
                      ? "bg-gradient-to-br from-[#14b8a6] to-[#0d7377] text-white scale-110 rotate-6"
                      : "bg-white text-[#14b8a6] border-2 border-[#14b8a6]"
                  }`}
                >
                  {tahap.nomor}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {tahap.judul}
                </h3>
                <p
                  className={`text-gray-600 leading-relaxed transition-all duration-300 ${
                    activeStep === index ? "text-gray-700" : ""
                  }`}
                >
                  {tahap.deskripsi}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
