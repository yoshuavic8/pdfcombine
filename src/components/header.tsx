"use client";

import { FileStack } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
        <FileStack className="w-5 h-5 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-lg font-semibold leading-tight">PDF Combine</h1>
        <p className="text-xs text-muted-foreground">
          Merge multiple PDFs into one
        </p>
      </div>
    </header>
  );
}
