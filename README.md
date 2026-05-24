<div align="center">

```
══════════════════════════════════════════════════════════════════════
 ║   ██╗  ██╗  ███████╗  ███████╗        WORLD SIMULATION ENGINE     ║
 ║   ██║  ██║  ██╔════╝  ██╔════╝        界  模  引  擎  v4.2.2      ║
 ║   ██║  ██║  ███████╗  █████╗          AI文明史诗推演控制台        ║
 ║   ╚█████╔╝  ╚════██║  ██╔══╝          从创世，到群星，到终焉      ║
 ║    ╚════╝   ███████║  ███████╗                                    ║
 ║             ╚══════╝  ╚══════╝        Time is a flowing river...  ║
 ══════════════════════════════════════════════════════════════════════
```

[![HTML](https://img.shields.io/badge/HTML5-Frontend-00e5ff?style=flat-square&logo=html5&logoColor=0d1117&labelColor=0d1117)](index.html)
[![CSS](https://img.shields.io/badge/CSS3-Cyberpunk_UI-b04aff?style=flat-square&logo=css3&logoColor=b04aff&labelColor=0d1117)](style.css)
[![JavaScript](https://img.shields.io/badge/JavaScript-SSE_Stream-00e676?style=flat-square&logo=javascript&logoColor=00e676&labelColor=0d1117)](app.js)
[![AI](https://img.shields.io/badge/AI-OpenAI_Compatible-ffd740?style=flat-square&logo=openai&logoColor=ffd740&labelColor=0d1117)](#api-配置)
[![Performance](https://img.shields.io/badge/Performance-60fps_Hardware_Accelerated-ff3d71?style=flat-square&logo=fastapi&logoColor=ff3d71&labelColor=0d1117)](#-性能优化)

</div>

---

## ◈ 项目简介

**世界模拟引擎（World Simulation Engine，简称 WSE v4.2.2）** 是一个三文件分离的纯前端 AI 世界线推演工具。

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

> 注意：如果 API 不返回 `usage` 字段，WSE 会使用字符数粗略估算 Token数。

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

### 🎨 赛博朋克 UI 2.0 (重构版)

项目最新重构了暗黑终端 + 霓虹视觉风格系统：

- **GPU 硬件加速**：所有大位移和核心动效（如 `scanln` 扫描线、页面入场等）全部迁移至 3D 硬件加速通道（如 `transform: translateY()`），消除页面重绘重排（Reflow / Repaint），移动端运行无比顺滑；
- **智能双端适配**：通过高精度的 `css 媒体查询` 重组布局：
  - **PC 端**：经典的三栏分布式全功能控制台，视野开阔，极客质感。
  - **移动端**：自动将左侧导航、侧边栏折叠合并，主界面采用单列紧凑面板，底部呼出原生浮动操作抽屉（`#action-bar-mobile`），提供极其出色的单手手势操作体验。
- **粒子物理背景**：高性能的 Canvas 粒子画布，在空闲时智能漂移，自动在邻近节点间拉起星轨连线。
- **减少动画模式**：支持系统级 `prefers-reduced-motion` 规范，开启后自动销毁高负载 Canvas 物理粒子，降低移动端和低端设备的能耗与闪烁。

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

### 📁 项目结构

```txt
world-simulation-engine/
├── index.html      # 页面结构
├── style.css       # 高性能赛博朋克 UI 样式 (Refactored)
├── app.js          # SSE 流式推演逻辑、Token 统计、安全过滤、生命周期状态管理 (Bug Fixed)
├── README.md       # 项目说明 (Updated)
└── LICENSE         # 开源协议
```

项目无构建步骤，无 `node_modules`，无后端依赖。

---

## 🛡️ 安全与漏洞保护

在本次 v4.2.2 维护重构中，我们特别针对纯前端环境进行了全方位的安全防护和语法加固：

1. **XSS 漏洞防护**：
   * 所有来自大模型（AI Output）以及用户自定义干预输入的内容，在渲染到 HTML 之前均必须通过 `escapeHTML` 方法进行转义，彻底消除了通过 Markdown、JSON 键值对恶意注入 JavaScript 脚本的 XSS 攻击通道。
2. **SSE 语法碎裂与解析容错**：
   * 修复了由于 SSE 流切包导致的单帧 JSON 片段破坏、未捕获的句法异常缺陷（**Bug Fixed**）。
   * 增强了 `parseAIResponse` 提取算法。即便 AI 违背指令附带了冗余解释、多重 Markdown 标记，系统依然能精准剥离出最外层 JSON 主体。
3. **安全配置存储**：
   * 密钥本地 `localStorage` 安全沙箱隔离，并对接口做了严格的跨域握手（CORS）容错处理。

---

## ⚙️ API 配置

WSE 使用标准 OpenAI 兼容接口。

默认配置：
```txt
Base URL: https://ai.hhhl.cc
API Key:  sk-free
Model:    gpt-5.5
```

你可以点击右上角小齿轮，在快速设置中修改对应的 API 端点和密钥。

---

## 🧭 使用流程

```txt
1. 打开项目页面
        │
        ▼
2. 点击右上角小齿轮，检查 API 配置与鉴权
        │
        ▼
3. 同步模型列表，自由选择推演 AI 核心
        │
        ▼
4. 填写文明名称、文明类型和初始因果律参数
        │
        ▼
5. 点击「启动演化」
        │
        ▼
6. 终端显示流式数据，并在结束后渲染结构化纪元卡片
        │
        ▼
7. 随时向当前时间线「注入神迹/灾难干预」
        │
        ▼
8. 推演下一纪元 / 导出 Markdown 推演史诗日志
```

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

**让更多人见证文明的诞生、繁荣、崩塌与重生。**

*时间是一条河流，但手握因果律的人，可以决定它流向何方。*
