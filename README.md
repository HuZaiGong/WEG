<div align="center">

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ██╗    ██╗███████╗███████╗                             ║
║   ██║    ██║██╔════╝██╔════╝                             ║
║   ██║ █╗ ██║███████╗█████╗                               ║
║   ██║███╗██║╚════██║██╔══╝                               ║
║   ╚███╔███╔╝███████║███████╗                             ║
║    ╚══╝╚══╝ ╚══════╝╚══════╝                             ║
║                                                          ║
║        WORLD SIMULATION ENGINE  v4.2.1                   ║
║        世 界 模 拟 引 擎  ·  NEURAL CORE ONLINE          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

**用 AI 推演文明的史诗命运 — 从创世到终焉**

[![License](https://img.shields.io/badge/license-MIT-00f0ff?style=flat-square&labelColor=0d1117)](LICENSE)
[![HTML](https://img.shields.io/badge/HTML5-Single_File-00f0ff?style=flat-square&logo=html5&logoColor=00f0ff&labelColor=0d1117)](index.html)
[![CSS](https://img.shields.io/badge/CSS3-Cyberpunk_UI-b04aff?style=flat-square&logo=css3&logoColor=b04aff&labelColor=0d1117)](index.html)
[![JS](https://img.shields.io/badge/JavaScript-Stream_API-00ff88?style=flat-square&logo=javascript&logoColor=00ff88&labelColor=0d1117)](index.html)
[![AI](https://img.shields.io/badge/AI-OpenAI_Compatible-ffd700?style=flat-square&logo=openai&logoColor=ffd700&labelColor=0d1117)](index.html)
[![Stars](https://img.shields.io/github/stars/your-username/world-simulation-engine?style=flat-square&color=ffd700&labelColor=0d1117)](.)

</div>

---

## ◈ 项目简介

**世界模拟引擎（World Simulation Engine）** 是一个纯单文件 Web 应用，让你像神明一样创造一个文明并亲眼见证它的演化历程。

通过配置文明的初始参数（类型、资源、军事、科技……），调用 AI 进行史诗级的世界线推演，每一个纪元都有独立的核心事件、文明成就与潜在危机。你还可以随时向世界线注入**神迹或灾难**，改变这个文明的命运走向。

> *"时间是一条河流，但手握因果律的人，可以决定它流向何方。"*

---

## ✦ 功能特性

### 🌐 文明创造系统

| 参数 | 说明 |
|------|------|
| **文明名称** | 自由命名你的文明 |
| **文明类型** | 8 种类型：魔法 / 纯科技 / 生物进化 / 星际殖民 / 意识上传 / 虚空召唤 / 混沌自然 / 时间操控 |
| **资源富饶度** | 0–100% 滑块控制，影响文明扩张速度 |
| **初始人口规模** | 决定文明起点的人口基数 |
| **军事潜力** | 影响战争冲突与防御能力 |
| **科研/魔法指数** | 推动技术或魔法体系的演进速率 |
| **世界背景** | 自由描述地理、神话体系、星球环境等 |

### ⚡ 演化控制台

- **启动演化** — 初始化文明并推演纪元一
- **推演下一纪元** — 延续历史上下文，生成下一阶段世界线
- **注入干预事件** — 在任意时间点向世界线注入神迹或灾难
- **重置世界线** — 清除所有历史，重新开始创世

### 🌩️ 干预事件系统

内置 **8 种预设干预**，可一键触发：

| 类型 | 事件 |
|------|------|
| 🟣 神迹 | 神圣启示、意识觉醒 |
| 🔴 灾难 | 陨石撞击、黑死瘟疫、外星入侵 |
| 🟡 事件 | 社会革命、时空门开启、星际接触 |

支持**完全自定义**干预内容，可描述任何你想注入的事件。

### 📡 实时流式输出

- 使用 **OpenAI SSE 流式 API**（`stream: true`）
- 终端内叠加**半透明毛玻璃预览层**，实时展示原始 JSON 数据流
- 流式数据带语法着色（key 紫色 / 字符串绿色 / 数字金色）
- 带轻微模糊滤镜，营造"量子解码中"的科幻质感
- 流式完成后 0.5s 淡出，切换为结构化纪元卡片

### 🎨 赛博朋克视觉系统

- 暗黑背景 `#0d1117` + 荧光青 `#00f0ff` + 荧光绿 `#00ff88`
- **霓虹呼吸灯**：`box-shadow` + CSS `@keyframes` 实现持续发光
- **扫描线 + 网格背景**：纯 CSS 伪元素构建，无额外资源
- **流动粒子系统**：Canvas 80 粒子 + 邻近粒子连线
- **终端风格日志区**：macOS 三色圆点 + 滚动面板 + 光标动画
- **霓虹文字闪烁**：模拟 CRT 显示器轻微抖动

---

## 🚀 快速开始

### 零依赖，直接运行

```bash
# 克隆仓库
git clone https://github.com/your-username/world-simulation-engine.git

# 进入目录
cd world-simulation-engine

# 直接双击打开，或用任意 HTTP 服务器托管
open index.html
```

> ⚠️ **注意**：由于需要调用外部 API，建议通过本地服务器运行以避免 CORS 问题。

```bash
# 使用 Python 启动本地服务器（任选其一）
python3 -m http.server 8080
# 或使用 Node.js
npx serve .
# 或使用 VS Code Live Server 插件
```

然后浏览器访问 `http://localhost:8080`

### 项目结构

```
world-simulation-engine/
└── index.html     # 全部代码，单文件，包含 HTML + CSS + JS
```

没有 `package.json`，没有 `node_modules`，没有构建步骤。**下载即用。**

---

## ⚙️ API 配置

项目使用标准 **OpenAI 兼容格式** API，默认配置如下：

```javascript
const API_BASE = 'https://ai.hhhl.cc';   // API 基础地址
const API_KEY  = 'sk-free';              // API 密钥
```

如需替换为自己的 API，修改 `index.html` 顶部 `<script>` 标签中的这两个常量即可。

### 支持任意 OpenAI 兼容端点

```javascript
// 替换为 OpenAI 官方
const API_BASE = 'https://api.openai.com';
const API_KEY  = 'sk-xxxxxxxxxxxxxxxx';

// 替换为 Azure OpenAI
const API_BASE = 'https://your-resource.openai.azure.com';
const API_KEY  = 'your-azure-key';

// 替换为本地 Ollama
const API_BASE = 'http://localhost:11434';
const API_KEY  = 'ollama';
```

### 模型动态加载

启动时自动调用 `/v1/models` 接口获取可用模型列表，右上角紫色徽章可实时切换。

---

## 🧠 AI 提示词工程

系统内置的 **System Prompt** 要求 AI 以严格 JSON 格式输出，确保数据可结构化渲染：

```
你是一个世界模拟引擎，根据用户给出的文明初始条件，
严密、逻辑清晰且充满史诗感地推演该世界接下来的发展历程。
```

**输出数据结构：**

```json
{
  "era": "纪元X · 时代名称",
  "year_range": "公元前3000年 - 公元前2500年",
  "core_event": "核心事件详细描述（200字以上，史诗感）",
  "dev_progress": 42,
  "crisis": "当前潜在危机描述",
  "crisis_level": "LOW | MEDIUM | HIGH | CRITICAL",
  "achievement": "本纪元最重要的文明成就",
  "population": "约200万"
}
```

**多轮上下文**：保留最近 10 轮对话（20 条消息），确保历史连贯性，防止 context 过长。

---

## 🖥️ 界面预览

```
╔══════════════════════════════════════════════════════════════╗
║  WSE-v4.2.1 NEURAL CORE ONLINE                   [AI CORE ▼]║
║                                                              ║
║  世界模拟引擎  WORLD SIMULATION ENGINE                       ║
║  // CAUSALITY MATRIX · CIVILIZATION EVOLUTION PROTOCOL //    ║
╠══════════════════════╦═══════════════════════════════════════╣
║  文明初始参数         ║  文明状态矩阵                         ║
║  ─────────────────── ║  纪元一 | 42% | HIGH | Round 3       ║
║  文明名称: 亚特兰提斯 ║  ████████████░░░░░ 42%               ║
║  类型: 魔法文明       ╠═══════════════════════════════════════╣
║  资源富饶度: ████ 65% ║  WSE://CAUSALITY-LOG · EPOCH-STREAM  ║
║  初始人口:   ███  50% ║  ┌─────────────────────────────────┐ ║
║  军事潜力:   ██   40% ║  │ ╔═ 纪元一 · 魔法启蒙时代 ══════ │ ║
║  科研指数:   ████ 55% ║  │ ║ 公元前5000年 - 公元前3000年   │ ║
║  ─────────────────── ║  │ ║                               │ ║
║  神迹 / 灾难干预      ║  │ ║ 【核心事件】                   │ ║
║  [神圣启示][意识觉醒] ║  │ ║ 在亚特兰提斯大陆的深处，      │ ║
║  [陨石撞击][黑死瘟疫] ║  │ ║ 一棵名为「源树」的古木...     │ ║
║  [外星入侵][社会革命] ║  │ ╚══════════════════════════════ │ ║
║                      ║  └─────────────────────────────────┘ ║
║  ┌──────────────────┐ ║  [ 启动演化 ][ 推演下一纪元 ][ 注入 ]║
║  │ 自定义干预事件...│ ║                                      ║
║  └──────────────────┘ ║  STREAM MODE ACTIVE | gpt-4o | EP:3 ║
╚══════════════════════╩═══════════════════════════════════════╝
```

---

## 📐 技术架构

```
index.html
├── <style>                    CSS 样式
│   ├── CSS 变量系统           颜色/阴影/动画统一管理
│   ├── 赛博朋克视觉层
│   │   ├── 扫描线网格          body::before 伪元素
│   │   ├── 霓虹呼吸灯          @keyframes breathe-cyan/green
│   │   ├── 文字发光动画         @keyframes neon-cyan/green
│   │   └── 闪烁/滚动/淡入      多组 @keyframes
│   └── 流式预览层             #streamPreview
│       ├── backdrop-filter    毛玻璃效果
│       ├── filter:blur        文字模糊
│       └── 渐变遮罩           ::before / ::after
│
├── <body>                     HTML 结构
│   ├── #particle-canvas       粒子系统画布
│   ├── header                 标题 + 扫描线
│   ├── #modelSelectorWrap     模型选择下拉
│   ├── .grid-main             主布局（左右分栏）
│   │   ├── 左侧：文明参数面板
│   │   └── 右侧：状态矩阵 + 终端 + 控制区
│   └── #toast                 Toast 通知层
│
└── <script>                   JavaScript 逻辑
    ├── 粒子系统                Canvas 2D API
    ├── loadModels()            /v1/models 动态加载
    ├── callAIStream()          SSE 流式读取
    │   └── ReadableStream      逐 chunk 解析
    ├── appendStreamChunk()     实时渲染预览层
    │   └── 语法着色            JSON key/value/number
    ├── showStreamPreview()     显示毛玻璃预览
    ├── hideStreamPreview()     淡出动画 (0.5s)
    ├── runEpoch()              单纪元推演核心
    ├── parseAIResponse()       容错 JSON 解析
    └── 多轮上下文管理           保留最近 10 轮
```

---

## 🛡️ 错误处理

| 错误类型 | 处理方式 |
|---------|---------|
| 网络超时 | 90 秒 `AbortController` 自动中断 |
| API 报错 | 红色字体显示「因果律武器过载（请求失败）」 |
| JSON 解析失败 | 容错提取 `{...}` 块，忽略 markdown 代码块标记 |
| 模型加载失败 | Toast 提示 + 终端日志标红 |
| SSE chunk 解析 | try/catch 逐行容错，跳过异常帧 |

---

## 🎮 使用流程

```
1. 打开 index.html
        │
        ▼
2. 等待 AI 模型列表同步（右上角紫色徽章）
        │
        ▼
3. 填写文明名称，选择类型，调整四个参数滑块
   可选：填写世界背景设定
        │
        ▼
4. 点击「启动演化」
        │
        ▼
5. 终端内出现流式预览层（毛玻璃 + 实时 JSON 流）
        │
        ▼
6. 流式结束，预览层淡出，结构化纪元卡片渐入
   状态矩阵同步更新（纪元 / 发展度 / 危机等级）
        │
        ▼
7. 点击「推演下一纪元」继续演化
   或先填写干预事件，注入后再推演
        │
        ▼
8. 重复 5-7，观察文明如何在命运的洪流中沉浮
```

---

## 🔧 自定义指南

### 修改文明类型

在 `index.html` 中找到 `<select id="civType">` 标签，添加或修改 `<option>` 即可：

```html
<option value="你的文明类型">图标 类型名称 — 描述</option>
```

### 修改预设干预事件

找到 `.chip-miracle` / `.chip-disaster` / `.chip-event` 区域，修改 `onclick` 中的文本内容。

### 调整 AI 推演风格

修改 `SYSTEM_PROMPT` 常量，可改变推演的叙事风格、详细程度、专注领域等。

### 修改颜色主题

修改 CSS `:root` 中的变量：

```css
:root {
  --cyan:   #00f0ff;   /* 主点缀色 */
  --green:  #00ff88;   /* 副点缀色 */
  --purple: #b04aff;   /* 模型/神迹色 */
  --red:    #ff3e5e;   /* 危机/错误色 */
  --yellow: #ffd700;   /* 事件/警告色 */
}
```

---

## 📦 依赖说明

| 依赖 | 用途 | 加载方式 |
|------|------|---------|
| [Tailwind CSS](https://tailwindcss.com) | 辅助工具类（少量使用） | CDN |
| [Font Awesome 6.5.1](https://fontawesome.com) | 图标系统 | CDN |

核心视觉与交互逻辑**不依赖任何框架**，纯原生 HTML5 / CSS3 / ES2022+ 实现。

---

## 🌌 文明类型参考

| 类型 | 能源核心 | 推演特点 |
|------|---------|---------|
| ✦ 魔法文明 | 魔力元素 | 神秘学体系、魔法战争、元素灾变 |
| ⚙ 纯科技文明 | 机械/信息 | 工业革命、AI 觉醒、星际探索 |
| ⬡ 生物进化文明 | 基因工程 | 物种改造、基因战争、生态崩溃 |
| ◈ 星际殖民文明 | 太空扩张 | 星球移民、外星接触、宇宙战争 |
| ⬗ 意识上传文明 | 数字存在 | 肉体消亡、数字永生、服务器战争 |
| ☽ 虚空召唤文明 | 维度力量 | 召唤秩序、维度裂缝、虚空入侵 |
| ❋ 混沌自然文明 | 自然融合 | 生态和谐、自然灾害、物种共生 |
| ⧗ 时间操控文明 | 时间流速 | 历史修改、悖论危机、时间战争 |

---

## 📄 License

```
MIT License

Copyright (c) 2026 World Simulation Engine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

完整授权协议见 [LICENSE](LICENSE) 文件。

---

<div align="center">

```
╔════════════════════════════════════════╗
║   root@WSE:~$ ./run_civilization.sh   ║
║   > 文明已创建，因果律引擎启动中...    ║
║   > 时间线构筑完成 [ OK ]             ║
║   > 你的文明命运，由你执笔。█          ║
╚════════════════════════════════════════╝
```

**如果这个项目对你有帮助，欢迎点一个 ⭐ Star**

*让更多人见证文明的诞生与消亡*

</div>
