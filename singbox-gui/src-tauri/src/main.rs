// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod service;
use service::{ServiceManager, start_service, stop_service, get_service_status};

fn main() {
    tauri::Builder::default()
        .manage(ServiceManager::new())
        .invoke_handler(tauri::generate_handler![
            start_service,
            stop_service,
            get_service_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
