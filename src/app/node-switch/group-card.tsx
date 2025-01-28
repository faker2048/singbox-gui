"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Activity } from "lucide-react"

export interface ProxyNode {
  type: string
  name: string
  udp: boolean
  history: Array<{
    time: string
    delay: number
  }>
  now?: string
  all?: string[]
}

export interface GroupCardProps {
  name: string
  proxyNode: ProxyNode
  onProxyChange: (groupName: string, selected: string) => void
  onTestDelay: (groupName: string) => Promise<Record<string, number>>
}

export default function GroupCard({ name, proxyNode, onProxyChange, onTestDelay }: GroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [delays, setDelays] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleTestDelay = async () => {
    setIsLoading(true)
    try {
      const delayData = await onTestDelay(name)
      setDelays(delayData)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeDisplay = (type: string) => {
    switch (type.toLowerCase()) {
      case "vmess":
        return "VMess"
      case "shadowsocks":
        return "SS"
      case "selector":
        return "选择器"
      case "urltest":
        return "自动测试"
      case "direct":
        return "直连"
      case "reject":
        return "拒绝"
      case "dns":
        return "DNS"
      default:
        return type
    }
  }

  const getDelayBadgeColor = (delay: number) => {
    if (delay < 200) return "bg-green-500"
    if (delay < 500) return "bg-blue-500"
    if (delay < 700) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleTestDelay}
            disabled={isLoading}
          >
            <Activity className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <Badge>{getTypeDisplay(proxyNode.type)}</Badge>
          {proxyNode.now && (
            <Badge variant="outline">当前: {proxyNode.now}</Badge>
          )}
        </div>

        {isExpanded && proxyNode.all && (
          <div className="grid gap-2 mt-4">
            {proxyNode.all.map((nodeName) => (
              <Card key={nodeName} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{nodeName}</span>
                    {delays[nodeName] && (
                      <Badge className={getDelayBadgeColor(delays[nodeName])}>
                        {delays[nodeName]}ms
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onProxyChange(name, nodeName)}
                    disabled={proxyNode.now === nodeName}
                  >
                    {proxyNode.now === nodeName ? "已选择" : "选择"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 