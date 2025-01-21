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

    pub fn start(&self, config_path: &str) -> Result<(), String> {
        let mut process = self.process.lock().unwrap();
        if process.is_some() {
            return Err("Service is already running".to_string());
        }

        let child = Command::new("sing-box")
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
            child.kill().map_err(|e| format!("Failed to stop service: {}", e))?;
            child.wait().map_err(|e| format!("Failed to wait for service: {}", e))?;
            Ok(())
        } else {
            Err("Service is not running".to_string())
        }
    }

    pub fn is_running(&self) -> bool {
        let process = self.process.lock().unwrap();
        process.is_some()
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