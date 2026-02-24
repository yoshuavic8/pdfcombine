"use client";

import { useEffect } from "react";
import { FilePlus2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropZone } from "@/components/drop-zone";
import { FileList } from "@/components/file-list";
import { MergeButton } from "@/components/merge-button";
import { usePdfFiles } from "@/hooks/use-pdf-files";

export function PdfMerger() {
  const {
    files,
    status,
    errors,
    addFiles,
    removeFile,
    reorderFiles,
    mergeAndSave,
    reset,
  } = usePdfFiles();

  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
    }
  }, [errors]);

  useEffect(() => {
    if (status === "done") {
      toast.success("PDF merged and saved successfully!");
    }
  }, [status]);

  const isWorking =
    status === "merging" || status === "saving" || status === "loading";

  if (files.length === 0 && !isWorking) {
    return <DropZone onSelectFiles={addFiles} disabled={isWorking} />;
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          onClick={addFiles}
          disabled={isWorking}
          className="gap-1.5"
        >
          <FilePlus2 className="w-3.5 h-3.5" />
          Add More
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          disabled={isWorking}
          className="gap-1.5 text-muted-foreground"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear All
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <FileList
          files={files}
          onRemove={removeFile}
          onReorder={reorderFiles}
          disabled={isWorking}
        />
      </div>

      <div className="px-6 py-4 border-t border-border bg-card">
        <MergeButton
          status={status}
          fileCount={files.length}
          onMerge={mergeAndSave}
        />
      </div>
    </div>
  );
}
