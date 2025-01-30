use serde::{Deserialize, Serialize};
use std::fs;
use std::io;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub mod app {
    use super::*;

    const APP_CONFIG_FILENAME: &str = "app_config.json";
    const APP_NAME: &str = "singbox-gui";

    #[derive(Debug, Serialize, Deserialize)]
    pub struct Config {
        pub config_dir: String,
        pub singbox_path: String,
    }

    impl Default for Config {
        fn default() -> Self {
            let default_config_dir = get_default_config_dir().join("configs").to_string_lossy().to_string();
            Self {
                config_dir: default_config_dir,
                singbox_path: "sing-box".to_string(),
            }
        }
    }

    pub fn get_default_config_dir() -> PathBuf {
        log::info!("[get_default_config_dir] 获取默认配置目录");
        let mut config_dir = dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(APP_NAME);

        if !config_dir.exists() {
            log::info!("[get_default_config_dir] 配置目录不存在，创建目录: {:?}", config_dir);
            if let Err(_) = fs::create_dir_all(&config_dir) {
                config_dir = PathBuf::from(".").join("singbox-gui");
                log::info!("[get_default_config_dir] 创建默认目录失败，使用备用目录: {:?}", config_dir);
                let _ = fs::create_dir_all(&config_dir);
            }
        }

        config_dir
    }

    pub fn get_app_config_path() -> PathBuf {
        log::info!("[get_app_config_path] 获取应用配置文件路径");
        get_default_config_dir().join(APP_CONFIG_FILENAME)
    }

    pub fn load_app_config() -> io::Result<Config> {
        log::info!("[load_app_config] 加载应用配置");
        let config_path = get_app_config_path();
        if !config_path.exists() {
            log::info!("[load_app_config] 配置文件不存在，创建默认配置");
            let default_config = Config::default();
            let config_str = serde_json::to_string_pretty(&default_config)?;
            fs::write(&config_path, config_str)?;
            return Ok(default_config);
        }

        log::info!("[load_app_config] 读取配置文件");
        let config_str = fs::read_to_string(config_path)?;
        let config = serde_json::from_str(&config_str).unwrap_or_else(|_| Config::default());
        Ok(config)
    }

    pub fn save_app_config(config: &Config) -> io::Result<()> {
        log::info!("[save_app_config] 保存应用配置: {:?}", config);
        let config_str = serde_json::to_string_pretty(&config)?;
        fs::write(get_app_config_path(), config_str)
    }

    #[tauri::command]
    pub async fn get_app_config() -> Result<Config, String> {
        log::info!("[get_app_config] 获取应用配置");
        load_app_config().map_err(|e| e.to_string())
    }

    #[tauri::command]
    pub async fn update_app_config(config: Config) -> Result<(), String> {
        log::info!("[update_app_config] 更新应用配置: {:?}", config);
        save_app_config(&config).map_err(|e| e.to_string())
    }
}

pub mod singbox {
    use super::*;

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
        pub fn load(_app: &AppHandle) -> Self {
            log::info!("[State::load] 加载 singbox 状态");
            let config_dir = app::get_default_config_dir();
            log::info!("[State::load] config_dir: {:?}", config_dir);
            let config_file = config_dir.join(CONFIGS_STATE_FILENAME);

            if !config_dir.exists() {
                fs::create_dir_all(&config_dir).expect("无法创建配置目录");
            }

            if config_file.exists() {
                let content = fs::read_to_string(&config_file).expect("无法读取配置文件");
                serde_json::from_str(&content).unwrap_or_default()
            } else {
                Self::default()
            }
        }

        pub fn save(&self, app: &AppHandle) -> Result<(), String> {
            log::info!("[State::save] 保存 singbox 配置状态");
            let config_dir = app::get_default_config_dir();
            let config_file = config_dir.join(CONFIGS_STATE_FILENAME);

            let content = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
            fs::write(config_file, content).map_err(|e| e.to_string())?;
            Ok(())
        }

