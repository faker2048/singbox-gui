# SingBox Manager

## 项目描述
一个现代化的 sing-box 代理工具管理器，提供直观的图形界面来管理和监控 sing-box 实例。

## 核心功能

### 1. 代理服务管理
- 启动/停止/重启 sing-box 服务
- 显示服务运行状态（运行中/已停止）
- 实时显示服务性能指标（CPU 使用率、内存占用）
- 显示服务运行时长

### 2. 配置管理
- 导入/编辑 sing-box 配置文件
- 配置文件语法检查
- 配置文件版本管理
- 支持多配置文件切换

### 3. 日志监控
- 实时显示 sing-box 运行日志
- 日志级别过滤（INFO、WARNING、ERROR等）
- 日志搜索功能
- 日志导出功能

### 4. 系统监控面板
- 可视化展示系统状态
- 网络流量统计
- 连接状态监控
- 系统资源使用情况

## 技术栈
- Frontend: Next.js 22+ with App Router
- UI Framework: shadcn/ui + Tailwind CSS
- Desktop Framework: Tauri
- 状态管理: Zustand
- 图表库: TanStack Charts

## UI/UX 要求
- 深色/浅色主题支持
- 响应式设计
- 简洁现代的界面风格
- 流畅的动画过渡效果
- 清晰的状态反馈

## 系统要求
- sing-box 可执行文件集成
- 最小化系统资源占用

## 特色功能
- 系统托盘支持
- 自动更新
- 配置文件导入导出
- 快捷键支持
- 多语言支持（中文/英文）


## 已完成的功能：
- 基础UI框架搭建
- 主题切换支持
- 状态管理
- 页面路由
- 响应式设计
- Toast通知系统

## 待实现的功能：
- Tauri 后端功能
- sing-box 服务管理
- 系统托盘
- 配置文件管理
- 自动更新
- 国际化