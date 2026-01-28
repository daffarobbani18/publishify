"use client";

/**
 * Komponen StatusTracker
 * Menampilkan timeline visual 5 tahap penerbitan naskah
 */

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  STATUS_NASKAH,
  TAHAP_PENERBITAN,
  type StatusNaskah,
} from "@/lib/constants/status-naskah";

interface StatusTrackerProps {
  /** Status naskah saat ini */
  statusSaatIni: StatusNaskah;
  /** Ukuran tampilan */
  ukuran?: "kecil" | "sedang" | "besar";
  /** Tampilkan label */
  tampilkanLabel?: boolean;
  /** Tampilkan deskripsi */
  tampilkanDeskripsi?: boolean;
  /** Class tambahan */
  className?: string;
}

/**
 * StatusTracker - Menampilkan progress timeline 5 tahap penerbitan
 *
 * Tahap: Diajukan → Dalam Review → Dalam Editing → Siap Terbit → Terbit
 */
export function StatusTracker({
  statusSaatIni,
  ukuran = "sedang",
  tampilkanLabel = true,
  tampilkanDeskripsi = false,
  className = "",
}: StatusTrackerProps) {
  const konfigurasiSaatIni = STATUS_NASKAH[statusSaatIni];
  const stepSaatIni = konfigurasiSaatIni?.step || 0;
  const isDitolak = statusSaatIni === "ditolak";

  // Ukuran berdasarkan prop
  const ukuranConfig = {
    kecil: {
      lingkaran: "w-6 h-6",
      icon: "w-3 h-3",
      garis: "h-0.5",
      teks: "text-xs",
      gap: "gap-1",
    },
    sedang: {
      lingkaran: "w-10 h-10",
      icon: "w-5 h-5",
      garis: "h-1",
      teks: "text-sm",
      gap: "gap-2",
    },
    besar: {
      lingkaran: "w-14 h-14",
      icon: "w-7 h-7",
      garis: "h-1.5",
      teks: "text-base",
      gap: "gap-3",
    },
  };

  const config = ukuranConfig[ukuran];

  // Render status ditolak sebagai tampilan khusus
  if (isDitolak) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 border-4 border-red-300">
          <STATUS_NASKAH.ditolak.icon className="w-8 h-8 text-red-600" />
        </div>
        <p className="mt-3 text-lg font-semibold text-red-700">Naskah Ditolak</p>
        <p className="text-sm text-red-600">
          {STATUS_NASKAH.ditolak.deskripsi}
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Timeline Container */}
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div
          className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 ${config.garis} bg-slate-200 rounded-full`}
          style={{ left: "5%", right: "5%" }}
        />

        {/* Progress Line */}
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 ${config.garis} bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full`}
          style={{ left: "5%" }}
          initial={{ width: 0 }}
          animate={{
            width: `${Math.max(0, ((stepSaatIni - 1) / 4) * 90)}%`,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Steps */}
        {TAHAP_PENERBITAN.map((status, index) => {
          const konfigurasi = STATUS_NASKAH[status];
          const stepNumber = index + 1;
          const isComplete = stepSaatIni > stepNumber;
          const isActive = stepSaatIni === stepNumber;
          const isPending = stepSaatIni < stepNumber;
          const Icon = konfigurasi.icon;

          return (
            <div
              key={status}
              className={`flex flex-col items-center relative z-10 ${config.gap}`}
              style={{ flex: 1 }}
            >
              {/* Circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  ${config.lingkaran} rounded-full flex items-center justify-center
                  transition-all duration-300 shadow-md
                  ${
                    isComplete
                      ? "bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-teal-500/30"
                      : isActive
                        ? `bg-white border-4 border-teal-500 ${konfigurasi.warnaTeks} shadow-teal-500/20`
                        : "bg-white border-2 border-slate-300 text-slate-400"
                  }
                `}
              >
                {isComplete ? (
                  <Check className={config.icon} strokeWidth={3} />
                ) : (
                  <Icon className={config.icon} />
                )}
              </motion.div>

              {/* Label */}
              {tampilkanLabel && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="text-center mt-2"
                >
                  <p
                    className={`
                    ${config.teks} font-medium transition-colors
                    ${
                      isComplete || isActive
                        ? "text-slate-900"
                        : "text-slate-400"
                    }
                  `}
                  >
                    {konfigurasi.label}
                  </p>
                  {tampilkanDeskripsi && (
                    <p className="text-xs text-slate-500 mt-0.5 max-w-[120px]">
                      {konfigurasi.deskripsi}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex justify-center"
      >
        <div
          className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full
          ${konfigurasiSaatIni.warnaBg} ${konfigurasiSaatIni.warnaTeks}
          ring-2 ${konfigurasiSaatIni.warnaRing}
        `}
        >
          <konfigurasiSaatIni.icon className="w-4 h-4" />
          <span className="font-semibold">{konfigurasiSaatIni.label}</span>
          <span className="text-sm opacity-75">
            ({stepSaatIni}/5)
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Versi compact dari StatusTracker untuk card/list
 */
export function StatusTrackerMini({
  statusSaatIni,
  className = "",
}: {
  statusSaatIni: StatusNaskah;
  className?: string;
}) {
  const konfigurasi = STATUS_NASKAH[statusSaatIni];
  const stepSaatIni = konfigurasi?.step || 0;

  if (statusSaatIni === "ditolak") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700">
          <STATUS_NASKAH.ditolak.icon className="w-3 h-3" />
          <span className="text-xs font-medium">Ditolak</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Progress dots */}
      <div className="flex items-center gap-1">
        {TAHAP_PENERBITAN.map((status, i) => {
          const stepNum = i + 1;
          const isComplete = stepSaatIni > stepNum;
          const isActive = stepSaatIni === stepNum;
          
          return (
            <div
              key={status}
              className={`
                w-2 h-2 rounded-full transition-all
                ${
                  isComplete
                    ? "bg-teal-500"
                    : isActive
                      ? "bg-teal-500 ring-2 ring-teal-200"
                      : "bg-slate-200"
                }
              `}
            />
          );
        })}
      </div>
      
      {/* Status badge */}
      <span
        className={`
          text-xs font-medium px-2 py-0.5 rounded-full
          ${konfigurasi.warnaBg} ${konfigurasi.warnaTeks}
        `}
      >
        {konfigurasi.label}
      </span>
    </div>
  );
}

export default StatusTracker;
