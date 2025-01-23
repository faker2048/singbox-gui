// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod service;
mod config;

use service::{ServiceManager, start_service, stop_service, get_service_status};
use config::ConfigManager;
use std::sync::Mutex;

#[tauri::command]
async fn save_config(
    name: String,
    content: String,
    config_manager: tauri::State<'_, Mutex<ConfigManager>>,
) -> Result<(), String> {
    let manager = config_manager.lock().unwrap();
    manager
        .save_config(&name, &content)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_config(
    name: String,
    config_manager: tauri::State<'_, Mutex<ConfigManager>>,
) -> Result<String, String> {
    let manager = config_manager.lock().unwrap();
    manager
        .load_config(&name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_configs(
    config_manager: tauri::State<'_, Mutex<ConfigManager>>,
) -> Result<Vec<String>, String> {
    let manager = config_manager.lock().unwrap();
    manager
        .list_configs()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_config_dir(
    config_manager: tauri::State<'_, Mutex<ConfigManager>>,
) -> Result<String, String> {
    let manager = config_manager.lock().unwrap();
    Ok(manager.get_config_dir().to_string())
}

#[tauri::command]
async fn set_config_dir(
    dir: String,
    config_manager: tauri::State<'_, Mutex<ConfigManager>>,
) -> Result<(), String> {
    let mut manager = config_manager.lock().unwrap();
    manager.set_config_dir(dir).map_err(|e| e.to_string())
}

fn main() {
    let config_manager = ConfigManager::new()
        .expect("Failed to initialize config manager");

    tauri::Builder::default()
        .manage(ServiceManager::new())
        .manage(Mutex::new(config_manager))
        .invoke_handler(tauri::generate_handler![
            start_service,
            stop_service,
            get_service_status,
            save_config,
            load_config,
            list_configs,
            get_config_dir,
            set_config_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
