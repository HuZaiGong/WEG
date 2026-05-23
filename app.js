/* ══════════════════════════════════════════════════════
   WORLD SIMULATION ENGINE — app.js
══════════════════════════════════════════════════════ */

/* ── Config ── */
const API_BASE       = 'https://ai.hhhl.cc';
const API_KEY        = 'sk-free';
const DEFAULT_MODEL  = 'gpt-5.5';

const SYSTEM_PROMPT = `你是一个世界模拟引擎（World Simulation Engine），根据用户给出的文明初始条件，严密、逻辑清晰且充满史诗感地推演该世界接下来的发展历程。

每次推演请严格按照以下JSON格式输出（不要包含任何额外说明或markdown代码块标记，直接输出纯JSON）：
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
  '正在构筑时间线...','正在计算因果律...','推演历史节点...',
  '同步量子随机性...','编织文明命运...','折叠时空维度...',
  '激活史诗引擎...','注入世界线参数...',
];

/* ── State ── */
const state = {
  models:               [],
  selectedModel:        DEFAULT_MODEL,
  isRunning:            false,
  epoch:                0,
  history:              [],
  civStarted:           false,
  pendingIntervention:  '',
  // token 统计
  tokens: {
    totalIn:   0,
    totalOut:  0,
    totalAll:  0,
    records:   [],          // [{epoch,model,in,out,total,ts}]
    sessionStart: Date.now(),
  },
  // 导航状态
  nav: {
    active1:  'evo',        // 一级激活
    active2:  'evo',        // 二级激活
    active3:  null,         // 三级激活
    sb2Open:  true,
    sb3Open:  false,
    sb3Mode:  null,         // 'settings'|'tokens'|...
  },
};

/* ══════════════════════════════════════════════════════
   粒子系统
══════════════════════════════════════════════════════ */
function initParticles() {
  const cv = document.getElementById('particle-canvas');
  const cx = cv.getContext('2d');
  const C  = ['#00e5ff','#00e676','#b04aff','#ffd740'];
  let ps    = [];
  const resize = () => { cv.width = innerWidth; cv.height = innerHeight; };
  window.addEventListener('resize', resize); resize();
  const cnt = innerWidth < 600 ? 35 : 65;
  for (let i = 0; i < cnt; i++) ps.push({
    x: Math.random()*innerWidth, y: Math.random()*innerHeight,
    r: Math.random()*1.3+.3, dx: (Math.random()-.5)*.28, dy: (Math.random()-.5)*.28,
    color: C[~~(Math.random()*C.length)], a: Math.random()*.4+.08,
  });
  (function draw() {
    cx.clearRect(0,0,cv.width,cv.height);
    ps.forEach(p => {
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = cv.width;  if (p.x > cv.width)  p.x = 0;
      if (p.y < 0) p.y = cv.height; if (p.y > cv.height) p.y = 0;
      cx.beginPath(); cx.arc(p.x,p.y,p.r,0,Math.PI*2);
      cx.fillStyle = p.color; cx.globalAlpha = p.a; cx.fill();
    });
    const lim = innerWidth < 600 ? 65 : 95;
    for (let i = 0; i < ps.length; i++) for (let j = i+1; j < ps.length; j++) {
      const dx = ps[i].x-ps[j].x, dy = ps[i].y-ps[j].y, d = Math.sqrt(dx*dx+dy*dy);
      if (d < lim) { cx.beginPath(); cx.moveTo(ps[i].x,ps[i].y); cx.lineTo(ps[j].x,ps[j].y); cx.strokeStyle = ps[i].color; cx.globalAlpha = (1-d/lim)*.09; cx.lineWidth = .5; cx.stroke(); }
    }
    cx.globalAlpha = 1; requestAnimationFrame(draw);
  })();
}

/* ══════════════════════════════════════════════════════
   三级菜单导航系统
══════════════════════════════════════════════════════ */

/* 一级 nav 点击 */
function nav1Click(key) {
  state.nav.active1 = key;
  document.querySelectorAll('.nav-item[data-key]').forEach(el => el.classList.toggle('active', el.dataset.key === key));

  if (key === 'evo') {
    showSidebar2('evo');
    showView('view-evo');
    hideSidebar3();
  } else if (key === 'token') {
    showSidebar2('token');
    showView('view-token');
    hideSidebar3();
    renderTokenPage();
  } else if (key === 'settings') {
    showSidebar2('settings');
    showView('view-settings');
    hideSidebar3();
  }

  // 更新 topbar breadcrumb
  const labels = { evo:'演化控制台', token:'Token 统计', settings:'系统设置' };
  document.getElementById('bc-page').textContent = labels[key] || key;
  document.getElementById('bc-sub').textContent  = '';
}

/* 二级 sidebar item 点击 */
function nav2Click(key, label) {
  document.querySelectorAll('.sb-item[data-key]').forEach(el => el.classList.toggle('active', el.dataset.key === key));
  state.nav.active2 = key;

  // 带三级的项
  const hasChildren = {
    'civ-params':   { title:'文明参数',   sub:'INIT CONFIG',   view:'sb3-civ'      },
    'event-inject': { title:'干预事件',   sub:'EVENT INJECT',  view:'sb3-event'    },
    'token-detail': { title:'详细统计',   sub:'TOKEN DETAIL',  view:'sb3-tokendet' },
    'token-hist':   { title:'调用历史',   sub:'CALL HISTORY',  view:'sb3-tokenhist'},
    'sys-model':    { title:'模型配置',   sub:'MODEL CONFIG',  view:'sb3-model'    },
    'sys-prompt':   { title:'提示词配置', sub:'PROMPT CONFIG', view:'sb3-prompt'   },
  };
  if (hasChildren[key]) {
    showSidebar3(hasChildren[key].title, hasChildren[key].sub, hasChildren[key].view);
  } else {
    hideSidebar3();
  }

  // 面板跳转
  if (key === 'evo-log')     scrollToTerminal();
  if (key === 'evo-status')  scrollToStatus();
  if (key === 'evo-control') scrollToActions();

  // 更新 breadcrumb sub
  document.getElementById('bc-sub').textContent = label ? ` / ${label}` : '';
}

/* 二级折叠组 */
function toggleSbGroup(el) {
  const item = el.closest('.sb-item');
  item.classList.toggle('open');
  const children = item.nextElementSibling;
  if (children && children.classList.contains('sb-children')) {
    children.classList.toggle('open');
  }
}

/* 三级 sidebar3 item 点击 */
function nav3Click(key, label) {
  document.querySelectorAll('.s3-item[data-key]').forEach(el => el.classList.toggle('active', el.dataset.key === key));
  state.nav.active3 = key;
  document.getElementById('bc-sub').textContent = label ? ` / ${label}` : '';
  // 三级具体跳转逻辑
  if (key === 'civ-name')   focusField('civName');
  if (key === 'civ-type')   focusField('civType');
  if (key === 'civ-bg')     focusField('worldBg');
  if (key === 'ev-preset')  scrollToChips();
  if (key === 'ev-custom')  focusField('intervention');
}

/* 显示/隐藏二级 */
function showSidebar2(mode) {
  const sb = document.getElementById('sidebar');
  sb.classList.remove('hidden');
  // 根据 mode 渲染内容
  document.getElementById('sb-content').innerHTML = buildSidebar2(mode);
  state.nav.sb2Open = true;
}
function hideSidebar2() {
  document.getElementById('sidebar').classList.add('hidden');
  state.nav.sb2Open = false;
}

/* 显示/隐藏三级 */
function showSidebar3(title, sub, view) {
  const sb3 = document.getElementById('sidebar3');
  sb3.classList.remove('hidden');
  document.getElementById('s3-title').textContent  = title;
  document.getElementById('s3-sub').textContent    = sub;
  document.getElementById('s3-body').innerHTML     = buildSidebar3(view);
  state.nav.sb3Open = true;
  state.nav.sb3Mode = view;
}
function hideSidebar3() {
  document.getElementById('sidebar3').classList.add('hidden');
  state.nav.sb3Open  = false;
  state.nav.sb3Mode  = null;
  document.querySelectorAll('.s3-item').forEach(el => el.classList.remove('active'));
}

/* ── 二级菜单内容构建 ── */
function buildSidebar2(mode) {
  if (mode === 'evo') return `
    <div class="sb-section">
      <div class="sb-section-label">演化控制台</div>
      <div class="sb-item active" data-key="evo" onclick="nav2Click('evo','演化')">
        <i class="fas fa-globe-asia"></i> 世界演化主页
        <span class="sb-badge">MAIN</span>
      </div>
      <div class="sb-item has-children" data-key="civ-params" onclick="toggleSbGroup(this);nav2Click('civ-params','文明参数')">
        <i class="fas fa-dna"></i> 文明初始参数
        <i class="fas fa-chevron-right sb-arrow"></i>
      </div>
      <div class="sb-children">
        <div class="sb-child" onclick="nav3Click('civ-name','文明名称')"><i class="fas fa-signature"></i> 文明名称</div>
        <div class="sb-child" onclick="nav3Click('civ-type','文明类型')"><i class="fas fa-dna"></i> 文明类型</div>
        <div class="sb-child" onclick="nav3Click('civ-res','资源富饶度')"><i class="fas fa-mountain"></i> 资源富饶度</div>
        <div class="sb-child" onclick="nav3Click('civ-pop','人口规模')"><i class="fas fa-users"></i> 初始人口</div>
        <div class="sb-child" onclick="nav3Click('civ-mil','军事潜力')"><i class="fas fa-shield-alt"></i> 军事潜力</div>
        <div class="sb-child" onclick="nav3Click('civ-tech','科研指数')"><i class="fas fa-flask"></i> 科研指数</div>
        <div class="sb-child" onclick="nav3Click('civ-bg','背景设定')"><i class="fas fa-scroll"></i> 世界背景</div>
      </div>
      <div class="sb-item has-children" data-key="event-inject" onclick="toggleSbGroup(this);nav2Click('event-inject','干预事件')">
        <i class="fas fa-bolt"></i> 神迹 / 灾难干预
        <i class="fas fa-chevron-right sb-arrow"></i>
      </div>
      <div class="sb-children">
        <div class="sb-child" onclick="nav3Click('ev-preset','预设事件')"><i class="fas fa-star"></i> 预设事件</div>
        <div class="sb-child" onclick="nav3Click('ev-custom','自定义')"><i class="fas fa-pencil-alt"></i> 自定义干预</div>
      </div>
    </div>
    <div class="sb-section">
      <div class="sb-section-label">演化日志</div>
      <div class="sb-item" data-key="evo-log" onclick="nav2Click('evo-log','推演日志')">
        <i class="fas fa-terminal"></i> 推演日志终端
      </div>
      <div class="sb-item" data-key="evo-status" onclick="nav2Click('evo-status','状态矩阵')">
        <i class="fas fa-chart-line"></i> 文明状态矩阵
      </div>
      <div class="sb-item" data-key="evo-control" onclick="nav2Click('evo-control','控制台')">
        <i class="fas fa-gamepad"></i> 演化控制
      </div>
    </div>`;

  if (mode === 'token') return `
    <div class="sb-section">
      <div class="sb-section-label">Token 统计</div>
      <div class="sb-item active" data-key="token" onclick="nav2Click('token','总览')">
        <i class="fas fa-coins"></i> 总览仪表盘
        <span class="sb-badge">LIVE</span>
      </div>
      <div class="sb-item" data-key="token-detail" onclick="nav2Click('token-detail','详细')">
        <i class="fas fa-chart-bar"></i> 详细统计
        <i class="fas fa-chevron-right sb-arrow"></i>
      </div>
      <div class="sb-item" data-key="token-hist" onclick="nav2Click('token-hist','历史')">
        <i class="fas fa-history"></i> 调用历史
        <i class="fas fa-chevron-right sb-arrow"></i>
      </div>
    </div>
    <div class="sb-section">
      <div class="sb-section-label">费用估算</div>
      <div class="sb-item" data-key="token-cost" onclick="nav2Click('token-cost','费用')">
        <i class="fas fa-dollar-sign"></i> 费用估算
      </div>
    </div>`;

  if (mode === 'settings') return `
    <div class="sb-section">
      <div class="sb-section-label">系统设置</div>
      <div class="sb-item active" data-key="settings" onclick="nav2Click('settings','设置')">
        <i class="fas fa-cog"></i> 全局配置
      </div>
      <div class="sb-item" data-key="sys-model" onclick="nav2Click('sys-model','模型')">
        <i class="fas fa-microchip"></i> 模型配置
        <i class="fas fa-chevron-right sb-arrow"></i>
      </div>
      <div class="sb-item" data-key="sys-prompt" onclick="nav2Click('sys-prompt','提示词')">
        <i class="fas fa-code"></i> 提示词配置
        <i class="fas fa-chevron-right sb-arrow"></i>
      </div>
      <div class="sb-item" data-key="sys-api" onclick="nav2Click('sys-api','API')">
        <i class="fas fa-plug"></i> API 端点
      </div>
    </div>
    <div class="sb-section">
      <div class="sb-section-label">关于</div>
      <div class="sb-item" data-key="about" onclick="nav2Click('about','关于')">
        <i class="fas fa-info-circle"></i> 关于 WSE
        <span class="sb-badge">v4.2</span>
      </div>
    </div>`;

  return '';
}

/* ── 三级菜单内容构建 ── */
function buildSidebar3(view) {
  if (view === 'sb3-civ') return `
    <div class="s3-item active" data-key="civ-name" onclick="nav3Click('civ-name','文明名称')"><i class="fas fa-signature"></i> 文明名称</div>
    <div class="s3-item" data-key="civ-type" onclick="nav3Click('civ-type','文明类型')"><i class="fas fa-dna"></i> 文明类型</div>
    <div class="s3-item" data-key="civ-res" onclick="nav3Click('civ-res','资源')"><i class="fas fa-mountain"></i> 资源富饶度</div>
    <div class="s3-item" data-key="civ-pop" onclick="nav3Click('civ-pop','人口')"><i class="fas fa-users"></i> 初始人口规模</div>
    <div class="s3-item" data-key="civ-mil" onclick="nav3Click('civ-mil','军事')"><i class="fas fa-shield-alt"></i> 军事潜力</div>
    <div class="s3-item" data-key="civ-tech" onclick="nav3Click('civ-tech','科研')"><i class="fas fa-flask"></i> 科研 / 魔法指数</div>
    <div class="s3-item" data-key="civ-bg" onclick="nav3Click('civ-bg','背景')"><i class="fas fa-scroll"></i> 世界背景设定</div>`;

  if (view === 'sb3-event') return `
    <div class="s3-item active" data-key="ev-preset" onclick="nav3Click('ev-preset','预设')"><i class="fas fa-star"></i> 预设事件库</div>
    <div class="s3-item" data-key="ev-m1" onclick="setIntervention('上帝之手降临，赐予该文明前所未有的神圣启示与超凡力量');nav3Click('ev-m1','神圣启示')"><i class="fas fa-star"></i> 神圣启示 <span class="s3-badge">神迹</span></div>
    <div class="s3-item" data-key="ev-m2" onclick="setIntervention('一场无声的意识觉醒席卷全族，每个个体突破了认知极限');nav3Click('ev-m2','意识觉醒')"><i class="fas fa-brain"></i> 意识觉醒 <span class="s3-badge">神迹</span></div>
    <div class="s3-item" data-key="ev-d1" onclick="setIntervention('一颗直径5公里的陨石命中文明核心城市，造成毁灭性破坏');nav3Click('ev-d1','陨石撞击')"><i class="fas fa-meteor"></i> 陨石撞击 <span class="s3-badge" style="color:var(--red);">灾难</span></div>
    <div class="s3-item" data-key="ev-d2" onclick="setIntervention('一场致命的黑死级瘟疫在全境蔓延，死亡率高达70%');nav3Click('ev-d2','黑死瘟疫')"><i class="fas fa-biohazard"></i> 黑死瘟疫 <span class="s3-badge" style="color:var(--red);">灾难</span></div>
    <div class="s3-item" data-key="ev-d3" onclick="setIntervention('外星入侵者突然出现，技术碾压本土文明，发动全面战争');nav3Click('ev-d3','外星入侵')"><i class="fas fa-rocket"></i> 外星入侵 <span class="s3-badge" style="color:var(--red);">灾难</span></div>
    <div class="s3-item" data-key="ev-e1" onclick="setIntervention('文明内部爆发意识形态革命，旧权力体系在一夜间土崩瓦解');nav3Click('ev-e1','社会革命')"><i class="fas fa-fire"></i> 社会革命 <span class="s3-badge" style="color:var(--yellow);">事件</span></div>
    <div class="s3-item" data-key="ev-e2" onclick="setIntervention('偶然发现了超时空传送门，通往一个资源极其丰沛的新世界');nav3Click('ev-e2','时空门')"><i class="fas fa-door-open"></i> 时空门开启 <span class="s3-badge" style="color:var(--yellow);">事件</span></div>
    <div class="s3-item" data-key="ev-e3" onclick="setIntervention('与另一个高等文明首次建立联系，开启宇宙级外交与文化交流');nav3Click('ev-e3','星际接触')"><i class="fas fa-satellite"></i> 星际接触 <span class="s3-badge" style="color:var(--yellow);">事件</span></div>
    <div class="s3-item" data-key="ev-custom" onclick="nav3Click('ev-custom','自定义');focusField('intervention')"><i class="fas fa-pencil-alt"></i> 自定义干预</div>`;

  if (view === 'sb3-tokendet') return `
    <div class="s3-item active" data-key="td-in" onclick="nav3Click('td-in','输入')"><i class="fas fa-arrow-right"></i> 输入 Tokens <span class="s3-badge">${fmt(state.tokens.totalIn)}</span></div>
    <div class="s3-item" data-key="td-out" onclick="nav3Click('td-out','输出')"><i class="fas fa-arrow-left"></i> 输出 Tokens <span class="s3-badge">${fmt(state.tokens.totalOut)}</span></div>
    <div class="s3-item" data-key="td-all" onclick="nav3Click('td-all','合计')"><i class="fas fa-sigma"></i> 合计 Tokens <span class="s3-badge">${fmt(state.tokens.totalAll)}</span></div>
    <div class="s3-item" data-key="td-epo" onclick="nav3Click('td-epo','纪元')"><i class="fas fa-layer-group"></i> 推演轮次 <span class="s3-badge">${state.epoch}</span></div>`;

  if (view === 'sb3-tokenhist') return state.tokens.records.length === 0
    ? `<div style="padding:24px 14px;font-size:12px;color:var(--text-dim);text-align:center;">暂无调用记录</div>`
    : state.tokens.records.slice().reverse().map((r,i) => `
      <div class="s3-item ${i===0?'active':''}" data-key="rec-${i}" onclick="nav3Click('rec-${i}','纪元${r.epoch}')">
        <i class="fas fa-history"></i>
        纪元 ${r.epoch}
        <span class="s3-badge">${fmt(r.total)}</span>
      </div>`).join('');

  if (view === 'sb3-model') return `
    <div class="s3-item active" data-key="m-cur" onclick="nav3Click('m-cur','当前模型')"><i class="fas fa-check-circle"></i> 当前模型</div>
    <div style="padding:8px 14px 4px;font-family:var(--font-head);font-size:9px;letter-spacing:1.5px;color:var(--text-dim);">可用模型</div>
    ${state.models.map((m,i) => `
      <div class="s3-item${m === state.selectedModel?' active':''}" data-key="m-${i}" onclick="selectModel('${m}',this);nav3Click('m-${i}','${m}')">
        <i class="fas fa-microchip"></i>
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:11px;">${m}</span>
      </div>`).join('')}`;

  if (view === 'sb3-prompt') return `
    <div class="s3-item active" onclick="nav3Click('sp-sys','System')"><i class="fas fa-terminal"></i> System Prompt</div>
    <div class="s3-item" onclick="nav3Click('sp-user','User')"><i class="fas fa-user"></i> User Template</div>
    <div class="s3-item" onclick="nav3Click('sp-temp','Temperature')"><i class="fas fa-thermometer-half"></i> Temperature: 0.88</div>
    <div class="s3-item" onclick="nav3Click('sp-max','Max Tokens')"><i class="fas fa-sort-amount-up"></i> Max Tokens: 1400</div>`;

  return '<div style="padding:20px 14px;font-size:12px;color:var(--text-dim);">请从左侧选择项目</div>';
}

/* ══════════════════════════════════════════════════════
   View 切换
══════════════════════════════════════════════════════ */
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

/* ══════════════════════════════════════════════════════
   Slider
══════════════════════════════════════════════════════ */
function updateSlider(el, lid) {
  document.getElementById(lid).textContent = el.value + '%';
  el.style.background = `linear-gradient(90deg,var(--cyan) ${el.value}%,rgba(0,229,255,.12) ${el.value}%)`;
}
function initSliders() {
  ['resourceRich','initPop','militaryPot','techIndex'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.background = `linear-gradient(90deg,var(--cyan) ${el.value}%,rgba(0,229,255,.12) ${el.value}%)`;
  });
}

/* ══════════════════════════════════════════════════════
   Model Dropdown（topbar）
══════════════════════════════════════════════════════ */
function toggleModelDropdown() {
  document.getElementById('modelDropdown').classList.toggle('open');
}
document.addEventListener('click', e => {
  const wrap = document.getElementById('modelSelectorWrap');
  if (wrap && !wrap.contains(e.target))
    document.getElementById('modelDropdown').classList.remove('open');
});

async function loadModels() {
  try {
    const res   = await fetch(`${API_BASE}/v1/models`, { headers: { Authorization: `Bearer ${API_KEY}` } });
    const data  = await res.json();
    const models = (data.data || []).map(m => m.id);
    // 确保默认模型在列表中
    if (models.length && !models.includes(DEFAULT_MODEL)) models.unshift(DEFAULT_MODEL);
    if (!models.length) models.push(DEFAULT_MODEL);
    state.models = models;

    const listEl = document.getElementById('modelList');
    listEl.innerHTML = '';
    models.forEach((m, i) => {
      const div = document.createElement('div');
      div.className = 'model-option' + (m === state.selectedModel ? ' selected' : '');
      const tag = m.includes('gpt-5')?'GPT-5':m.includes('gpt-4')?'GPT-4':m.includes('claude')?'CLAUDE':m.includes('gemini')?'GEMINI':m.includes('deepseek')?'DS':'AI';
      div.innerHTML = `<span class="m-name">${m}</span><span class="model-tag">${tag}</span>`;
      div.onclick = () => selectModel(m, div);
      listEl.appendChild(div);
    });

    // 设置默认选中
    selectModel(DEFAULT_MODEL, listEl.querySelector('.model-option'));
    // boot log
    const bm = document.getElementById('bootMsg');
    if (bm) bm.innerHTML = bm.innerHTML.replace('[ PENDING ]','<span class="ok">[ OK ]</span>');
    showToast(`已同步 ${models.length} 个 AI 核心`, 'success');
  } catch(e) {
    if (!state.models.includes(DEFAULT_MODEL)) state.models = [DEFAULT_MODEL];
    selectModel(DEFAULT_MODEL, null);
    showToast('模型列表同步失败，已使用默认模型', 'error');
  }
}

function selectModel(id, el) {
  state.selectedModel = id;
  const lbl = id.length > 20 ? id.slice(0,18)+'…' : id;
  const mLbl = document.getElementById('mLabel');
  if (mLbl) mLbl.textContent = lbl;
  // 同步桌面/移动两处
  ['footerModel','footerModelM'].forEach(fid => {
    const f = document.getElementById(fid); if (f) f.textContent = lbl;
  });
  document.querySelectorAll('.model-option').forEach(o => o.classList.remove('selected'));
  if (el) el.classList.add('selected');
  document.getElementById('modelDropdown').classList.remove('open');
  // 更新 topbar token badge 里的 model 显示
  updateTokenBadge();
}

/* ══════════════════════════════════════════════════════
   Token 统计
══════════════════════════════════════════════════════ */
function fmt(n) { return n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n); }
function fmtFull(n) { return n.toLocaleString(); }

function addTokenRecord(epochNum, inTk, outTk) {
  const rec = { epoch: epochNum, model: state.selectedModel, in: inTk, out: outTk, total: inTk+outTk, ts: Date.now() };
  state.tokens.records.push(rec);
  state.tokens.totalIn  += inTk;
  state.tokens.totalOut += outTk;
  state.tokens.totalAll += inTk + outTk;
  updateTokenBadge();
  updateSidebarFooter();
}

function updateTokenBadge() {
  const el = document.getElementById('tokenBadgeVal');
  if (el) {
    el.textContent = fmt(state.tokens.totalAll);
    el.classList.remove('updated');
    void el.offsetWidth;
    el.classList.add('updated');
  }
}

function updateSidebarFooter() {
  const fi = document.getElementById('sf-in');   if (fi) fi.textContent = fmtFull(state.tokens.totalIn);
  const fo = document.getElementById('sf-out');  if (fo) fo.textContent = fmtFull(state.tokens.totalOut);
  const ft = document.getElementById('sf-tot');  if (ft) ft.textContent = fmtFull(state.tokens.totalAll);
  const fp = document.getElementById('sf-prog'); if (fp) fp.style.width = Math.min(100, (state.tokens.totalAll / 1000) * 5) + '%';
}

function renderTokenPage() {
  const tk = state.tokens;
  const elapsed = Math.round((Date.now() - tk.sessionStart) / 1000);
  const avgPerEpoch = state.epoch > 0 ? Math.round(tk.totalAll / state.epoch) : 0;

  // 概要卡片
  document.getElementById('tk-in-val').textContent   = fmtFull(tk.totalIn);
  document.getElementById('tk-out-val').textContent  = fmtFull(tk.totalOut);
  document.getElementById('tk-tot-val').textContent  = fmtFull(tk.totalAll);
  document.getElementById('tk-avg-val').textContent  = fmtFull(avgPerEpoch);
  document.getElementById('tk-epoch-val').textContent= state.epoch;
  document.getElementById('tk-time-val').textContent = elapsed < 60 ? elapsed+'s' : Math.round(elapsed/60)+'m'+elapsed%60+'s';

  // 历史表格
  const tbody = document.getElementById('tk-tbody');
  if (!tk.records.length) {
    tbody.innerHTML = `<div class="tk-empty"><i class="fas fa-hourglass" style="margin-right:8px;color:var(--text-dim);"></i>暂无推演记录，启动演化后将在此显示</div>`;
    return;
  }
  tbody.innerHTML = tk.records.slice().reverse().map(r => {
    const d = new Date(r.ts);
    const ts = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0') + ':' + d.getSeconds().toString().padStart(2,'0');
    return `<div class="tk-row">
      <span class="ep">${r.epoch}</span>
      <span class="model-nm">${r.model}</span>
      <span class="in">${fmtFull(r.in)}</span>
      <span class="out tk-hide">${fmtFull(r.out)}</span>
      <span class="tot">${fmtFull(r.total)}</span>
      <span class="ts tk-hide">${ts}</span>
    </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════
   Toast
