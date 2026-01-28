import { Toaster } from "sonner";

export const metadata = {
  title: "Publishify - Katalog Buku",
  description: "Jelajahi koleksi buku yang telah diterbitkan di Publishify",
};

export default function PublikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  );
}
