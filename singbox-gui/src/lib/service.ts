import { invoke } from '@tauri-apps/api/core'

export async function startService(configPath: string): Promise<void> {
  await invoke('start_service', { configPath })
}

export async function stopService(): Promise<void> {
  await invoke('stop_service')
}

export async function getServiceStatus(): Promise<boolean> {
  return await invoke('get_service_status')
}

export async function restartService(configPath: string): Promise<void> {
  try {
    await stopService()
    await startService(configPath)
  } catch (error) {
    throw new Error(`Failed to restart service: ${error}`)
  }
}

export async function checkServiceStatus(): Promise<boolean> {
  try {
    const isRunning = await getServiceStatus()
    return isRunning
  } catch (error) {
    console.error('Failed to check service status:', error)
    return false
  }
} 