/* ── RedesWiki — App initialization ──────────────────── */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  buildSidebar();
  initBackToTop();
  buildBreadcrumbs();
  Progress.init();
  enhanceLearningUX();
  Interactive.init();
  Navigation.init();
  if (typeof Glossary    !== 'undefined') Glossary.init();
  if (typeof SubnetCalc  !== 'undefined') SubnetCalc.init();
  initPWA();
  registerSW();
  initOnlineStatus();
  initTOC();
  initBottomArticleNav();
  initSectionAnchors();
  prefetchNextModule();
  loadPomodoro();
});

/* ── PWA install banner ───────────────────────────── */
let _deferredInstall = null;
const INSTALL_KEY = 'rw-install-dismissed';

function initPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _deferredInstall = e;
    if (!localStorage.getItem(INSTALL_KEY)) showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('rwInstallBanner');
    if (banner) banner.hidden = true;
  });
}

function showInstallBanner() {
  let banner = document.getElementById('rwInstallBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'rw-install-banner';
    banner.id = 'rwInstallBanner';
    banner.setAttribute('role', 'banner');
    banner.innerHTML = `
      <span class="rw-install-icon">📱</span>
      <span class="rw-install-text"><strong>RedesWiki</strong> funciona offline — instale na tela inicial para acesso rápido.</span>
      <button class="rw-install-cta" id="rwInstallAccept" type="button">Instalar</button>
      <button class="rw-install-x" id="rwInstallDismiss" type="button" aria-label="Fechar">✕</button>
    `;
    document.body.appendChild(banner);
  }
  banner.hidden = false;

  banner.querySelector('#rwInstallAccept').addEventListener('click', () => {
    if (!_deferredInstall) return;
    _deferredInstall.prompt();
    _deferredInstall.userChoice.then(() => {
      banner.hidden = true;
      _deferredInstall = null;
    });
  });

  banner.querySelector('#rwInstallDismiss').addEventListener('click', () => {
    banner.hidden = true;
    localStorage.setItem(INSTALL_KEY, '1');
  });
}

