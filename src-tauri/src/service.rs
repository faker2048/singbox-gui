use crate::config::app::{get_app_config, load_app_config, Config as AppConfig};
use std::path::Path;
use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::State;

pub struct ServiceManager {
    process: Mutex<Option<Child>>,
}

impl ServiceManager {
    pub fn new() -> Self {
        Self {
            process: Mutex::new(None),
        }
    }

    fn get_singbox_path() -> Result<String, String> {
        let config = load_app_config().unwrap();
        Ok(config.singbox_path)
    }

    pub fn start(&self, config_path: &str) -> Result<(), String> {
        let mut process = self.process.lock().unwrap();
        if process.is_some() {
            return Err("Service is already running".to_string());
        }

        if !Path::new(config_path).exists() {
            return Err(format!("Config '{}' file not found", config_path));
        }

        let singbox_path = Self::get_singbox_path()?;
        let child = Command::new(singbox_path)
            .arg("run")
            .arg("-c")
            .arg(config_path)
            .spawn()
            .map_err(|e| format!("Failed to start service: {}", e))?;

        *process = Some(child);
        Ok(())
    }

    pub fn stop(&self) -> Result<(), String> {
        let mut process = self.process.lock().unwrap();
        if let Some(mut child) = process.take() {
            child
                .kill()
                .map_err(|e| format!("Failed to stop service: {}", e))?;
            child
                .wait()
                .map_err(|e| format!("Failed to wait for service: {}", e))?;
            Ok(())
        } else {
            Err("Service is not running".to_string())
        }
    }

    pub fn is_running(&self) -> bool {
        let process = self.process.lock().unwrap();
        process.is_some()
    }

    pub fn get_singbox_version(&self) -> Result<String, String> {
        let singbox_path = Self::get_singbox_path()?;
        let output = match Command::new(singbox_path).arg("version").output() {
            Ok(output) => output,
            Err(_) => return Err("Failed to execute sing-box version".to_string()),
        };

        let version = match String::from_utf8(output.stdout) {
            Ok(v) => v,
            Err(_) => return Err("Failed to execute sing-box version".to_string()),
        };

        let re = regex::Regex::new(r"version\s+(\d+\.\d+\.\d+)").unwrap();
        let version = re.find(&version).unwrap().as_str().to_string();
        Ok(version)
    }
}

#[tauri::command]
pub async fn start_service(
    config_path: String,
    service: State<'_, ServiceManager>,
) -> Result<(), String> {
    service.start(&config_path)
}

#[tauri::command]
pub async fn stop_service(service: State<'_, ServiceManager>) -> Result<(), String> {
    service.stop()
}

#[tauri::command]
pub async fn get_service_status(service: State<'_, ServiceManager>) -> Result<bool, String> {
    Ok(service.is_running())
}

#[tauri::command]
pub async fn get_singbox_version(service: State<'_, ServiceManager>) -> Result<String, String> {
    service.get_singbox_version()
}
