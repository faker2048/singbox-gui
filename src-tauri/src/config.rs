use std::path::{Path, PathBuf};
use std::fs;
use serde::{Deserialize, Serialize};
use std::io;

const APP_CONFIG_FILENAME: &str = "app_config.json";
const DEFAULT_CONFIG_DIR: &str = ".singbox-configs";
const APP_NAME: &str = "singbox-gui";
const CONFIG_FILE_EXTENSION: &str = "json";

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub config_dir: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        let default_config_dir = get_default_config_dir().to_string_lossy().to_string();
        Self {
            config_dir: default_config_dir,
        }
    }
}

pub struct ConfigManager {
    app_config: AppConfig,
}

impl ConfigManager {
    pub fn new() -> io::Result<Self> {
        let config_dir = get_default_config_dir();
        fs::create_dir_all(&config_dir)?;
        
        let app_config = Self::load_app_config()?;
        
        Ok(Self { app_config })
    }

    fn load_app_config() -> io::Result<AppConfig> {
        let config_path = Self::get_app_config_path();
        if !config_path.exists() {
            let default_config = AppConfig::default();
            let config_str = serde_json::to_string_pretty(&default_config)?;
            fs::write(&config_path, config_str)?;
            return Ok(default_config);
        }

        let config_str = fs::read_to_string(config_path)?;
        let config = serde_json::from_str(&config_str)
            .unwrap_or_else(|_| AppConfig::default());
        Ok(config)
    }

    pub fn save_config(&self, name: &str, content: &str) -> io::Result<()> {
        let config_path = Path::new(&self.app_config.config_dir)
            .join(format!("{}.{}", name, CONFIG_FILE_EXTENSION));
        fs::write(config_path, content)
    }

    pub fn load_config(&self, name: &str) -> io::Result<String> {
        let config_path = Path::new(&self.app_config.config_dir)
            .join(format!("{}.{}", name, CONFIG_FILE_EXTENSION));
        fs::read_to_string(config_path)
    }

    pub fn list_configs(&self) -> io::Result<Vec<String>> {
        let mut configs = Vec::new();
        for entry in fs::read_dir(&self.app_config.config_dir)? {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.extension().and_then(|s| s.to_str()) == Some(CONFIG_FILE_EXTENSION) {
                    if let Some(name) = path.file_stem().and_then(|s| s.to_str()) {
                        configs.push(name.to_string());
                    }
                }
            }
        }
        Ok(configs)
    }

    fn get_app_config_path() -> PathBuf {
        get_default_config_dir().join(APP_CONFIG_FILENAME)
    }

    pub fn get_config_dir(&self) -> &str {
        &self.app_config.config_dir
    }

    pub fn set_config_dir(&mut self, dir: String) -> io::Result<()> {
        fs::create_dir_all(&dir)?;
        self.app_config.config_dir = dir;
        let config_str = serde_json::to_string_pretty(&self.app_config)?;
        fs::write(Self::get_app_config_path(), config_str)?;
        Ok(())
    }
}

fn get_default_config_dir() -> PathBuf {
    let mut config_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(APP_NAME);
    
    if !config_dir.exists() {
        if let Err(_) = fs::create_dir_all(&config_dir) {
            config_dir = PathBuf::from(DEFAULT_CONFIG_DIR);
            let _ = fs::create_dir_all(&config_dir);
        }
    }
    
    config_dir
} 