/* ── Online / Offline indicator ──────────────────────── */
function initOnlineStatus() {
  function showNetToast(msg, icon, warm) {
    const t = document.createElement('div');
    t.className = 'rw-toast';
    t.style.cssText = warm
      ? '--toast-bg:var(--bg-secondary)'
      : '--toast-bg:#1c0d0d';
    t.innerHTML = `<span class="rw-toast-icon">${icon}</span> <span>${msg}</span>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('rw-toast--show'));
    setTimeout(() => {
      t.classList.remove('rw-toast--show');
      t.addEventListener('transitionend', () => t.remove(), { once: true });
    }, 4000);
  }
  window.addEventListener('offline', () =>
    showNetToast('Você está offline. O conteúdo ainda funciona.', '📡', false));
  window.addEventListener('online', () =>
    showNetToast('Conexão restaurada.', '✓', true));
}

/* ── Floating TOC ────────────────────────────────────── */
function initTOC() {
  const main = document.querySelector('.article-wrapper');
  if (!main) return;
  const headings = [...main.querySelectorAll('h2')].filter(h => h.closest('.section'));
  if (headings.length < 2) return;

  const wrap = document.createElement('div');
  wrap.className = 'rw-toc-float';
  wrap.setAttribute('aria-label', 'Sumário');

  const panel = document.createElement('nav');
  panel.className = 'rw-toc-panel';
  panel.setAttribute('aria-label', 'Seções desta página');
  panel.innerHTML = `<p class="rw-toc-heading">Nesta página</p>
    <ul class="rw-toc-list">
      ${headings.map(h => {
        const section = h.closest('.section');
        const id = section?.id || '';
        const text = h.textContent.replace(/[^\w\s.,:'"-]/g, '').trim();
        return `<li><a href="#${id}" data-toc-id="${id}">${text}</a></li>`;
      }).join('')}
    </ul>`;

  const toggle = document.createElement('button');
  toggle.className = 'rw-toc-toggle';
  toggle.setAttribute('aria-label', 'Sumário da página');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.title = 'Sumário';
  toggle.innerHTML = '≡';

  wrap.appendChild(panel);
  wrap.appendChild(toggle);
  document.body.appendChild(wrap);

  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  panel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      panel.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Scroll spy */
  const links = panel.querySelectorAll('a[data-toc-id]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(a => a.classList.toggle('rw-toc-active', a.dataset.tocId === id));
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(h => { const s = h.closest('.section'); if (s) obs.observe(s); });
}

/* ── Bottom article navigation ───────────────────────── */
function initBottomArticleNav() {
  const pageId = getCurrentPageId();
  if (typeof MODULES === 'undefined') return;
  const idx = MODULES.findIndex(m => m.id === pageId);
  if (idx === -1) return;

  const prev = MODULES[idx - 1] || null;
  const next = MODULES[idx + 1] || null;
  if (!prev && !next) return;

  const main = document.querySelector('.article-wrapper');
  if (!main) return;

  const nav = document.createElement('nav');
  nav.className = 'rw-article-nav';
  nav.setAttribute('aria-label', 'Navegação entre módulos');

  const prevSlot = `<div class="rw-article-nav-slot rw-article-nav-prev">
    ${prev ? `<a href="${getRelativePath(prev.url)}">
      <span class="rw-article-nav-kicker">← Anterior</span>
      <span class="rw-article-nav-title">${prev.num}. ${prev.title}</span>
    </a>` : ''}
  </div>`;

  const nextSlot = `<div class="rw-article-nav-slot rw-article-nav-next">
    ${next ? `<a href="${getRelativePath(next.url)}">
      <span class="rw-article-nav-kicker">Próximo →</span>
      <span class="rw-article-nav-title">${next.num}. ${next.title}</span>
    </a>` : ''}
  </div>`;

  nav.innerHTML = prevSlot + nextSlot;
  main.appendChild(nav);
}

/* ── Section anchor links ────────────────────────────── */
function initSectionAnchors() {
  document.querySelectorAll('.article-wrapper .section[id] h2').forEach(h => {
    const section = h.closest('.section[id]');
    if (!section || h.querySelector('.rw-anchor-link')) return;

    const a = document.createElement('a');
    a.className = 'rw-anchor-link';
    a.href = `#${section.id}`;
    a.setAttribute('aria-label', 'Link permanente para esta seção');
    a.title = 'Copiar link desta seção';
    a.textContent = '#';

    a.addEventListener('click', e => {
      e.preventDefault();
      const url = new URL(window.location.href);
      url.hash = `#${section.id}`;
      history.pushState(null, '', url.toString());
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url.toString()).then(() => showCopyLinkToast()).catch(() => {});
      }
    });

    h.appendChild(a);
  });
}

function showCopyLinkToast() {
  const t = document.createElement('div');
  t.className = 'rw-toast';
  t.innerHTML = '<span class="rw-toast-icon">🔗</span> <span>Link copiado!</span>';
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('rw-toast--show'));
  setTimeout(() => {
    t.classList.remove('rw-toast--show');
    t.addEventListener('transitionend', () => t.remove(), { once: true });
  }, 2000);
}

/* ── Prefetch next module ────────────────────────────── */
function prefetchNextModule() {
  const pageId = getCurrentPageId();
  if (typeof MODULES === 'undefined') return;
  const idx = MODULES.findIndex(m => m.id === pageId);
  if (idx === -1 || idx + 1 >= MODULES.length) return;
  const next = MODULES[idx + 1];
  const base = window.location.pathname.includes('/pages/') ? '../' : './';
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = `${base}${next.url}`;
  document.head.appendChild(link);
}

/* ── Load Pomodoro dynamically ───────────────────────── */
function loadPomodoro() {
  const base = window.location.pathname.includes('/pages/') ? '../' : './';
  const s = document.createElement('script');
  s.src = `${base}js/pomodoro.js`;
  s.defer = true;
  document.head.appendChild(s);
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  const swPath = window.location.pathname.includes('/pages/')
    ? '../service-worker.js'
    : './service-worker.js';
  navigator.serviceWorker.register(swPath).catch(() => {});
}

