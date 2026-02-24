"use client";

import { Header } from "@/components/header";
import { PdfMerger } from "@/components/pdf-merger";

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-background overflow-hidden select-none">
      <Header />
      <PdfMerger />
    </main>
  );
}
