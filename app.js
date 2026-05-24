/* ══════════════════════════════════════════════════════
   WORLD SIMULATION ENGINE v4.2.2
   app.js
══════════════════════════════════════════════════════ */

/* ==========================================================================
   1. 常量与配置
========================================================================== */

const DEFAULT_CONFIG = {
  apiBase: 'https://ai.hhhl.cc',
  apiKey: 'sk-free',
  defaultModel: 'gpt-5.5',
  temperature: 0.88,
  maxTokens: 1400,
};

const STORAGE_KEYS = {
  config: 'wse-config-v422',
  state: 'wse-state-lite-v422',
};

const SYSTEM_PROMPT = `你是一个世界模拟引擎（World Simulation Engine），根据用户给出的文明初始条件，严密、逻辑清晰且充满史诗感地推演该世界接下来的发展历程。

每次推演请严格按照以下 JSON 格式输出（不要包含任何额外说明或 markdown 代码块标记，直接输出纯 JSON）：
{
  "era": "纪元X · 时代名称",
  "year_range": "推算的年代范围，如：公元前3000年 - 公元前2500年",
  "core_event": "核心事件的详细描述（200字以上，充满史诗感）",
  "dev_progress": 数字（0-100，代表文明发展百分比）,
  "crisis": "当前潜在危机描述（100字左右）",
  "crisis_level": "LOW / MEDIUM / HIGH / CRITICAL",
  "achievement": "本纪元最重要的文明成就",
  "population": "估算人口（如：约200万）"
}`;

const STREAM_TEXTS = [
  '正在构筑时间线...',
  '正在计算因果律...',
  '推演历史节点...',
  '同步量子随机性...',
  '编织文明命运...',
  '折叠时空维度...',
  '激活史诗引擎...',
  '注入世界线参数...',
];

const SIDEBAR_MENUS = {
  evo: [
    {
      label: '演化控制台',
      items: [
        { key: 'evo-main', icon: 'fa-globe-asia', text: '世界演化主页', badge: 'MAIN', target: 'top' },
        { key: 'evo-civ', icon: 'fa-dna', text: '文明初始参数', target: 'panelCivilization' },
        { key: 'evo-event', icon: 'fa-bolt', text: '神迹 / 灾难干预', target: 'panelIntervention' },
      ],
    },
    {
      label: '演化日志',
      items: [
        { key: 'evo-status', icon: 'fa-chart-line', text: '文明状态矩阵', target: 'civStatusPanel' },
        { key: 'evo-log', icon: 'fa-terminal', text: '推演日志终端', target: 'terminalPanel' },
        { key: 'evo-control', icon: 'fa-gamepad', text: '演化控制区', target: 'actionPanel' },
      ],
    },
  ],

  token: [
    {
      label: 'Token 统计',
      items: [
        { key: 'token-overview', icon: 'fa-coins', text: '总览仪表盘', badge: 'LIVE', target: 'top' },
        { key: 'token-history', icon: 'fa-history', text: '调用历史', target: 'tokenHistoryBody' },
      ],
    },
  ],

  settings: [
    {
      label: '系统说明',
      items: [
        { key: 'settings-info', icon: 'fa-info-circle', text: '系统说明', badge: 'INFO', target: 'top' },
        { key: 'settings-prompt', icon: 'fa-code', text: 'Prompt 预览', target: 'settingsPromptPreview' },
      ],
    },
    {
      label: '快捷入口',
      items: [
        { key: 'settings-drawer', icon: 'fa-cog', text: '打开快速设置', action: 'openSettings' },
      ],
    },
  ],
};

/* ==========================================================================
   2. 全局状态
========================================================================== */

const config = loadConfig();

const state = {
  models: [],
  selectedModel: config.defaultModel,
  isRunning: false,
  epoch: 0,
  history: [],
  civStarted: false,
  pendingIntervention: '',
  activeView: 'evo',

  tokens: {
    totalIn: 0,
    totalOut: 0,
    totalAll: 0,
    records: [],
    sessionStart: Date.now(),
  },
};

let currentAbortController = null;
let streamLabelTimer = null;
let streamBuffer = '';
let streamCharCount = 0;

/* ==========================================================================
   3. DOM 快捷引用
========================================================================== */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const dom = {
  navItems: () => $$('.nav-item[data-view]'),

  sidebarTitle: () => $('#sidebarTitle'),
  sidebarBody: () => $('#sidebarBody'),

  breadcrumbPage: () => $('#breadcrumbPage'),
  breadcrumbSub: () => $('#breadcrumbSub'),

  modelLabel: () => $('#modelLabel'),
  modelDropdown: () => $('#modelDropdown'),
  modelList: () => $('#modelList'),

  terminalBody: () => $('#terminalBody'),
  streamPreview: () => $('#streamPreview'),
  streamLabel: () => $('#streamLabel'),
  streamRawText: () => $('#streamRawText'),
  streamPreviewLabel: () => $('#streamPreviewLabel'),
  streamPreviewCount: () => $('#streamPreviewCount'),

  tokenBadgeValue: () => $('#tokenBadgeValue'),

  quickSettingsMask: () => $('#quickSettingsMask'),
  quickSettingsPanel: () => $('#quickSettingsPanel'),
};