/* ── Theme ───────────────────────────────────────────── */
function initTheme() {
  const themeKey = window.StorageHub?.KEYS?.theme || 'rw-theme';
  const saved = localStorage.getItem(themeKey) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeToggle(saved);

  document.addEventListener('click', e => {
    const btn = e.target.closest('.theme-toggle');
    if (!btn) return;
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(themeKey, next);
    updateThemeToggle(next);
  });
}

function updateThemeToggle(theme) {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.innerHTML = theme === 'dark'
      ? '<span>☀️</span><span>Claro</span>'
      : '<span>🌙</span><span>Escuro</span>';
    btn.title = theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro';
  });
}

/* ── Sidebar builder ─────────────────────────────────── */
function buildSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar || typeof MODULES === 'undefined') return;

  const currentPage = getCurrentPageId();
  const moduleItems = MODULES.map(m => buildModuleNavItem(m, currentPage)).join('');

  const html = `
    <div class="sidebar-logo">
      <a href="${getRelativePath('index.html')}">
        <span class="logo-icon">🌐</span>
        <span>RedesWiki</span>
      </a>
    </div>
    <div class="sidebar-search">
      <input type="search" id="sidebarSearch" placeholder="🔍 Buscar no conteúdo..." autocomplete="off">
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section" id="navSectionHome">
        <ul class="nav-items">
          <li class="nav-item">
            <a href="${getRelativePath('index.html')}" class="${currentPage === 'home' ? 'active' : ''}" ${currentPage === 'home' ? 'aria-current="page"' : ''}>
              <span class="nav-icon">🏠</span> Início
            </a>
          </li>
          <li class="nav-item">
            <a href="${getRelativePath('index.html')}#favoritos" id="favLink">
              <span class="nav-icon">⭐</span> Meus Favoritos
            </a>
          </li>
        </ul>
      </div>
      <div class="nav-section" id="navSectionModules">
        <button class="nav-section-header nav-section-toggle" type="button" aria-expanded="true" aria-controls="navModulesList">
          <span class="nav-section-title">Módulos</span>
          <i class="nav-chevron">▾</i>
        </button>
        <ul class="nav-items" id="navModulesList">
          ${moduleItems}
        </ul>
      </div>
      <div class="nav-section" id="navSectionTools">
        <button class="nav-section-header nav-section-toggle" type="button" aria-expanded="true" aria-controls="navToolsList">
          <span class="nav-section-title">Ferramentas</span>
          <i class="nav-chevron">▾</i>
        </button>
        <ul class="nav-items" id="navToolsList">
          <li class="nav-item">
            <a href="${getRelativePath('pages/revisao.html')}" class="${currentPage === 'revisao' ? 'active' : ''}" ${currentPage === 'revisao' ? 'aria-current="page"' : ''}>
              <span class="nav-icon">🧠</span> Central de Revisão
            </a>
          </li>
          <li class="nav-item">
            <a href="${getRelativePath('pages/simulado.html')}" class="${currentPage === 'simulado' ? 'active' : ''}" ${currentPage === 'simulado' ? 'aria-current="page"' : ''}>
              <span class="nav-icon">🎓</span> Simulado
            </a>
          </li>
          <li class="nav-item">
            <a href="${getRelativePath('pages/exercicios.html')}" class="${currentPage === 'exercicios' ? 'active' : ''}" ${currentPage === 'exercicios' ? 'aria-current="page"' : ''}>
              <span class="nav-icon">💻</span> Exercícios Práticos
            </a>
          </li>
        </ul>
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-progress-wrap">
        <div class="sp-label">
          <span>Progresso geral</span>
          <span id="spPct">0%</span>
        </div>
        <div class="sp-bar"><div class="sp-fill" id="spFill"></div></div>
      </div>
    </div>
  `;

  sidebar.innerHTML = html;

  initSidebarSections(sidebar);
  initSidebarModules(sidebar);

  // Hamburger
  const ham = document.getElementById('hamburger');
  const overlay = document.getElementById('sidebarOverlay');
  if (ham && overlay) {
    ham.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }
}

