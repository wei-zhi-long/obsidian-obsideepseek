# Obsideepseek 🧠

> **DeepSeek AI 深度集成到 Obsidian** — 实时对话、自动保存、一键导出到知识库。

![Obsidian](https://img.shields.io/badge/Obsidian-7C3AED?style=flat&logo=obsidian&logoColor=white)
![DeepSeek](https://img.shields.io/badge/DeepSeek-4F46E5?style=flat)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

---

## ✨ 功能一览

| 功能 | 说明 |
|------|------|
| 💬 **侧边栏聊天** | 在 Obsidian 内直接与 DeepSeek 对话 |
| 💾 **自动保存** | 会话实时保存到 `.obsideepseek/sessions/`（JSON） |
| 📤 **一键导出** | 导出当前/全部会话为 Markdown，纳入知识库管理 |
| 🏷️ **智能领域分类** | 按内容自动归类到对应目录（AI / Fashion / Esoteric / TCM / Stocks） |
| 🛡️ **安全机制** | Esoteric + TCM 组合自动拦截，防止交叉污染 |
| ⚙️ **全面设置** | API Key、模型切换、Temperature、System Prompt 全可调 |
| 🔍 **命令面板** | 支持 `打开 DeepSeek 聊天` / `导出当前对话` / `新建对话` |

## 📦 安装

### 方法一：BRAT（推荐）

1. 安装社区插件 [BRAT](https://obsidian.md/plugins?id=obsidian42-brat)
2. 设置 → BRAT → `Add Beta Plugin` → 输入 `your-username/obsidian-obsideepseek`
3. 启用插件

### 方法二：手动安装

1. 下载 [最新 Release](https://github.com/your-username/obsidian-obsideepseek/releases) 中的 `main.js`、`manifest.json`、`styles.css`
2. 复制到你的仓库 `.obsidian/plugins/obsideepseek/`
3. 重启 Obsidian → 设置 → 第三方插件 → 启用

### 方法三：从源码构建

```bash
git clone https://github.com/your-username/obsidian-obsideepseek.git
cd obsidian-obsideepseek
npm install
npm run build
```

## 🔧 使用指南

### 1. 获取 API Key
- 访问 [platform.deepseek.com](https://platform.deepseek.com) 注册
- 创建 API Key，复制到插件设置中

### 2. 开始对话
- 点击左侧丝带 🧠 图标，或从命令面板打开
- Enter 发送消息，Shift+Enter 换行
- 对话自动保存到 `.obsideepseek/sessions/`

### 3. 导出到知识库
- 在设置页设置导出路径（如 `11_Raw/Journal` 或 `DeepSeek/Conversations`）
- 点击「导出当前对话」或「全部导出」
- 文件格式：Markdown + YAML Frontmatter

## 📁 数据存储

```
你的仓库/
├── .obsideepseek/          ← 插件数据目录
│   └── sessions/           ← 会话 JSON 文件
├── .obsidian/
│   └── plugins/
│       └── obsideepseek/   ← 插件代码
└── 11_Raw/                 ← （可选）导出目标
    ├── AI/
    ├── Fashion/
    ├── Esoteric/
    ├── TCM/
    ├── Stocks/
    └── Journal/
```

## ⚙️ 设置选项

| 设置项 | 默认值 | 说明 |
|--------|--------|------|
| API Key | — | DeepSeek 密钥 |
| 模型 | `deepseek-chat` | V3 或 R1 |
| Temperature | `0.7` | 创意程度 |
| Max Tokens | `4096` | 回复长度上限 |
| 自动保存 | ✅ | 实时保存会话 |
| 导出路径 | `11_Raw/Journal` | Markdown 输出目录 |
| 领域分类 | ✅ | 按关键词自动归档 |
| System Prompt | `You are...` | 角色设定 |

## 📄 导出格式

每次导出生成一个 Markdown 文件：

```markdown
---
title: "帮我写一个 Python 脚本"
created: 2026-06-25 14:30:00
domain: "AI"
model: "deepseek-chat"
messages: 5
source: "obsideepseek"
---

# 帮我写一个 Python 脚本

> 模型: deepseek-chat | 日期: 2026-06-25 14:30

### 👤 User 14:30:00
你好，帮我写一个 Python 脚本

---

### 🤖 DeepSeek 14:30:05
当然！以下是一个 Python 脚本...
```

## 🧩 开发

```bash
npm run dev      # 开发模式（监听文件变化）
npm run build    # 生产构建
npm run release  # 构建并安装到本地仓库
```

## 📜 许可

MIT