        pub fn add_config(&mut self, mut config: Config) {
            let app_config = app::load_app_config().unwrap_or_default();
            let config_dir = PathBuf::from(&app_config.config_dir);
            
            // 确保使用完整路径，并且保存在 configs 目录下
            if !config.path.contains(app_config.config_dir.as_str()) {
                config.path = config_dir.join(&config.id).with_extension("json")
                    .to_string_lossy()
                    .to_string();
            }
            
            // 创建 configs 目录（如果不存在）
            if let Err(e) = fs::create_dir_all(&config_dir) {
                log::error!("[State::add_config] 创建配置目录失败: {:?}", e);
            }
            
            log::info!("[State::add_config] 添加配置: {:?}", config);
            self.configs.push(config);
        }

        pub fn remove_config(&mut self, id: &str) {
            log::info!("[State::remove_config] 删除配置: {:?}", id);
            self.configs.retain(|c| c.id != id);
            if self.active_config_id.as_deref() == Some(id) {
                self.active_config_id = None;
            }
        }

        pub fn set_active_config(&mut self, id: Option<String>) {
            log::info!("[State::set_active_config] 设置活动配置: {:?}", id);
            self.active_config_id = id;
        }

        pub fn get_active_config(&self) -> Option<&Config> {
            log::info!("[State::get_active_config] 获取活动配置: {:?}", self.active_config_id);
            self.active_config_id
                .as_ref()
                .and_then(|id| self.configs.iter().find(|c| &c.id == id))
        }

        pub fn get_configs(&self) -> &[Config] {
            log::info!("[State::get_configs] 获取所有配置: {:?}", self.configs);
            &self.configs
        }
    }

    #[tauri::command]
    pub async fn write_config_file(path: String, content: String) -> Result<(), String> {
        let app_config = app::load_app_config().map_err(|e| e.to_string())?;
        let config_dir = PathBuf::from(&app_config.config_dir);
        let path_buf = PathBuf::from(&path);
        
        // 确保路径在 configs 目录下
        let full_path = if path_buf.is_absolute() {
            if !path_buf.starts_with(&config_dir) {
                config_dir.join(path_buf.file_name().ok_or("无效的文件名")?)
            } else {
                path_buf
            }
        } else {
            config_dir.join(&path)
        };

        log::info!("[write_config_file] 写入配置文件: {:?}", full_path);
        if let Some(parent) = full_path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        fs::write(&full_path, content).map_err(|e| e.to_string())
    }

    #[tauri::command]
    pub async fn save_config(
        app: AppHandle,
        state: tauri::State<'_, Mutex<State>>,
        mut config: Config,
    ) -> Result<(), String> {
        log::info!("[save_config] 保存 singbox 配置: {:?}", config);
        let app_config = app::load_app_config().map_err(|e| e.to_string())?;
        let config_dir = PathBuf::from(&app_config.config_dir);
        
        // 确保使用完整路径
        if !config.path.contains(app_config.config_dir.as_str()) {
            config.path = config_dir.join(&config.path)
                .to_string_lossy()
                .to_string();
        }
        
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
        log::info!("[remove_config] 删除 singbox 配置: {}", id);
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
        log::info!("[set_active_config] 设置活动配置: {:?}", id);
        let mut state = state.lock().unwrap();
        state.set_active_config(id);
        state.save(&app)
    }

    #[tauri::command]
    pub async fn get_configs(state: tauri::State<'_, Mutex<State>>) -> Result<Vec<Config>, String> {
        log::info!("[get_configs] 获取所有配置");
        let state = state.lock().unwrap();
        Ok(state.get_configs().to_vec())
    }

    #[tauri::command]
    pub async fn get_active_config(
        state: tauri::State<'_, Mutex<State>>,
    ) -> Result<Option<Config>, String> {
        log::info!("[get_active_config] 获取活动配置");
        let state = state.lock().unwrap();
        Ok(state.get_active_config().cloned())
    }
}
