"use client";

import { Loader2, Merge, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppStatus } from "@/hooks/use-pdf-files";

interface MergeButtonProps {
  status: AppStatus;
  fileCount: number;
  onMerge: () => void;
}

export function MergeButton({ status, fileCount, onMerge }: MergeButtonProps) {
  const isWorking = status === "merging" || status === "saving";
  const isDone = status === "done";
  const canMerge = fileCount >= 2 && status === "idle";

  return (
    <Button
      size="lg"
      onClick={onMerge}
      disabled={!canMerge && !isDone}
      className="gap-2 w-full"
    >
      {status === "merging" && (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Merging {fileCount} files...
        </>
      )}
      {status === "saving" && (
        <>
          <Save className="w-4 h-4 animate-pulse" />
          Saving...
        </>
      )}
      {isDone && (
        <>
          <Check className="w-4 h-4" />
          Saved successfully
        </>
      )}
      {(status === "idle" || status === "loading") && (
        <>
          <Merge className="w-4 h-4" />
          {fileCount < 2
            ? `Add ${2 - fileCount} more file${2 - fileCount !== 1 ? "s" : ""}`
            : `Merge ${fileCount} files`}
        </>
      )}
    </Button>
  );
}
