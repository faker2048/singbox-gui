"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useServiceStore } from "@/lib/store"
import { Activity, Cpu, MemoryStick, Network } from "lucide-react"

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export default function MonitorPage() {
  const service = useServiceStore((state) => state.service)

  return (
    <MainLayout>
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <CardTitle>CPU 使用率</CardTitle>
              </div>
              <CardDescription>
                实时 CPU 使用情况监控
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                CPU 使用率图表区域
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4" />
                <CardTitle>内存使用</CardTitle>
              </div>
              <CardDescription>
                实时内存使用情况监控
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                内存使用图表区域
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <CardTitle>网络流量</CardTitle>
            </div>
            <CardDescription>
              实时网络流量监控
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              网络流量图表区域
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <CardTitle>连接详情</CardTitle>
            </div>
            <CardDescription>
              活动连接列表
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {service.connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted"
                >
                  <div>
                    <div className="font-medium">{conn.protocol}</div>
                    <div className="text-sm text-muted-foreground">
                      {conn.source} → {conn.destination}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    持续时间: {Math.floor(conn.duration / 60)}分钟
                  </div>
                </div>
              ))}
              {service.connections.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  暂无活动连接
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
} 