/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Search,
  BookOpen,
  Calendar,
  Send,
  FileCheck,
  Clock,
} from "lucide-react";
import { naskahApi, type Naskah } from "@/lib/api/naskah";
import { StatusTrackerMini } from "@/components/naskah/status-tracker";
import {
  STATUS_NASKAH,
  TAHAP_PENERBITAN,
  type StatusNaskah,
} from "@/lib/constants/status-naskah";

// Tab keys sesuai dengan 5 tahap penerbitan + semua
type TabKey =
  | "semua"
  | "diajukan"
  | "dalam_review"
  | "dalam_editing"
  | "siap_terbit"
  | "diterbitkan";

function formatTanggal(iso?: string) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function DrafPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("semua");
  const [allDrafts, setAllDrafts] = useState<Naskah[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await naskahApi.ambilNaskahSaya();
      const list = [...(res.data || [])].sort((a, b) =>
        a.dibuatPada < b.dibuatPada ? 1 : -1,
      );
      setAllDrafts(list);
    } catch (e: any) {
      toast.error(e?.response?.data?.pesan || "Gagal memuat draf");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter naskah berdasarkan tab
  const filteredDrafts = useMemo(() => {
    if (activeTab === "semua") return allDrafts;
    return allDrafts.filter((n) => n.status === activeTab);
  }, [allDrafts, activeTab]);

  // Enhanced filtered drafts dengan search
  const filteredDraftsEnhanced = useMemo(() => {
    let filtered = filteredDrafts;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.judul?.toLowerCase().includes(query) ||
          n.sinopsis?.toLowerCase().includes(query),
      );
    }
    return filtered;
  }, [filteredDrafts, searchQuery]);

  // Stats untuk tabs - 5 tahap penerbitan
  const tabStats = useMemo(
    () => ({
      semua: allDrafts.length,
      diajukan: allDrafts.filter((n) => n.status === "diajukan").length,
      dalam_review: allDrafts.filter((n) => n.status === "dalam_review").length,
      dalam_editing: allDrafts.filter((n) => n.status === "dalam_editing")
        .length,
      siap_terbit: allDrafts.filter((n) => n.status === "siap_terbit").length,
      diterbitkan: allDrafts.filter((n) => n.status === "diterbitkan").length,
    }),
    [allDrafts],
  );

  const onLihatDetail = (id: string) => router.push(`/penulis/draf/${id}`);
  // Edit naskah - redirect ke halaman detail yang sudah ada form EditorRevisi
  const onEdit = (id: string) => router.push(`/penulis/draf/${id}`);
  const onHapus = async (id: string) => {
    const konfirmasi = window.confirm("Yakin ingin menghapus draf ini?");
    if (!konfirmasi) return;
    try {
      await naskahApi.hapusNaskah(id);
      toast.success("Draf berhasil dihapus");
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.pesan || "Gagal menghapus draf");
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 overflow-hidden shadow-lg shadow-teal-500/20"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                Draf Naskah Saya
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Kelola dan pantau progres semua karya Anda di sini
              </p>
            </div>
            <div className="hidden lg:block ml-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="relative w-full mb-6 sm:mb-8">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari naskah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Tabs - 6 Tab untuk status */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-6 gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto">
            {[
              { key: "semua" as TabKey, label: "Semua", icon: BookOpen },
              { key: "diajukan" as TabKey, label: "Diajukan", icon: Send },
              {
                key: "dalam_review" as TabKey,
                label: "Review",
                icon: STATUS_NASKAH.dalam_review.icon,
              },
              {
                key: "dalam_editing" as TabKey,
                label: "Editing",
                icon: STATUS_NASKAH.dalam_editing.icon,
              },
              {
                key: "siap_terbit" as TabKey,
                label: "Siap Terbit",
                icon: FileCheck,
              },
              {
                key: "diterbitkan" as TabKey,
                label: "Terbit",
                icon: STATUS_NASKAH.diterbitkan.icon,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const count = tabStats[tab.key];

              return (
                <motion.button
                  key={tab.key}
                  whileHover={{ y: -2 }}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative px-2 sm:px-4 md:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm transition-all duration-200
                    ${
                      isActive
                        ? "text-teal-600"
                        : "text-slate-600 hover:text-slate-900"
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                    <span
                      className={`
                      px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0
                      ${
                        isActive
                          ? "bg-teal-100 text-teal-700"
                          : "bg-slate-100 text-slate-600"
                      }
                    `}
                    >
                      {count}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 to-cyan-600"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredDraftsEnhanced.length === 0 ? (
            <EmptyState
              activeTab={activeTab}
              searchQuery={searchQuery}
              onReset={() => {
                setSearchQuery("");
                setActiveTab("semua");
              }}
              onCreateNew={() => router.push("/penulis/naskah/buat")}
            />
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
              >
                {filteredDraftsEnhanced.map((naskah, index) => (
                  <NaskahCard
                    key={naskah.id}
                    naskah={naskah}
                    index={index}
                    onLihatDetail={onLihatDetail}
                    onEdit={onEdit}
                    onHapus={onHapus}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton Loading Component
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 animate-pulse">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="h-5 sm:h-6 bg-slate-200 rounded w-16 sm:w-20"></div>
        <div className="h-6 sm:h-8 bg-slate-200 rounded w-6 sm:w-8"></div>
      </div>
      <div className="h-5 sm:h-6 bg-slate-200 rounded w-3/4 mb-2 sm:mb-3"></div>
      <div className="space-y-2 mb-3 sm:mb-4">
        <div className="h-3 sm:h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-3 sm:h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 sm:h-10 bg-slate-200 rounded-lg flex-1"></div>
        <div className="h-9 sm:h-10 bg-slate-200 rounded-lg w-9 sm:w-10"></div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({
  activeTab,
  searchQuery,
  onReset,
  onCreateNew,
}: {
  activeTab: TabKey;
  searchQuery: string;
  onReset: () => void;
  onCreateNew: () => void;
}) {
  const hasFilters = activeTab !== "semua" || searchQuery.trim() !== "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 sm:py-20 px-4"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 text-center">
        {hasFilters ? "Tidak ada naskah ditemukan" : "Belum ada naskah"}
      </h3>
      <p className="text-sm sm:text-base text-slate-600 text-center max-w-md mb-6 sm:mb-8 px-4">
        {hasFilters
          ? "Coba ubah filter atau kata kunci pencarian Anda"
          : "Mulai perjalanan menulis Anda dengan membuat naskah pertama"}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
        {hasFilters && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-3 border-2 border-slate-200 text-slate-700 text-sm sm:text-base font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Reset Filter
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateNew}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm sm:text-base font-medium rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Buat Naskah Baru
        </motion.button>
      </div>
    </motion.div>
  );
}

// Naskah Card Component
function NaskahCard({
  naskah,
  index,
  onLihatDetail,
  onEdit,
  onHapus,
}: {
  naskah: Naskah;
  index: number;
  onLihatDetail: (id: string) => void;
  onEdit: (id: string) => void;
  onHapus: (id: string) => void;
}) {
  const status = (naskah.status || "draft") as StatusNaskah;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      layout
      whileHover={{ y: -4 }}
      className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 overflow-hidden w-full"
    >
      <div className="p-4 sm:p-6">
        {/* Header with Status Badge - using StatusTrackerMini */}
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <StatusTrackerMini statusSaatIni={status} />
          {naskah.review && naskah.review.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg flex-shrink-0">
              <Eye className="w-3 h-3" />
              {naskah.review.length}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors break-words">
          {naskah.judul || "Tanpa Judul"}
        </h3>

        {/* Synopsis */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-3 sm:mb-4 leading-relaxed break-words">
          {naskah.sinopsis || "Belum ada sinopsis"}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="truncate">{formatTanggal(naskah.dibuatPada)}</span>
          </div>
          {naskah.jumlahHalaman && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span>{naskah.jumlahHalaman} hal</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {status === "dalam_review" ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLihatDetail(naskah.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all min-w-0"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Lihat Detail</span>
            </motion.button>
          ) : status === "dalam_editing" ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLihatDetail(naskah.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all min-w-0"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Lihat Detail</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLihatDetail(naskah.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all min-w-0"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Lihat Detail</span>
            </motion.button>
          )}

          {status !== "dalam_review" && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onEdit(naskah.id)}
                className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 bg-slate-100 text-slate-700 rounded-lg sm:rounded-xl hover:bg-slate-200 transition-colors flex-shrink-0"
                aria-label="Edit"
              >
                <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onHapus(naskah.id)}
                className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 bg-red-50 text-red-600 rounded-lg sm:rounded-xl hover:bg-red-100 transition-colors flex-shrink-0"
                aria-label="Hapus"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
