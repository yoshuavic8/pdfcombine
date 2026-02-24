mod commands;
mod pdf_merge;

use std::collections::HashMap;
use std::sync::Mutex;

pub struct MergeStore {
    pub buffers: HashMap<u64, Vec<u8>>,
    pub next_id: u64,
}

pub struct MergeState(pub Mutex<MergeStore>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(MergeState(Mutex::new(MergeStore {
            buffers: HashMap::new(),
            next_id: 1,
        })))
        .invoke_handler(tauri::generate_handler![
            commands::get_pdf_info,
            commands::merge_pdfs,
            commands::save_merged_pdf,
            commands::clear_merge_state,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
