"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { useEffect, useState } from "react"
import GroupCard from "./group_card"
import type { ProxyNode } from "./group_card"
import { useToast } from "@/hooks/use-toast"

// 获得当前的流量
// GET 192.168.100.1:9999/traffic

// 获得实时的上下行 (Byte)

// 200 返回一个 Chunk Stream，每秒推送一个 JSON，up 为上行 down 为下行
// Copy

// {
//     "up": 200,
//     "down": 300
// }

interface ProxiesResponse {
  proxies: Record<string, ProxyNode>
}

export default function MonitorPage() {
  const [proxies, setProxies] = useState<Record<string, ProxyNode>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchProxies()
    // 设置定时刷新
    const interval = setInterval(fetchProxies, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchProxies = async () => {
    try {
      const response = await fetch("http://192.168.100.1:9999/proxies")
      if (!response.ok) {
        throw new Error("Failed to fetch proxies")
      }
      const data: ProxiesResponse = await response.json()
      setProxies(data.proxies)
    } catch (error) {
      console.error("Failed to fetch proxies:", error)
      // 只在第一次加载失败时显示toast
      if (Object.keys(proxies).length === 0) {
        toast({
          title: "连接失败",
          description: "无法连接到 sing-box 代理服务",
          variant: "destructive",
        })
      }
    }
  }

  const handleProxyChange = async (groupName: string, selected: string) => {
    try {
      const response = await fetch(`http://192.168.100.1:9999/proxies/${encodeURIComponent(groupName)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: selected }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to change proxy")
      }

      // 更新后重新获取代理列表
      fetchProxies()
      
      toast({
        title: "切换成功",
        description: `已切换到节点: ${selected}`,
      })
    } catch (error) {
      console.error("Failed to change proxy:", error)
      toast({
        title: "切换失败",
        description: "无法切换代理节点",
        variant: "destructive",
      })
    }
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="text-xl font-bold">代理切换</div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(proxies).map(([name, proxy]) => (
            <GroupCard
              key={name}
              name={name}
              proxy={proxy}
              onProxyChange={handleProxyChange}
            />
          ))}
          {Object.keys(proxies).length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8">
              暂无代理组数据
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
} 