══════════════════════════════════════════════════════ */
function showToast(msg, type='info') {
  const t = document.getElementById('toast');
  const d = document.createElement('div');
  d.className = `toast-item toast-${type==='error'?'error':type==='success'?'success':''}`;
  d.innerHTML = `<i class="fas fa-${type==='error'?'exclamation-circle':type==='success'?'check-circle':'info-circle'}"></i>${msg}`;
  t.appendChild(d);
  setTimeout(() => { d.style.opacity='0'; d.style.transition='opacity .35s'; setTimeout(()=>d.remove(),360); }, 3000);
}

/* ══════════════════════════════════════════════════════
   Stream Preview
══════════════════════════════════════════════════════ */
let _stInt=null, _stBuf='', _stLen=0;
function showStreamPreview() {
  const p = document.getElementById('streamPreview');
  p.classList.add('active');
  document.getElementById('streamLabel').classList.add('active');
  document.getElementById('streamRawText').innerHTML = '';
  document.getElementById('spTokenCount').textContent = '0 chars';
  _stBuf = ''; _stLen = 0;
  let si = 0;
  document.getElementById('spStatusLabel').textContent = STREAM_TEXTS[0];
  _stInt = setInterval(() => { si=(si+1)%STREAM_TEXTS.length; document.getElementById('spStatusLabel').textContent = STREAM_TEXTS[si]; }, 2000);
}
function hideStreamPreview() {
  clearInterval(_stInt);
  const p = document.getElementById('streamPreview');
  p.style.transition = 'opacity .45s ease'; p.style.opacity = '0';
  document.getElementById('streamLabel').classList.remove('active');
  setTimeout(() => { p.classList.remove('active'); p.style.opacity=''; p.style.transition=''; }, 450);
}
function appendStreamChunk(chunk) {
  _stBuf += chunk; _stLen += chunk.length;
  document.getElementById('spTokenCount').textContent = `~${_stLen} chars`;
  const html = esc(_stBuf)
    .replace(/"([^"]+)"(\s*:)/g, '<span class="sk">"$1"</span>$2')
    .replace(/:\s*"([^"]*)"/g, ': <span class="sv">"$1"</span>')
    .replace(/:\s*(\d+)/g, ': <span class="sn">$1</span>');
  const el = document.getElementById('streamRawText');
  el.innerHTML = html;
  el.parentElement.scrollTop = el.parentElement.scrollHeight;
  document.getElementById('terminalBody').scrollTop = 999999;
}
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ══════════════════════════════════════════════════════
   API — Stream
