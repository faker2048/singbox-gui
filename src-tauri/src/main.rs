// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod service;
mod config;

use tauri::Manager;
use service::{ServiceManager, start_service, stop_service, get_service_status};
use config::singbox::{
    State as SingboxConfigState,
    get_configs, get_active_config, save_config, remove_config, set_active_config,
    write_config_file,
};
use config::app::get_app_config;
use std::sync::Mutex;

fn main() {
    tauri::Builder::default()
        .manage(ServiceManager::new())
        .manage(Mutex::new(SingboxConfigState::default()))
        .setup(|app| {
            let handle = app.handle();
            let state = SingboxConfigState::load(&handle);
            *app.state::<Mutex<SingboxConfigState>>().lock().unwrap() = state;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_service,
            stop_service,
            get_service_status,
            get_configs,
            get_active_config,
            save_config,
            remove_config,
            set_active_config,
            write_config_file,
            get_app_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