/* ==========================================================================
   4. 安全与工具函数
========================================================================== */

function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clampNumber(value, min, max, fallback = min) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function formatCompactNumber(n) {
  const num = Number(n) || 0;
  return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : String(num);
}

function formatFullNumber(n) {
  return (Number(n) || 0).toLocaleString();
}

function scrollToElement(id) {
  if (id === 'top') {
    $('#page-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ==========================================================================
   5. 配置与状态持久化
========================================================================== */

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.config);
    if (!raw) return { ...DEFAULT_CONFIG };

    return {
      ...DEFAULT_CONFIG,
      ...JSON.parse(raw),
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig() {
  localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
}

function loadStateLite() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.state);
    if (!raw) return;

    const data = JSON.parse(raw);

    if (data.selectedModel) state.selectedModel = data.selectedModel;
    if (data.tokens) state.tokens = data.tokens;
    if (typeof data.epoch === 'number') state.epoch = data.epoch;
    if (typeof data.civStarted === 'boolean') state.civStarted = data.civStarted;
    if (typeof data.pendingIntervention === 'string') {
      state.pendingIntervention = data.pendingIntervention;
    }
  } catch {
    // ignore corrupted state
  }
}

function saveStateLite() {
  try {
    const data = {
      selectedModel: state.selectedModel,
      tokens: state.tokens,
      epoch: state.epoch,
      civStarted: state.civStarted,
      pendingIntervention: state.pendingIntervention,
    };

    localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

/* ==========================================================================
   6. 初始化粒子背景
========================================================================== */

function initParticles() {
  const canvas = $('#particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const colors = ['#00e5ff', '#00e676', '#b04aff', '#ffd740'];
  const particles = [];
  const count = window.innerWidth < 600 ? 35 : 65;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.3 + 0.3,
      dx: (Math.random() - 0.5) * 0.28,
      dy: (Math.random() - 0.5) * 0.28,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.4 + 0.08,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    const limit = window.innerWidth < 600 ? 65 : 95;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < limit) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].color;
          ctx.globalAlpha = (1 - distance / limit) * 0.09;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   7. 导航与侧边栏
========================================================================== */

function switchView(viewKey) {
  state.activeView = viewKey;

  $$('.view').forEach((view) => view.classList.remove('active'));
  $(`#view-${viewKey}`)?.classList.add('active');

  dom.navItems().forEach((item) => {
    item.classList.toggle('active', item.dataset.view === viewKey);
  });

  const titleMap = {
    evo: '演化控制台',
    token: 'Token 统计',
    settings: '系统说明',
  };

  dom.sidebarTitle().textContent = titleMap[viewKey] || viewKey;
  dom.breadcrumbPage().textContent = titleMap[viewKey] || viewKey;
  dom.breadcrumbSub().textContent = '';

  renderSidebar(viewKey);

  if (viewKey === 'token') renderTokenPage();
  if (viewKey === 'settings') renderSettingsPage();
}

function renderSidebar(viewKey) {
  const groups = SIDEBAR_MENUS[viewKey] || [];

  dom.sidebarBody().innerHTML = groups
    .map((group) => {
      const items = group.items
        .map((item) => {
          const badge = item.badge ? `<span class="sb-badge">${escapeHTML(item.badge)}</span>` : '';

          return `
            <button class="sb-item" data-sidebar-key="${escapeHTML(item.key)}" data-target="${escapeHTML(item.target || '')}" data-action="${escapeHTML(item.action || '')}">
              <i class="fas ${escapeHTML(item.icon)}"></i>
              ${escapeHTML(item.text)}
              ${badge}
            </button>
          `;
        })
        .join('');

      return `
        <div class="sb-section">
          <div class="sb-section-label">${escapeHTML(group.label)}</div>
          ${items}
        </div>
      `;
    })
    .join('');
}

function handleSidebarClick(event) {
  const button = event.target.closest('.sb-item');
  if (!button) return;

  $$('.sb-item').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');

  const action = button.dataset.action;
  const target = button.dataset.target;

  if (action === 'openSettings') {
    openQuickSettings();
    return;
  }

  if (target) scrollToElement(target);

  const text = button.textContent.trim();
  dom.breadcrumbSub().textContent = ` / ${text}`;
}

/* ==========================================================================
   8. 表单与滑块
========================================================================== */

function initSliders() {
  const sliderMap = [
    ['resourceRich', 'resourceVal', '%'],
    ['initPop', 'popVal', '%'],
    ['militaryPot', 'militaryVal', '%'],
    ['techIndex', 'techVal', '%'],
    ['cfgTemperature', 'cfgTemperatureValue', ''],
  ];

  for (const [inputId, labelId, suffix] of sliderMap) {
    const input = document.getElementById(inputId);
    const label = document.getElementById(labelId);

    if (!input || !label) continue;

    const update = () => {
      label.textContent = `${input.value}${suffix}`;
      const max = Number(input.max) || 100;
      const pct = (Number(input.value) / max) * 100;
      input.style.background = `linear-gradient(90deg, var(--cyan) ${pct}%, rgba(0,229,255,.12) ${pct}%)`;
    };

    input.addEventListener('input', update);
    update();
  }
}

function getCivilizationForm() {
  return {
    name: $('#civName').value.trim() || '未命名文明',
    type: $('#civType').value,
    resource: $('#resourceRich').value,
    population: $('#initPop').value,
    military: $('#militaryPot').value,
    tech: $('#techIndex').value,
    background: $('#worldBackground').value.trim(),
  };
}

/* ==========================================================================
   9. 模型加载与选择
========================================================================== */

async function loadModels() {
  const list = dom.modelList();

  list.innerHTML = `<div class="model-loading">正在同步模型列表...</div>`;

  try {
    const response = await fetch(`${config.apiBase}/v1/models`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const models = (data.data || [])
      .map((model) => model.id)
      .filter(Boolean);

    if (models.length && !models.includes(config.defaultModel)) {
      models.unshift(config.defaultModel);
    }

    if (!models.length) {
      models.push(config.defaultModel);
    }

    state.models = models;

    renderModelList(models);

    const preferredModel = models.includes(state.selectedModel)
      ? state.selectedModel
      : config.defaultModel;

    selectModel(preferredModel);

    $('#modelSyncStatus').textContent = '[ OK ]';
    $('#modelSyncStatus').className = 'ok';

    showToast(`已同步 ${models.length} 个 AI 核心`, 'success');
  } catch (error) {
    state.models = [config.defaultModel];

    renderModelList(state.models);
    selectModel(config.defaultModel);

    list.insertAdjacentHTML(
      'afterbegin',
      `<div class="model-loading" style="color:var(--red);">同步失败：${escapeHTML(error.message)}</div>`
    );

    showToast('模型列表同步失败，已使用默认模型', 'error');
  }
}

function renderModelList(models) {
  const list = dom.modelList();
  list.innerHTML = '';

  for (const model of models) {
    const item = document.createElement('div');
    item.className = 'model-option';

    const name = document.createElement('span');
    name.className = 'm-name';
    name.textContent = model;

    const tag = document.createElement('span');
    tag.className = 'model-tag';
    tag.textContent = getModelTag(model);

    item.appendChild(name);
    item.appendChild(tag);

    item.addEventListener('click', () => selectModel(model));

    list.appendChild(item);
  }
}

function getModelTag(model) {
  const name = model.toLowerCase();

  if (name.includes('gpt-5')) return 'GPT-5';
  if (name.includes('gpt-4')) return 'GPT-4';
  if (name.includes('claude')) return 'CLAUDE';
  if (name.includes('gemini')) return 'GEMINI';
  if (name.includes('deepseek')) return 'DS';

  return 'AI';
}

function selectModel(model) {
  state.selectedModel = model;
  config.defaultModel = model;

  saveConfig();
  saveStateLite();

  const label = model.length > 20 ? `${model.slice(0, 18)}…` : model;

  dom.modelLabel().textContent = label;

  $('#footerModel').textContent = label;
  $('#footerModelMobile').textContent = label;

  $$('.model-option').forEach((item) => {
    const name = item.querySelector('.m-name')?.textContent;
    item.classList.toggle('selected', name === model);
  });

  dom.modelDropdown().classList.remove('open');

  syncQuickSettingsForm();
}

/* ==========================================================================
   10. 快速设置抽屉
========================================================================== */

function openQuickSettings() {
  syncQuickSettingsForm();

  dom.quickSettingsMask().classList.add('open');
  dom.quickSettingsPanel().classList.add('open');
}

function closeQuickSettings() {
  dom.quickSettingsMask().classList.remove('open');
  dom.quickSettingsPanel().classList.remove('open');
}

function syncQuickSettingsForm() {
  $('#cfgApiBase').value = config.apiBase;
  $('#cfgApiKey').value = config.apiKey;
  $('#cfgDefaultModel').value = config.defaultModel;
  $('#cfgTemperature').value = config.temperature;
  $('#cfgTemperatureValue').textContent = config.temperature;
  $('#cfgMaxTokens').value = config.maxTokens;

  $('#quickPromptPreview').textContent = SYSTEM_PROMPT;

  if ($('#settingsPromptPreview')) {
    $('#settingsPromptPreview').textContent = SYSTEM_PROMPT;
  }

  initSliders();
}

function saveQuickSettings() {
  const apiBase = $('#cfgApiBase').value.trim();
  const apiKey = $('#cfgApiKey').value.trim();
  const defaultModel = $('#cfgDefaultModel').value.trim();
  const temperature = clampNumber($('#cfgTemperature').value, 0, 2, DEFAULT_CONFIG.temperature);
  const maxTokens = clampNumber($('#cfgMaxTokens').value, 128, 32000, DEFAULT_CONFIG.maxTokens);

  if (!apiBase) {
    showToast('Base URL 不能为空', 'error');
    return;
  }

  if (!apiKey) {
    showToast('API Key 不能为空', 'error');
    return;
  }

  if (!defaultModel) {
    showToast('默认模型不能为空', 'error');
    return;
  }

  config.apiBase = apiBase.replace(/\/+$/, '');
  config.apiKey = apiKey;
  config.defaultModel = defaultModel;
  config.temperature = temperature;
  config.maxTokens = maxTokens;

  saveConfig();
  selectModel(defaultModel);
  syncQuickSettingsForm();

  showToast('配置已保存', 'success');
}

function resetQuickSettings() {
  Object.assign(config, DEFAULT_CONFIG);

  saveConfig();
  selectModel(config.defaultModel);
  syncQuickSettingsForm();

  showToast('已恢复默认配置', 'info');
}

/* ==========================================================================
   11. Token 统计
========================================================================== */

function addTokenRecord(epoch, inputTokens, outputTokens) {
  const record = {
    epoch,
    model: state.selectedModel,
    in: inputTokens,
    out: outputTokens,
    total: inputTokens + outputTokens,
    ts: Date.now(),
  };

  state.tokens.records.push(record);
  state.tokens.totalIn += inputTokens;
  state.tokens.totalOut += outputTokens;
  state.tokens.totalAll += inputTokens + outputTokens;

  updateTokenUI();
  saveStateLite();
}

function updateTokenUI() {
  dom.tokenBadgeValue().textContent = formatCompactNumber(state.tokens.totalAll);

  $('#sfInput').textContent = formatFullNumber(state.tokens.totalIn);
  $('#sfOutput').textContent = formatFullNumber(state.tokens.totalOut);
  $('#sfTotal').textContent = formatFullNumber(state.tokens.totalAll);
  $('#sfProgress').style.width = `${Math.min(100, (state.tokens.totalAll / 1000) * 5)}%`;

  if (state.activeView === 'token') {
    renderTokenPage();
  }
}

function renderTokenPage() {
  const tokens = state.tokens;
  const elapsed = Math.round((Date.now() - tokens.sessionStart) / 1000);
  const average = state.epoch > 0 ? Math.round(tokens.totalAll / state.epoch) : 0;

  $('#tkInputValue').textContent = formatFullNumber(tokens.totalIn);
  $('#tkOutputValue').textContent = formatFullNumber(tokens.totalOut);
  $('#tkTotalValue').textContent = formatFullNumber(tokens.totalAll);
  $('#tkAverageValue').textContent = formatFullNumber(average);
  $('#tkEpochValue').textContent = state.epoch;
  $('#tkSessionValue').textContent = formatDuration(elapsed);

  const body = $('#tokenHistoryBody');

  if (!tokens.records.length) {
    body.innerHTML = `
      <div class="tk-empty">
        <i class="fas fa-hourglass"></i>
        暂无推演记录，启动演化后将在此显示。
      </div>
    `;
    return;
  }

  body.innerHTML = tokens.records
    .slice()
    .reverse()
    .map((record) => {
      const time = new Date(record.ts).toLocaleTimeString();

      return `
        <div class="tk-row">
          <span class="ep">${escapeHTML(record.epoch)}</span>
          <span class="model-nm">${escapeHTML(record.model)}</span>
          <span class="in">${formatFullNumber(record.in)}</span>
          <span class="out tk-hide">${formatFullNumber(record.out)}</span>
          <span class="tot">${formatFullNumber(record.total)}</span>
          <span class="ts tk-hide">${escapeHTML(time)}</span>
        </div>
      `;
    })
    .join('');
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${minutes}m${restSeconds}s`;
}

/* ==========================================================================
   12. Toast
========================================================================== */

function showToast(message, type = 'info') {
  const container = $('#toast');
  const item = document.createElement('div');

  const icon = type === 'error'
    ? 'exclamation-circle'
    : type === 'success'
      ? 'check-circle'
      : 'info-circle';

  item.className = `toast-item ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
  item.innerHTML = `<i class="fas fa-${icon}"></i>${escapeHTML(message)}`;

  container.appendChild(item);

  setTimeout(() => {
    item.style.opacity = '0';
    item.style.transition = 'opacity .35s';
    setTimeout(() => item.remove(), 360);
  }, 3000);
}

/* ==========================================================================
   13. 流式预览
========================================================================== */

function showStreamPreview() {
  const preview = dom.streamPreview();

  preview.classList.add('active');
  dom.streamLabel().classList.add('active');

  streamBuffer = '';
  streamCharCount = 0;

  dom.streamRawText().innerHTML = '';
  dom.streamPreviewCount().textContent = '0 chars';

  let index = 0;
  dom.streamPreviewLabel().textContent = STREAM_TEXTS[index];

  clearInterval(streamLabelTimer);

  streamLabelTimer = setInterval(() => {
    index = (index + 1) % STREAM_TEXTS.length;
    dom.streamPreviewLabel().textContent = STREAM_TEXTS[index];
  }, 2000);
}

function hideStreamPreview() {
  clearInterval(streamLabelTimer);

  const preview = dom.streamPreview();

  preview.style.transition = 'opacity .45s ease';
  preview.style.opacity = '0';

  dom.streamLabel().classList.remove('active');

  setTimeout(() => {
    preview.classList.remove('active');
    preview.style.opacity = '';
    preview.style.transition = '';
  }, 450);
}

function appendStreamChunk(chunk) {
  streamBuffer += chunk;
  streamCharCount += chunk.length;

  dom.streamPreviewCount().textContent = `~${streamCharCount} chars`;

  const html = escapeHTML(streamBuffer)
    .replace(/"([^"]+)"(\s*:)/g, '<span class="sk">"$1"</span>$2')
    .replace(/:\s*"([^"]*)"/g, ': <span class="sv">"$1"</span>')
    .replace(/:\s*(\d+)/g, ': <span class="sn">$1</span>');

  const raw = dom.streamRawText();
  raw.innerHTML = html;

  raw.parentElement.scrollTop = raw.parentElement.scrollHeight;
  dom.terminalBody().scrollTop = dom.terminalBody().scrollHeight;
}

/* ==========================================================================
   14. API 调用
========================================================================== */

async function callAIStream(messages) {
  currentAbortController = new AbortController();

  const controller = currentAbortController;
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(`${config.apiBase}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: state.selectedModel,
        messages,
        temperature: Number(config.temperature) || DEFAULT_CONFIG.temperature,
        max_tokens: Number(config.maxTokens) || DEFAULT_CONFIG.maxTokens,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error new reader-8');

    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;
    let sseBuffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      sseBuffer += decoder.decode(value, { stream: true });

      const lines = sseBuffer.split('\n');
      sseBuffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed || !trimmed.startsWith('data:')) continue;
        if (trimmed === 'data: [DONE]') continue;

        try {
          const json = =.?.delta?. || (delta {
Chunk(delta);
            outputTokens += Math.ceil(delta.length / 4);
          }

          if (json.usage) {
            inputTokens = json.usage.prompt_tokens || inputTokens;
            outputTokens = json.usage.completion_tokens || outputTokens;
          }
        } catch {
          // 单帧失败跳过，不中断整个流。
        }
      }
    }

    if (!inputTokens) {
      inputTokens = Math.ceil(
        messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / 4
      );
    }

    return {
      content: fullContent,
      inTokens: inputTokens,
      outTokens: outputTokens,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求已中断或超时');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    currentAbortController = null;
  }
}

function stopGeneration() {
  if (!currentAbortController) {
    showToast('当前没有正在运行的推演', 'info');
    return;
  }

  currentAbortController.abort();
  currentAbortController = null;
  showToast('已中断当前推演', 'info');
}

/* ==========================================================================
   15. Prompt 与 JSON 解析
========================================================================== */

function buildInitialPrompt() {
  const civ = getCivilizationForm();

  return `【文明初始参数】
- 文明名称：${civ.name}
- 文明类型：${civ.type}
- 资源富饶度：${civ.resource}%
- 初始人口规模：${civ.population}%
- 军事潜力：${civ.military}%
- 科研/魔法指数：${civ.tech}%
${civ.background ? `- 世界背景：${civ.background}` : ''}

请推演【纪元一】。
严格输出纯 JSON，禁止多余说明。`;
}

function buildNextPrompt(intervention) {
  let prompt = `请继续推演【纪元${state.epoch + 1}】，延续上文逻辑。`;

  if (intervention) {
    prompt += `

【外部干预注入】：${intervention}
请将此事件深度融入本纪元。`;
  }

  return `${prompt}

严格输出纯 JSON。`;
}

function parseAIResponse(raw) {
  let text = String(raw || '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      era: `纪元${state.epoch + 1 || 1} · 未解析时代`,
      year_range: '未知年代',
      core_event: raw || 'AI 返回内容为空，无法解析为结构化 JSON。',
      dev_progress: 0,
      crisis: 'AI 输出未能被解析，世界线结构暂时不稳定。',
      crisis_level: 'HIGH',
      achievement: '本轮推演已返回文本，但未形成标准纪元档案。',
      population: '未知',
    };
  }
}

/* ==========================================================================
   16. 终端日志渲染
========================================================================== */

function appendLog(html, className = '') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${className}`;
  entry.innerHTML = html;

  dom.terminalBody().appendChild(entry);
  dom.terminalBody().scrollTop = dom.terminalBody().scrollHeight;

  return entry;
}

function appendSystemLog(message) {
  appendLog(
    `
      <span style="font-size:13px;color:var(--text-dim);">
        <i class="fas fa-chevron-right" style="margin-right:6px;font-size:10px;color:var(--cyan-dim);"></i>
        ${escapeHTML(message)}
      </span>
    `,
    'sys-entry'
  );
}

function appendErrorLog(message) {
  appendLog(
    `
      <div class="log-error">
        <i class="fas fa-skull-crossbones" style="margin-right:7px;"></i>
        因果律武器过载（请求失败）— ${escapeHTML(message)}，请重试
      </div>
    `,
    'error-entry'
  );
}

function renderEpochLog(data, epochNumber) {
  const crisisLevel = String(data.crisis_level || '').toUpperCase();
  const progress = clampNumber(data.dev_progress, 0, 100, 0);

  const crisisColor = {
    LOW: 'var(--green)',
    MEDIUM: 'var(--yellow)',
    HIGH: 'var(--red)',
    CRITICAL: 'var(--red)',
  }[crisisLevel] || 'var(--text)';

  return `
    <div class="log-era">◈ ${escapeHTML(data.era || `纪元${epochNumber}`)}</div>

    <div class="log-time">
      <i class="fas fa-clock" style="margin-right:4px;"></i>
      ${escapeHTML(data.year_range || '')}
      &nbsp;
      <i class="fas fa-users" style="margin-right:4px;"></i>
      人口：${escapeHTML(data.population || '未知')}
    </div>

    <div class="cyber-div"></div>

    <div class="log-sec c">
      <i class="fas fa-scroll"></i>
      核心事件
    </div>
    <div class="log-body">${escapeHTML(data.core_event || '')}</div>

    <div class="log-sec g">
      <i class="fas fa-trophy"></i>
      文明成就
    </div>
    <div class="log-body green">${escapeHTML(data.achievement || '')}</div>

    <div class="log-sec y">
      <i class="fas fa-chart-bar"></i>
      文明发展度
    </div>

    <div style="margin-top:5px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-family:var(--font-head);font-size:9px;letter-spacing:1.5px;color:var(--text-dim);">
          CIVILIZATION PROGRESS
        </span>
        <span style="font-family:var(--font-head);font-size:11px;color:var(--green);">
          ${progress}%
        </span>
      </div>

      <div class="progress-wrap">
        <div class="progress-bar" style="width:${progress}%;"></div>
      </div>
    </div>

    <div class="log-sec r">
      <i class="fas fa-radiation"></i>
      潜在危机
      <span class="crisis-badge" style="background:${crisisColor}22;border-color:${crisisColor};color:${crisisColor};">
        ${escapeHTML(crisisLevel || 'UNKNOWN')}
      </span>
    </div>

    <div class="log-body red">${escapeHTML(data.crisis || '')}</div>

    <div style="margin-top:12px;font-family:var(--font-head);font-size:10px;color:var(--text-dim);letter-spacing:1px;">
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    </div>
  `;
}

/* ==========================================================================
   17. 状态矩阵
========================================================================== */

function updateCivilizationStatus(data, epochNumber) {
  const progress = clampNumber(data.dev_progress, 0, 100, 0);

  $('#statEra').textContent = (data.era || `纪元${epochNumber}`).split('·')[0].trim();
  $('#statDev').textContent = `${progress}%`;
  $('#statCrisis').textContent = data.crisis_level || '—';
  $('#statRound').textContent = epochNumber;

  $('#progressBar').style.width = `${progress}%`;
  $('#progressLabel').textContent = `${progress}%`;

  $('#footerEpochs').textContent = epochNumber;
  $('#footerEpochsMobile').textContent = epochNumber;

  const dev = $('#statDev');
  dev.classList.remove('count-anim');
  void dev.offsetWidth;
  dev.classList.add('count-anim');
}

/* ==========================================================================
   18. 按钮状态
========================================================================== */

function updateActionButtons() {
  const isRunning = state.isRunning;
  const canContinue = state.civStarted && !isRunning;

  const startButtons = [
    ['startBtn', 'startIcon', 'startBtnText'],
    ['startBtnMobile', 'startIconMobile', 'startBtnTextMobile'],
  ];

  for (const [buttonId, iconId, textId] of startButtons) {
    const button = document.getElementById(buttonId);
    const icon = document.getElementById(iconId);
    const text = document.getElementById(textId);

    if (button) button.disabled = isRunning;
    if (icon) icon.className = isRunning ? 'fas fa-spinner fa-spin' : 'fas fa-play-circle';
    if (text) text.textContent = state.civStarted ? '重新创世' : '启动演化';
  }

  ['nextBtn', 'nextBtnMobile'].forEach((id) => {
    const button = document.getElementById(id);
    if (button) button.disabled = !canContinue;
  });

  ['injectBtn', 'injectBtnMobile'].forEach((id) => {
    const button = document.getElementById(id);
    if (button) button.disabled = !canContinue;
  });
}

/* ==========================================================================
   19. 推演核心
========================================================================== */

async function runEpoch(messages, epochNumber) {
  showStreamPreview();

  let response;

  try {
    response = await callAIStream(messages);
  } finally {
    hideStreamPreview();
  }

  addTokenRecord(epochNumber, response.inTokens, response.outTokens);

  const lastMessage = messages[messages.length - 1];

  state.history.push(lastMessage);
  state.history.push({
    role: 'assistant',
    content: response.content,
  });

  if (state.history.length > 20) {
    state.history = state.history.slice(-20);
  }

  const parsed = parseAIResponse(response.content);

  appendLog(renderEpochLog(parsed, epochNumber), 'era-entry');
  updateCivilizationStatus(parsed, epochNumber);

  return parsed;
}

async function startEvolution() {
  if (state.isRunning) return;

  const civ = getCivilizationForm();

  state.isRunning = true;
  state.epoch = 0;
  state.history = [];
  state.civStarted = false;
  state.pendingIntervention = '';

  updateActionButtons();

  dom.terminalBody().innerHTML = '';
  rebuildStreamPreview();

  appendSystemLog(`创世协议启动 · 文明「${civ.name}」世界线初始化`);
  appendSystemLog(`AI 核心：${state.selectedModel} · 流式模式已就绪`);

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildInitialPrompt() },
    ];

    await runEpoch(messages, 1);

    state.epoch = 1;
    state.civStarted = true;

    saveStateLite();
    showToast('纪元一推演完成', 'success');
  } catch (error) {
    state.civStarted = false;
    state.epoch = 0;

    hideStreamPreview();
    appendErrorLog(error.message);
    showToast(`推演失败：${error.message}`, 'error');
  } finally {
    state.isRunning = false;
    updateActionButtons();
  }
}

