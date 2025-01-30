"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { useEffect, useState } from "react"
import GroupCard from "./group-card"
import type { ProxyNode } from "./group-card"
import { useToast } from "@/hooks/use-toast"
import { invoke } from "@tauri-apps/api/core"

interface ProxiesResponse {
  proxies: Record<string, ProxyNode>
}

interface SingboxConfig {
  experimental?: {
    clash_api?: {
      external_controller?: string
    }
  }
}

export default function MonitorPage() {
  const [proxies, setProxies] = useState<Record<string, ProxyNode>>({})
  const [apiEndpoint, setApiEndpoint] = useState<string>("")
  const [isConfigLoaded, setIsConfigLoaded] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // 初始化时获取 API 地址
    const initializeApiEndpoint = async () => {
      try {
        const configContent = await invoke<string>("get_active_config_content")
        const config: SingboxConfig = JSON.parse(configContent)
        const endpoint = config.experimental?.clash_api?.external_controller || "127.0.0.1:9999"
        setApiEndpoint(`http://${endpoint}`)
        setIsConfigLoaded(true)
      } catch (error) {
        setIsConfigLoaded(false)
      }
    }

    initializeApiEndpoint()
  }, [])

  useEffect(() => {
    if (!apiEndpoint) return

    fetchProxies()
    const interval = setInterval(fetchProxies, 5000)
    return () => clearInterval(interval)
  }, [apiEndpoint])

  const fetchProxies = async () => {
    if (!apiEndpoint) return

    try {
      const response = await fetch(`${apiEndpoint}/proxies`)
      if (!response.ok) return
      const data: ProxiesResponse = await response.json()
      setProxies(data.proxies)
    } catch (error) {
      // 静默失败，不显示错误提示
      console.debug("Failed to fetch proxies:", error)
    }
  }

  const handleProxyChange = async (groupName: string, selected: string) => {
    try {
      const response = await fetch(`${apiEndpoint}/proxies/${encodeURIComponent(groupName)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: selected }),
      })
      
      if (!response.ok) return

      fetchProxies()
      
      toast({
        title: "切换成功",
        description: `已切换到节点: ${selected}`,
      })
    } catch (error) {
      // 只在用户操作时提示错误
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
        `${apiEndpoint}/group/${encodeURIComponent(groupName)}/delay?url=https%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=5000`
      )
      if (!response.ok) return {}
      return await response.json()
    } catch (error) {
      // 静默失败，返回空对象
      return {}
    }
  }

  // 如果没有加载到配置，显示提示信息
  if (!isConfigLoaded) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="text-4xl">🔍</div>
            <h2 className="text-2xl font-semibold">未找到活动配置</h2>
            <p className="text-muted-foreground text-center max-w-md">
              请先在配置管理页面中导入并激活一个配置文件，确保配置文件中包含了 experimental.clash_api.external_controller 设置。
            </p>
          </div>
        </div>
      </MainLayout>
    )
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
          {proxyGroups.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">未找到可用的代理组或服务未启动</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
} 