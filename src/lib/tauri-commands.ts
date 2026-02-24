import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

export interface PdfFileInfo {
  path: string;
  filename: string;
  page_count: number;
}

export interface PdfInfoResult {
  files: PdfFileInfo[];
  errors: string[];
}

export async function pickPdfFiles(): Promise<string[] | null> {
  const selected = await open({
    multiple: true,
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
  });

  if (!selected) return null;
  if (typeof selected === "string") return [selected];
  return selected;
}

export async function pickSaveLocation(): Promise<string | null> {
  const path = await save({
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    defaultPath: "merged.pdf",
  });
  return path;
}

export async function getPdfInfo(paths: string[]): Promise<PdfInfoResult> {
  return invoke<PdfInfoResult>("get_pdf_info", { paths });
}

export async function mergePdfs(paths: string[]): Promise<number> {
  return invoke<number>("merge_pdfs", { paths });
}

export async function saveMergedPdf(
  mergeId: number,
  outputPath: string
): Promise<void> {
  return invoke("save_merged_pdf", { mergeId, outputPath });
}

export async function clearMergeState(): Promise<void> {
  return invoke("clear_merge_state");
}
