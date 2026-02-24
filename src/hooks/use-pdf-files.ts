"use client";

import { useCallback, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  type PdfFileInfo,
  getPdfInfo,
  pickPdfFiles,
  mergePdfs,
  saveMergedPdf,
  pickSaveLocation,
  clearMergeState,
} from "@/lib/tauri-commands";

export type AppStatus = "idle" | "loading" | "merging" | "saving" | "done";

export interface PdfFile extends PdfFileInfo {
  id: string;
}

let fileCounter = 0;

function toFileItems(infos: PdfFileInfo[]): PdfFile[] {
  return infos.map((info) => ({
    ...info,
    id: `pdf-${++fileCounter}`,
  }));
}

export function usePdfFiles() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [status, setStatus] = useState<AppStatus>("idle");
  const [errors, setErrors] = useState<string[]>([]);

  const addFiles = useCallback(async () => {
    try {
      const paths = await pickPdfFiles();
      if (!paths || paths.length === 0) return;

      setStatus("loading");
      setErrors([]);

      const result = await getPdfInfo(paths);

      if (result.errors.length > 0) {
        setErrors(result.errors);
      }

      if (result.files.length > 0) {
        const newFiles = toFileItems(result.files);
        setFiles((prev) => [...prev, ...newFiles]);
      }
    } catch (e) {
      setErrors([(e as Error).message || String(e)]);
    } finally {
      setStatus("idle");
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setErrors([]);
  }, []);

  const reorderFiles = useCallback(
    (oldIndex: number, newIndex: number) => {
      setFiles((prev) => arrayMove(prev, oldIndex, newIndex));
    },
    []
  );

  const mergeAndSave = useCallback(async () => {
    if (files.length < 2) return;

    try {
      setStatus("merging");
      setErrors([]);

      const paths = files.map((f) => f.path);
      const mergeId = await mergePdfs(paths);

      setStatus("saving");

      const outputPath = await pickSaveLocation();
      if (!outputPath) {
        await clearMergeState();
        setStatus("idle");
        return;
      }

      await saveMergedPdf(mergeId, outputPath);
      setStatus("done");

      setTimeout(() => {
        setFiles([]);
        setStatus("idle");
        setErrors([]);
      }, 2000);
    } catch (e) {
      setErrors([(e as Error).message || String(e)]);
      setStatus("idle");
      await clearMergeState().catch(() => {});
    }
  }, [files]);

  const reset = useCallback(() => {
    setFiles([]);
    setStatus("idle");
    setErrors([]);
    clearMergeState().catch(() => {});
  }, []);

  return {
    files,
    status,
    errors,
    addFiles,
    removeFile,
    reorderFiles,
    mergeAndSave,
    reset,
  };
}
