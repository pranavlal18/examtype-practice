// ExamType Practice desktop wrapper.
// The app itself is the fork's static frontend; there is no app-specific
// Rust or IPC beyond Tauri's defaults — this is a thin native shell.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
