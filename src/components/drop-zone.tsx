"use client";

import { FilePlus2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DropZoneProps {
  onSelectFiles: () => void;
  disabled?: boolean;
}

export function DropZone({ onSelectFiles, disabled }: DropZoneProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
          <Upload className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Add PDF files</h2>
          <p className="text-sm text-muted-foreground">
            Select two or more PDF files to merge them into a single document.
            Files are processed locally and never leave your computer.
          </p>
        </div>
        <Button
          size="lg"
          onClick={onSelectFiles}
          disabled={disabled}
          className="gap-2"
        >
          <FilePlus2 className="w-4 h-4" />
          Select PDF Files
        </Button>
      </div>
    </div>
  );
}