function buildModuleNavItem(module, currentPage) {
  const isCurrent = currentPage === module.id;
  const topics = Array.isArray(module.navTopics) ? module.navTopics : [];
  const subId = `nav-sub-${module.id}`;
  const links = topics.map(topic => {
    const href = isCurrent ? `#${topic.id}` : `${getRelativePath(module.url)}#${topic.id}`;
    return `
      <li>
        <a href="${href}" data-module-topic="${module.id}" data-topic-id="${topic.id}">
          <span class="nav-sub-index">${getTopicIndexLabel(topic.title)}</span>
          <span class="nav-sub-label">${topic.title}</span>
        </a>
      </li>
    `;
  }).join('');

  return `
    <li class="nav-item nav-module-item ${isCurrent ? 'current' : ''}" data-module-item="${module.id}">
      <button
        class="nav-module-trigger"
        type="button"
        data-module-trigger="${module.id}"
        aria-expanded="${isCurrent ? 'true' : 'false'}"
        aria-controls="${subId}"
      >
        <span class="nav-module-main">
          <span class="nav-icon nav-module-icon">${module.icon}</span>
          <span class="nav-module-text">
            <span class="nav-module-kicker">Módulo ${String(module.num).padStart(2, '0')}</span>
            <span class="nav-module-title">${module.num}. ${module.title}</span>
          </span>
        </span>
        <span class="nav-module-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="nav-sub-wrap ${isCurrent ? 'open' : ''}" id="${subId}">
        <ul class="nav-sub">
          ${links}
        </ul>
      </div>
    </li>
  `;
}

function initSidebarSections(sidebar) {
  sidebar.querySelectorAll('.nav-section-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.closest('.nav-section');
      const isCollapsed = section.classList.toggle('collapsed');
      btn.setAttribute('aria-expanded', String(!isCollapsed));
    });
  });
}

