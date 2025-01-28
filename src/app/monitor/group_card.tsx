"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface History {
  time: string
  delay: number
}

export interface ProxyNode {
  type: string
  name: string
  udp: boolean
  history: History[]
  now?: string
  all?: string[]
}

interface GroupCardProps {
  name: string
  proxy: ProxyNode
  onProxyChange?: (name: string, selected: string) => void
}

const GroupCard = ({ name, proxy, onProxyChange }: GroupCardProps) => {
  const [currentDelay, setCurrentDelay] = useState<number | null>(null)

  useEffect(() => {
    if (proxy.history && proxy.history.length > 0) {
      setCurrentDelay(proxy.history[proxy.history.length - 1].delay)
    }
  }, [proxy.history])

  const handleProxyChange = (value: string) => {
    onProxyChange?.(name, value)
  }

  // 只显示 Selector 类型的代理组
  if (proxy.type !== "Selector" || !proxy.all) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {name}
          {currentDelay !== null && (
            <Badge 
              variant={currentDelay > 300 ? "destructive" : "secondary"} 
              className="ml-2"
            >
              {currentDelay}ms
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={proxy.now} onValueChange={handleProxyChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择节点" />
          </SelectTrigger>
          <SelectContent>
            {proxy.all.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

export default GroupCard

