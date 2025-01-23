"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { FileJson, Upload, Plus, Check, X, FileCode, Clipboard, Power } from "lucide-react"
import { useState } from "react"
import React from "react"

interface Config {
  id: string
  name: string
  content: string
}

export default function ConfigPage() {
  const { toast } = useToast()
  const [configs, setConfigs] = useState<Config[]>([])
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [configContent, setConfigContent] = useState("")
  const [newConfigName, setNewConfigName] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [importMethod, setImportMethod] = useState<"file" | "clipboard" | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleSaveFromImportedFile = async () => {
    if (!selectedFile) {
      toast({
        title: "请选择文件",
        description: "请先选择一个配置文件",
        variant: "destructive",
      })
      return
    }

    try {
      const content = await selectedFile.text()
      setConfigContent(content)
      handleSaveConfigContent(content)
    } catch (error) {
      toast({
        title: "导入失败",
        description: "无法导入配置文件",
        variant: "destructive",
      })
    }
  }

  const handleSaveConfigContent = (fileContent?: string) => {
    const content = fileContent || configContent
    if (!newConfigName || !content) {
      toast({
        title: "无法保存",
        description: "配置名称和内容不能为空",
        variant: "destructive",
      })
      return
    }

    const newConfig: Config = {
      id: Date.now().toString(),
      name: newConfigName,
      content: content,
    }

    setConfigs([...configs, newConfig])
    setNewConfigName("")
    setConfigContent("")
    setSelectedFile(null)
    setImportMethod(null)

    toast({
      title: "配置已保存",
      description: "新配置已成功保存",
    })
  }

  const handleSaveButtonClick = () => {
    if (importMethod === "file") {
      handleSaveFromImportedFile()
    } else {
      handleSaveConfigContent()
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

  const handleActivateConfig = async (configId: string) => {
    if (isRunning) {
      toast({
        title: "无法切换",
        description: "sing-box 正在运行中，请先停止运行",
        variant: "destructive",
      })
      return
    }

    setActiveConfigId(configId)
    toast({
      title: "配置已激活",
      description: "配置已切换",
    })
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleBrowseButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <MainLayout>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>配置管理</CardTitle>
                <CardDescription>
                  管理 sing-box 的配置文件
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    新建配置
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新建配置</DialogTitle>
                    <DialogDescription>
                      选择导入方式并为配置文件命名
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={importMethod === "file" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setImportMethod("file")}
                      >
                        <FileCode className="mr-2 h-4 w-4" />
                        从文件导入
                      </Button>
                      <Button
                        variant={importMethod === "clipboard" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setImportMethod("clipboard")}
                      >
                        <Clipboard className="mr-2 h-4 w-4" />
                        从剪贴板导入
                      </Button>
                    </div>
                    <Input
                      placeholder="配置名称"
                      value={newConfigName}
                      onChange={(e) => setNewConfigName(e.target.value)}
                    />
                    {importMethod === "file" && (
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={selectedFile?.name || ""}
                          placeholder="选择配置文件..."
                          className="flex-1"
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileInputChange}
                          accept=".json"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleBrowseButtonClick}
                        >
                          浏览...
                        </Button>
                      </div>
                    )}
                    {importMethod === "clipboard" && (
                      <textarea
                        value={configContent}
                        onChange={(e) => setConfigContent(e.target.value)}
                        className="w-full h-[200px] p-4 font-mono text-sm bg-muted rounded-md resize-none"
                        placeholder="在此粘贴配置文件内容..."
                      />
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleSaveButtonClick}
                      disabled={!newConfigName || (importMethod === "clipboard" && !configContent)}
                    >
                      保存配置
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {configs.map((config) => (
                <Card key={config.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="font-medium">{config.name}</div>
                        {activeConfigId === config.id && (
                          <span className="text-sm text-muted-foreground">
                            (当前使用)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivateConfig(config.id)}
                          disabled={activeConfigId === config.id || isRunning}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          使用此配置
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {configs.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  暂无配置，请点击"新建配置"按钮添加
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
} 