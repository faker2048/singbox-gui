"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { useEffect, useState } from "react"
import GroupCard from "./group-card"
import type { ProxyNode } from "./group-card"
import { useToast } from "@/hooks/use-toast"



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

  const handleTestDelay = async (groupName: string) => {
    try {
      const response = await fetch(
        `http://192.168.100.1:9999/group/${encodeURIComponent(groupName)}/delay?url=https%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=5000`
      )
      if (!response.ok) {
        throw new Error("Failed to test delay")
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Failed to test delay:", error)
      toast({
        title: "测试失败",
        description: "无法测试节点延迟",
        variant: "destructive",
      })
      return {}
    }
  }

  // 过滤出所有代理组
  const proxyGroups = Object.entries(proxies).filter(([_, node]) => 
    node.type === "Selector" || node.type === "URLTest"
  )

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-4">
        <div className="columns-1 md:columns-2 gap-4 space-y-4 [&>*]:break-inside-avoid-column">
          {proxyGroups.map(([name, group]) => (
            <GroupCard
              key={name}
              name={name}
              proxyNode={group}
              onProxyChange={handleProxyChange}
              onTestDelay={handleTestDelay}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  )
} 