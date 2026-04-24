/* ── RedesWiki — Glossário com tooltips ──────────────── */
'use strict';

const Glossary = (() => {
  let tipEl = null;
  let drawerEl = null;
  let hideTimer = null;

  function init() {
    if (typeof GLOSSARY === 'undefined') return;
    const article = document.querySelector('.article-wrapper');
    if (!article) return;

    // Build sorted terms (longest first to avoid partial matches)
    const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
    injectTooltips(article, terms);
    createTooltipEl();
    createDrawerEl();
  }

  function injectTooltips(root, terms) {
    // Walk only text nodes inside p, li, td — skip code, pre, h1-h6, .bloco-header
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (['CODE','PRE','H1','H2','H3','H4','H5','H6','SCRIPT','STYLE'].includes(tag))
          return NodeFilter.FILTER_REJECT;
        if (p.classList.contains('bloco-header') || p.classList.contains('glossary-term'))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    // Track which term was already matched in this text node (prevent double-wrap)
    nodes.forEach(textNode => {
      let html = escapeHTML(textNode.textContent);
      const used = new Set();

      terms.forEach(term => {
        if (used.has(term.toLowerCase())) return;
        // Match whole word, case-insensitive, but not inside already-wrapped spans
        const re = new RegExp(`(?<![\\w>])${escapeRegex(term)}(?![\\w<])`, 'i');
        if (re.test(html) && !html.includes(`data-term="${term.toLowerCase()}"`)) {
          html = html.replace(re, match => {
            used.add(term.toLowerCase());
            return `<span class="glossary-term" data-term="${term.toLowerCase()}" tabindex="0">${match}</span>`;
          });
        }
      });

      if (html !== escapeHTML(textNode.textContent)) {
        const span = document.createElement('span');
        span.innerHTML = html;
        textNode.parentNode.replaceChild(span, textNode);
      }
    });

    // Add events
    document.querySelectorAll('.glossary-term').forEach(el => {
      el.addEventListener('mouseenter', showTip);
      el.addEventListener('mouseleave', hideTip);
      el.addEventListener('focus', showTip);
      el.addEventListener('blur', hideTip);
      el.addEventListener('click', e => {
        showTip(e);
        openTerm(e.currentTarget.dataset.term);
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTerm(e.currentTarget.dataset.term);
        }
      });
    });
  }

  function createTooltipEl() {
    tipEl = document.createElement('div');
    tipEl.className = 'glossary-tooltip';
    tipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(tipEl);
    tipEl.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    tipEl.addEventListener('mouseleave', hideTip);
  }

  function createDrawerEl() {
    if (drawerEl) return;
    drawerEl = document.createElement('aside');
    drawerEl.className = 'glossary-drawer';
    drawerEl.setAttribute('aria-hidden', 'true');
    drawerEl.innerHTML = `
      <button class="glossary-drawer-close" type="button" aria-label="Fechar glossário">✕</button>
      <div class="glossary-drawer-content"></div>
    `;
    document.body.appendChild(drawerEl);
    drawerEl.querySelector('.glossary-drawer-close')?.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  function showTip(e) {
    clearTimeout(hideTimer);
    const term    = e.currentTarget.dataset.term;
    const defEntry = getEntry(term);
    const def = typeof defEntry === 'string' ? defEntry : defEntry?.def || '';
    if (!def || !tipEl) return;

    tipEl.innerHTML = `<span class="gt-term">${e.currentTarget.textContent}</span><span class="gt-def">${def}</span>`;
    tipEl.classList.add('visible');
    positionTip(e.currentTarget);
  }

  function hideTip() {
    hideTimer = setTimeout(() => {
      if (tipEl) tipEl.classList.remove('visible');
    }, 150);
  }

  function positionTip(el) {
    if (!tipEl) return;
    const rect = el.getBoundingClientRect();
    const tipW = 280;
    let left   = rect.left + window.scrollX;
    let top    = rect.bottom + window.scrollY + 6;

    if (left + tipW > window.innerWidth - 16)
      left = window.innerWidth - tipW - 16;
    if (left < 8) left = 8;

    tipEl.style.left = left + 'px';
    tipEl.style.top  = top + 'px';
  }

  function openTerm(term) {
    if (!drawerEl) createDrawerEl();
    const entry = getEntry(term);
    if (!entry || !drawerEl) return;
    const prettyTerm = Object.keys(GLOSSARY).find(key => key.toLowerCase() === term.toLowerCase()) || term;
    const definition = typeof entry === 'string' ? entry : entry.def || '';
    const relatedModules = findRelatedModules(prettyTerm, definition);
    const relatedSections = findRelatedSections(prettyTerm);
    const content = drawerEl.querySelector('.glossary-drawer-content');
    if (!content) return;

    content.innerHTML = `
      <div class="glossary-drawer-kicker">Glossário contextual</div>
      <h3>${prettyTerm}</h3>
      <p>${definition}</p>
      <div class="glossary-drawer-block">
        <strong>Onde isso aparece</strong>
        <ul>
          ${relatedModules.length ? relatedModules.map(module => `<li><a href="${resolveModuleHref(module.url)}">${module.title}</a></li>`).join('') : '<li>Este termo aparece de forma distribuída em vários módulos.</li>'}
        </ul>
      </div>
      <div class="glossary-drawer-block">
        <strong>Seções mais ligadas ao termo</strong>
        <ul>
          ${relatedSections.length ? relatedSections.map(section => `<li>${section}</li>`).join('') : '<li>Use a busca lateral para encontrar exemplos adicionais.</li>'}
        </ul>
      </div>
      <div class="glossary-drawer-block">
        <strong>Como revisar rápido</strong>
        <p>Explique este termo sem ler a definição. Depois confira se você conseguiu dizer o que é, como funciona, por que importa e onde aparece em cyber.</p>
      </div>
    `;
    drawerEl.classList.add('visible');
    drawerEl.setAttribute('aria-hidden', 'false');
    if (typeof Progress !== 'undefined') Progress.recordGlossaryLookup(prettyTerm);
  }

  function closeDrawer() {
    if (!drawerEl) return;
    drawerEl.classList.remove('visible');
    drawerEl.setAttribute('aria-hidden', 'true');
  }

  function getEntry(term) {
    return GLOSSARY[Object.keys(GLOSSARY).find(k => k.toLowerCase() === term.toLowerCase())];
  }

  function findRelatedModules(term, definition) {
    if (typeof MODULES === 'undefined') return [];
    const normalized = `${term} ${definition}`.toLowerCase();
    return MODULES.filter(module => {
      const haystack = `${module.title} ${module.description} ${(module.navTopics || []).map(topic => topic.title).join(' ')}`.toLowerCase();
      return haystack.includes(term.toLowerCase()) || normalized.includes(module.id);
    }).slice(0, 4);
  }

  function findRelatedSections(term) {
    return Array.from(document.querySelectorAll('.section h2, .section h3'))
      .map(heading => heading.textContent.trim())
      .filter(text => text.toLowerCase().includes(term.toLowerCase()))
      .slice(0, 4);
  }

  function resolveModuleHref(url) {
    if (window.location.pathname.includes('/pages/')) return url.replace(/^pages\//, '');
    return url;
  }

  function escapeHTML(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  }

  return { init, openTerm };
})();
