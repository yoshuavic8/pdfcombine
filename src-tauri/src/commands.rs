use crate::pdf_merge;
use crate::MergeState;
use serde::Serialize;
use std::fs;
use tauri::State;

#[derive(Serialize, Clone)]
pub struct PdfFileInfo {
    pub path: String,
    pub filename: String,
    pub page_count: u32,
}

#[derive(Serialize)]
pub struct PdfInfoResult {
    pub files: Vec<PdfFileInfo>,
    pub errors: Vec<String>,
}

#[tauri::command]
pub fn get_pdf_info(paths: Vec<String>) -> Result<PdfInfoResult, String> {
    let mut files = Vec::new();
    let mut errors = Vec::new();

    for path in paths {
        match pdf_merge::get_info(&path) {
            Ok(info) => {
                files.push(PdfFileInfo {
                    path: info.path,
                    filename: info.filename,
                    page_count: info.page_count,
                });
            }
            Err(e) => {
                errors.push(e);
            }
        }
    }

    Ok(PdfInfoResult { files, errors })
}

#[tauri::command]
pub fn merge_pdfs(paths: Vec<String>, state: State<'_, MergeState>) -> Result<u64, String> {
    let buffer = pdf_merge::merge(&paths)?;
    let mut store = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let id = store.next_id;
    store.next_id += 1;
    store.buffers.insert(id, buffer);
    Ok(id)
}

#[tauri::command]
pub fn save_merged_pdf(
    merge_id: u64,
    output_path: String,
    state: State<'_, MergeState>,
) -> Result<(), String> {
    let mut store = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    let buffer = store
        .buffers
        .remove(&merge_id)
        .ok_or("Merged PDF not found — it may have already been saved")?;

    fs::write(&output_path, &buffer)
        .map_err(|e| format!("Failed to save to '{}': {}", output_path, e))?;

    Ok(())
}

#[tauri::command]
pub fn clear_merge_state(state: State<'_, MergeState>) -> Result<(), String> {
    let mut store = state.0.lock().map_err(|e| format!("Lock error: {}", e))?;
    store.buffers.clear();
    Ok(())
}
