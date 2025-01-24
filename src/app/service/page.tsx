"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useServiceStore } from "@/lib/store"
import { startService, stopService, restartService, checkServiceStatus } from "@/lib/service"
import { Play, Square, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"

interface Config {
  id: string
  name: string
  path: string
}

export default function ServicePage() {
  const service = useServiceStore((state) => state.service)
  const setStatus = useServiceStore((state) => state.setStatus)
  const { toast } = useToast()
  const [activeConfig, setActiveConfig] = useState<Config | null>(null)
  const [singboxVersion, setSingboxVersion] = useState<string>("")

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [isRunning, config] = await Promise.all([
          checkServiceStatus(),
          invoke<Config | null>("get_active_config")
        ])
        setStatus(isRunning ? "running" : "stopped")
        setActiveConfig(config)
      } catch (error) {
        console.error("检查状态失败:", error)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000) // 每5秒检查一次状态

    return () => clearInterval(interval)
  }, [setStatus])

  useEffect(() => {
    setSingboxVersion("retrieving...")
    const getVersion = async () => {
      const version = await invoke<string>("get_singbox_version")
      setSingboxVersion(version)
    }
    getVersion()
  }, [])

  const handleStartService = async () => {
    if (!activeConfig) {
      toast({
        title: "无法启动服务",
        description: "请先选择一个配置文件",
        variant: "destructive",
      })
      return
    }

    try {
      await startService(activeConfig.path)
      setStatus("running")
      toast({
        title: "服务已启动",
        description: `sing-box 服务已使用配置 "${activeConfig.name}" 启动`,
      })
    } catch (error) {
      toast({
        title: "启动失败",
        description: `无法启动 sing-box 服务: ${error}`,
        variant: "destructive",
      })
    }
  }

  const handleStopService = async () => {
    try {
      await stopService()
      setStatus("stopped")
      toast({
        title: "服务已停止",
        description: "sing-box 服务已成功停止",
      })
    } catch (error) {
      toast({
        title: "停止失败",
        description: `无法停止 sing-box 服务: ${error}`,
        variant: "destructive",
      })
    }
  }

  const handleRestartService = async () => {
    if (!activeConfig) {
      toast({
        title: "无法重启服务",
        description: "请先选择一个配置文件",
        variant: "destructive",
      })
      return
    }

    try {
      await restartService(activeConfig.path)
      setStatus("running")
      toast({
        title: "服务已重启",
        description: `sing-box 服务已使用配置 "${activeConfig.name}" 重启`,
      })
    } catch (error) {
      toast({
        title: "重启失败",
        description: `无法重启 sing-box 服务: ${error}`,
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>服务管理</CardTitle>
            <CardDescription>
              管理 sing-box 服务的运行状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleStartService}
                disabled={service.status === "running" || !activeConfig}
              >
                <Play className="mr-2 h-4 w-4" />
                启动服务
              </Button>
              <Button
                onClick={handleStopService}
                disabled={service.status === "stopped"}
                variant="destructive"
              >
                <Square className="mr-2 h-4 w-4" />
                停止服务
              </Button>
              <Button
                onClick={handleRestartService}
                disabled={service.status === "stopped" || !activeConfig}
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重启服务
              </Button>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                当前状态: {service.status === "running" ? "运行中" : "已停止"}
              </div>
              <div className="text-sm text-muted-foreground">
                当前配置: {activeConfig ? activeConfig.name : "未选择"}
              </div>
              <div className="text-sm text-muted-foreground">
                当前 sing-box 版本: {singboxVersion}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
} 