══════════════════════════════════════════════════════ */
async function callAIStream(messages) {
  const ctrl = new AbortController();
  const tm   = setTimeout(() => ctrl.abort(), 90000);
  const res  = await fetch(`${API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', Authorization:`Bearer ${API_KEY}` },
    body: JSON.stringify({ model: state.selectedModel, messages, temperature: 0.88, max_tokens: 1400, stream: true }),
    signal: ctrl.signal,
  });
  clearTimeout(tm);
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error?.message || `HTTP ${res.status}`); }

  const reader = res.body.getReader(), dec = new TextDecoder('utf-8');
  let full = '', inTokens = 0, outTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of dec.decode(value,{stream:true}).split('\n')) {
      const t = line.trim();
      if (!t || t === 'data: [DONE]' || !t.startsWith('data:')) continue;
      try {
        const parsed = JSON.parse(t.slice(5).trim());
        const d = parsed.choices?.[0]?.delta?.content || '';
        if (d) { full += d; appendStreamChunk(d); outTokens += Math.ceil(d.length / 4); }
        // 尝试读取真实 usage（最后一帧）
        if (parsed.usage) { inTokens = parsed.usage.prompt_tokens || 0; outTokens = parsed.usage.completion_tokens || outTokens; }
      } catch(_) {}
    }
  }
  // 如果没有 usage 帧，估算 input
  if (inTokens === 0) inTokens = Math.ceil(messages.reduce((a,m)=>a+(m.content?.length||0),0) / 4);
  return { content: full, inTokens, outTokens };
}

/* ══════════════════════════════════════════════════════
   JSON 解析
══════════════════════════════════════════════════════ */
function parseAI(raw) {
  let t = raw.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
  const s = t.indexOf('{'), e = t.lastIndexOf('}');
  if (s !== -1 && e !== -1) t = t.slice(s, e+1);
  return JSON.parse(t);
}

/* ══════════════════════════════════════════════════════
   Prompts
══════════════════════════════════════════════════════ */
function buildInitPrompt() {
  const n  = document.getElementById('civName').value.trim() || '未命名文明';
  const tp = document.getElementById('civType').value;
  const r  = document.getElementById('resourceRich').value;
  const p  = document.getElementById('initPop').value;
  const m  = document.getElementById('militaryPot').value;
  const tc = document.getElementById('techIndex').value;
  const bg = document.getElementById('worldBg').value.trim();
  return `【文明初始参数】\n- 文明名称：${n}\n- 文明类型：${tp}\n- 资源富饶度：${r}%\n- 初始人口规模：${p}%\n- 军事潜力：${m}%\n- 科研/魔法指数：${tc}%\n${bg?`- 世界背景：${bg}`:''}\n\n请推演【纪元一】。严格输出纯JSON，禁止多余说明。`;
}
function buildNextPrompt(iv) {
  let p = `请继续推演【纪元${state.epoch+1}】，延续上文逻辑。`;
  if (iv) p += `\n\n【外部干预注入】：${iv}\n请将此事件深度融入本纪元。`;
  return p + '\n\n严格输出纯JSON。';
}

/* ══════════════════════════════════════════════════════
   Log Helpers
══════════════════════════════════════════════════════ */
function appendLog(html, cls='') {
  const body = document.getElementById('terminalBody');
  const e    = document.createElement('div');
  e.className = `log-entry ${cls}`;
  e.innerHTML = html;
  body.appendChild(e);
  body.scrollTop = body.scrollHeight;
  return e;
}
function appendSysLog(msg) {
  appendLog(`<span style="font-family:var(--font-ui);font-size:13px;color:var(--text-dim);">
    <i class="fas fa-chevron-right" style="margin-right:6px;font-size:10px;color:var(--cyan-dim);"></i>${msg}</span>`,'sys-entry');
}
function appendErrLog(msg) {
  appendLog(`<div class="log-error"><i class="fas fa-skull-crossbones" style="margin-right:7px;"></i>因果律武器过载（请求失败）— ${msg}，请重试</div>`,'error-entry');
}
function renderEpoch(data, n) {
  const cc = {LOW:'var(--green)',MEDIUM:'var(--yellow)',HIGH:'var(--red)',CRITICAL:'var(--red)'}[data.crisis_level] || 'var(--text)';
  return `
    <div class="log-era">◈ ${data.era || '纪元 '+n}</div>
    <div class="log-time"><i class="fas fa-clock" style="margin-right:4px;"></i>${data.year_range||''} &nbsp;<i class="fas fa-users" style="margin-right:4px;"></i>人口：${data.population||'未知'}</div>
    <div class="cyber-div"></div>
    <div class="log-sec c"><i class="fas fa-scroll"></i> 核心事件</div>
    <div class="log-body">${data.core_event||''}</div>
    <div class="log-sec g" style="margin-top:10px;"><i class="fas fa-trophy"></i> 文明成就</div>
    <div class="log-body green">${data.achievement||''}</div>
    <div class="log-sec y" style="margin-top:10px;"><i class="fas fa-chart-bar"></i> 文明发展度</div>
    <div style="margin-top:5px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-family:var(--font-head);font-size:9px;letter-spacing:1.5px;color:var(--text-dim);">CIVILIZATION PROGRESS</span>
        <span style="font-family:var(--font-head);font-size:11px;color:var(--green);">${data.dev_progress||0}%</span>
      </div>
      <div class="progress-wrap"><div class="progress-bar" style="width:${data.dev_progress||0}%;"></div></div>
    </div>
    <div class="log-sec r" style="margin-top:10px;"><i class="fas fa-radiation"></i> 潜在危机 <span class="crisis-badge" style="background:${cc}22;border-color:${cc};color:${cc};">${data.crisis_level||''}</span></div>
    <div class="log-body red">${data.crisis||''}</div>
    <div style="margin-top:12px;font-family:var(--font-head);font-size:10px;color:var(--text-dim);letter-spacing:1px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>`;
}

/* ══════════════════════════════════════════════════════
   Status
══════════════════════════════════════════════════════ */
function updateStatus(data, n) {
  document.getElementById('statEra').textContent    = (data.era||`纪元${n}`).split('·')[0].trim();
  document.getElementById('statDev').textContent    = (data.dev_progress||0)+'%';
  document.getElementById('statCrisis').textContent = data.crisis_level||'—';
  document.getElementById('statRound').textContent  = n;
  ['footerEpochs','footerEpochsM'].forEach(id=>{ const e=document.getElementById(id); if(e) e.textContent=n; });
  const pct = data.dev_progress||0;
  document.getElementById('progressBar').style.width    = pct+'%';
  document.getElementById('progressLabel').textContent  = pct+'%';
  const sd = document.getElementById('statDev');
  sd.classList.remove('count-anim'); void sd.offsetWidth; sd.classList.add('count-anim');
}

/* ══════════════════════════════════════════════════════
   Button state
══════════════════════════════════════════════════════ */
function setButtons(loading) {
  ['startBtn','nextBtn','injectBtn','startBtnM','nextBtnM','injectBtnM'].forEach(id => {
    const el = document.getElementById(id); if (el) el.disabled = loading;
  });
  const icon = loading ? 'fas fa-spinner fa-spin' : 'fas fa-play-circle';
  ['startIcon','startIconM'].forEach(id => { const e=document.getElementById(id); if(e) e.className=icon; });
  if (!loading && state.civStarted) {
    ['startBtnText','startBtnTextM'].forEach(id=>{ const e=document.getElementById(id); if(e) e.textContent='重新创世'; });
  }
}
function enableEvoButtons() {
  ['nextBtn','injectBtn','nextBtnM','injectBtnM'].forEach(id => {
    const el = document.getElementById(id); if (el) el.disabled = false;
  });
}

/* ══════════════════════════════════════════════════════
   rebuildStreamPreview
══════════════════════════════════════════════════════ */
function rebuildStreamPreview() {
  const body = document.getElementById('terminalBody');
  const p = document.createElement('div');
  p.id = 'streamPreview';
  p.innerHTML = `
    <div class="sp-bar">
      <div class="sp-spinner"></div>
      <div class="sp-label" id="spStatusLabel">正在构筑时间线...</div>
      <div class="sp-count" id="spTokenCount">0 chars</div>
    </div>
    <div class="sp-wrap"><div id="streamRawText"></div></div>
    <div class="sp-hint"><span>◈</span> AI 正在实时推演世界线 · 数据流解析中 <span>◈</span></div>`;
  body.appendChild(p);
}

/* ══════════════════════════════════════════════════════
   runEpoch
══════════════════════════════════════════════════════ */
async function runEpoch(messages, n) {
  showStreamPreview();
  let result;
  try { result = await callAIStream(messages); }
  finally { hideStreamPreview(); }
  const { content: raw, inTokens, outTokens } = result;
  // token 记录
  addTokenRecord(n, inTokens, outTokens);
  state.history.push(messages[messages.length - 1]);
  state.history.push({ role:'assistant', content: raw });
  if (state.history.length > 20) state.history = state.history.slice(-20);
  const data = parseAI(raw);
  appendLog(renderEpoch(data, n), 'era-entry');
  updateStatus(data, n);
  // 如果 token 页面是当前视图，刷新
  if (document.getElementById('view-token')?.classList.contains('active')) renderTokenPage();
  return data;
}

/* ══════════════════════════════════════════════════════
   startEvolution
══════════════════════════════════════════════════════ */
async function startEvolution() {
  if (state.isRunning) return;
  if (!state.selectedModel) { showToast('请先选择 AI 模型','error'); return; }
  const civName = document.getElementById('civName').value.trim() || '未命名文明';
  state.isRunning = true; state.epoch = 0; state.history = []; state.civStarted = true;
  setButtons(true);
  document.getElementById('terminalBody').innerHTML = '';
  rebuildStreamPreview();
  appendSysLog(`创世协议启动 · 文明「${civName}」世界线初始化`);
  appendSysLog(`AI 核心：${state.selectedModel} · 流式模式已就绪`);
  try {
    const userMsg  = buildInitPrompt();
    const messages = [{ role:'system',content:SYSTEM_PROMPT },{ role:'user',content:userMsg }];
    await runEpoch(messages, 1);
    state.epoch = 1;
    enableEvoButtons();
    showToast('纪元一推演完成','success');
  } catch(e) {
    hideStreamPreview(); appendErrLog(e.message); showToast('推演失败：'+e.message,'error');
  } finally { state.isRunning=false; setButtons(false); }
}

/* ══════════════════════════════════════════════════════
   nextEpoch
══════════════════════════════════════════════════════ */
async function nextEpoch() {
  if (state.isRunning || !state.civStarted) return;
  const iv = state.pendingIntervention||'';
  state.pendingIntervention = '';
  state.isRunning = true; setButtons(true);
  if (iv) {
    appendLog(`<div class="log-sec p"><i class="fas fa-bolt"></i> 外部干预注入</div>
      <div class="log-body" style="color:var(--purple);">${iv}</div>`,'miracle-entry');
  }
  try {
    const userMsg  = buildNextPrompt(iv);
    const messages = [{ role:'system',content:SYSTEM_PROMPT },...state.history,{ role:'user',content:userMsg }];
    await runEpoch(messages, state.epoch+1);
    state.epoch++;
    showToast(`纪元 ${state.epoch} 推演完成`,'success');
  } catch(e) {
    hideStreamPreview(); appendErrLog(e.message); showToast('推演失败：'+e.message,'error');
  } finally { state.isRunning=false; setButtons(false); enableEvoButtons(); }
}

/* ══════════════════════════════════════════════════════
   injectEvent / setIntervention
══════════════════════════════════════════════════════ */
function injectEvent() {
  const txt = document.getElementById('intervention').value.trim();
  if (!txt) { showToast('请先填写干预事件内容','error'); return; }
  state.pendingIntervention = txt;
  document.getElementById('intervention').value = '';
  appendLog(`
    <span style="font-family:var(--font-ui);font-size:13px;color:var(--yellow);">
      <i class="fas fa-exclamation-triangle" style="margin-right:6px;"></i>干预事件已注入世界线缓冲区
    </span>
    <div style="color:var(--purple);margin-top:5px;font-size:14px;">"${txt}"</div>`,'miracle-entry');
  showToast('干预事件已注入，推演下一纪元时触发','success');
}
function setIntervention(t) {
  document.getElementById('intervention').value = t;
  const p = document.getElementById('panel-event');
  if (p?.classList.contains('collapsed')) p.classList.remove('collapsed');
  document.getElementById('intervention').focus();
}

/* ══════════════════════════════════════════════════════
   clearLog / resetAll
══════════════════════════════════════════════════════ */
function clearLog() {
  document.getElementById('terminalBody').innerHTML = '';
  rebuildStreamPreview();
  appendSysLog('日志已清空 · LOG CLEARED');
}
function resetAll() {
  Object.assign(state, { epoch:0, history:[], civStarted:false, pendingIntervention:'', isRunning:false });
  state.tokens = { totalIn:0, totalOut:0, totalAll:0, records:[], sessionStart:Date.now() };
  ['nextBtn','injectBtn','nextBtnM','injectBtnM'].forEach(id => { const e=document.getElementById(id); if(e) e.disabled=true; });
  ['startBtn','startBtnM'].forEach(id => { const e=document.getElementById(id); if(e) e.disabled=false; });
  ['startBtnText','startBtnTextM'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent='启动演化'; });
  ['startIcon','startIconM'].forEach(id => { const e=document.getElementById(id); if(e) e.className='fas fa-play-circle'; });
  ['statEra','statDev','statCrisis'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent='—'; });
  const sr = document.getElementById('statRound'); if(sr) sr.textContent='0';
  const pb = document.getElementById('progressBar'); if(pb) pb.style.width='0%';
  const pl = document.getElementById('progressLabel'); if(pl) pl.textContent='0%';
  ['footerEpochs','footerEpochsM'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent='0'; });
  updateTokenBadge(); updateSidebarFooter();
  clearLog();
  showToast('世界线已重置','info');
}

