/* ── RedesWiki — Progress, Learning State & Analytics ─ */
'use strict';

const StorageHub = window.StorageHub || (() => {
  const KEYS = {
    progress: 'rw-progress',
    favorites: 'rw-favorites',
    sectionState: 'rw-section-state',
    analytics: 'rw-analytics',
    quizInsights: 'rw-quiz-insights',
    simHistory: 'rw-simulado-history',
    exerciseHistory: 'rw-exercise-history',
    quizHistory: 'rw-quiz-history',
    sm2: 'rw-sm2',
    theme: 'rw-theme',
    notes: 'rw-notes'
  };

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  return { KEYS, loadJson, saveJson, remove };
})();

window.StorageHub = StorageHub;

const Progress = (() => {
  const {
    progress: KEY_PROGRESS,
    favorites: KEY_FAVS,
    sectionState: KEY_SECTION_STATE,
    analytics: KEY_ANALYTICS,
    quizInsights: KEY_QUIZ,
    simHistory: KEY_SIM,
    exerciseHistory: KEY_EXERCISE
  } = StorageHub.KEYS;

  const SECTION_STATES = ['lido', 'entendido', 'revisar'];
  const SECTION_STATE_LABELS = {
    lido: 'Lido',
    entendido: 'Entendi',
    revisar: 'Revisar'
  };

  function loadJson(key, fallback) {
    return StorageHub.loadJson(key, fallback);
  }

  function saveJson(key, value) {
    StorageHub.saveJson(key, value);
  }

  function load() {
    return loadJson(KEY_PROGRESS, {});
  }

  function save(data) {
    saveJson(KEY_PROGRESS, data);
  }

  function loadFavs() {
    return loadJson(KEY_FAVS, []);
  }

  function saveFavs(favs) {
    saveJson(KEY_FAVS, favs);
  }

  function loadSectionStates() {
    return loadJson(KEY_SECTION_STATE, {});
  }

  function saveSectionStates(data) {
    saveJson(KEY_SECTION_STATE, data);
  }

  function loadAnalytics() {
    return loadJson(KEY_ANALYTICS, {
      pageViews: {},
      searches: [],
      glossary: {},
      events: []
    });
  }

  function saveAnalytics(data) {
    saveJson(KEY_ANALYTICS, data);
  }

  function loadQuizInsights() {
    return loadJson(KEY_QUIZ, {});
  }

  function saveQuizInsights(data) {
    saveJson(KEY_QUIZ, data);
  }

  function loadSimHistory() {
    return loadJson(KEY_SIM, []);
  }

  function saveSimHistory(data) {
    saveJson(KEY_SIM, data);
  }

  function loadExerciseHistory() {
    return loadJson(KEY_EXERCISE, {});
  }

  function saveExerciseHistory(data) {
    saveJson(KEY_EXERCISE, data);
  }

  function getCurrentPageId() {
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path.endsWith('/') || path === '') return 'home';
    const match = path.match(/\/([^\/]+)\.html$/);
    if (!match) return 'home';
    return decodeURIComponent(match[1]);
  }

  function getModuleById(moduleId) {
    if (typeof MODULES === 'undefined') return null;
    return MODULES.find(module => module.id === moduleId) || null;
  }

  function getSectionStateKey(pageId, sectionId) {
    return `${pageId}:${sectionId}`;
  }

  function notifyChange(detail) {
    document.dispatchEvent(new CustomEvent('rw:progress-change', { detail }));
  }

  function ensureSectionStateControls(label) {
    const section = label.closest('.section');
    if (!section || section.querySelector('.section-state-group')) return;

    const pageId = getCurrentPageId();
    const sectionId = label.dataset.section;
    const key = getSectionStateKey(pageId, sectionId);
    const states = loadSectionStates();
    const current = states[key] || '';
    const group = document.createElement('div');
    group.className = 'section-state-group';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Estado de aprendizagem da seção');
    group.innerHTML = SECTION_STATES.map(state => `
      <button
        type="button"
        class="section-state-btn ${current === state ? 'active' : ''}"
        data-section-state="${state}"
        aria-pressed="${String(current === state)}"
      >
        ${SECTION_STATE_LABELS[state]}
      </button>
    `).join('');

    const actions = section.querySelector('.section-actions');
    if (actions) {
      actions.after(group);
    } else {
      const intro = section.querySelector('.section-intro');
      if (intro) intro.after(group);
      else section.prepend(group);
    }

    group.querySelectorAll('.section-state-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.sectionState;
        const latest = loadSectionStates();
        latest[key] = latest[key] === next ? '' : next;
        saveSectionStates(latest);
        updateSectionStateUI(group, latest[key] || '');
        updateHomeAndSidebar();
        recordEvent('section_state', { pageId, sectionId, state: latest[key] || 'none' });
        notifyChange({ type: 'section-state', pageId, sectionId, state: latest[key] || '' });
      });
    });
  }

  function updateSectionStateUI(group, current) {
    group.querySelectorAll('.section-state-btn').forEach(btn => {
      const active = btn.dataset.sectionState === current;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function initCheckboxes() {
    const checks = document.querySelectorAll('.section-check');
    const data = load();
    const pageId = getCurrentPageId();

    checks.forEach(label => {
      const sectionId = label.dataset.section;
      const key = `${pageId}:${sectionId}`;
      const checked = !!data[key];
      const input = label.querySelector('input[type="checkbox"]');
      const span = label.querySelector('.check-text');

      label.classList.toggle('checked', checked);
      label.setAttribute('role', 'button');
      label.setAttribute('tabindex', '0');
      label.setAttribute('aria-pressed', String(checked));
      if (input) input.checked = checked;
      if (span) span.textContent = checked ? '✓ Estudado' : 'Marcar como estudado';

      ensureSectionStateControls(label);

      const toggle = event => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        const latest = load();
        const newState = !latest[key];
        latest[key] = newState;
        save(latest);
        label.classList.toggle('checked', newState);
        label.setAttribute('aria-pressed', String(newState));
        if (input) input.checked = newState;
        if (span) span.textContent = newState ? '✓ Estudado' : 'Marcar como estudado';
        animateSectionCheck(label, newState);
        updateHomeAndSidebar();
        recordEvent('section_completion', { pageId, sectionId, completed: newState });
        notifyChange({ type: 'section-completion', pageId, sectionId, completed: newState });
      };

      label.addEventListener('click', toggle);
      label.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') toggle(event);
      });
    });
  }

  function updateModuleProgress() {
    const fill = document.getElementById('mpFill');
    const pct = document.getElementById('mpPct');
    if (!fill && !pct) return;

    const data = load();
    const pageId = getCurrentPageId();
    const checks = document.querySelectorAll('.section-check');
    if (!checks.length) return;

    let done = 0;
    checks.forEach(label => {
      const key = `${pageId}:${label.dataset.section}`;
      if (data[key]) done += 1;
    });

    const percent = Math.round((done / checks.length) * 100);
    if (fill) { fill.style.width = `${percent}%`; animateProgressFill(fill); }
    if (pct) animateCounter(pct, percent);

    if (percent === 100) maybeShowCompletion(pageId);
  }

  /* ── Module completion celebration ───────────────────── */
  const SESSION_KEY = 'rw-celebrated';

  function maybeShowCompletion(pageId) {
    try {
      const celebrated = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
      if (celebrated[pageId]) return;
      celebrated[pageId] = 1;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(celebrated));
    } catch {}
    showCompletionModal(pageId);
  }

  function showCompletionModal(pageId) {
    const module   = getModuleById(pageId);
    if (!module) return;
    const nextMod  = typeof MODULES !== 'undefined'
      ? MODULES.find(m => m.num === module.num + 1) : null;
    const nextHref = nextMod ? (window.location.pathname.includes('/pages/')
      ? nextMod.url.replace('pages/', '') : nextMod.url) : null;

    launchConfetti();

    const overlay = document.createElement('div');
    overlay.className = 'rw-completion-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Módulo concluído');
    overlay.innerHTML = `
      <div class="rw-completion-card">
        <div class="rw-completion-icon">🎉</div>
        <h2 class="rw-completion-title">Módulo ${module.num} concluído!</h2>
        <p class="rw-completion-sub">Você estudou todas as seções de <strong>${module.title}</strong>.</p>
        <div class="rw-completion-actions">
          ${nextHref ? `<a href="${nextHref}" class="rw-completion-next">Próximo: ${nextMod.title} →</a>` : ''}
          <button class="rw-completion-close" type="button">Continuar aqui</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    const close = () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s';
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    };

    overlay.querySelector('.rw-completion-close')?.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, { once: true });
  }

  function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.className = 'rw-confetti-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 80 }, () => ({
      x:  Math.random() * canvas.width,
      y:  -20 - Math.random() * 120,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 8,
      w:  6 + Math.random() * 6,
      h:  10 + Math.random() * 8,
      color: ['#4f8ef7','#8b5cf6','#22c55e','#f59e0b','#ef4444','#ec4899'][Math.floor(Math.random() * 6)]
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.07;
        p.rot += p.vr;
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) { frame = requestAnimationFrame(draw); }
      else        { canvas.remove(); }
    };
    frame = requestAnimationFrame(draw);
    setTimeout(() => { cancelAnimationFrame(frame); canvas.remove(); }, 5000);
  }

  function getModuleCompletion(moduleId) {
    const module = getModuleById(moduleId);
    if (!module || !module.sections.length) return { done: 0, total: 0, pct: 0 };
    const data = load();
    let done = 0;
    module.sections.forEach(sectionId => {
      if (data[`${moduleId}:${sectionId}`]) done += 1;
    });
    return {
      done,
      total: module.sections.length,
      pct: Math.round((done / module.sections.length) * 100)
    };
  }

  function getModuleMastery(moduleId) {
    const module = getModuleById(moduleId);
    if (!module || !module.sections.length) return { score: 0, pct: 0 };

    const states = loadSectionStates();
    const completion = load();
    let score = 0;
    module.sections.forEach(sectionId => {
      const state = states[getSectionStateKey(moduleId, sectionId)];
      if (state === 'revisar') score += 0.25;
      else if (state === 'lido') score += 0.55;
      else if (state === 'entendido') score += 1;
      else if (completion[`${moduleId}:${sectionId}`]) score += 0.7;
    });

    return {
      score,
      pct: Math.round((score / module.sections.length) * 100)
    };
  }

  function getFlashcardCoverage(moduleId) {
    if (typeof FLASHCARDS === 'undefined' || typeof SR === 'undefined' || !FLASHCARDS[moduleId]?.length) {
      return { reviewed: 0, total: FLASHCARDS?.[moduleId]?.length || 0, pct: 0 };
    }

    let reviewed = 0;
    FLASHCARDS[moduleId].forEach((_, index) => {
      if (SR.getCard(moduleId, index).reps > 0) reviewed += 1;
    });

    return {
      reviewed,
      total: FLASHCARDS[moduleId].length,
      pct: Math.round((reviewed / FLASHCARDS[moduleId].length) * 100)
    };
  }

  function getExerciseContribution(moduleId) {
    const exerciseHistory = loadExerciseHistory();
    if (!exerciseHistory || !Object.keys(exerciseHistory).length) return { completed: 0, total: 0, pct: 0 };
    const map = {
      fundamentos: ['dns-ip-ok-domain-fail'],
      enderecamento: ['gateway-ok-internet-down', 'dns-interno-divergente'],
      protocolos: ['single-site-down', 'dns-ip-ok-domain-fail', 'dns-interno-divergente'],
      troubleshooting: ['dns-ip-ok-domain-fail', 'single-site-down', 'gateway-ok-internet-down', 'service-port-closed', 'latency-after-hops', 'dns-interno-divergente'],
      portas: ['service-port-closed']
    };
    const related = map[moduleId] || [];
    if (!related.length) return { completed: 0, total: 0, pct: 0 };
    const completed = related.filter(id => exerciseHistory[id]?.status === 'completed').length;
    return { completed, total: related.length, pct: Math.round((completed / related.length) * 100) };
  }

  function getLearningScore(moduleId) {
    const completion = getModuleCompletion(moduleId).pct;
    const mastery = getModuleMastery(moduleId).pct;
    const quiz = getQuizPerformance(moduleId).attempts ? getQuizPerformance(moduleId).avgPct : null;
    const flashcards = getFlashcardCoverage(moduleId).pct;
    const exercises = getExerciseContribution(moduleId).pct;

    const weighted = [
      { value: completion, weight: 0.35 },
      { value: mastery, weight: 0.2 },
      { value: quiz ?? Math.min(completion, mastery), weight: 0.25 },
      { value: flashcards, weight: 0.1 },
      { value: exercises, weight: 0.1 }
    ];

    const pct = Math.round(weighted.reduce((sum, item) => sum + (item.value * item.weight), 0));
    return { pct, completion, mastery, quiz: quiz ?? 0, flashcards, exercises };
  }

  function getModuleReadiness(moduleId) {
    const module = getModuleById(moduleId);
    if (!module) return null;
    const completion = getModuleCompletion(moduleId);
    const quiz = getQuizPerformance(moduleId);
    const flashcards = getFlashcardCoverage(moduleId);
    const score = getLearningScore(moduleId);
    const checks = {
      sectionsDone: completion.pct === 100,
      quizReady: quiz.attempts > 0 ? quiz.lastPct >= 70 : false,
      termsReviewed: flashcards.total ? flashcards.pct >= 30 : true
    };
    const ready = checks.sectionsDone && checks.quizReady && checks.termsReviewed;

    return {
      module,
      ready,
      checks,
      completion,
      quiz,
      flashcards,
      score,
      label: ready ? 'Pronto para seguir' : 'Revise antes de avançar'
    };
  }

  function getGoalProgress(goalId) {
    if (typeof STUDY_GOALS === 'undefined') return null;
    const goal = STUDY_GOALS.find(item => item.id === goalId);
    if (!goal) return null;
    const modules = goal.modules.map(getModuleById).filter(Boolean);
    const completed = modules.filter(module => getModuleReadiness(module.id)?.ready).length;
    const avgScore = modules.length
      ? Math.round(modules.reduce((sum, module) => sum + getLearningScore(module.id).pct, 0) / modules.length)
      : 0;
    const remaining = modules.filter(module => !getModuleReadiness(module.id)?.ready);
    return {
      goal,
      modules,
      completed,
      total: modules.length,
      pct: modules.length ? Math.round((completed / modules.length) * 100) : 0,
      avgScore,
      remaining
    };
  }

  function updateGlobalProgress() {
    const fill = document.getElementById('gpFill');
    const pctEl = document.getElementById('gpPct');
    const dotsEl = document.getElementById('gpModules');
    if (!fill && !pctEl) return;
    if (typeof MODULES === 'undefined') return;

    let totalSections = 0;
    let doneSections = 0;

    MODULES.forEach(module => {
      const completion = getModuleCompletion(module.id);
      totalSections += completion.total;
      doneSections += completion.done;
    });

    const percent = totalSections ? Math.round((doneSections / totalSections) * 100) : 0;
    if (fill) { fill.style.width = `${percent}%`; animateProgressFill(fill); }
    if (pctEl) animateCounter(pctEl, percent);

    if (dotsEl) {
      dotsEl.innerHTML = MODULES.map(module => {
        const completion = getModuleCompletion(module.id);
        const mastery = getModuleMastery(module.id);
        const done = completion.done === completion.total && completion.total > 0;
        return `
          <span class="gp-module-dot ${done ? 'done' : ''}" title="${module.title} • conclusão ${completion.pct}% • domínio ${mastery.pct}%">
            ${module.num}. ${module.title.split(' ')[0]}
          </span>
        `;
      }).join('');
    }

    MODULES.forEach(module => {
      const cardFill = document.getElementById(`mc-fill-${module.id}`);
      const cardPct = document.getElementById(`mc-pct-${module.id}`);
      if (!cardFill && !cardPct) return;
      const completion = getModuleCompletion(module.id);
      if (cardFill) cardFill.style.width = `${completion.pct}%`;
      if (cardPct) cardPct.textContent = `${completion.pct}%`;
    });

    updateModuleBadges();
  }

  function updateSidebarProgress() {
    const fill = document.getElementById('spFill');
    const pct = document.getElementById('spPct');
    if (!fill && !pct) return;
    if (typeof MODULES === 'undefined') return;

    let total = 0;
    let done = 0;
    MODULES.forEach(module => {
      const completion = getModuleCompletion(module.id);
      total += completion.total;
      done += completion.done;
    });

    const progressPct = total ? Math.round((done / total) * 100) : 0;
    if (fill) fill.style.width = `${progressPct}%`;
    if (pct) pct.textContent = `${progressPct}%`;
  }

  function initFavButtons() {
    const favs = loadFavs();
    document.querySelectorAll('.fav-btn').forEach(btn => {
      const id = btn.dataset.favId;
      const title = btn.dataset.favTitle;
      const page = btn.dataset.favPage;
      const isFav = favs.some(item => item.id === id);
      btn.classList.toggle('active', isFav);
      btn.title = isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
      btn.setAttribute('aria-pressed', String(isFav));

      btn.addEventListener('click', () => {
        const latest = loadFavs();
        const idx = latest.findIndex(item => item.id === id);
        if (idx === -1) {
          latest.push({ id, title, page });
          btn.classList.add('active');
          btn.title = 'Remover dos favoritos';
          btn.setAttribute('aria-pressed', 'true');
        } else {
          latest.splice(idx, 1);
          btn.classList.remove('active');
          btn.title = 'Adicionar aos favoritos';
          btn.setAttribute('aria-pressed', 'false');
        }
        saveFavs(latest);
        renderFavorites();
        notifyChange({ type: 'favorites' });
      });
    });
  }

  function renderFavorites() {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;
    const favs = loadFavs();

    if (!favs.length) {
      container.innerHTML = `
        <div class="fav-empty">
          <div class="fav-empty-icon">⭐</div>
          <p>Nenhum favorito ainda. Clique na estrela em qualquer seção para salvar aqui.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="fav-list">
        ${favs.map(fav => `
          <div class="fav-item">
            <div class="fav-item-info">
              <div class="fav-item-title">${fav.title}</div>
              <div class="fav-item-path">${fav.page}</div>
            </div>
            <button class="fav-item-remove" data-fav-id="${fav.id}">Remover</button>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.fav-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const updated = loadFavs().filter(item => item.id !== btn.dataset.favId);
        saveFavs(updated);
        renderFavorites();
        notifyChange({ type: 'favorites' });
      });
    });
  }

  function initExport() {
    const btn = document.getElementById('exportProgress');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const allKeys = Object.values(StorageHub.KEYS);
      const data = {};
      allKeys.forEach(key => {
        if (!key) return;
        try { data[key] = JSON.parse(localStorage.getItem(key)); }
        catch { data[key] = localStorage.getItem(key); }
      });
      const payload = {
        exportedAt: new Date().toISOString(),
        version: 1,
        data
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `redeswiki-progress-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function initReset() {
    const btn = document.getElementById('resetProgress');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!confirm('Resetar TODO o progresso?\n\nIsso apaga: seções estudadas, quizzes, simulados, exercícios, flashcards SM-2 e analytics.\n\nO tema (claro/escuro) e favoritos são mantidos.')) return;

      // Clear all data keys except theme and favorites
      const keysToReset = [
        KEY_PROGRESS, KEY_SECTION_STATE, KEY_ANALYTICS,
        KEY_QUIZ, KEY_SIM, KEY_EXERCISE,
        StorageHub.KEYS.quizHistory, StorageHub.KEYS.sm2
      ];
      keysToReset.forEach(key => key && StorageHub.remove(key));

      // Reset section UI
      document.querySelectorAll('.section-check').forEach(label => {
        label.classList.remove('checked');
        label.setAttribute('aria-pressed', 'false');
        const input = label.querySelector('input[type="checkbox"]');
        const span = label.querySelector('.check-text');
        if (input) input.checked = false;
        if (span) span.textContent = 'Marcar como estudado';
      });
      document.querySelectorAll('.section-state-group').forEach(group => {
        updateSectionStateUI(group, '');
      });
      updateHomeAndSidebar();
      notifyChange({ type: 'reset' });
    });
  }

  function updateHomeAndSidebar() {
    updateModuleProgress();
    updateGlobalProgress();
    updateSidebarProgress();
  }

  /* ── Animations ──────────────────────────────────────── */
  function animateSectionCheck(label, checked) {
    label.classList.remove('section-check--pop');
    void label.offsetWidth;
    label.classList.add('section-check--pop');
    label.addEventListener('animationend', () => label.classList.remove('section-check--pop'), { once: true });

    if (checked) {
      const section = label.closest('.section');
      if (section) showProgressToast(section);
    }
  }

  function animateProgressFill(fill) {
    fill.classList.remove('progress-fill--pulse');
    void fill.offsetWidth;
    fill.classList.add('progress-fill--pulse');
    fill.addEventListener('animationend', () => fill.classList.remove('progress-fill--pulse'), { once: true });
  }

  function animateCounter(el, target) {
    const prev = parseInt(el.textContent, 10) || 0;
    if (prev === target) { el.textContent = `${target}%`; return; }
    const step = target > prev ? 1 : -1;
    const steps = Math.abs(target - prev);
    const delay = Math.max(8, Math.round(300 / steps));
    let current = prev;
    const tick = setInterval(() => {
      current += step;
      el.textContent = `${current}%`;
      if (current === target) clearInterval(tick);
    }, delay);
  }

  function showProgressToast(section) {
    const heading = section.querySelector('h2,h3');
    const name = heading ? heading.textContent.replace(/[★⭐☆]/g, '').trim().slice(0, 32) : '';
    const toast = document.createElement('div');
    toast.className = 'rw-toast';
    toast.innerHTML = `<span class="rw-toast-icon">✓</span> <span>${name ? `"${name}" marcado` : 'Seção marcada'}</span>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('rw-toast--show'));
    setTimeout(() => {
      toast.classList.remove('rw-toast--show');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 2200);
  }

  /* ── Share buttons ───────────────────────────────────── */
  function initShareButtons() {
    document.querySelectorAll('.section[id]').forEach(section => {
      const actions = section.querySelector('.section-actions');
      if (!actions || actions.querySelector('.share-btn')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'share-btn';
      btn.setAttribute('aria-label', 'Compartilhar seção');
      btn.title = 'Compartilhar';
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';

      btn.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.hash = `#${section.id}`;
        url.searchParams.delete('q');
        const shareUrl = url.toString();
        const heading = section.querySelector('h2,h3');
        const title = heading ? heading.textContent.replace(/[★⭐☆]/g, '').trim() : document.title;

        if (navigator.share) {
          navigator.share({ title, url: shareUrl }).catch(() => {});
        } else {
          navigator.clipboard.writeText(shareUrl).then(() => showShareToast()).catch(() => {});
        }
      });

      actions.insertBefore(btn, actions.firstChild);
    });
  }

  function showShareToast() {
    const toast = document.createElement('div');
    toast.className = 'rw-toast';
    toast.innerHTML = '<span class="rw-toast-icon">🔗</span> <span>Link copiado!</span>';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('rw-toast--show'));
    setTimeout(() => {
      toast.classList.remove('rw-toast--show');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 2000);
  }

  /* ── Section personal notes ──────────────────────────── */
  function loadNotes() { return StorageHub.loadJson(StorageHub.KEYS.notes, {}); }
  function saveNotes(data) { StorageHub.saveJson(StorageHub.KEYS.notes, data); }

  function initSectionNotes() {
    const pageId = getCurrentPageId();
    document.querySelectorAll('.section[id]').forEach(section => {
      const sectionId = section.id;
      const key = `${pageId}:${sectionId}`;
      const notes = loadNotes();
      const saved = notes[key] || '';

      const wrap = document.createElement('div');
      wrap.className = 'rw-notes-wrap';

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'rw-notes-toggle' + (saved ? ' has-notes' : '');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = `<span class="rw-notes-toggle-icon">📝</span> ${saved ? 'Ver nota' : 'Adicionar nota'}`;

      const body = document.createElement('div');
      body.className = 'rw-notes-body';

      const textarea = document.createElement('textarea');
      textarea.className = 'rw-notes-textarea';
      textarea.placeholder = 'Suas anotações sobre esta seção…';
      textarea.value = saved;
      textarea.setAttribute('aria-label', 'Nota pessoal da seção');
      textarea.rows = 3;

      const hint = document.createElement('p');
      hint.className = 'rw-notes-hint';
      hint.textContent = 'Salvo automaticamente no seu navegador.';

      body.appendChild(textarea);
      body.appendChild(hint);
      wrap.appendChild(toggle);
      wrap.appendChild(body);

      toggle.addEventListener('click', () => {
        const open = body.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        if (open) textarea.focus();
      });

      let saveTimer;
      textarea.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          const latest = loadNotes();
          const val = textarea.value.trim();
          if (val) { latest[key] = val; } else { delete latest[key]; }
          saveNotes(latest);
          const hasContent = !!val;
          toggle.classList.toggle('has-notes', hasContent);
          toggle.innerHTML = `<span class="rw-notes-toggle-icon">📝</span> ${hasContent ? 'Ver nota' : 'Adicionar nota'}`;
        }, 600);
      });

      /* attach after section-state-group if it exists, else end of section */
      const stateGroup = section.querySelector('.section-state-group');
      if (stateGroup) { stateGroup.after(wrap); }
      else { section.appendChild(wrap); }
    });
  }

  /* ── Module completion badges ─────────────────────────── */
  function updateModuleBadges() {
    if (typeof MODULES === 'undefined') return;
    MODULES.forEach(module => {
      const fill = document.getElementById(`mc-fill-${module.id}`);
      const card = fill?.closest('.module-card');
      if (!card) return;

      const completion = getModuleCompletion(module.id);
      const quiz = getQuizPerformance(module.id);
      const earned = completion.pct === 100 && quiz.attempts > 0 && quiz.lastPct >= 70;

      let badge = card.querySelector('.mc-badge');
      if (earned && !badge) {
        badge = document.createElement('span');
        badge.className = 'mc-badge';
        badge.title = 'Concluído: 100% das seções + quiz ≥ 70%';
        badge.textContent = '✓ Concluído';
        card.appendChild(badge);
      } else if (!earned && badge) {
        badge.remove();
      }
    });
  }

  function recordEvent(type, payload = {}) {
    const analytics = loadAnalytics();
    analytics.events.push({
      type,
      payload,
      pageId: getCurrentPageId(),
      at: new Date().toISOString()
    });
    if (analytics.events.length > 120) analytics.events = analytics.events.slice(-120);
    saveAnalytics(analytics);
  }

  function recordPageView(pageId = getCurrentPageId()) {
    const analytics = loadAnalytics();
    analytics.pageViews[pageId] = (analytics.pageViews[pageId] || 0) + 1;
    saveAnalytics(analytics);
  }

  function recordSearch(term, results = []) {
    if (!term) return;
    const analytics = loadAnalytics();
    analytics.searches.unshift({
      term,
      resultCount: results.length,
      topResult: results[0]?.label || '',
      at: new Date().toISOString()
    });
    analytics.searches = analytics.searches.slice(0, 20);
    saveAnalytics(analytics);
  }

  function recordGlossaryLookup(term) {
    if (!term) return;
    const analytics = loadAnalytics();
    analytics.glossary[term] = (analytics.glossary[term] || 0) + 1;
    saveAnalytics(analytics);
  }

  function recordQuizAttempt(moduleId, payload) {
    if (!moduleId) return;
    const insights = loadQuizInsights();
    if (!insights[moduleId]) insights[moduleId] = [];
    insights[moduleId].push({
      ...payload,
      at: new Date().toISOString()
    });
    insights[moduleId] = insights[moduleId].slice(-12);
    saveQuizInsights(insights);
    recordEvent('quiz_attempt', { moduleId, pct: payload?.pct || 0 });
    notifyChange({ type: 'quiz-attempt', moduleId });
  }

  function recordSimuladoAttempt(payload) {
    const history = loadSimHistory();
    history.push({
      ...payload,
      at: new Date().toISOString()
    });
    saveSimHistory(history.slice(-12));
    recordEvent('simulado_attempt', { pct: payload?.pct || 0, mode: payload?.mode || 'misto' });
    notifyChange({ type: 'simulado-attempt' });
  }

  function recordExerciseAttempt(exerciseId, payload) {
    if (!exerciseId) return;
    const history = loadExerciseHistory();
    history[exerciseId] = {
      ...history[exerciseId],
      ...payload,
      at: new Date().toISOString()
    };
    saveExerciseHistory(history);
    recordEvent('exercise_attempt', { exerciseId, status: payload?.status || 'open' });
    notifyChange({ type: 'exercise-attempt', exerciseId });
  }

  function getQuizPerformance(moduleId) {
    const entries = loadQuizInsights()[moduleId] || [];
    if (!entries.length) return { attempts: 0, avgPct: 0, lastPct: 0 };
    const total = entries.reduce((sum, entry) => sum + (entry.pct || 0), 0);
    return {
      attempts: entries.length,
      avgPct: Math.round(total / entries.length),
      lastPct: entries[entries.length - 1]?.pct || 0
    };
  }

  function getWeakModules(limit = 3) {
    if (typeof MODULES === 'undefined') return [];
    return MODULES.map(module => {
      const completion = getModuleCompletion(module.id);
      const mastery = getModuleMastery(module.id);
      const quiz = getQuizPerformance(module.id);
      const learning = getLearningScore(module.id);
      return { module, completion, mastery, quiz, learning, score: learning.pct };
    })
      .filter(entry => entry.completion.pct > 0 || entry.mastery.pct > 0 || entry.quiz.attempts > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }

  function getReadyModules() {
    if (typeof MODULES === 'undefined' || typeof MODULE_META === 'undefined') return [];
    return MODULES.filter(module => {
      const meta = MODULE_META[module.id];
      const prerequisites = meta?.prerequisites || [];
      return prerequisites.every(moduleId => getModuleCompletion(moduleId).pct >= 60);
    });
  }

  function getRecommendedNextModule() {
    if (typeof MODULES === 'undefined' || typeof MODULE_META === 'undefined') return null;
    const ready = getReadyModules();
    return ready.find(item => getModuleCompletion(item.id).pct < 100) || MODULES.find(item => getModuleCompletion(item.id).pct < 100) || null;
  }

  function getReviewQueue() {
    if (typeof MODULES === 'undefined') return [];
    const sectionStates = loadSectionStates();
    const items = [];

    MODULES.forEach(module => {
      module.sections.forEach(sectionId => {
        const key = getSectionStateKey(module.id, sectionId);
        if (sectionStates[key] === 'revisar') {
          items.push({
            type: 'section',
            moduleId: module.id,
            moduleTitle: module.title,
            sectionId,
            label: module.navTopics?.find(topic => topic.id === sectionId)?.title || sectionId
          });
        }
      });

      if (typeof SR !== 'undefined' && typeof FLASHCARDS !== 'undefined' && FLASHCARDS[module.id]) {
        const due = SR.dueCount(module.id, FLASHCARDS[module.id].length);
        if (due > 0) {
          items.push({
            type: 'flashcards',
            moduleId: module.id,
            moduleTitle: module.title,
            due,
            label: `${due} flashcard${due > 1 ? 's' : ''} para revisar`
          });
        }
      }
    });

    return items;
  }

  function getStudyDashboard() {
    const weakModules = getWeakModules(3);
    const reviewQueue = getReviewQueue();
    const nextModule = getRecommendedNextModule();
    const analytics = loadAnalytics();
    return {
      weakModules,
      reviewQueue,
      nextModule,
      goalProgress: typeof STUDY_GOALS !== 'undefined' ? STUDY_GOALS.map(goal => getGoalProgress(goal.id)) : [],
      readiness: typeof MODULES !== 'undefined' ? MODULES.map(module => getModuleReadiness(module.id)) : [],
      pageViews: analytics.pageViews,
      searches: analytics.searches.slice(0, 5),
      glossaryTop: Object.entries(analytics.glossary).sort((a, b) => b[1] - a[1]).slice(0, 5),
      simuladoHistory: loadSimHistory(),
      exercises: loadExerciseHistory()
    };
  }

  function init() {
    recordPageView();
    initCheckboxes();
    updateModuleProgress();
    updateGlobalProgress();
    updateSidebarProgress();
    initFavButtons();
    renderFavorites();
    initReset();
    initExport();
    initShareButtons();
    initSectionNotes();
  }

  return {
    init,
    updateGlobalProgress,
    updateSidebarProgress,
    updateModuleBadges,
    getCurrentPageId,
    getModuleCompletion,
    getModuleMastery,
    getLearningScore,
    getModuleReadiness,
    getGoalProgress,
    getFlashcardCoverage,
    getStudyDashboard,
    getRecommendedNextModule,
    getReadyModules,
    getWeakModules,
    getReviewQueue,
    getQuizPerformance,
    recordEvent,
    recordSearch,
    recordGlossaryLookup,
    recordQuizAttempt,
    recordSimuladoAttempt,
    recordExerciseAttempt,
    loadQuizInsights,
    loadSimHistory,
    loadExerciseHistory
  };
})();
