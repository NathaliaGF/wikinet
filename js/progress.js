/* ── RedesWiki — Progress & Favorites ────────────────── */
'use strict';

const Progress = (() => {
  const KEY_PROGRESS = 'rw-progress';
  const KEY_FAVS     = 'rw-favorites';

  /* ── State ─────────────────────────────────────────── */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY_PROGRESS)) || {}; }
    catch { return {}; }
  }

  function save(data) {
    localStorage.setItem(KEY_PROGRESS, JSON.stringify(data));
  }

  function loadFavs() {
    try { return JSON.parse(localStorage.getItem(KEY_FAVS)) || []; }
    catch { return []; }
  }

  function saveFavs(favs) {
    localStorage.setItem(KEY_FAVS, JSON.stringify(favs));
  }

  /* ── Checkboxes ─────────────────────────────────────── */
  function initCheckboxes() {
    const checks = document.querySelectorAll('.section-check');
    const data = load();
    const pageId = getPageId();

    checks.forEach(label => {
      const sectionId = label.dataset.section;
      const key = `${pageId}:${sectionId}`;
      const checked = !!data[key];
      label.classList.toggle('checked', checked);
      const span = label.querySelector('.check-text');
      if (span) span.textContent = checked ? '✓ Estudado' : 'Marcar como estudado';

      label.addEventListener('click', () => {
        const newState = !data[key];
        data[key] = newState;
        save(data);
        label.classList.toggle('checked', newState);
        if (span) span.textContent = newState ? '✓ Estudado' : 'Marcar como estudado';
        updateModuleProgress();
        updateGlobalProgress();
        updateSidebarProgress();
      });
    });
  }

  /* ── Module progress bar ────────────────────────────── */
  function updateModuleProgress() {
    const fill = document.getElementById('mpFill');
    const pct  = document.getElementById('mpPct');
    if (!fill && !pct) return;

    const data    = load();
    const pageId  = getPageId();
    const checks  = document.querySelectorAll('.section-check');
    if (checks.length === 0) return;

    let done = 0;
    checks.forEach(label => {
      const key = `${pageId}:${label.dataset.section}`;
      if (data[key]) done++;
    });

    const percent = Math.round((done / checks.length) * 100);
    if (fill) fill.style.width = percent + '%';
    if (pct)  pct.textContent  = percent + '%';
  }

  /* ── Global progress (homepage) ────────────────────── */
  function updateGlobalProgress() {
    const fill   = document.getElementById('gpFill');
    const pctEl  = document.getElementById('gpPct');
    const dotsEl = document.getElementById('gpModules');
    if (!fill && !pctEl) return;

    if (typeof MODULES === 'undefined') return;
    const data = load();

    let totalSections = 0;
    let doneSections  = 0;

    MODULES.forEach(m => {
      m.sections.forEach(sec => {
        totalSections++;
        if (data[`${m.id}:${sec}`]) doneSections++;
      });
    });

    const percent = totalSections > 0 ? Math.round((doneSections / totalSections) * 100) : 0;
    if (fill) fill.style.width = percent + '%';
    if (pctEl) pctEl.textContent = percent + '%';

    if (dotsEl) {
      dotsEl.innerHTML = MODULES.map(m => {
        let modDone = 0;
        m.sections.forEach(sec => { if (data[`${m.id}:${sec}`]) modDone++; });
        const done = modDone === m.sections.length && m.sections.length > 0;
        return `<span class="gp-module-dot ${done ? 'done' : ''}" title="${m.title}">${m.num}. ${m.title.split(' ')[0]}</span>`;
      }).join('');
    }

    // Module cards on homepage
    MODULES.forEach(m => {
      const cardFill = document.getElementById(`mc-fill-${m.id}`);
      const cardPct  = document.getElementById(`mc-pct-${m.id}`);
      if (!cardFill && !cardPct) return;
      let modDone = 0;
      m.sections.forEach(sec => { if (data[`${m.id}:${sec}`]) modDone++; });
      const p = m.sections.length > 0 ? Math.round((modDone / m.sections.length) * 100) : 0;
      if (cardFill) cardFill.style.width = p + '%';
      if (cardPct)  cardPct.textContent  = p + '%';
    });
  }

  function updateSidebarProgress() {
    const fill = document.getElementById('spFill');
    const pct  = document.getElementById('spPct');
    if (!fill && !pct) return;
    if (typeof MODULES === 'undefined') return;

    const data = load();
    let total = 0, done = 0;
    MODULES.forEach(m => {
      m.sections.forEach(sec => {
        total++;
        if (data[`${m.id}:${sec}`]) done++;
      });
    });

    const p = total > 0 ? Math.round((done / total) * 100) : 0;
    if (fill) fill.style.width = p + '%';
    if (pct)  pct.textContent  = p + '%';
  }

  /* ── Favorites ──────────────────────────────────────── */
  function initFavButtons() {
    const favs = loadFavs();

    document.querySelectorAll('.fav-btn').forEach(btn => {
      const id    = btn.dataset.favId;
      const title = btn.dataset.favTitle;
      const page  = btn.dataset.favPage;

      const isFav = favs.some(f => f.id === id);
      btn.classList.toggle('active', isFav);
      btn.title = isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';

      btn.addEventListener('click', () => {
        const favs2 = loadFavs();
        const idx = favs2.findIndex(f => f.id === id);
        if (idx === -1) {
          favs2.push({ id, title, page });
          btn.classList.add('active');
          btn.title = 'Remover dos favoritos';
        } else {
          favs2.splice(idx, 1);
          btn.classList.remove('active');
          btn.title = 'Adicionar aos favoritos';
        }
        saveFavs(favs2);
      });
    });
  }

  /* ── Favorites display (homepage section) ─────────── */
  function renderFavorites() {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;
    const favs = loadFavs();

    if (favs.length === 0) {
      container.innerHTML = `
        <div class="fav-empty">
          <div class="fav-empty-icon">⭐</div>
          <p>Nenhum favorito ainda. Clique na estrela em qualquer seção para salvar aqui.</p>
        </div>`;
      return;
    }

    container.innerHTML = `<div class="fav-list">${favs.map(f => `
      <div class="fav-item">
        <div class="fav-item-info">
          <div class="fav-item-title">${f.title}</div>
          <div class="fav-item-path">${f.page}</div>
        </div>
        <button class="fav-item-remove" data-fav-id="${f.id}">Remover</button>
      </div>
    `).join('')}</div>`;

    container.querySelectorAll('.fav-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = loadFavs();
        const updated = current.filter(f => f.id !== btn.dataset.favId);
        saveFavs(updated);
        renderFavorites();
      });
    });
  }

  /* ── Reset ──────────────────────────────────────────── */
  function initReset() {
    const btn = document.getElementById('resetProgress');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!confirm('Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita.')) return;
      localStorage.removeItem(KEY_PROGRESS);
      document.querySelectorAll('.section-check').forEach(el => {
        el.classList.remove('checked');
        const span = el.querySelector('.check-text');
        if (span) span.textContent = 'Marcar como estudado';
      });
      updateModuleProgress();
      updateGlobalProgress();
      updateSidebarProgress();
    });
  }

  /* ── Init ───────────────────────────────────────────── */
  function init() {
    initCheckboxes();
    updateModuleProgress();
    updateGlobalProgress();
    updateSidebarProgress();
    initFavButtons();
    renderFavorites();
    initReset();
  }

  function getPageId() {
    const path = window.location.pathname;
    const match = path.match(/\/([^\/]+)\.html$/);
    if (!match) return 'home';
    const raw = decodeURIComponent(match[1]);
    if (raw === 'endereçamento') return 'enderecamento';
    if (raw === 'segurança')     return 'seguranca';
    return raw;
  }

  return { init, updateGlobalProgress, updateSidebarProgress };
})();
