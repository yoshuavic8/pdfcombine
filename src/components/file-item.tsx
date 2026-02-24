"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PdfFile } from "@/hooks/use-pdf-files";

interface FileItemProps {
  file: PdfFile;
  index: number;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function FileItem({ file, index, onRemove, disabled }: FileItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card transition-colors ${
        isDragging
          ? "opacity-50 border-primary shadow-lg z-10"
          : "border-border hover:border-muted-foreground/30"
      }`}
    >
      <button
        type="button"
        className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-default"
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-center w-8 h-8 rounded bg-muted flex-shrink-0">
        <FileText className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.filename}</p>
        <p className="text-xs text-muted-foreground">
          {file.page_count} {file.page_count === 1 ? "page" : "pages"}
        </p>
      </div>

      <span className="flex-shrink-0 text-xs text-muted-foreground tabular-nums w-6 text-center">
        {index + 1}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 w-7 h-7 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(file.id)}
        disabled={disabled}
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
