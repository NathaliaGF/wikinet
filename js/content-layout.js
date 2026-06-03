/* ── RedesWiki: Content Layout — Accordion + Rail ─── */
'use strict';

(() => {
  const TOPBAR_H = 56;

  const CARD_LABELS = {
    'concept-card':           '📖 Conceito principal',
    'why-it-matters-card':    '🎯 Por que isso importa',
    'analogy-card':           '💡 Analogia',
    'technical-view-card':    '⚙️ Visão técnica',
    'common-mistake-card':    '⚠️ Erro comum',
    'mental-flow-card':       '🔄 Fluxo mental',
    'cyber-connection-card':  '🔗 Conexão com cyber',
    'quick-quiz-card':        '✍️ Teste rápido',
    'explain-own-words-card': '💬 Explique com suas palavras',
    'final-review-card':      '📌 Revisão final'
  };

  function getCardLabel(classList) {
    for (const cls of classList) {
      if (CARD_LABELS[cls]) return CARD_LABELS[cls];
    }
    if (classList.contains('bloco-explicacao')) return '📖 Conceito';
    if (classList.contains('bloco-analogia'))   return '💡 Analogia';
    if (classList.contains('bloco-exemplo'))    return '🎯 Exemplo';
    if (classList.contains('bloco-resumo'))     return '📌 Resumo';
    if (classList.contains('bloco-memorizar'))  return '🔑 Para fixar';
    if (classList.contains('bloco-erros'))      return '⚠️ Erro comum';
    if (classList.contains('bloco-revisao'))    return '📋 Revisão';
    return '📄 Conteúdo';
  }

  function isModulePage() {
    return !!document.querySelector(
      '.article-wrapper .section .bloco-explicacao, ' +
      '.article-wrapper .section .bloco-analogia, ' +
      '.article-wrapper .section .ped-grid'
    );
  }

  function getModuleId() {
    const m = window.location.pathname.match(/\/([^/]+)\.html/);
    return m ? m[1] : null;
  }

  /* ── 1. Accordion: ped-grid cards ────────────────── */
  function initAccordion() {
    document.querySelectorAll('.ped-grid [class*="bloco-"]').forEach(block => {
      const isMain = block.classList.contains('bloco-explicacao');
      wrapGridCard(block, !isMain);
    });
  }

  function wrapGridCard(block, startCollapsed) {
    const label = getCardLabel(block.classList);
    const existingKicker = block.querySelector('.card-kicker');
    const existingTitle  = block.querySelector('.card-title');

    /* Toggle header */
    const header = document.createElement('div');
    header.className = 'cl-toggle';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', String(!startCollapsed));

    const labelSpan = document.createElement('span');
    labelSpan.className = 'cl-toggle-label';
    labelSpan.textContent = label;
    header.appendChild(labelSpan);

    if (existingTitle) {
      existingTitle.className += ' cl-toggle-title';
      header.appendChild(existingTitle);
    }

    const chevron = document.createElement('span');
    chevron.className = 'cl-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    header.appendChild(chevron);

    if (existingKicker) existingKicker.remove();

    /* Body: remaining content */
    const body = document.createElement('div');
    body.className = 'cl-body';
    [...block.children].forEach(child => body.appendChild(child));

    block.appendChild(header);
    block.appendChild(body);
    if (startCollapsed) block.classList.add('cl-collapsed');

    const toggle = () => {
      const collapsed = block.classList.toggle('cl-collapsed');
      header.setAttribute('aria-expanded', String(!collapsed));
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }

  /* ── 2. Left section trail ───────────────────────── */
  function buildTrail() {
    const sections = Array.from(
      document.querySelectorAll('.article-wrapper .section[id]')
    );
    if (sections.length < 2) return null;

    const nav = document.createElement('nav');
    nav.className = 'cl-trail';
    nav.setAttribute('aria-label', 'Seções do módulo');

    nav.innerHTML = sections.map((s, i) => {
      const h = s.querySelector('h2');
      const raw = h ? h.textContent.trim() : `Seção ${i + 1}`;
      const label = raw.replace(/^\d+\.\s*/, '').slice(0, 34);
      return `<a class="cl-trail-item" href="#${s.id}" data-sid="${s.id}">
        <span class="cl-trail-num">${i + 1}</span>
        <span class="cl-trail-lbl">${label}</span>
      </a>`;
    }).join('');

    const items = nav.querySelectorAll('.cl-trail-item');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const link = nav.querySelector(`[data-sid="${e.target.id}"]`);
        if (link) link.classList.toggle('active', e.isIntersecting);
      });
    }, { threshold: 0.25, rootMargin: '-5% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));

    return nav;
  }

  /* ── 3. Right sidebar ────────────────────────────── */
  function buildSidebar(moduleId) {
    const meta     = typeof MODULE_META !== 'undefined' ? MODULE_META[moduleId] : null;
    const sections = Array.from(
      document.querySelectorAll('.article-wrapper .section[id]')
    );

    const aside = document.createElement('aside');
    aside.className = 'cl-sidebar';
    aside.setAttribute('aria-label', 'Painel de estudo');

    /* Section anchors */
    if (sections.length) {
      const items = sections.map((s, i) => {
        const h   = s.querySelector('h2');
        const raw = h ? h.textContent.trim() : s.id;
        const lbl = raw.replace(/^\d+\.\s*/, '').slice(0, 38);
        return `<li class="cl-sb-item" data-sid="${s.id}">
          <span class="cl-sb-dot"></span>
          <a href="#${s.id}">${lbl}</a>
        </li>`;
      }).join('');

      aside.innerHTML += `
        <div class="cl-sb-card">
          <div class="cl-sb-kicker">Nesta página</div>
          <ul class="cl-sb-list">${items}</ul>
        </div>`;
    }

    /* Learning outcomes */
    if (meta?.outcomes?.length) {
      const list = meta.outcomes
        .map(o => `<li>${o}</li>`)
        .join('');
      aside.innerHTML += `
        <div class="cl-sb-card">
          <div class="cl-sb-kicker">Você vai aprender</div>
          <ul class="cl-sb-outcomes">${list}</ul>
        </div>`;
    }

    /* Meta chips */
    if (meta?.difficulty || meta?.estTime) {
      aside.innerHTML += `
        <div class="cl-sb-chips">
          ${meta.estTime   ? `<span class="cl-sb-chip">⏱ ${meta.estTime}</span>` : ''}
          ${meta.difficulty ? `<span class="cl-sb-chip">📊 ${meta.difficulty}</span>` : ''}
        </div>`;
    }

    /* Progress */
    aside.innerHTML += `
      <div class="cl-sb-card">
        <div class="cl-sb-kicker">Progresso do módulo</div>
        <div class="cl-sb-prog"><div class="cl-sb-prog-fill" id="clProgFill"></div></div>
        <div class="cl-sb-prog-pct" id="clProgPct">0%</div>
      </div>`;

    /* Scroll-track sidebar anchors */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const item = aside.querySelector(`[data-sid="${e.target.id}"]`);
        if (item) item.classList.toggle('active', e.isIntersecting);
      });
    }, { threshold: 0.25, rootMargin: '-5% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));

    /* Live progress */
    function updateProgress() {
      if (typeof Progress === 'undefined' || !Progress.getModuleCompletion) return;
      const c = Progress.getModuleCompletion(moduleId);
      if (!c) return;
      const fill = document.getElementById('clProgFill');
      const pct  = document.getElementById('clProgPct');
      if (fill) fill.style.width = `${c.pct}%`;
      if (pct)  pct.textContent  = `${c.pct}%`;

      document.querySelectorAll('.section-check.checked').forEach(el => {
        const sid  = el.dataset.section;
        const item = aside.querySelector(`[data-sid="${sid}"]`);
        if (item) item.classList.add('done');
      });
    }
    setTimeout(updateProgress, 400);
    document.addEventListener('progress-changed', updateProgress);

    return aside;
  }

  /* ── 4. Assemble 3-column grid ───────────────────── */
  function buildGrid(moduleId) {
    const article = document.querySelector('.article-wrapper');
    if (!article) return;

    const trail   = buildTrail();
    const sidebar = buildSidebar(moduleId);

    const grid = document.createElement('div');
    grid.className = 'cl-grid';
    article.parentNode.insertBefore(grid, article);

    if (trail)   grid.appendChild(trail);
    grid.appendChild(article);
    if (sidebar) grid.appendChild(sidebar);
  }

  /* ── Init ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    if (!isModulePage()) return;
    const moduleId = getModuleId();
    document.body.classList.add('cl-active');
    initAccordion();
    buildGrid(moduleId);
  });
})();
