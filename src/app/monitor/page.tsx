"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { LineChart } from "lucide-react"

// 获得当前的流量
// GET 127.0.0.1:9999/traffic

// 获得实时的上下行 (Byte)

// 200 返回一个 Chunk Stream，每秒推送一个 JSON，up 为上行 down 为下行
// Copy

// {
//     "up": 200,
//     "down": 300
// }

const TrafficCard = () => {
  
}


export default function MonitorPage() {

  return (
    <MainLayout>
      <LineChart />
    </MainLayout>
  )
} 