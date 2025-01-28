"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Settings, Languages, Moon, Sun, Monitor, FolderSearch, Cpu } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"

interface AppConfig {
  config_dir: string
  singbox_path: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState("zh")
  const [singboxPath, setSingboxPath] = useState("")

  useEffect(() => {
    invoke<AppConfig>("get_app_config").then((config) => {
      setSingboxPath(config.singbox_path)
    })
  }, [])

  const handleSingboxPathChange = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: "Executable",
          extensions: ["exe"]
        }]
      })

      if (selected) {
        const path = selected as string
        setSingboxPath(path)
        await invoke("update_app_config", {
          config: {
            config_dir: "", // 保持原值
            singbox_path: path
          }
        })
        toast({
          title: "设置已更新",
          description: "sing-box 路径已更新",
        })
      }
    } catch (e) {
      toast({
        title: "错误",
        description: "设置 sing-box 路径失败",
        variant: "destructive"
      })
    }
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    toast({
      title: "语言已更改",
      description: "TODO: 应用语言设置已更新",
    })
  }

  return (
    <MainLayout>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <CardTitle>内核设置</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="font-medium">sing-box 路径</div>
              <div className="flex items-center gap-2">
                <Input
                  value={singboxPath}
                  readOnly
                  placeholder="选择 sing-box 可执行文件路径"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSingboxPathChange}
                >
                  <FolderSearch className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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