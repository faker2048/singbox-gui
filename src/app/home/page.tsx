"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { useServiceStore } from "@/lib/store"
import { ServiceCard } from "./service-card"
import ConfigCard from "./config-card"

export default function Home() {

  return (
    <MainLayout>
      <div className="grid gap-4">
        <ConfigCard />
        <ServiceCard />
      </div>
    </MainLayout>
  )
}
