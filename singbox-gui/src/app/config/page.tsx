"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { FileJson, Upload, Check, X } from "lucide-react"
import { useState } from "react"

export default function ConfigPage() {
  const { toast } = useToast()
  const [configContent, setConfigContent] = useState("")
  const [isValidating, setIsValidating] = useState(false)

  const handleImportConfig = async () => {
    try {
      // TODO: 调用 Tauri 命令导入配置
      toast({
        title: "配置已导入",
        description: "配置文件已成功导入",
      })
    } catch (error) {
      toast({
        title: "导入失败",
        description: "无法导入配置文件",
        variant: "destructive",
      })
    }
  }

  const handleValidateConfig = async () => {
    try {
      setIsValidating(true)
      // TODO: 调用 Tauri 命令验证配置
      toast({
        title: "配置有效",
        description: "配置文件验证通过",
      })
    } catch (error) {
      toast({
        title: "验证失败",
        description: "配置文件验证未通过",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <MainLayout>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>配置管理</CardTitle>
            <CardDescription>
              管理 sing-box 的配置文件
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={handleImportConfig}>
                <Upload className="mr-2 h-4 w-4" />
                导入配置
              </Button>
              <Button
                onClick={handleValidateConfig}
                variant="outline"
                disabled={isValidating || !configContent}
              >
                {isValidating ? (
                  <>
                    <FileJson className="mr-2 h-4 w-4 animate-spin" />
                    验证中...
                  </>
                ) : (
                  <>
                    <FileJson className="mr-2 h-4 w-4" />
                    验证配置
                  </>
                )}
              </Button>
            </div>
            <div className="relative">
              <textarea
                value={configContent}
                onChange={(e) => setConfigContent(e.target.value)}
                className="w-full h-[400px] p-4 font-mono text-sm bg-muted rounded-md resize-none"
                placeholder="在此粘贴配置文件内容..."
              />
              {configContent && (
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-green-500"
                    onClick={() => {
                      // TODO: 保存配置
                      toast({
                        title: "配置已保存",
                        description: "配置文件已成功保存",
                      })
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-destructive"
                    onClick={() => setConfigContent("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
} 