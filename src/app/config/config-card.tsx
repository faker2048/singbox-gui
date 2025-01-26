"use client"

import { MainLayout } from "@/components/layouts/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { invoke } from "@tauri-apps/api/core"
import { join } from "@tauri-apps/api/path"
import { Command, open } from '@tauri-apps/plugin-shell'
import * as Icon from "lucide-react"
import { useEffect, useState } from "react"
import React from "react"

interface Config {
  id: string
  name: string
  path: string  // 配置文件的路径
}

export default function ConfigCard() {
  const { toast } = useToast()
  const [configs, setConfigs] = useState<Config[]>([])
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [newConfigName, setNewConfigName] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [importMethod, setImportMethod] = useState<"file" | "clipboard" | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [configContent, setConfigContent] = useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 初始化时加载配置列表和当前激活的配置
    const initializeConfigs = async () => {
      try {
        const [configsData, activeConfig] = await Promise.all([
          invoke<Config[]>("get_configs"),
          invoke<Config | null>("get_active_config")
        ]);

        setConfigs(configsData);
        if (activeConfig) {
          setActiveConfigId(activeConfig.id);
        }

        // 获取服务运行状态
        const status = await invoke<boolean>("get_service_status");
        setIsRunning(status);
      } catch (error) {
        toast({
          title: "加载配置失败",
          description: "无法读取配置信息",
          variant: "destructive",
        });
      }
    };

    initializeConfigs();
  }, []);

  const handleSaveConfig = async (content: string) => {
    if (!newConfigName) {
      toast({
        title: "无法保存",
        description: "配置名称不能为空",
        variant: "destructive",
      });
      return;
    }

    try {
      // 获取配置目录
      const appConfig = await invoke<{ config_dir: string }>("get_app_config");
      const configDir = appConfig.config_dir;

      // 生成配置文件路径
      const configId = Date.now().toString();
      const configFileName = `${configId}.json`;
      const configPath = await join(configDir, configFileName);

      // 保存配置文件
      await invoke("save_config", {
        config: {
          id: configId,
          name: newConfigName,
          path: configPath,
        }
      });

      // 写入配置内容到文件
      await invoke("write_config_file", {
        path: configPath,
        content: content
      });

      // 更新状态
      const newConfigs = await invoke<Config[]>("get_configs");
      setConfigs(newConfigs);

      setNewConfigName("");
      setConfigContent("");
      setSelectedFile(null);
      setImportMethod(null);

      toast({
        title: "配置已保存",
        description: "新配置已成功保存",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: `无法保存配置: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  };

  const handleActivateConfig = async (configId: string) => {
    if (isRunning) {
      toast({
        title: "无法切换",
        description: "sing-box 正在运行中，请先停止运行",
        variant: "destructive",
      });
      return;
    }

    try {
      await invoke("set_active_config", { id: configId });
      setActiveConfigId(configId);
      toast({
        title: "配置已激活",
        description: "配置已切换",
      });
    } catch (error) {
      toast({
        title: "切换失败",
        description: "无法切换配置",
        variant: "destructive",
      });
    }
  };

  const handleSaveFromImportedFile = async () => {
    if (!selectedFile) {
      toast({
        title: "请选择文件",
        description: "请先选择一个配置文件",
        variant: "destructive",
      });
      return;
    }

    try {
      const content = await selectedFile.text();
      // 验证 JSON 格式
      JSON.parse(content);
      await handleSaveConfig(content);
    } catch (error) {
      toast({
        title: "导入失败",
        description: "配置文件格式无效",
        variant: "destructive",
      });
    }
  };

  const handleSaveButtonClick = () => {
    if (importMethod === "file") {
      handleSaveFromImportedFile();
    } else if (importMethod === "clipboard") {
      try {
        // 验证 JSON 格式
        JSON.parse(configContent);
        handleSaveConfig(configContent);
      } catch (error) {
        toast({
          title: "保存失败",
          description: "配置内容格式无效",
          variant: "destructive",
        });
      }
    }
  };


  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleBrowseButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleEditConfig = async (configPath: string) => {
    try {
      await open(configPath)
    } catch (error) {
      toast({
        title: "打开失败",
        description: error instanceof Error ? error.message : "无法打开配置文件",
        variant: "destructive",
      })
    }
  }

  const handleRemoveConfig = async (configId: string) => {
    await invoke("remove_config", { id: configId });
    const newConfigs = await invoke<Config[]>("get_configs");
    setConfigs(newConfigs);
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>配置管理</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Icon.Plus className="mr-2 h-4 w-4" />
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
                      <Icon.FileCode className="mr-2 h-4 w-4" />
                      从文件导入
                    </Button>
                    <Button
                      variant={importMethod === "clipboard" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setImportMethod("clipboard")}
                    >
                      <Icon.Clipboard className="mr-2 h-4 w-4" />
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
              <Card key={config.id}
                className={activeConfigId === config.id ? "border-green-500/30 bg-green-100/20 dark:border-green-500/30 dark:bg-green-950/30" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="font-medium">{config.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivateConfig(config.id)}
                        disabled={activeConfigId === config.id || isRunning}
                      >
                        {activeConfigId === config.id ? <Icon.CircleDot /> :
                          <Icon.Play />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditConfig(config.path)}
                      >
                        <Icon.Pencil />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveConfig(config.id)}
                      >
                        <Icon.Trash />
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
  )
} 