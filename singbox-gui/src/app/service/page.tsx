"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useServiceStore } from "@/lib/store"
import { Play, Square, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ServicePage() {
  const service = useServiceStore((state) => state.service)
  const setStatus = useServiceStore((state) => state.setStatus)
  const { toast } = useToast()

  const handleStartService = async () => {
    try {
      // TODO: 调用 Tauri 命令启动服务
      setStatus("running")
      toast({
        title: "服务已启动",
        description: "sing-box 服务已成功启动",
      })
    } catch (error) {
      toast({
        title: "启动失败",
        description: "无法启动 sing-box 服务",
        variant: "destructive",
      })
    }
  }

  const handleStopService = async () => {
    try {
      // TODO: 调用 Tauri 命令停止服务
      setStatus("stopped")
      toast({
        title: "服务已停止",
        description: "sing-box 服务已成功停止",
      })
    } catch (error) {
      toast({
        title: "停止失败",
        description: "无法停止 sing-box 服务",
        variant: "destructive",
      })
    }
  }

  const handleRestartService = async () => {
    try {
      await handleStopService()
      await handleStartService()
      toast({
        title: "服务已重启",
        description: "sing-box 服务已成功重启",
      })
    } catch (error) {
      toast({
        title: "重启失败",
        description: "无法重启 sing-box 服务",
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