function initSidebarModules(sidebar) {
  sidebar.querySelectorAll('.nav-module-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const moduleId = btn.dataset.moduleTrigger;
      const item = sidebar.querySelector(`[data-module-item="${moduleId}"]`);
      const wrap = item?.querySelector('.nav-sub-wrap');
      if (!item || !wrap) return;

      const isOpen = wrap.classList.toggle('open');
      item.classList.toggle('expanded', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

function getTopicIndexLabel(title) {
  const match = title.match(/^\s*(\d+)\./);
  return match ? `${match[1]}.` : '•';
}

/* ── Helpers ─────────────────────────────────────────── */
function getCurrentPageId() {
  return Progress.getCurrentPageId();
}

function getRelativePath(url) {
  const depth = (window.location.pathname.match(/\//g) || []).length;
  const isInPages = window.location.pathname.includes('/pages/');
  if (isInPages) {
    if (url === 'index.html') return '../index.html';
    if (url.startsWith('pages/')) return url.replace('pages/', '');
    return url;
  }
  return url;
}

/* ── Back to Top ─────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
}

/* ── Breadcrumbs ─────────────────────────────────────── */
function buildBreadcrumbs() {
  const bc = document.getElementById('breadcrumbs');
  if (!bc || typeof MODULES === 'undefined') return;

  const pageId = getCurrentPageId();
  const isInPages = window.location.pathname.includes('/pages/');

  if (pageId === 'home') {
    bc.innerHTML = '<span class="current">Início</span>';
    return;
  }

  const mod = MODULES.find(m => m.id === pageId);
  const homeHref = isInPages ? '../index.html' : 'index.html';
  let html = `<a href="${homeHref}">Início</a><span class="sep">›</span>`;
  if (mod) {
    html += `<span class="current">${mod.title}</span>`;
  } else if (typeof TOOL_PAGES !== 'undefined' && TOOL_PAGES[pageId]) {
    html += `<span class="current">${TOOL_PAGES[pageId].title}</span>`;
  } else {
    html += `<span class="current">Página</span>`;
  }
  bc.innerHTML = html;
}

function enhanceLearningUX() {
  buildHomeStudySections();
  decorateModulePage();
  document.addEventListener('rw:progress-change', () => {
    if (getCurrentPageId() === 'home') buildHomeStudySections();
  });
}

function buildHomeStudySections() {
  if (getCurrentPageId() !== 'home' || typeof Progress === 'undefined') return;
  const modulesSection = document.getElementById('modulos');
  if (!modulesSection) return;

  const dashboard = Progress.getStudyDashboard();
  injectStudyGoals(modulesSection);
  injectLearningDashboard(modulesSection, dashboard);
}

function injectStudyGoals(anchor) {
  if (typeof STUDY_GOALS === 'undefined') return;
  let section = document.getElementById('objetivos-estudo');
  if (!section) {
    section = document.createElement('section');
    section.className = 'home-section';
    section.id = 'objetivos-estudo';
    anchor.before(section);
  }

  section.innerHTML = `
    <h2>Estudar por objetivo</h2>
    <p>Escolha a trilha pelo que você quer alcançar, não só pela ordem dos módulos. Isso reduz estudo disperso e deixa a progressão mais clara.</p>
    <div class="study-goals-grid">
      ${STUDY_GOALS.map(goal => `
        <article class="study-goal-card">
          <div class="study-goal-kicker">Objetivo</div>
          <h3>${goal.title}</h3>
          <p>${goal.description}</p>
          ${renderGoalProgress(goal)}
          <div class="study-goal-tags">${goal.modules.map(moduleId => {
            const module = MODULES.find(item => item.id === moduleId);
            return `<span>${module ? `${module.num}. ${module.title}` : moduleId}</span>`;
          }).join('')}</div>
          <div class="study-goal-next">${renderGoalNextAction(goal)}</div>
        </article>
      `).join('')}
    </div>
  `;
}

function injectLearningDashboard(anchor, dashboard) {
  let section = document.getElementById('painel-aprendizagem');
  if (!section) {
    section = document.createElement('section');
    section.className = 'home-section';
    section.id = 'painel-aprendizagem';
    anchor.before(section);
  }

  const nextModule = dashboard.nextModule;
  const reviewQueue = dashboard.reviewQueue.slice(0, 5);
  const weakModules = dashboard.weakModules;
  const glossaryTop = dashboard.glossaryTop;
  const simulado = dashboard.simuladoHistory.at(-1);

  section.innerHTML = `
    <h2>Painel de Aprendizagem</h2>
    <p>Este painel usa apenas armazenamento local. Ele mostra onde você está avançando, onde revisar e qual é o próximo melhor passo na trilha.</p>
    <div class="learning-dashboard-grid">
      <article class="dashboard-card">
        <div class="dashboard-kicker">Próximo passo</div>
        <h3>${nextModule ? `${nextModule.num}. ${nextModule.title}` : 'Trilha concluída'}</h3>
        <p>${nextModule && MODULE_META?.[nextModule.id] ? `Pré-requisitos atendidos. Tempo sugerido: ${MODULE_META[nextModule.id].estTime}.` : 'Você completou todos os módulos principais disponíveis.'}</p>
        ${nextModule ? `<a class="dashboard-link" href="${nextModule.url}">Abrir módulo recomendado →</a>` : ''}
      </article>
      <article class="dashboard-card">
        <div class="dashboard-kicker">Fila de revisão</div>
        <h3>${reviewQueue.length ? `${reviewQueue.length} itens pendentes` : 'Nada crítico agora'}</h3>
        <ul class="dashboard-list">
          ${reviewQueue.length ? reviewQueue.map(item => `
            <li>
              <strong>${item.moduleTitle}</strong>
              <span>${item.label}</span>
            </li>
          `).join('') : '<li><strong>Bom sinal.</strong><span>Sem seções marcadas para revisão e sem flashcards vencidos.</span></li>'}
        </ul>
        <a class="dashboard-link" href="${getRelativePath('pages/revisao.html')}">Abrir central de revisão →</a>
      </article>
      <article class="dashboard-card">
        <div class="dashboard-kicker">Temas mais fracos</div>
        <h3>${weakModules.length ? 'Onde revisar primeiro' : 'Sem dados ainda'}</h3>
        <ul class="dashboard-list">
          ${weakModules.length ? weakModules.map(entry => `
            <li>
              <strong>${entry.module.num}. ${entry.module.title}</strong>
              <span>Aprendizagem ${entry.learning.pct}% • conclusão ${entry.completion.pct}%${entry.quiz.attempts ? ` • quiz médio ${entry.quiz.avgPct}%` : ''}</span>
            </li>
          `).join('') : '<li><strong>Estude um módulo.</strong><span>O sistema começa a recomendar revisão após progresso, quiz ou simulado.</span></li>'}
        </ul>
      </article>
      <article class="dashboard-card">
        <div class="dashboard-kicker">Uso real</div>
        <h3>${simulado ? `Último simulado: ${simulado.pct}%` : 'Sem simulado ainda'}</h3>
        <ul class="dashboard-list">
          <li>
            <strong>Termos consultados</strong>
            <span>${glossaryTop.length ? glossaryTop.map(([term]) => term).join(', ') : 'Nenhum termo consultado ainda'}</span>
          </li>
          <li>
            <strong>Páginas mais vistas</strong>
            <span>${formatTopPages(dashboard.pageViews)}</span>
          </li>
          <li>
            <strong>Buscas recentes</strong>
            <span>${dashboard.searches.length ? dashboard.searches.map(item => item.term).join(', ') : 'Nenhuma busca registrada ainda'}</span>
          </li>
        </ul>
      </article>
    </div>
  `;
}

function formatTopPages(pageViews) {
  const entries = Object.entries(pageViews || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (!entries.length) return 'Nenhuma página acessada ainda';
  return entries.map(([pageId, count]) => {
    const module = MODULES.find(item => item.id === pageId);
    const tool = typeof TOOL_PAGES !== 'undefined' ? TOOL_PAGES[pageId] : null;
    const label = pageId === 'home' ? 'Início' : (module?.title || tool?.title || pageId);
    return `${label} (${count})`;
  }).join(' • ');
}

function renderGoalProgress(goal) {
  const progress = typeof Progress !== 'undefined' ? Progress.getGoalProgress(goal.id) : null;
  if (!progress) return '';
  return `
    <div class="goal-progress-meta">
      <div class="goal-progress-top">
        <strong>${progress.pct}% concluído</strong>
        <span>${progress.completed}/${progress.total} módulos prontos</span>
      </div>
      <div class="goal-progress-bar"><div class="goal-progress-fill" style="width:${progress.pct}%"></div></div>
      <div class="goal-progress-copy">Faltam ${progress.remaining.length} módulo${progress.remaining.length === 1 ? '' : 's'} para essa trilha ficar pronta.</div>
    </div>
  `;
}

function renderGoalNextAction(goal) {
  const progress = typeof Progress !== 'undefined' ? Progress.getGoalProgress(goal.id) : null;
  if (!progress || !progress.remaining.length) return `${goal.nextAction} Trilha pronta para revisão e prática.`;
  const next = progress.remaining[0];
  return `${goal.nextAction} Próximo foco: ${next.num}. ${next.title}.`;
}

function decorateModulePage() {
  const pageId = getCurrentPageId();
  if (pageId === 'home' || typeof MODULE_META === 'undefined') return;

  const module = MODULES.find(item => item.id === pageId);
  const tool = typeof TOOL_PAGES !== 'undefined' ? TOOL_PAGES[pageId] : null;
  const main = document.querySelector('.article-wrapper');
  const header = main?.querySelector('.page-header');
  if (!main || !header) return;

  if (module && !main.querySelector('.page-meta-strip')) {
    const meta = MODULE_META[module.id] || {};
    const prerequisites = (meta.prerequisites || []).map(moduleId => MODULES.find(item => item.id === moduleId)).filter(Boolean);
    const nextModule = MODULES.find(item => item.num === module.num + 1) || null;
    const prevModule = MODULES.find(item => item.num === module.num - 1) || null;
    const readiness = typeof Progress !== 'undefined' ? Progress.getModuleReadiness(module.id) : null;

    header.insertAdjacentHTML('beforeend', `
      <div class="page-meta-strip">
        <span><strong>Nível:</strong> ${meta.difficulty || 'Base'}</span>
        <span><strong>Tempo:</strong> ${meta.estTime || '30-45 min'}</span>
        <span><strong>Pronto para:</strong> ${meta.goalTags?.slice(0, 2).join(' • ') || 'trilha-base'}</span>
      </div>
      ${readiness ? `
        <div class="page-readiness ${readiness.ready ? 'ready' : 'needs-review'}">
          <div class="page-learning-kicker">Pronto para avançar?</div>
          <h3>${readiness.label}</h3>
          <div class="page-readiness-grid">
            <span class="${readiness.checks.sectionsDone ? 'ok' : 'pending'}">Seções: ${readiness.completion.pct}%</span>
            <span class="${readiness.checks.quizReady ? 'ok' : 'pending'}">Quiz: ${readiness.quiz.attempts ? `${readiness.quiz.lastPct}%` : 'não feito'}</span>
            <span class="${readiness.checks.termsReviewed ? 'ok' : 'pending'}">Termos centrais: ${readiness.flashcards.total ? `${readiness.flashcards.pct}% revisados` : 'n/a'}</span>
          </div>
        </div>
      ` : ''}
      <div class="page-learning-panel">
        <div class="page-learning-card">
          <div class="page-learning-kicker">Pré-requisitos</div>
          <h3>O que convém saber antes</h3>
          <p>${prerequisites.length ? prerequisites.map(item => item.title).join(', ') : 'Nenhum. Este módulo pode ser estudado como ponto de partida.'}</p>
        </div>
        <div class="page-learning-card">
          <div class="page-learning-kicker">Ao final desta aula</div>
          <h3>Você já deve conseguir</h3>
          <ul>${(meta.outcomes || []).map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="page-learning-card">
          <div class="page-learning-kicker">Erros comuns</div>
          <h3>O que costuma travar iniciantes</h3>
          <ul>${(meta.commonGaps || []).map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="page-route-links">
        ${prevModule ? `<a href="${getRelativePath(prevModule.url)}">← Revisar ${prevModule.title}</a>` : '<span></span>'}
        ${nextModule ? `<a href="${getRelativePath(nextModule.url)}">Próximo módulo: ${nextModule.title} →</a>` : ''}
      </div>
    `);
  }

  if (!module && tool && !main.querySelector('.page-learning-panel')) {
    header.insertAdjacentHTML('beforeend', `
      <div class="page-meta-strip">
        <span><strong>Tipo:</strong> ferramenta de estudo</span>
        <span><strong>Uso ideal:</strong> diagnóstico e revisão</span>
      </div>
      <div class="page-learning-panel">
        <div class="page-learning-card">
          <div class="page-learning-kicker">Quando usar</div>
          <h3>${tool.title}</h3>
          <p>${tool.description}</p>
        </div>
        <div class="page-learning-card">
          <div class="page-learning-kicker">Conecta com</div>
          <h3>Módulos relacionados</h3>
          <ul>${tool.relatedModules.map(moduleId => {
            const related = MODULES.find(item => item.id === moduleId);
            return related ? `<li><a href="${getRelativePath(related.url)}">${related.title}</a></li>` : '';
          }).join('')}</ul>
        </div>
      </div>
    `);
  }
}