async function nextEpoch() {
  if (state.isRunning || !state.civStarted) return;

  const intervention = state.pendingIntervention;
  state.pendingIntervention = '';

  state.isRunning = true;
  updateActionButtons();

  if (intervention) {
    appendLog(
      `
        <div class="log-sec p">
          <i class="fas fa-bolt"></i>
          外部干预注入
        </div>
        <div class="log-body" style="color:var(--purple);">
          ${escapeHTML(intervention)}
        </div>
      `,
      'miracle-entry'
    );
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...state.history,
      { role: 'user', content: buildNextPrompt(intervention) },
    ];

    await runEpoch(messages, state.epoch + 1);

    state.epoch += 1;

    saveStateLite();
    showToast(`纪元 ${state.epoch} 推演完成`, 'success');
  } catch (error) {
    hideStreamPreview();
    appendErrorLog(error.message);
    showToast(`推演失败：${error.message}`, 'error');
  } finally {
    state.isRunning = false;
    updateActionButtons();
  }
}

/* ==========================================================================
   20. 干预、清空、重置、导出
========================================================================== */

function setIntervention(text) {
  $('#intervention').value = text;

  const panel = $('#panelIntervention');
  if (panel?.classList.contains('collapsed')) {
    panel.classList.remove('collapsed');
  }

  $('#intervention').focus();
}

