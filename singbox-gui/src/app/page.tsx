"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Box, Cpu, MemoryStick } from "lucide-react"
import { useServiceStore } from "@/lib/store"

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}小时${minutes}分钟`
}

export default function Home() {
  const service = useServiceStore((state) => state.service)

  return (
    <MainLayout>
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                服务状态
              </CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                service.status === "running" ? "text-green-500" : "text-red-500"
              }`}>
                {service.status === "running" ? "运行中" : "已停止"}
              </div>
              <p className="text-xs text-muted-foreground">
                运行时长: {formatDuration(service.uptime)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                CPU 使用率
              </CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{service.cpuUsage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                核心数: 8
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                内存使用
              </CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(service.memoryUsage)}</div>
              <p className="text-xs text-muted-foreground">
                总内存: 16GB
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                网络活动
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBytes(service.networkStats.uploadSpeed + service.networkStats.downloadSpeed)}/s
              </div>
              <p className="text-xs text-muted-foreground">
                ↑{formatBytes(service.networkStats.uploadSpeed)}/s ↓{formatBytes(service.networkStats.downloadSpeed)}/s
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>网络流量统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                流量图表区域
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>活动连接</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {service.connections.map((conn) => (
                  <div key={conn.id} className="text-sm">
                    <div className="font-medium">{conn.protocol}</div>
                    <div className="text-muted-foreground">
                      {conn.source} → {conn.destination}
                    </div>
                  </div>
                ))}
                {service.connections.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center">
                    暂无活动连接
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
