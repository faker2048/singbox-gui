"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useServiceStore } from "@/lib/store"
import { startService, stopService, restartService, checkServiceStatus } from "@/lib/service"
import { Play, Square, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

export default function ServicePage() {
  const service = useServiceStore((state) => state.service)
  const setStatus = useServiceStore((state) => state.setStatus)
  const { toast } = useToast()

  // TODO: 从配置中获取配置文件路径
  const configPath = "config.json"

  useEffect(() => {
    const checkStatus = async () => {
      const isRunning = await checkServiceStatus()
      setStatus(isRunning ? "running" : "stopped")
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000) // 每5秒检查一次状态

    return () => clearInterval(interval)
  }, [setStatus])

  const handleStartService = async () => {
    try {
      await startService(configPath)
      setStatus("running")
      toast({
        title: "服务已启动",
        description: "sing-box 服务已成功启动",
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
    try {
      await restartService(configPath)
      setStatus("running")
      toast({
        title: "服务已重启",
        description: "sing-box 服务已成功重启",
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
                disabled={service.status === "running"}
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
                disabled={service.status === "stopped"}
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重启服务
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              当前状态: {service.status === "running" ? "运行中" : "已停止"}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
} 