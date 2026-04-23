/* ── RedesWiki — App initialization ──────────────────── */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  buildSidebar();
  initBackToTop();
  buildBreadcrumbs();
  Progress.init();
  Interactive.init();
  Navigation.init();
});

/* ── Theme ───────────────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('rw-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeToggle(saved);

  document.addEventListener('click', e => {
    const btn = e.target.closest('.theme-toggle');
    if (!btn) return;
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('rw-theme', next);
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
            <a href="${getRelativePath('index.html')}" class="${currentPage === 'home' ? 'active' : ''}">
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
        <div class="nav-section-header" data-target="navModulesList">
          <span class="nav-section-title">Módulos</span>
          <i class="nav-chevron">▾</i>
        </div>
        <ul class="nav-items" id="navModulesList">
          ${MODULES.map(m => `
            <li class="nav-item">
              <a href="${getRelativePath(m.url)}" class="${currentPage === m.id ? 'active' : ''}" data-module="${m.id}">
                <span class="nav-icon">${m.icon}</span>
                <span>${m.num}. ${m.title}</span>
              </a>
            </li>
          `).join('')}
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

  // Collapse/expand modules section
  sidebar.querySelectorAll('.nav-section-header').forEach(header => {
    header.addEventListener('click', () => {
      const section = header.closest('.nav-section');
      section.classList.toggle('collapsed');
    });
  });

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

/* ── Helpers ─────────────────────────────────────────── */
function getCurrentPageId() {
  const path = window.location.pathname;
  if (path.endsWith('index.html') || path.endsWith('/') || path === '') return 'home';
  const match = path.match(/\/([^\/]+)\.html$/);
  if (!match) return 'home';
  const name = decodeURIComponent(match[1]);
  if (name === 'endereçamento' || name === 'endere%C3%A7amento') return 'enderecamento';
  if (name === 'segurança'     || name === 'seguran%C3%A7a')     return 'seguranca';
  return name;
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
  } else {
    html += `<span class="current">Página</span>`;
  }
  bc.innerHTML = html;
}
