use serde::{Deserialize, Serialize};
use std::fs;
use std::io;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub mod app {
    use super::*;

    const APP_CONFIG_FILENAME: &str = "app_config.json";
    const DEFAULT_CONFIG_DIR: &str = ".singbox-configs";
    const APP_NAME: &str = "singbox-gui";

    #[derive(Debug, Serialize, Deserialize)]
    pub struct Config {
        pub config_dir: String,
        pub singbox_path: String,
    }

    impl Default for Config {
        fn default() -> Self {
            let default_config_dir = get_default_config_dir().to_string_lossy().to_string();
            Self {
                config_dir: default_config_dir,
                singbox_path: "sing-box".to_string(),
            }
        }
    }

    pub fn get_default_config_dir() -> PathBuf {
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

    pub fn get_app_config_path() -> PathBuf {
        get_default_config_dir().join(APP_CONFIG_FILENAME)
    }

    pub fn load_app_config() -> io::Result<Config> {
        let config_path = get_app_config_path();
        if !config_path.exists() {
            let default_config = Config::default();
            let config_str = serde_json::to_string_pretty(&default_config)?;
            fs::write(&config_path, config_str)?;
            return Ok(default_config);
        }

        let config_str = fs::read_to_string(config_path)?;
        let config = serde_json::from_str(&config_str).unwrap_or_else(|_| Config::default());
        Ok(config)
    }

    pub fn save_app_config(config: &Config) -> io::Result<()> {
        let config_str = serde_json::to_string_pretty(&config)?;
        fs::write(get_app_config_path(), config_str)
    }

    #[tauri::command]
    pub async fn get_app_config() -> Result<Config, String> {
        load_app_config().map_err(|e| e.to_string())
    }

    #[tauri::command]
    pub async fn update_app_config(config: Config) -> Result<(), String> {
        save_app_config(&config).map_err(|e| e.to_string())
    }
}

pub mod singbox {
    use super::*;

    const CONFIG_FILE_EXTENSION: &str = "json";
    const CONFIGS_STATE_FILENAME: &str = "configs.json";

    #[derive(Debug, Serialize, Deserialize, Clone)]
    pub struct Config {
        pub id: String,
        pub name: String,
        pub path: String,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    pub struct State {
        configs: Vec<Config>,
        active_config_id: Option<String>,
    }

    impl Default for State {
        fn default() -> Self {
            Self {
                configs: Vec::new(),
                active_config_id: None,
            }
        }
    }

    impl State {
        pub fn load(app: &AppHandle) -> Self {
            let app_dir = app
                .path()
                .app_local_data_dir()
                .expect("无法获取应用数据目录");
            let config_file = app_dir.join(CONFIGS_STATE_FILENAME);

            if !app_dir.exists() {
                fs::create_dir_all(&app_dir).expect("无法创建应用数据目录");
            }

            if config_file.exists() {
                let content = fs::read_to_string(&config_file).expect("无法读取配置文件");
                serde_json::from_str(&content).unwrap_or_default()
            } else {
                Self::default()
            }
        }

        pub fn save(&self, app: &AppHandle) -> Result<(), String> {
            let app_dir = app
                .path()
                .app_local_data_dir()
                .expect("无法获取应用数据目录");
            let config_file = app_dir.join(CONFIGS_STATE_FILENAME);

            let content = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
            fs::write(config_file, content).map_err(|e| e.to_string())?;
            Ok(())
        }

        pub fn add_config(&mut self, config: Config) {
            self.configs.push(config);
        }

        pub fn remove_config(&mut self, id: &str) {
            self.configs.retain(|c| c.id != id);
            if self.active_config_id.as_deref() == Some(id) {
                self.active_config_id = None;
            }
        }

        pub fn set_active_config(&mut self, id: Option<String>) {
            self.active_config_id = id;
        }

        pub fn get_active_config(&self) -> Option<&Config> {
            self.active_config_id
                .as_ref()
                .and_then(|id| self.configs.iter().find(|c| &c.id == id))
        }

        pub fn get_configs(&self) -> &[Config] {
            &self.configs
        }
    }

    #[tauri::command]
    pub async fn save_config(
        app: AppHandle,
        state: tauri::State<'_, Mutex<State>>,
        config: Config,
    ) -> Result<(), String> {
        let mut state = state.lock().unwrap();
        state.add_config(config);
        state.save(&app)
    }

    #[tauri::command]
    pub async fn remove_config(
        app: AppHandle,
        state: tauri::State<'_, Mutex<State>>,
        id: String,
    ) -> Result<(), String> {
        let mut state = state.lock().unwrap();
        state.remove_config(&id);
        state.save(&app)
    }

    #[tauri::command]
    pub async fn set_active_config(
        app: AppHandle,
        state: tauri::State<'_, Mutex<State>>,
        id: Option<String>,
    ) -> Result<(), String> {
        let mut state = state.lock().unwrap();
        state.set_active_config(id);
        state.save(&app)
    }

    #[tauri::command]
    pub async fn get_configs(state: tauri::State<'_, Mutex<State>>) -> Result<Vec<Config>, String> {
        let state = state.lock().unwrap();
        Ok(state.get_configs().to_vec())
    }

    #[tauri::command]
    pub async fn get_active_config(
        state: tauri::State<'_, Mutex<State>>,
    ) -> Result<Option<Config>, String> {
        let state = state.lock().unwrap();
        Ok(state.get_active_config().cloned())
    }

    #[tauri::command]
    pub async fn write_config_file(path: String, content: String) -> Result<(), String> {
        fs::write(path, content).map_err(|e| e.to_string())
    }
}
