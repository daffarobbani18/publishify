"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Server, 
  FileText, 
  MessageSquare, 
  Printer, 
  Upload, 
  User,
  Shield,
  Database,
  Activity
} from "lucide-react";

interface TestResult {
  endpoint: string;
  method: string;
  status: "success" | "error" | "loading";
  statusCode?: number;
  response?: any;
  error?: string;
  timestamp: string;
  duration?: number;
}

// ============================================
// MOCK API RESPONSES (Data Dummy untuk Testing)
// ============================================

const MOCK_RESPONSES: Record<string, any> = {
  "GET:/health": {
    status: 200,
    duration: 32,
    data: {
      status: "ok",
      database: "connected",
      uptime: 86400,
      timestamp: new Date().toISOString()
    }
  },
  "GET:/": {
    status: 200,
    duration: 45,
    data: {
      sukses: true,
      pesan: "Publishify API v1.0 - Sistem Manajemen Penerbitan Naskah",
      data: {
        versi: "1.0.0",
        status: "aktif",
        timestamp: new Date().toISOString()
      }
    }
  },
  "POST:/api/auth/login": {
    status: 200,
    duration: 280,
    data: {
      sukses: true,
      pesan: "Login berhasil",
      data: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFB1Ymxpc2hpZnkiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlJlZnJlc2giLCJpYXQiOjE1MTYyMzkwMjJ9.refresh_token_dummy",
        pengguna: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          email: "admin@publishify.com",
          peran: ["admin"]
        }
      }
    }
  },
  "POST:/api/auth/daftar": {
    status: 201,
    duration: 420,
    data: {
      sukses: true,
      pesan: "Registrasi berhasil. Silakan cek email untuk verifikasi akun.",
      data: {
        id: "650e8400-e29b-41d4-a716-446655440001",
        email: "penulis.baru@example.com"
      }
    }
  },
  "GET:/api/naskah": {
    status: 200,
    duration: 125,
    data: {
      sukses: true,
      pesan: "Daftar naskah berhasil diambil",
      data: [
        {
          id: "naskah-001",
          judul: "Filosofi Kopi: Perjalanan Rasa",
          subJudul: "Eksplorasi Kopi Nusantara",
          sinopsis: "Sebuah kisah tentang perjalanan menemukan makna hidup melalui secangkir kopi...",
          isbn: "978-602-1234-56-7",
          status: "diterbitkan",
          jumlahHalaman: 280,
          jumlahKata: 75000,
          urlSampul: "https://example.com/cover1.jpg",
          dibuatPada: "2026-01-01T10:00:00Z",
          penulis: {
            id: "penulis-001",
            email: "dee@example.com",
            profilPengguna: {
              namaDepan: "Dee",
              namaBelakang: "Lestari"
            }
          },
          kategori: { id: "kat-001", nama: "Fiksi", slug: "fiksi" },
          genre: { id: "genre-001", nama: "Drama", slug: "drama" }
        },
        {
          id: "naskah-002",
          judul: "Laskar Pelangi",
          sinopsis: "Kisah inspiratif anak-anak Belitung yang pantang menyerah...",
          status: "diterbitkan",
          jumlahHalaman: 350,
          penulis: {
            profilPengguna: { namaDepan: "Andrea", namaBelakang: "Hirata" }
          },
          kategori: { nama: "Fiksi" },
          genre: { nama: "Inspirasi" }
        },
        {
          id: "naskah-003",
          judul: "Bumi Manusia",
          sinopsis: "Tetralogi Buru bagian pertama...",
          status: "diterbitkan",
          jumlahHalaman: 535,
          penulis: {
            profilPengguna: { namaDepan: "Pramoedya", namaBelakang: "Ananta Toer" }
          },
          kategori: { nama: "Fiksi Sejarah" },
          genre: { nama: "Historical Fiction" }
        }
      ],
      metadata: {
        total: 156,
        halaman: 1,
        limit: 10,
        totalHalaman: 16
      }
    }
  },
  "GET:/api/naskah/penulis/saya": {
    status: 200,
    duration: 95,
    data: {
      sukses: true,
      pesan: "Daftar naskah Anda berhasil diambil",
      data: [
        {
          id: "naskah-user-001",
          judul: "Novel Pertama Saya",
          sinopsis: "Draft awal yang masih dalam pengembangan",
          status: "draft",
          jumlahHalaman: 120,
          dibuatPada: "2026-01-10T08:30:00Z",
          diperbaruiPada: "2026-01-12T14:20:00Z"
        },
        {
          id: "naskah-user-002",
          judul: "Kisah Perjalanan Waktu",
          sinopsis: "Naskah sedang dalam proses review",
          status: "dalam_review",
          jumlahHalaman: 280,
          dibuatPada: "2026-01-05T10:00:00Z"
        },
        {
          id: "naskah-user-003",
          judul: "Petualangan Si Kancil Modern",
          sinopsis: "Telah disetujui dan siap diterbitkan",
          status: "disetujui",
          jumlahHalaman: 180,
          isbn: "978-602-9999-88-8",
          dibuatPada: "2026-01-01T09:00:00Z"
        }
      ],
      metadata: {
        total: 3
      }
    }
  },
  "GET:/api/naskah/penulis/diterbitkan": {
    status: 200,
    duration: 145,
    data: {
      sukses: true,
      pesan: "Daftar naskah diterbitkan berhasil diambil",
      data: [
        {
          id: "naskah-approved-001",
          judul: "Buku Siap Cetak Premium",
          subJudul: "Edisi Terbatas",
          sinopsis: "Naskah yang telah lolos review dan siap untuk dicetak",
          isbn: "978-602-1111-22-3",
          jumlahHalaman: 250,
          status: "disetujui",
          urlSampul: "https://example.com/approved-cover.jpg",
          review: [
            {
              id: "review-001",
              status: "selesai",
              rekomendasi: "setujui",
              catatanEditor: "Naskah sangat baik, siap untuk diterbitkan",
              rating: 5,
              editor: {
                id: "editor-001",
                profilPengguna: {
                  namaDepan: "Editor",
                  namaBelakang: "Senior"
                }
              },
              selesaiPada: "2026-01-08T16:00:00Z"
            }
          ]
        }
      ],
      metadata: {
        total: 1
      }
    }
  },
  "GET:/api/naskah/statistik": {
    status: 200,
    duration: 180,
    data: {
      sukses: true,
      data: {
        totalNaskah: 156,
        statusBreakdown: {
          draft: 45,
          diajukan: 12,
          dalam_review: 18,
          perlu_revisi: 8,
          disetujui: 42,
          ditolak: 6,
          diterbitkan: 25
        },
        kategoriTerpopuler: [
          { nama: "Fiksi", jumlah: 68 },
          { nama: "Non-Fiksi", jumlah: 45 },
          { nama: "Pendidikan", jumlah: 43 }
        ],
        genreTerpopuler: [
          { nama: "Drama", jumlah: 38 },
          { nama: "Romance", jumlah: 32 },
          { nama: "Thriller", jumlah: 28 }
        ]
      }
    }
  },
  "GET:/api/review": {
    status: 200,
    duration: 110,
    data: {
      sukses: true,
      data: [
        {
          id: "review-101",
          status: "dalam_proses",
          rekomendasi: null,
          rating: null,
          naskah: {
            id: "naskah-201",
            judul: "Naskah Yang Sedang Direview",
            jumlahHalaman: 200
          },
          editor: {
            id: "editor-101",
            profilPengguna: {
              namaDepan: "Editor",
              namaBelakang: "Utama"
            }
          },
          ditugaskanPada: "2026-01-10T08:00:00Z",
          deadline: "2026-01-17T23:59:59Z"
        },
        {
          id: "review-102",
          status: "ditugaskan",
          naskah: {
            judul: "Naskah Baru Masuk"
          },
          editor: {
            profilPengguna: {
              namaDepan: "Editor",
              namaBelakang: "Junior"
            }
          },
          ditugaskanPada: "2026-01-12T10:00:00Z",
          deadline: "2026-01-19T23:59:59Z"
        }
      ],
      metadata: {
        total: 18
      }
    }
  },
  "GET:/api/review/editor/saya": {
    status: 200,
    duration: 88,
    data: {
      sukses: true,
      data: [
        {
          id: "review-my-001",
          status: "ditugaskan",
          naskah: {
            id: "naskah-301",
            judul: "Naskah Baru Masuk - Menunggu Review",
            sinopsis: "Cerita menarik tentang...",
            jumlahHalaman: 180
          },
          ditugaskanPada: "2026-01-12T09:00:00Z",
          deadline: "2026-01-19T23:59:59Z"
        },
        {
          id: "review-my-002",
          status: "dalam_proses",
          naskah: {
            id: "naskah-302",
            judul: "Sedang Dikerjakan - Progress 60%",
            jumlahHalaman: 250
          },
          feedback: [
            {
              id: "fb-001",
              bagian: "Bab 1",
              komentar: "Plot sangat menarik, namun ada beberapa typo yang perlu diperbaiki",
              rating: 4,
              dibuatPada: "2026-01-11T14:00:00Z"
            },
            {
              id: "fb-002",
              bagian: "Bab 2-3",
              komentar: "Karakterisasi tokoh sangat baik",
              rating: 5,
              dibuatPada: "2026-01-12T10:00:00Z"
            }
          ],
          ditugaskanPada: "2026-01-08T08:00:00Z",
          deadline: "2026-01-15T23:59:59Z"
        }
      ]
    }
  },
  "GET:/api/review/statistik": {
    status: 200,
    duration: 165,
    data: {
      sukses: true,
      data: {
        totalReview: 89,
        statusBreakdown: {
          ditugaskan: 12,
          dalam_proses: 18,
          selesai: 52,
          dibatalkan: 7
        },
        rekomendasiBreakdown: {
          setujui: 38,
          revisi: 10,
          tolak: 4
        },
        rataRataWaktu: 6.5,
        rataRataRating: 4.3,
        editorTerbaik: [
          {
            nama: "Editor Senior",
            jumlahSelesai: 25,
            rataRating: 4.7
          },
          {
            nama: "Editor Profesional",
            jumlahSelesai: 18,
            rataRating: 4.5
          }
        ]
      }
    }
  },
  "GET:/api/percetakan/daftar": {
    status: 200,
    duration: 75,
    data: {
      sukses: true,
      data: [
        {
          id: "percetakan-001",
          nama: "Percetakan Prima Jakarta",
          alamat: "Jl. Industri No. 45, Jakarta Selatan",
          telepon: "021-1234567",
          email: "admin@primacetak.com",
          tarifBase: {
            A4: 2500,
            A5: 2000,
            B5: 2200
          },
          opsiFinishing: [
            { jenis: "laminasi_glossy", harga: 500, deskripsi: "Laminasi Glossy" },
            { jenis: "laminasi_doff", harga: 500, deskripsi: "Laminasi Doff" },
            { jenis: "jilid_perfect", harga: 1500, deskripsi: "Jilid Perfect Binding" },
            { jenis: "jilid_spiral", harga: 1000, deskripsi: "Jilid Spiral" }
          ],
          rating: 4.8,
          jumlahPesananSelesai: 156,
          aktif: true
        },
        {
          id: "percetakan-002",
          nama: "CV Mitra Cetak Nusantara",
          alamat: "Jl. Printing No. 88, Bandung",
          telepon: "022-9876543",
          email: "info@mitracetak.co.id",
          tarifBase: {
            A4: 2300,
            A5: 1900,
            B5: 2100
          },
          opsiFinishing: [
            { jenis: "laminasi_glossy", harga: 450 },
            { jenis: "jilid_perfect", harga: 1400 }
          ],
          rating: 4.6,
          jumlahPesananSelesai: 98,
          aktif: true
        }
      ]
    }
  },
  "GET:/api/percetakan": {
    status: 200,
    duration: 135,
    data: {
      sukses: true,
      data: [
        {
          id: "pesanan-001",
          naskah: {
            id: "naskah-approved-001",
            judul: "Buku Saya - Edisi Premium",
            isbn: "978-602-1111-22-3"
          },
          jumlah: 100,
          formatKertas: "A5",
          jenisKertas: "HVS 80gram",
          jenisCover: "art_paper_260",
          finishingTambahan: ["laminasi_glossy", "jilid_perfect"],
          totalHarga: 250000,
          status: "dalam_produksi",
          estimasiSelesai: "2026-01-20T00:00:00Z",
          percetakan: {
            id: "percetakan-001",
            nama: "Percetakan Prima Jakarta"
          },
          dibuatPada: "2026-01-13T08:00:00Z"
        },
        {
          id: "pesanan-002",
          naskah: {
            judul: "Pesanan Selesai Cetak"
          },
          jumlah: 50,
          formatKertas: "A5",
          totalHarga: 125000,
          status: "siap",
          percetakan: {
            nama: "CV Mitra Cetak"
          },
          selesaiPada: "2026-01-11T15:00:00Z"
        }
      ]
    }
  },
  "GET:/api/kategori": {
    status: 200,
    duration: 45,
    data: {
      sukses: true,
      data: [
        {
          id: "kategori-001",
          nama: "Fiksi",
          slug: "fiksi",
          deskripsi: "Karya fiksi dan cerita khayalan",
          aktif: true,
          subKategori: [
            { id: "sub-001", nama: "Novel", slug: "novel" },
            { id: "sub-002", nama: "Cerpen", slug: "cerpen" },
            { id: "sub-003", nama: "Novella", slug: "novella" }
          ]
        },
        {
          id: "kategori-002",
          nama: "Non-Fiksi",
          slug: "non-fiksi",
          deskripsi: "Karya berdasarkan fakta dan kenyataan",
          aktif: true,
          subKategori: [
            { nama: "Biografi", slug: "biografi" },
            { nama: "Esai", slug: "esai" }
          ]
        },
        {
          id: "kategori-003",
          nama: "Pendidikan",
          slug: "pendidikan",
          aktif: true,
          subKategori: []
        },
        {
          id: "kategori-004",
          nama: "Anak-anak",
          slug: "anak-anak",
          aktif: true
        }
      ]
    }
  },
  "GET:/api/genre": {
    status: 200,
    duration: 38,
    data: {
      sukses: true,
      data: [
        { id: "genre-001", nama: "Drama", slug: "drama", aktif: true },
        { id: "genre-002", nama: "Romance", slug: "romance", aktif: true },
        { id: "genre-003", nama: "Thriller", slug: "thriller", aktif: true },
        { id: "genre-004", nama: "Fantasi", slug: "fantasi", aktif: true },
        { id: "genre-005", nama: "Sci-Fi", slug: "sci-fi", aktif: true },
        { id: "genre-006", nama: "Horror", slug: "horror", aktif: true },
        { id: "genre-007", nama: "Inspirasi", slug: "inspirasi", aktif: true },
        { id: "genre-008", nama: "Historical Fiction", slug: "historical-fiction", aktif: true }
      ]
    }
  },
  "GET:/api/pengguna/profil/saya": {
    status: 200,
    duration: 68,
    data: {
      sukses: true,
      data: {
        id: "user-123",
        email: "penulis@publishify.com",
        telepon: "081234567890",
        aktif: true,
        terverifikasi: true,
        profilPengguna: {
          namaDepan: "John",
          namaBelakang: "Doe",
          namaTampilan: "J.D. Writer",
          bio: "Penulis novel fiksi dengan 5 tahun pengalaman",
          urlAvatar: "https://ui-avatars.com/api/?name=John+Doe",
          tanggalLahir: "1990-05-15T00:00:00Z",
          jenisKelamin: "laki-laki",
          alamat: "Jl. Merdeka No. 123",
          kota: "Jakarta Selatan",
          provinsi: "DKI Jakarta",
          kodePos: "12345"
        },
        profilPenulis: {
          namaPena: "J.D. Writer",
          biografi: "Menulis adalah passion saya sejak kecil...",
          spesialisasi: ["Fiksi", "Drama", "Romance"],
          totalBuku: 3,
          totalDibaca: 1250,
          ratingRataRata: 4.5,
          namaRekeningBank: "John Doe",
          namaBank: "Bank Mandiri",
          nomorRekeningBank: "1234567890",
          npwp: "12.345.678.9-012.345"
        },
        peranPengguna: [
          {
            jenisPeran: "penulis",
            aktif: true,
            ditugaskanPada: "2025-01-01T00:00:00Z"
          }
        ]
      }
    }
  },
  "GET:/api/pembayaran": {
    status: 200,
    duration: 98,
    data: {
      sukses: true,
      data: [
        {
          id: "payment-001",
          pesananCetak: {
            id: "pesanan-001",
            naskah: {
              judul: "Buku Saya - Edisi Premium"
            },
            jumlah: 100
          },
          jumlah: 250000,
          status: "menunggu",
          metodePembayaran: "transfer_bank",
          tanggalJatuhTempo: "2026-01-15T23:59:59Z",
          dibuatPada: "2026-01-13T08:00:00Z",
          keterangan: "Pembayaran pesanan cetak 100 buku"
        },
        {
          id: "payment-002",
          pesananCetak: {
            naskah: {
              judul: "Pesanan Lunas"
            },
            jumlah: 50
          },
          jumlah: 125000,
          status: "lunas",
          metodePembayaran: "transfer_bank",
          tanggalBayar: "2026-01-10T14:30:00Z",
          dibuatPada: "2026-01-08T10:00:00Z",
          buktiPembayaran: "https://example.com/bukti-transfer.jpg"
        }
      ],
      metadata: {
        total: 2,
        totalMenunggu: 1,
        totalLunas: 1,
        jumlahMenunggu: 250000,
        jumlahLunas: 125000
      }
    }
  }
};

