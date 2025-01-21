"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Settings, Languages, Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState("zh")

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    toast({
      title: "语言已更改",
      description: "应用语言设置已更新",
    })
  }

  return (
    <MainLayout>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <CardTitle>通用设置</CardTitle>
            </div>
            <CardDescription>
              管理应用的基本设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="font-medium">主题设置</div>
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  浅色
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  深色
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  跟随系统
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">语言设置</div>
              <div className="flex items-center gap-2">
                <Button
                  variant={language === "zh" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLanguageChange("zh")}
                >
                  <Languages className="mr-2 h-4 w-4" />
                  中文
                </Button>
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLanguageChange("en")}
                >
                  <Languages className="mr-2 h-4 w-4" />
                  English
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">开机自启</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: 设置开机自启
                    toast({
                      title: "设置已更新",
                      description: "开机自启动设置已保存",
                    })
                  }}
                >
                  设置开机自启
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">关于</div>
              <div className="text-sm text-muted-foreground">
                <p>SingBox Manager v0.1.0</p>
                <p>一个现代化的 sing-box 代理工具管理器</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
} 