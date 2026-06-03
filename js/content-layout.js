/* ── RedesWiki: Content Layout ─────────────────────── */
'use strict';

(() => {
  const CARD_CFG = {
    'concept-card':           { label: 'Conceito principal',        icon: '🌐', bg: 'rgba(79,142,247,.18)',  dot: '#4f8ef7' },
    'why-it-matters-card':    { label: 'Por que importa',           icon: '🛡️', bg: 'rgba(99,102,241,.18)', dot: '#6366f1' },
    'analogy-card':           { label: 'Analogia',                  icon: '📊', bg: 'rgba(20,184,166,.18)', dot: '#14b8a6' },
    'technical-view-card':    { label: 'Visão técnica',             icon: '⚙️', bg: 'rgba(148,163,184,.18)',dot: '#94a3b8' },
    'common-mistake-card':    { label: 'Erros Comuns',                icon: '⚠️', bg: 'rgba(245,158,11,.18)', dot: '#f59e0b' },
    'mental-flow-card':       { label: 'Fluxo mental',              icon: '🔄', bg: 'rgba(245,158,11,.18)', dot: '#f59e0b' },
    'cyber-connection-card':  { label: 'Conexão com cyber',         icon: '🔒', bg: 'rgba(79,142,247,.22)', dot: '#4f8ef7' },
    'quick-quiz-card':        { label: 'Teste rápido',              icon: '✏️', bg: 'rgba(139,92,246,.18)', dot: '#8b5cf6' },
    'explain-own-words-card': { label: 'Explique com suas palavras',icon: '💬', bg: 'rgba(139,92,246,.18)', dot: '#8b5cf6' },
    'final-review-card':      { label: 'Revisão final',             icon: '📋', bg: 'rgba(16,185,129,.18)', dot: '#10b981' },
  };
  const BLOCO_CFG = {
    'bloco-explicacao': { label: 'Conceito',   icon: '📖', bg: 'rgba(79,142,247,.18)',  dot: '#4f8ef7' },
    'bloco-analogia':   { label: 'Analogia',   icon: '💡', bg: 'rgba(20,184,166,.18)', dot: '#14b8a6' },
    'bloco-exemplo':    { label: 'Exemplo',    icon: '📦', bg: 'rgba(245,158,11,.18)', dot: '#f59e0b' },
    'bloco-resumo':     { label: 'Resumo',     icon: '📌', bg: 'rgba(139,92,246,.18)', dot: '#8b5cf6' },
    'bloco-memorizar':  { label: 'Para fixar', icon: '🔑', bg: 'rgba(245,158,11,.18)', dot: '#f59e0b' },
    'bloco-erros':      { label: 'Erros Comuns', icon: '⚠️', bg: 'rgba(239,68,68,.18)',  dot: '#ef4444' },
    'bloco-revisao':    { label: 'Revisão',    icon: '📋', bg: 'rgba(16,185,129,.18)', dot: '#10b981' },
  };

  function getCfg(el) {
    for (const [k, v] of Object.entries(CARD_CFG)) {
      if (el.classList.contains(k)) return v;
    }
    for (const [k, v] of Object.entries(BLOCO_CFG)) {
      if (el.classList.contains(k)) return v;
    }
    return { label: 'Conteúdo', icon: '📄', bg: 'rgba(107,114,128,.18)', dot: '#6b7280' };
  }

  function isModulePage() {
    return !!document.querySelector('.article-wrapper .section .ped-grid');
  }

  function getModuleId() {
    const m = window.location.pathname.match(/\/([^/]+)\.html/);
    return m ? m[1] : null;
  }

  /* ── 1. Accordion (non-concept ped-grid cards) ──── */
  function initAccordion() {
    document.querySelectorAll('.ped-grid [class*="bloco-"]').forEach(block => {
      if (block.classList.contains('concept-card')) {
        /* Upgrade dev kicker to a proper badge */
        const kicker = block.querySelector('.card-kicker');
        if (kicker) { kicker.textContent = '📖 Conceito principal'; kicker.className = 'cl-concept-badge'; }
        return;
      }
      makeAccordion(block);
    });
  }

  function makeAccordion(block) {
    const cfg = getCfg(block);
    block.querySelector('.card-kicker')?.remove();

    const hdr = document.createElement('div');
    hdr.className = 'cl-acc-hdr';
    hdr.setAttribute('role', 'button');
    hdr.setAttribute('tabindex', '0');
    hdr.setAttribute('aria-expanded', 'false');

    const ico = document.createElement('span');
    ico.className = 'cl-acc-ico';
    ico.textContent = cfg.icon;
    ico.style.background = cfg.bg;

    const lbl = document.createElement('span');
    lbl.className = 'cl-acc-lbl';
    lbl.textContent = cfg.label;

    const chv = document.createElement('span');
    chv.className = 'cl-acc-chv';
    chv.setAttribute('aria-hidden', 'true');

    hdr.appendChild(ico);
    hdr.appendChild(lbl);
    hdr.appendChild(chv);

    const body = document.createElement('div');
    body.className = 'cl-acc-body';
    [...block.children].forEach(c => body.appendChild(c));

    block.classList.add('cl-acc', 'cl-acc-closed');
    block.appendChild(hdr);
    block.appendChild(body);

    const toggle = () => {
      const closed = block.classList.toggle('cl-acc-closed');
      hdr.setAttribute('aria-expanded', String(!closed));
    };
    hdr.addEventListener('click', toggle);
    hdr.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }

  /* ── 2. Right sidebar ───────────────────────────── */
  function buildSidebar(moduleId) {
    const sections = Array.from(
      document.querySelectorAll('.article-wrapper .section[id]')
    );

    const aside = document.createElement('aside');
    aside.className = 'cl-sidebar';
    aside.setAttribute('aria-label', 'Painel de estudo');
    aside.innerHTML = `
      <div class="cl-sb-box">
        <span class="cl-sb-kicker">Nesta seção</span>
        <ul class="cl-sb-list" id="clCardList"></ul>
      </div>
      <div class="cl-sb-cyber" id="clCyberBox">
        <span class="cl-sb-cyber-ico">🔒</span>
        <div>
          <div class="cl-sb-cyber-title" id="clCyberTitle"></div>
          <div class="cl-sb-cyber-desc"  id="clCyberDesc"></div>
        </div>
      </div>
      <div class="cl-sb-box">
        <div class="cl-sb-prog-row">
          <span class="cl-sb-kicker">Progresso do módulo</span>
          <span class="cl-sb-prog-pct" id="clPct">0%</span>
        </div>
        <div class="cl-sb-prog-track">
          <div class="cl-sb-prog-fill" id="clFill"></div>
        </div>
      </div>`;

    /* Use refs inside aside (not in DOM yet) */
    const elList  = aside.querySelector('#clCardList');
    const elCyber = aside.querySelector('#clCyberBox');
    const elCT    = aside.querySelector('#clCyberTitle');
    const elCD    = aside.querySelector('#clCyberDesc');
    const elFill  = aside.querySelector('#clFill');
    const elPct   = aside.querySelector('#clPct');

    function syncSec(section) {
      if (elList) {
        const cards = section.querySelectorAll('.ped-grid [class*="bloco-"]');
        elList.innerHTML = [...cards].map(c => {
          const cfg = getCfg(c);
          return `<li class="cl-sb-item">
            <span class="cl-sb-dot" style="background:${cfg.dot}"></span>
            <span>${cfg.label}</span>
          </li>`;
        }).join('');
      }

      const cyberCard = section.querySelector('.cyber-connection-card');
      if (elCyber) {
        if (cyberCard) {
          const title = cyberCard.querySelector('.card-title')?.textContent.trim() || 'Conexão com cyber';
          const desc  = cyberCard.querySelector('p')?.textContent.trim() || '';
          if (elCT) elCT.textContent = title;
          if (elCD) elCD.textContent = desc.length > 88 ? desc.slice(0, 86) + '…' : desc;
          elCyber.classList.add('cl-sb-cyber-on');
        } else {
          elCyber.classList.remove('cl-sb-cyber-on');
        }
      }
    }

    function syncProg() {
      if (typeof Progress === 'undefined' || !Progress.getModuleCompletion) return;
      const c = Progress.getModuleCompletion(moduleId);
      if (!c) return;
      if (elFill) elFill.style.width = `${c.pct}%`;
      if (elPct)  elPct.textContent  = `${c.pct}%`;
    }

    if (sections.length) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) syncSec(e.target); });
      }, { threshold: 0.15, rootMargin: '-5% 0px -55% 0px' });
      sections.forEach(s => obs.observe(s));
      syncSec(sections[0]);
    }

    setTimeout(syncProg, 400);
    document.addEventListener('progress-changed', syncProg);
    return aside;
  }

  /* ── 3. 2-column layout wrapper ─────────────────── */
  function buildLayout(moduleId) {
    const article = document.querySelector('.article-wrapper');
    if (!article) return;
    const sidebar = buildSidebar(moduleId);
    const wrap = document.createElement('div');
    wrap.className = 'cl-layout';
    article.parentNode.insertBefore(wrap, article);
    wrap.appendChild(article);
    wrap.appendChild(sidebar);
  }

  /* ── Init ─────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    if (!isModulePage()) return;
    document.body.classList.add('cl-active');
    initAccordion();
    buildLayout(getModuleId());
  });
})();
