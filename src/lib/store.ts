import { create } from 'zustand'

interface ServiceState {
  status: 'running' | 'stopped'
  uptime: number
  cpuUsage: number
  memoryUsage: number
  networkStats: {
    uploadSpeed: number
    downloadSpeed: number
  }
  connections: Array<{
    id: string
    source: string
    destination: string
    protocol: string
    duration: number
  }>
}

interface ServiceStore {
  service: ServiceState
  setStatus: (status: ServiceState['status']) => void
  setUptime: (uptime: number) => void
  setCpuUsage: (usage: number) => void
  setMemoryUsage: (usage: number) => void
  setNetworkStats: (stats: ServiceState['networkStats']) => void
  setConnections: (connections: ServiceState['connections']) => void
}

export const useServiceStore = create<ServiceStore>((set) => ({
  service: {
    status: 'stopped',
    uptime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    networkStats: {
      uploadSpeed: 0,
      downloadSpeed: 0,
    },
    connections: [],
  },
  setStatus: (status) =>
    set((state) => ({
      service: { ...state.service, status },
    })),
  setUptime: (uptime) =>
    set((state) => ({
      service: { ...state.service, uptime },
    })),
  setCpuUsage: (cpuUsage) =>
    set((state) => ({
      service: { ...state.service, cpuUsage },
    })),
  setMemoryUsage: (memoryUsage) =>
    set((state) => ({
      service: { ...state.service, memoryUsage },
    })),
  setNetworkStats: (networkStats) =>
    set((state) => ({
      service: { ...state.service, networkStats },
    })),
  setConnections: (connections) =>
    set((state) => ({
      service: { ...state.service, connections },
    })),
})) 