export default function TestApiPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [loginEmail, setLoginEmail] = useState("admin@publishify.com");
  const [loginPassword, setLoginPassword] = useState("Admin123!");
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("timestamp");

  // Helper untuk menambah result
  const addResult = (result: TestResult) => {
    setResults((prev) => [result, ...prev]);
  };

  // Helper untuk update result
  const updateResult = (endpoint: string, updates: Partial<TestResult>) => {
    setResults((prev) =>
      prev.map((r) =>
        r.endpoint === endpoint && r.timestamp === updates.timestamp
          ? { ...r, ...updates }
          : r
      )
    );
  };

  // Helper untuk test endpoint dengan MOCK DATA
  const testEndpoint = async (
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    data?: any,
    requiresAuth: boolean = false
  ) => {
    const timestamp = new Date().toISOString();

    addResult({
      endpoint,
      method,
      status: "loading",
      timestamp,
    });

    // Simulasi network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

    const mockKey = `${method}:${endpoint.split('?')[0]}`;
    const mockResponse = MOCK_RESPONSES[mockKey];

    if (mockResponse) {
      updateResult(endpoint, {
        status: "success",
        statusCode: mockResponse.status,
        response: mockResponse.data,
        duration: mockResponse.duration,
        timestamp,
      });

      toast.success(`${method} ${endpoint} - Berhasil (${mockResponse.duration}ms)`, {
        description: "Mock data berhasil dimuat"
      });
    } else {
      updateResult(endpoint, {
        status: "error",
        statusCode: 404,
        error: "Mock data tidak tersedia untuk endpoint ini",
        duration: 100,
        timestamp,
      });

      toast.error(`${method} ${endpoint} - Mock data tidak ditemukan`);
    }
  };

  // Test Functions untuk setiap module
  const testHealth = async () => {
    await testEndpoint("GET", "/health");
  };

  const testLogin = async () => {
    const response = await testEndpoint("POST", "/api/auth/login", {
      email: loginEmail,
      kataSandi: loginPassword,
    });
  };

  const testRegister = async () => {
    await testEndpoint("POST", "/api/auth/daftar", {
      email: `test${Date.now()}@example.com`,
      kataSandi: "Test123!",
      namaDepan: "Test",
      namaBelakang: "User",
    });
  };

  const testNaskahList = async () => {
    await testEndpoint("GET", "/api/naskah?limit=10", null, true);
  };

  const testNaskahSaya = async () => {
    await testEndpoint("GET", "/api/naskah/penulis/saya", null, true);
  };

  const testNaskahDiterbitkan = async () => {
    await testEndpoint("GET", "/api/naskah/penulis/diterbitkan", null, true);
  };

  const testNaskahStatistik = async () => {
    await testEndpoint("GET", "/api/naskah/statistik", null, true);
  };

  const testReviewList = async () => {
    await testEndpoint("GET", "/api/review", null, true);
  };

  const testReviewEditorSaya = async () => {
    await testEndpoint("GET", "/api/review/editor/saya", null, true);
  };

  const testReviewStatistik = async () => {
    await testEndpoint("GET", "/api/review/statistik", null, true);
  };

  const testPercetakanDaftar = async () => {
    await testEndpoint("GET", "/api/percetakan/daftar", null, true);
  };

  const testPercetakanList = async () => {
    await testEndpoint("GET", "/api/percetakan", null, true);
  };

  const testKategoriList = async () => {
    await testEndpoint("GET", "/api/kategori", null, false);
  };

  const testGenreList = async () => {
    await testEndpoint("GET", "/api/genre", null, false);
  };

  const testPenggunaProfile = async () => {
    await testEndpoint("GET", "/api/pengguna/profil/saya", null, true);
  };

  const testPembayaranList = async () => {
    await testEndpoint("GET", "/api/pembayaran", null, true);
  };

  const testAllEndpoints = async () => {
    setLoading(true);
    setResults([]);

    // Health Check
    await testHealth();
    await new Promise((r) => setTimeout(r, 500));

    // Auth Tests (tanpa token)
    await testLogin();
    await new Promise((r) => setTimeout(r, 500));

    // Kategori & Genre (public)
    await testKategoriList();
    await new Promise((r) => setTimeout(r, 500));
    await testGenreList();
    await new Promise((r) => setTimeout(r, 500));

    // Authenticated Tests (perlu token)
    if (token) {
      await testNaskahList();
      await new Promise((r) => setTimeout(r, 500));
      await testNaskahSaya();
      await new Promise((r) => setTimeout(r, 500));
      await testNaskahDiterbitkan();
      await new Promise((r) => setTimeout(r, 500));
      await testNaskahStatistik();
      await new Promise((r) => setTimeout(r, 500));
      await testReviewList();
      await new Promise((r) => setTimeout(r, 500));
      await testReviewStatistik();
      await new Promise((r) => setTimeout(r, 500));
      await testPercetakanDaftar();
      await new Promise((r) => setTimeout(r, 500));
      await testPercetakanList();
      await new Promise((r) => setTimeout(r, 500));
      await testPenggunaProfile();
      await new Promise((r) => setTimeout(r, 500));
      await testPembayaranList();
    }

    setLoading(false);
    toast.success("Pengujian selesai!");
  };

  const handleLoginTest = async () => {
    const timestamp = new Date().toISOString();

    addResult({
      endpoint: "/api/auth/login",
      method: "POST",
      status: "loading",
      timestamp,
    });

    // Simulasi network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockResponse = MOCK_RESPONSES["POST:/api/auth/login"];

    updateResult("/api/auth/login", {
      status: "success",
      statusCode: mockResponse.status,
      response: mockResponse.data,
      duration: mockResponse.duration,
      timestamp,
    });

    // Simpan token dari mock data
    if (mockResponse.data?.data?.accessToken) {
      setToken(mockResponse.data.data.accessToken);
      toast.success(`Login berhasil! Token tersimpan (${mockResponse.duration}ms)`, {
        description: "Menggunakan mock token untuk demo"
      });
    }
  };

  const clearResults = () => {
    setResults([]);
    toast.info("Hasil pengujian dibersihkan");
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `api-test-results-${Date.now()}.json`;
    link.click();
    toast.success("Hasil pengujian berhasil diekspor");
  };

  // Filter dan sort results
  const filteredResults = results
    .filter((result) => {
      // Filter by status
      if (filterStatus !== "all" && result.status !== filterStatus) {
        return false;
      }
      
      // Filter by method
      if (filterMethod !== "all" && result.method !== filterMethod) {
        return false;
      }
      
      // Filter by search query (endpoint)
      if (searchQuery && !result.endpoint.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "timestamp":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case "duration":
          return (b.duration || 0) - (a.duration || 0);
        case "endpoint":
          return a.endpoint.localeCompare(b.endpoint);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Publishify API Testing Dashboard
          </h1>
          <p className="text-slate-600">
            Halaman pengujian lengkap untuk semua endpoint API Publishify
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline">
              <Activity className="w-3 h-3 mr-1" />
              Demo Mode - Mock Data
            </Badge>
            <Badge variant="secondary">
              <Database className="w-3 h-3 mr-1" />
              Tidak Memerlukan Backend
            </Badge>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Authentication Setup
            </CardTitle>
            <CardDescription>
              Login untuk mendapatkan token akses (menggunakan mock data untuk demo)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@publishify.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={handleLoginTest} className="flex-1">
                <Shield className="w-4 h-4 mr-2" />
                Test Login & Dapatkan Token
              </Button>
              {token && (
                <Badge variant="secondary" className="px-4 py-2">
                  Token Tersimpan ✓
                </Badge>
              )}
            </div>

            {token && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-mono break-all">
                  Token: {token.substring(0, 50)}...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="border-indigo-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              API Testing Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-7 mb-6">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="naskah">Naskah</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="cetak">Cetak</TabsTrigger>
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={testAllEndpoints}
                    disabled={loading}
                    className="flex-1"
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Activity className="w-4 h-4 mr-2" />
                    )}
                    Test Semua Endpoint
                  </Button>
                  <Button
                    onClick={clearResults}
                    variant="outline"
                    disabled={results.length === 0}
                  >
                    Bersihkan
                  </Button>
                  <Button
                    onClick={exportResults}
                    variant="outline"
                    disabled={results.length === 0}
                  >
                    Export JSON
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="health" className="space-y-2">
                <Button onClick={testHealth} className="w-full" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  GET /health
                </Button>
                <Button onClick={() => testEndpoint("GET", "/")} className="w-full" variant="outline">
                  <Server className="w-4 h-4 mr-2" />
                  GET / (Root)
                </Button>
              </TabsContent>

              <TabsContent value="naskah" className="space-y-2">
                <Button onClick={testNaskahList} className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  GET /api/naskah (List)
                </Button>
                <Button onClick={testNaskahSaya} className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  GET /api/naskah/penulis/saya
                </Button>
                <Button onClick={testNaskahDiterbitkan} className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  GET /api/naskah/penulis/diterbitkan
                </Button>
                <Button onClick={testNaskahStatistik} className="w-full" variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  GET /api/naskah/statistik
                </Button>
              </TabsContent>

              <TabsContent value="review" className="space-y-2">
                <Button onClick={testReviewList} className="w-full" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  GET /api/review (List)
                </Button>
                <Button onClick={testReviewEditorSaya} className="w-full" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  GET /api/review/editor/saya
                </Button>
                <Button onClick={testReviewStatistik} className="w-full" variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  GET /api/review/statistik
                </Button>
              </TabsContent>

              <TabsContent value="cetak" className="space-y-2">
                <Button onClick={testPercetakanDaftar} className="w-full" variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  GET /api/percetakan/daftar
                </Button>
                <Button onClick={testPercetakanList} className="w-full" variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  GET /api/percetakan (Pesanan)
                </Button>
              </TabsContent>

              <TabsContent value="user" className="space-y-2">
                <Button onClick={testPenggunaProfile} className="w-full" variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  GET /api/pengguna/profil/saya
                </Button>
                <Button onClick={testPembayaranList} className="w-full" variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  GET /api/pembayaran
                </Button>
              </TabsContent>

              <TabsContent value="data" className="space-y-2">
                <Button onClick={testKategoriList} className="w-full" variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  GET /api/kategori (Public)
                </Button>
                <Button onClick={testGenreList} className="w-full" variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  GET /api/genre (Public)
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Hasil Pengujian
              </span>
              <Badge variant="secondary">{filteredResults.length} / {results.length} hasil</Badge>
            </CardTitle>
            <CardDescription>
              Real-time hasil pengujian dari setiap endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filter Controls */}
            {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Cari Endpoint</Label>
                  <Input
                    placeholder="Cari endpoint..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Status</Label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm"
                  >
                    <option value="all">Semua Status</option>
                    <option value="success">✅ Success</option>
                    <option value="error">❌ Error</option>
                    <option value="loading">⏳ Loading</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Method</Label>
                  <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm"
                  >
                    <option value="all">Semua Method</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Urutkan</Label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white text-sm"
                  >
                    <option value="timestamp">⏰ Terbaru</option>
                    <option value="duration">⚡ Tercepat</option>
                    <option value="endpoint">🔤 Endpoint</option>
                    <option value="status">📊 Status</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="h-[600px] w-full overflow-y-auto pr-4">
              {results.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Server className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Belum ada hasil pengujian</p>
                  <p className="text-sm">Klik tombol test untuk memulai</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Server className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Tidak ada hasil yang sesuai filter</p>
                  <p className="text-sm">Coba ubah filter atau search query</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResults.map((result, index) => (
                    <Card
                      key={`${result.endpoint}-${result.timestamp}`}
                      className={`border-l-4 ${
                        result.status === "success"
                          ? "border-l-green-500 bg-green-50/50"
                          : result.status === "error"
                          ? "border-l-red-500 bg-red-50/50"
                          : "border-l-blue-500 bg-blue-50/50"
                      }`}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {result.status === "loading" && (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            )}
                            {result.status === "success" && (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            )}
                            {result.status === "error" && (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <Badge variant="outline" className="font-mono">
                              {result.method}
                            </Badge>
                            <span className="font-mono text-sm">
                              {result.endpoint}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {result.duration && (
                              <Badge variant="secondary">{result.duration}ms</Badge>
                            )}
                            {result.statusCode && (
                              <Badge
                                variant={
                                  result.statusCode >= 200 && result.statusCode < 300
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {result.statusCode}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {result.error && (
                          <div className="p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
                            <strong>Error:</strong> {result.error}
                          </div>
                        )}

                        {result.response && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-900">
                              Lihat Response
                            </summary>
                            <pre className="mt-2 p-3 bg-slate-900 text-green-400 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.response, null, 2)}
                            </pre>
                          </details>
                        )}

                        <div className="text-xs text-slate-400">
                          {new Date(result.timestamp).toLocaleString("id-ID")}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {results.length > 0 && (
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                Statistik Pengujian
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.length}
                  </div>
                  <div className="text-sm text-slate-600">Total Tests</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {results.filter((r) => r.status === "success").length}
                  </div>
                  <div className="text-sm text-slate-600">Berhasil</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {results.filter((r) => r.status === "error").length}
                  </div>
                  <div className="text-sm text-slate-600">Gagal</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {results.filter((r) => r.duration).length > 0
                      ? Math.round(
                          results
                            .filter((r) => r.duration)
                            .reduce((acc, r) => acc + (r.duration || 0), 0) /
                            results.filter((r) => r.duration).length
                        )
                      : 0}
                    ms
                  </div>
                  <div className="text-sm text-slate-600">Rata-rata Waktu</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
