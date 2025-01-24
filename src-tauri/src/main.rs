// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod service;

use config::app::get_app_config;
use config::singbox::{
    get_active_config, get_configs, remove_config, save_config, set_active_config,
    write_config_file, State as SingboxConfigState,
};
use service::{
    get_service_status, get_singbox_version, start_service, stop_service, ServiceManager,
};
use std::sync::Mutex;
use tauri::Manager;

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
            get_singbox_version,
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