/* ══════════════════════════════════════════════════════
   折叠面板
══════════════════════════════════════════════════════ */
function togglePanel(id) {
  if (window.innerWidth >= 860) return;
  document.getElementById(id)?.classList.toggle('collapsed');
}

/* ══════════════════════════════════════════════════════
   辅助跳转
══════════════════════════════════════════════════════ */
function focusField(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior:'smooth', block:'center' });
  setTimeout(() => el.focus(), 300);
}
function scrollToTerminal() { document.querySelector('.terminal')?.scrollIntoView({ behavior:'smooth', block:'start' }); }
function scrollToStatus()   { document.getElementById('civStatusPanel')?.scrollIntoView({ behavior:'smooth', block:'start' }); }
function scrollToActions()  { document.getElementById('action-bar-desktop')?.scrollIntoView({ behavior:'smooth', block:'start' }); }
function scrollToChips()    { document.querySelector('.chip-row')?.scrollIntoView({ behavior:'smooth', block:'center' }); }

/* ══════════════════════════════════════════════════════
   Init
══════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initSliders();
  loadModels();
  // 默认激活一级 evo
  nav1Click('evo');
  // 移动端默认折叠干预面板
  if (window.innerWidth < 860) {
    document.getElementById('panel-event')?.classList.add('collapsed');
  }
});
