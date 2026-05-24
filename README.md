<div align="center">

```════════════════                                                          ║
   ██╗ ██╗█████████ ██   ╔╗██
║   ╚███╔███╔╝███████║███████╗                            ║
║    ╚══╝╚══╝ ╚══════╝╚                                                         ULATION. 界 模 引 NE         ║════════════════`

 AI文明史诗运 从创世到终焉[](img.shields.io/badge-M00e5ff?-square&=1117)](LICENSE![HTML](https://img.shields.io/badge/HTML5-Frontend-00e5ff?style=flat-square&logo=html5&logoColor=005d(https://img.shields.io/badge/CSS3-Cyberpunk_UI-b04aff?style=flat-square&logo=css3&logoColor=b04aff&labelColor=0d1117)](style.css)
[![JavaScript](https://img.shields.io/badge/JavaScript-SSE_Stream-00e676?style=flat-square&logo=javascript&logoColor=00e676&labelColor=0d1117)](app.js)
[![AI](https://img.shields.io/badge/AI-OpenAI_Compatible-ffd740?style=flat-square&logo=openai&logoColor=ffd740&labelColor=0d1117)](#api-配置)

</div>

---

## ◈ 项目简介

**世界模拟引擎（World Simulation Engine，简称 WSE）** 是一个三文件分离的纯前端 AI 世界线推演工具。

你可以像神明一样创建一个文明，设定它的文明类型、资源条件、人口规模、军事潜力、科技或魔法指数，然后调用 OpenAI 兼容 API，让 AI 按纪元推演这个文明的兴衰、战争、灾难、突破、危机与终局。

你还可以随时向世界线注入**神迹、灾难或突发事件**，改变文明的命运走向。

> *“时间是一条河流，但手握因果律的人，可以决定它流向何方。”*

---

## ✦ 核心特性

### 🌐 文明创造系统

| 参数 | 说明 |
|---|---|
| 文明名称 | 自由命名你的文明 |
| 文明类型 | 支持魔法、科技、生物进化、星际殖民、意识上传等多种文明方向 |
| 资源富饶度 | 影响文明扩张、战争资源与灾难承受能力 |
| 初始人口规模 | 决定文明初期社会复杂度和发展基础 |
| 军事潜力 | 影响战争、防御、征服与内部暴力风险 |
| 科研 / 魔法指数 | 推动技术、魔法、理论体系或超自然力量发展 |
| 世界背景设定 | 可自定义地理环境、神话体系、星球生态、宇宙规则等 |

---

### ⚡ 世界线推演控制台

- **启动演化**：初始化文明并生成纪元一。
- **推演下一纪元**：基于历史上下文继续推进文明发展。
- **注入干预事件**：将神迹、灾难、革命、外星接触等事件写入世界线。
- **停止生成**：中断当前 AI 流式响应。
- **重置世界线**：清除当前推演状态和 Token 统计。
- **导出日志**：将推演记录导出为 Markdown 文件。

---

### 🌩️ 干预事件系统

内置多种预设干预事件：

| 类型 | 事件 |
|---|---|
| 神迹 | 神圣启示、意识觉醒 |
| 灾难 | 陨石撞击、黑死瘟疫、外星入侵 |
| 突发事件 | 社会革命、时空门开启、星际接触 |

同时支持完全自定义干预事件，例如：

```txt
一位拥有预见能力的先知出现，公开了未来三百年的灾难预言，
导致文明内部爆发信仰分裂与技术跃迁。
```

---

### 📡 实时流式输出

WSE 使用 OpenAI 兼容的 Chat Completions SSE 流式接口：

```json
{
  "stream": true
}
```

特性包括：

- 实时读取 AI 输出；
- 支持 SSE chunk 分包缓冲解析；
- 终端内显示半透明数据流预览；
- JSON key / value / number 语法着色；
- 流式结束后自动渲染为结构化纪元日志；
- 支持请求超时与手动中断。

---

### 🧮 Token 统计系统

内置 Token 统计仪表盘：

| 指标 | 说明 |
|---|---|
| 输入 Tokens | Prompt 与历史上下文估算值 |
| 输出 Tokens | AI 流式响应估算值或 API usage 值 |
| 合计 Tokens | 输入 + 输出 |
| 平均 / 纪元 | 每轮推演平均消耗 |
| 推演轮次 | 当前文明演化纪元数 |
| 会话时长 | 当前页面会话持续时间 |

> 注意：如果 API 不返回 `usage` 字段，WSE 会使用字符数粗略估算 Token 数。

---

### ⚙️ 快速设置菜单

右上角小齿轮按钮可打开快速设置抽屉，支持配置：

| 配置项 | 说明 |
|---|---|
| Base URL | OpenAI 兼容 API 基础地址 |
| API Key | API 鉴权密钥 |
| 默认模型 | 默认使用的模型 ID |
| Temperature | 创造性参数 |
| Max Tokens | 单次最大输出 Token 数 |
| 重新同步模型 | 调用 `/v1/models` 获取模型列表 |
| 导出日志 | 将当前世界线导出为 Markdown |
| 停止生成 | 中断当前流式请求 |
| 清空日志 | 清空终端日志 |
| 重置世界线 | 重置文明推演状态 |

配置会保存到浏览器 `localStorage`。

---

### 🎨 赛博朋克 UI

项目使用暗黑终端 + 霓虹视觉风格：

- 暗黑背景；
- 蓝绿霓虹发光；
- 粒子画布背景；
- CSS 网格扫描线；
- 终端式日志窗口；
- 玻璃拟态流式预览；
- 移动端底部操作栏；
- 响应式布局；
- 支持 `prefers-reduced-motion` 减少动画模式。

---

## 🚀 快速开始

### 方式一：直接启动本地服务器

```bash
git clone https://github.com/your-username/world-simulation-engine.git
cd world-simulation-engine
python3 -m http.server 8080
```

然后访问：

```txt
http://localhost:8080
```

---

### 方式二：使用 Node.js 静态服务

```bash
npx serve .
```

---

### 方式三：使用 VS Code Live Server

1. 使用 VS Code 打开项目目录；
2. 安装 Live Server 插件；
3. 右键 `index.html`；
4. 选择 `Open with Live Server`。

---

## 📁 项目结构

```txt
world-simulation-engine/
├── index.html      # 页面结构
├── style.css       # 赛博朋克 UI 样式
├── app.js          # 交互逻辑、SSE 调用、Token 统计、状态管理
├── README.md       # 项目说明
└── LICENSE         # 开源协议，可选
```

项目无构建步骤，无 `node_modules`，无后端依赖。

---

## ⚙️ API 配置

WSE 使用标准 OpenAI 兼容接口。

默认配置：

```txt
Base URL: https://ai.hhhl.cc
API Key:  sk-free
Model:    gpt-5.5
```

你可以点击右上角小齿轮，在快速设置中修改：

- `Base URL`
- `API Key`
- `默认模型`
- `Temperature`
- `Max Tokens`

---

### OpenAI 官方示例

```txt
Base URL: https://api.openai.com
API Key:  sk-xxxxxxxxxxxxxxxx
Model:    gpt-4o
```

---

### Azure OpenAI 示例

```txt
Base URL: https://your-resource.openai.azure.com
API Key:  your-azure-key
Model:    your-deployment-name
```

> Azure OpenAI 的接口路径可能与标准 OpenAI 格式不同，如果你的网关未做兼容处理，需要自行调整 `app.js` 中的请求地址。

---

### 本地模型 / 网关示例

```txt
Base URL: http://localhost:11434
API Key:  ollama
Model:    llama3
```

> 需要你的本地服务提供 OpenAI 兼容的 `/v1/chat/completions` 和 `/v1/models` 接口。

---

## 🔐 安全说明

本项目是纯前端应用，因此：

```js
API Key 会保存在浏览器 localStorage 中。
```

这意味着：

- 适合本地使用；
- 适合个人演示；
- 适合公开免费 Key；
- 不适合直接暴露真实生产密钥。

如果你要公开部署，建议使用后端代理：

```txt
浏览器前端 → 你的后端代理 → AI API 服务
```

后端代理负责：

- 保存真实 API Key；
- 转发请求；
- 做限流；
- 做用户鉴权；
- 防止 Key 被盗用。

---

## 🧠 AI 输出格式

系统 Prompt 要求 AI 严格输出纯 JSON：

```json
{
  "era": "纪元X · 时代名称",
  "year_range": "公元前3000年 - 公元前2500年",
  "core_event": "核心事件的详细描述，充满史诗感",
  "dev_progress": 42,
  "crisis": "当前潜在危机描述",
  "crisis_level": "LOW / MEDIUM / HIGH / CRITICAL",
  "achievement": "本纪元最重要的文明成就",
  "population": "约200万"
}
```

WSE 会解析该 JSON 并渲染为结构化纪元卡片。

如果 AI 输出不规范，系统会：

1. 尝试提取 `{ ... }` JSON 块；
2. 移除 markdown 代码块标记；
3. 解析失败时降级为“未解析时代”日志；
4. 避免页面崩溃。

---

## 🧭 使用流程

```txt
1. 打开项目页面
        │
        ▼
2. 点击右上角小齿轮，检查 API 配置
        │
        ▼
3. 同步模型列表，选择模型
        │
        ▼
4. 填写文明名称、文明类型和初始参数
        │
        ▼
5. 可选：填写世界背景
        │
        ▼
6. 点击「启动演化」
        │
        ▼
7. 终端显示流式数据预览
        │
        ▼
8. AI 返回后渲染纪元日志
        │
        ▼
9. 可继续推演下一纪元
        │
        ▼
10. 可注入神迹、灾难、革命或自定义事件
        │
        ▼
11. 导出世界线日志或重置文明
```

---

## 🧩 技术架构

```txt
index.html
├── 页面结构
├── 导航栏
├── 主演化控制台
├── Token 统计页
├── 系统说明页
├── 快速设置抽屉
└── 移动端操作栏

style.css
├── CSS 变量系统
├── 赛博朋克主题
├── 响应式布局
├── 终端日志样式
├── 流式预览层
├── 快速设置抽屉
├── 移动端适配
└── reduced-motion 无障碍适配

app.js
├── 配置管理
├── 状态管理
├── localStorage 持久化
├── 模型列表同步
├── OpenAI SSE 流式请求
├── JSON 容错解析
├── 世界线推演逻辑
├── 干预事件注入
├── Token 统计
├── 日志导出
├── 停止生成
└── UI 事件绑定
```

---

## 🧪 错误处理

| 错误类型 | 处理方式 |
|---|---|
| API 请求失败 | 终端显示错误日志，Toast 提示 |
| 请求超时 | 90 秒自动中断 |
| 手动停止 | 使用 AbortController 中断请求 |
| SSE 分包 | 使用 buffer 拼接未完整行 |
| JSON 解析失败 | 降级为未解析纪元 |
| 模型加载失败 | 使用默认模型 |
| XSS 风险 | 对用户输入和 AI 输出进行 HTML 转义 |
| 按钮状态错乱 | 统一由状态机刷新按钮可用性 |

---

## 🧬 支持的文明类型

| 类型 | 核心方向 | 推演特点 |
|---|---|---|
| 魔法文明 | 魔力元素 | 魔法体系、神秘学、元素灾变 |
| 纯科技文明 | 机械与信息 | 工业革命、AI 觉醒、星际探索 |
| 生物进化文明 | 基因工程 | 物种改造、生态危机、基因战争 |
| 星际殖民文明 | 太空扩张 | 星球移民、宇宙外交、星际战争 |
| 意识上传文明 | 数字存在 | 肉体消亡、数字永生、服务器战争 |
| 虚空召唤文明 | 维度力量 | 召唤秩序、维度裂缝、虚空入侵 |
| 混沌自然文明 | 自然共生 | 生态平衡、自然灾害、物种融合 |
| 时间操控文明 | 时间流速 | 时间悖论、历史改写、时间战争 |

---

## 📦 依赖说明

| 依赖 | 用途 | 加载方式 |
|---|---|---|
| Font Awesome 6.5.1 | 图标系统 | CDN |
| Google Fonts | Rajdhani / Noto Sans SC / JetBrains Mono 字体 | CSS `@import` |

核心逻辑不依赖任何前端框架。

项目不依赖：

- React
- Vue
- Tailwind CSS
- Webpack
- Vite
- Node.js 构建流程

---

## 🛠️ 自定义指南

### 修改默认 API 配置

在 `app.js` 中找到：

```js
const DEFAULT_CONFIG = {
  apiBase: 'https://ai.hhhl.cc',
  apiKey: 'sk-free',
  defaultModel: 'gpt-5.5',
  temperature: 0.88,
  maxTokens: 1400,
};
```

按需修改即可。

---

### 修改文明类型

在 `index.html` 中找到：

```html
<select id="civType">
```

添加新的：

```html
<option value="机械神权文明">☼ 机械神权文明 — 由神谕 AI 管理的机械帝国</option>
```

---

### 修改预设干预事件

在 `index.html` 中查找：

```html
data-intervention=""
```

修改对应文本即可。

---

### 修改 AI 叙事风格

在 `app.js` 中修改：

```js
const SYSTEM_PROMPT = `...`;
```

例如你可以让 AI 更偏向：

- 硬科幻；
- 黑暗奇幻；
- 历史编年体；
- 克苏鲁风格；
- 学术报告风；
- 史诗神话风。

---

### 修改颜色主题

在 `style.css` 的 `:root` 中修改：

```css
:root {
  --bg: #0d1117;
  --cyan: #00e5ff;
  --green: #00e676;
  --purple: #b04aff;
  --red: #ff3d71;
  --yellow: #ffd740;
}
```

---

## 📤 日志导出

点击右上角小齿轮，选择：

```txt
导出日志
```

系统会导出：

```txt
WSE-worldline-{timestamp}.md
```

导出内容包括：

- 导出时间；
- 当前模型；
- 推演轮次；
- 所有终端纪元日志；
- 干预事件记录。

---

## 📱 移动端支持

WSE 支持移动端布局：

- 隐藏左侧导航；
- 主页面单列显示；
- 底部固定操作栏；
- 支持启动、下一纪元、注入、停止、打开设置；
- 面板可折叠；
- topbar 自动压缩。

---

## ♿ 无障碍与性能

项目支持系统级减少动画设置：

```css
@media (prefers-reduced-motion: reduce)
```

当用户系统启用减少动画时：

- 关闭大部分动画；
- 关闭粒子画布；
- 减少视觉闪烁；
- 降低移动端性能消耗。

---

## 🧯 常见问题

### 1. 为什么模型列表加载失败？

可能原因：

- Base URL 不正确；
- API Key 无效；
- 服务端不支持 `/v1/models`；
- 浏览器跨域限制；
- 网络不可达。

可以尝试：

1. 点击右上角小齿轮；
2. 检查 Base URL；
3. 检查 API Key；
4. 点击“重新同步模型列表”。

---

### 2. 为什么启动演化失败？

可能原因：

- `/v1/chat/completions` 不兼容；
- 模型名不存在；
- API Key 无权限；
- 响应超时；
- 服务端不支持流式输出。

---

### 3. 为什么 AI 没有输出标准 JSON？

模型可能没有严格遵守 Prompt。WSE 已内置容错解析，但如果经常失败，可以强化 `SYSTEM_PROMPT`，例如加入：

```txt
只允许输出 JSON，不允许输出自然语言解释。
```

---

### 4. Token 数准确吗？

不一定完全准确。

如果 API 返回 `usage` 字段，优先使用真实 usage。

如果 API 不返回 usage，WSE 使用：

```txt
字符数 / 4
```

进行粗略估算。

---

### 5. 可以直接部署到 GitHub Pages 吗？

可以，但请注意：

如果你在 GitHub Pages 中配置真实 API Key，会被任何访问者看到。

公开部署建议：

```txt
GitHub Pages 前端 → 自己的后端代理 → AI API
```

---

## 🗺️ 后续计划

可能的增强方向：

- [ ] 世界线存档 / 读档；
- [ ] 多文明并行模拟；
- [ ] 文明关系网络图；
- [ ] 时间轴可视化；
- [ ] 地图生成；
- [ ] 多模型对比推演；
- [ ] Prompt 模板编辑器；
- [ ] 后端代理模板；
- [ ] PWA 离线壳；
- [ ] 导出完整 HTML 报告。

---

## 📄 License

```txt
MIT License

Copyright (c) 2026 World Simulation Engine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files to deal in the Software
without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software.
```

完整协议请查看 `LICENSE` 文件。

---

<div align="center">

```txt
╔════════════════════════════════════════╗
║   root@WSE:~$ ./run_civilization.sh   ║
║   > 文明已创建，因果律引擎启动中...   ║
║   > 时间线构筑完成 [ OK ]             ║
║   > 你的文明命运，由你执笔。█         ║
╚════════════════════════════════════════╝
```

**如果这个项目对你有帮助，欢迎 Star。**

*让更多人见证文明的诞生、繁荣、崩塌与重生。*

</div>