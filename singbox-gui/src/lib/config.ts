import { invoke } from '@tauri-apps/api/core'

export async function saveConfig(name: string, content: string): Promise<void> {
  return invoke('save_config', { name, content })
}

export async function loadConfig(name: string): Promise<string> {
  return invoke('load_config', { name })
}

export async function listConfigs(): Promise<string[]> {
  return invoke('list_configs')
}

export async function getConfigDir(): Promise<string> {
  return invoke('get_config_dir')
}

export async function setConfigDir(dir: string): Promise<void> {
  return invoke('set_config_dir', { dir })
}

export interface Config {
  name: string
  content: string
} 