function injectIntervention() {
  const text = $('#intervention').value.trim();

  if (!text) {
    showToast('请先填写干预事件内容', 'error');
    return;
  }

  state.pendingIntervention = text;
  $('#intervention').value = '';

  appendLog(
    `
      <span style="font-size:13px;color:var(--yellow);">
        <i class="fas fa-exclamation-triangle" style="margin-right:6px;"></i>
        干预事件已注入世界线缓冲区
      </span>
      <div style="color:var(--purple);margin-top:5px;font-size:14px;">
        "${escapeHTML(text)}"
      </div>
    `,
    'miracle-entry'
  );

  saveStateLite();
  showToast('干预事件已注入，推演下一纪元时触发', 'success');
}

function rebuildStreamPreview() {
  const preview = document.createElement('div');

  preview.id = 'streamPreview';
  preview.innerHTML = `
    <div class="sp-bar">
      <div class="sp-spinner"></div>
      <div class="sp-label" id="streamPreviewLabel">正在构筑时间线...</div>
      <div class="sp-count" id="streamPreviewCount">0 chars</div>
    </div>
    <div class="sp-wrap">
      <div id="streamRawText"></div>
    </div>
    <div class="sp-hint">
      <span>◈</span>
      AI 正在实时推演世界线 · 数据流解析中
      <span>◈</span>
    </div>
  `;

  dom.terminalBody().appendChild(preview);
}

function clearLog() {
  dom.terminalBody().innerHTML = '';
  rebuildStreamPreview();
  appendSystemLog('日志已清空 · LOG CLEARED');
}

function resetAll() {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }

  state.isRunning = false;
  state.epoch = 0;
  state.history = [];
  state.civStarted = false;
  state.pendingIntervention = '';

  state.tokens = {
    totalIn: 0,
    totalOut: 0,
    totalAll: 0,
    records: [],
    sessionStart: Date.now(),
  };

  $('#statEra').textContent = '—';
  $('#statDev').textContent = '—';
  $('#statCrisis').textContent = '—';
  $('#statRound').textContent = '0';

  $('#progressBar').style.width = '0%';
  $('#progressLabel').textContent = '0%';

  $('#footerEpochs').textContent = '0';
  $('#footerEpochsMobile').textContent = '0';

  updateTokenUI();
  updateActionButtons();
  clearLog();
  saveStateLite();

  if (state.activeView === 'token') renderTokenPage();

  showToast('世界线已重置', 'info');
}

function exportWorldLog() {
  const entries = $$('.log-entry')
    .map((entry) => entry.innerText.trim())
    .filter(Boolean)
    .join('\n\n---\n\n');

  if (!entries) {
    showToast('暂无可导出的世界线日志', 'error');
    return;
  }

  const header = `# WORLD SIMULATION ENGINE 世界线日志

- 导出时间：${new Date().toLocaleString()}
- 当前模型：${state.selectedModel}
- 推演轮次：${state.epoch}

---

`;

  const blob = new Blob([header + entries], {
    type: 'text/markdown;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `WSE-worldline-${Date.now()}.md`;
  link.click();

  URL.revokeObjectURL(url);

  showToast('世界线日志已导出', 'success');
}

/* ==========================================================================
   21. 页面渲染辅助
========================================================================== */

function renderSettingsPage() {
  $('#settingsPromptPreview').textContent = SYSTEM_PROMPT;
}

/* ==========================================================================
   22. 事件绑定
========================================================================== */

function bindEvents() {
  // 一级导航
  dom.navItems().forEach((item) => {
    item.addEventListener('click', () => switchView(item.dataset.view));
  });

  $('#navAboutBtn').addEventListener('click', () => {
    showToast('WSE v4.2.2 · NEURAL CORE ONLINE', 'info');
  });

  // 二级菜单
  $('#sidebarBody').addEventListener('click', handleSidebarClick);

  // Token badge
  $('#tokenBadge').addEventListener('click', () => switchView('token'));

  // 模型下拉
  $('#modelSelectorBtn').addEventListener('click', () => {
    dom.modelDropdown().classList.toggle('open');
  });

  document.addEventListener('click', (event) => {
    const wrap = $('#modelSelectorWrap');
    if (wrap && !wrap.contains(event.target)) {
      dom.modelDropdown().classList.remove('open');
    }
  });

  // 快速设置
  $('#quickSettingsBtn').addEventListener('click', openQuickSettings);
  $('#mobileSettingsBtn').addEventListener('click', openQuickSettings);
  $('#quickSettingsCloseBtn').addEventListener('click', closeQuickSettings);
  $('#quickSettingsMask').addEventListener('click', closeQuickSettings);

  $('#saveConfigBtn').addEventListener('click', saveQuickSettings);
  $('#resetConfigBtn').addEventListener('click', resetQuickSettings);
  $('#reloadModelsBtn').addEventListener('click', loadModels);

  // 世界线操作
  $('#exportLogBtn').addEventListener('click', exportWorldLog);
  $('#drawerClearLogBtn').addEventListener('click', clearLog);
  $('#drawerStopBtn').addEventListener('click', stopGeneration);
  $('#resetAllBtn').addEventListener('click', resetAll);

  // 主操作按钮
  $('#startBtn').addEventListener('click', startEvolution);
  $('#startBtnMobile').addEventListener('click', startEvolution);

  $('#nextBtn').addEventListener('click', nextEpoch);
  $('#nextBtnMobile').addEventListener('click', nextEpoch);

  $('#injectBtn').addEventListener('click', injectIntervention);
  $('#injectBtnMobile').addEventListener('click', injectIntervention);

  $('#stopBtn').addEventListener('click', stopGeneration);
  $('#mobileStopBtn').addEventListener('click', stopGeneration);

  $('#clearLogBtn').addEventListener('click', clearLog);

  // 预设干预事件
  $$('.chip[data-intervention]').forEach((chip) => {
    chip.addEventListener('click', () => {
      setIntervention(chip.dataset.intervention);
    });
  });

  // 移动端折叠面板
  $$('[data-panel-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      if (window.innerWidth >= 900) return;

      const panelId = button.dataset.panelToggle;
      document.getElementById(panelId)?.classList.toggle('collapsed');
    });
  });
}

/* ==========================================================================
   23. 启动
========================================================================== */

function bootstrap() {
  loadStateLite();

  bindEvents();
  initParticles();
  initSliders();

  switchView('evo');
  syncQuickSettingsForm();
  updateTokenUI();
  updateActionButtons();

  loadModels();

  if (window.innerWidth < 900) {
    $('#panelIntervention')?.classList.add('collapsed');
  }
}

window.addEventListener('DOMContentLoaded', bootstrap);