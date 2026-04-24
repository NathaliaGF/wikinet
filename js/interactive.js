/* ── RedesWiki — Quizzes, Flashcards (SM-2), Search ──── */
'use strict';

const Interactive = (() => {

  function init() {
    initSearch();
    initAllFlashcards();
    initAllQuizzes();
  }

  /* ── Search ─────────────────────────────────────────── */
  function initSearch() {
    const input = document.getElementById('sidebarSearch');
    if (!input) return;
    ensureSearchPanel(input);
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => performSearch(input.value.trim()), 180);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        input.value = '';
        clearHighlights();
        renderSearchResults([]);
        clearSearchParam();
      }
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.sidebar-search')) renderSearchResults([]);
    });

    // Highlight term passed from another page via ?q=
    const q = new URLSearchParams(window.location.search).get('q');
    if (q && q.length >= 2) {
      input.value = q;
      setTimeout(() => {
        performSearch(q);
        clearSearchParam();
      }, 120);
    }
  }

  function clearSearchParam() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('q')) return;
    url.searchParams.delete('q');
    history.replaceState(null, '', url.toString());
  }

  function performSearch(term) {
    clearHighlights();
    if (!term || term.length < 2) {
      renderSearchResults([]);
      return;
    }

    const results = buildSearchIndex(term);
    renderSearchResults(results, term);
    if (typeof Progress !== 'undefined') Progress.recordSearch(term, results);

    const article = document.querySelector('.article-wrapper');
    if (!article) return;
    const re = new RegExp(`(${escapeRegex(term)})`, 'gi');
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (['SCRIPT','STYLE','MARK','INPUT','TEXTAREA'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (re.test(n.textContent)) nodes.push(n);
      re.lastIndex = 0;
    }
    nodes.forEach(textNode => {
      const frag = document.createDocumentFragment();
      textNode.textContent.split(re).forEach(part => {
        if (re.test(part)) {
          const mark = document.createElement('mark');
          mark.className = 'search-hl';
          mark.textContent = part;
          frag.appendChild(mark);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
        re.lastIndex = 0;
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
    const first = document.querySelector('mark.search-hl');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearHighlights() {
    document.querySelectorAll('mark.search-hl').forEach(m => {
      m.parentNode.replaceChild(document.createTextNode(m.textContent), m);
      m.parentNode.normalize();
    });
  }

  function ensureSearchPanel(input) {
    if (input.parentElement.querySelector('.search-results-panel')) return;
    input.insertAdjacentHTML('afterend', `
      <div class="search-results-panel" id="searchResultsPanel" role="listbox" aria-label="Resultados da busca"></div>
    `);
  }

  function buildSearchIndex(term) {
    const normalized = term.toLowerCase();
    const results = [];
    const pageId = typeof Progress !== 'undefined' ? Progress.getCurrentPageId() : '';

    if (typeof MODULES !== 'undefined') {
      MODULES.forEach(module => {
        const haystack = `${module.title} ${module.description} ${(module.navTopics || []).map(topic => topic.title).join(' ')}`.toLowerCase();
        if (haystack.includes(normalized)) {
          results.push({
            type: 'module',
            label: module.title,
            context: module.description,
            href: getSearchHref(module.url),
            pageId: module.id
          });
        }

        (module.navTopics || []).forEach(topic => {
          if (topic.title.toLowerCase().includes(normalized)) {
            const href = module.id === pageId ? `#${topic.id}` : `${getSearchHref(module.url)}#${topic.id}`;
            results.push({
              type: 'section',
              label: topic.title,
              context: module.title,
              href,
              pageId: module.id
            });
          }
        });
      });
    }

    if (typeof STUDY_GOALS !== 'undefined') {
      STUDY_GOALS.forEach(goal => {
        const haystack = `${goal.title} ${goal.description} ${goal.nextAction}`.toLowerCase();
        if (haystack.includes(normalized)) {
          results.push({
            type: 'goal',
            label: goal.title,
            context: goal.description,
            href: getSearchHref('index.html') + '#objetivos-estudo'
          });
        }
      });
    }

    if (typeof GLOSSARY !== 'undefined') {
      Object.entries(GLOSSARY).forEach(([termKey, value]) => {
        const definition = typeof value === 'string' ? value : value?.def || '';
        if (`${termKey} ${definition}`.toLowerCase().includes(normalized)) {
          results.push({
            type: 'glossary',
            label: termKey,
            context: definition,
            href: '#',
            glossaryTerm: termKey
          });
        }
      });
    }

    document.querySelectorAll('.section[id]').forEach(section => {
      const heading = section.querySelector('h2, h3');
      const body = section.textContent || '';
      if (`${heading?.textContent || ''} ${body}`.toLowerCase().includes(normalized)) {
        results.push({
          type: 'page',
          label: heading?.textContent?.trim() || section.id,
          context: 'Trecho da página atual',
          href: `#${section.id}`
        });
      }
    });

    const unique = [];
    const seen = new Set();
    results.forEach(result => {
      const key = `${result.type}:${result.label}:${result.href}:${result.glossaryTerm || ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(result);
    });
    return unique.slice(0, 8);
  }

  function renderSearchResults(results, term = '') {
    const panel = document.getElementById('searchResultsPanel');
    if (!panel) return;
    if (!results.length || !term) {
      panel.classList.remove('visible');
      panel.innerHTML = '';
      return;
    }

    panel.classList.add('visible');
    panel.innerHTML = results.map(result => `
      <button type="button" class="search-result-item" data-href="${result.href}" data-glossary-term="${result.glossaryTerm || ''}">
        <span class="search-result-type">${searchTypeLabel(result.type)}</span>
        <strong>${result.label}</strong>
        <span>${result.context}</span>
      </button>
    `).join('');

    panel.querySelectorAll('.search-result-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const glossaryTerm = btn.dataset.glossaryTerm;
        const href = btn.dataset.href;
        if (glossaryTerm && typeof Glossary !== 'undefined' && typeof Glossary.openTerm === 'function') {
          Glossary.openTerm(glossaryTerm);
          panel.classList.remove('visible');
          return;
        }

        if (href.startsWith('#')) {
          const target = document.getElementById(href.slice(1));
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const dest = new URL(href, window.location.href);
          if (term) dest.searchParams.set('q', term);
          window.location.href = dest.toString();
        }
        panel.classList.remove('visible');
      });
    });
  }

  function searchTypeLabel(type) {
    return ({
      module: 'Módulo',
      section: 'Tópico',
      page: 'Página atual',
      glossary: 'Glossário',
      goal: 'Objetivo'
    })[type] || 'Resultado';
  }

  function getSearchHref(url) {
    if (window.location.pathname.includes('/pages/')) {
      if (url === 'index.html') return '../index.html';
      return url.replace(/^pages\//, '');
    }
    return url;
  }

  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* ── Flashcards with SM-2 ───────────────────────────── */
  function initAllFlashcards() {
    document.querySelectorAll('[data-flashcard-set]').forEach(container => {
      const setId = container.dataset.flashcardSet;
      if (!FLASHCARDS || !FLASHCARDS[setId]) return;
      initFlashcardSet(container, setId, [...FLASHCARDS[setId]]);
    });
  }

  function initFlashcardSet(container, moduleId, cards) {
    const hasSR  = typeof SR !== 'undefined';
    let srMode   = false;
    let order    = cards.map((_, i) => i);
    let pos      = 0;
    let flipped  = false;

    const viewport = container.querySelector('.fc-viewport');
    const controls = container.querySelector('.fc-controls');

    // Auto-inject SM-2 UI elements when SR is available and HTML doesn't include them
    if (hasSR && viewport) {
      if (!container.querySelector('.fc-rating')) {
        viewport.insertAdjacentHTML('afterend',
          `<div class="fc-rating">
            <span class="fc-rating-label">Como foi?</span>
            <button class="fc-rate-btn" data-quality="1">😕 Esqueci</button>
            <button class="fc-rate-btn" data-quality="3">😐 Difícil</button>
            <button class="fc-rate-btn" data-quality="4">🙂 Bom</button>
            <button class="fc-rate-btn" data-quality="5">😄 Fácil</button>
          </div>`
        );
      }
      if (!container.querySelector('.fc-mode-toggle') && controls) {
        controls.insertAdjacentHTML('beforeend',
          '<button class="fc-btn fc-mode-toggle">📅 Modo Revisão</button>'
        );
      }
      if (!container.querySelector('.fc-sr-info')) {
        const header = container.querySelector('.fc-header');
        if (header) header.insertAdjacentHTML('beforeend', '<div class="fc-sr-info"></div>');
      }
    }

    const counter    = container.querySelector('.fc-counter');
    const prevBtn    = container.querySelector('[data-fc-prev]');
    const nextBtn    = container.querySelector('[data-fc-next]');
    const shuffBtn   = container.querySelector('[data-fc-shuffle]');
    const modeToggle = container.querySelector('.fc-mode-toggle');
    const ratingDiv  = container.querySelector('.fc-rating');
    const srInfo     = container.querySelector('.fc-sr-info');

    function getOrder() {
      if (srMode && hasSR) return SR.sortedIndices(moduleId, cards.length);
      return order;
    }

    function currentIdx() { return getOrder()[pos] ?? 0; }

    function render() {
      const idx  = currentIdx();
      const card = cards[idx];
      const el   = viewport.querySelector('.fc-card');
      if (!el) return;

      flipped = false;
      el.classList.remove('flipped');
      el.querySelector('.fc-question').textContent = card.q;
      el.querySelector('.fc-answer').textContent   = card.a;

      const ord = getOrder();
      if (counter) counter.textContent = `${pos + 1} / ${ord.length}`;
      if (prevBtn) prevBtn.disabled = pos === 0;
      if (nextBtn) nextBtn.disabled = pos === ord.length - 1;
      if (ratingDiv) ratingDiv.classList.remove('show');

      if (srInfo && hasSR) {
        const due = SR.dueCount(moduleId, cards.length);
        srInfo.innerHTML = `<span>📅 ${due} card${due !== 1 ? 's' : ''} p/ revisar hoje</span>`;
      }
    }

    // Flip
    const cardEl = viewport.querySelector('.fc-card');
    if (cardEl) {
      cardEl.addEventListener('click', () => {
        flipped = !flipped;
        cardEl.classList.toggle('flipped', flipped);
        if (flipped && ratingDiv) ratingDiv.classList.add('show');
      });
    }

    // SM-2 rating buttons
    if (ratingDiv && hasSR) {
      ratingDiv.querySelectorAll('.fc-rate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const q = parseInt(btn.dataset.quality);
          SR.review(moduleId, currentIdx(), q);
          advance();
        });
      });
    }

    function advance() {
      const ord = getOrder();
      if (pos < ord.length - 1) { pos++; render(); }
      else { pos = 0; render(); }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { if (pos > 0) { pos--; render(); } });
    if (nextBtn) nextBtn.addEventListener('click', advance);
    if (shuffBtn) shuffBtn.addEventListener('click', () => {
      order = shuffle(cards.map((_, i) => i));
      pos = 0; render();
    });

    if (modeToggle && hasSR) {
      modeToggle.addEventListener('click', () => {
        srMode = !srMode;
        modeToggle.classList.toggle('active', srMode);
        modeToggle.textContent = srMode ? '📅 Modo Revisão ON' : '📅 Modo Revisão';
        pos = 0; render();
      });
    }

    // ── Keyboard navigation ──────────────────────────────
    container.setAttribute('tabindex', '-1');
    container.addEventListener('keydown', e => {
      switch (e.key) {
        case ' ':
        case 'f':
        case 'F':
          e.preventDefault();
          cardEl?.click();
          break;
        case 'ArrowRight':
          e.preventDefault();
          advance();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (pos > 0) { pos--; render(); }
          break;
        case '1':
          if (flipped && hasSR) ratingDiv?.querySelector('[data-quality="1"]')?.click();
          break;
        case '2':
          if (flipped && hasSR) ratingDiv?.querySelector('[data-quality="3"]')?.click();
          break;
        case '3':
          if (flipped && hasSR) ratingDiv?.querySelector('[data-quality="4"]')?.click();
          break;
        case '4':
          if (flipped && hasSR) ratingDiv?.querySelector('[data-quality="5"]')?.click();
          break;
      }
    });

    // Focus container on card click so keyboard stays active
    if (cardEl) {
      cardEl.addEventListener('click', () => container.focus({ preventScroll: true }));
    }

    // ── Swipe / touch navigation ─────────────────────────
    if (cardEl) {
      let touchStartX = 0;
      let touchStartY = 0;

      cardEl.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      cardEl.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const isHorizontal = Math.abs(dx) > Math.abs(dy);
        if (isHorizontal && Math.abs(dx) > 48) {
          e.preventDefault();
          if (dx < 0) advance();
          else if (pos > 0) { pos--; render(); }
        }
        // small movement → let click/tap fire naturally (flip)
      });
    }

    render();
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ── Quiz with History ──────────────────────────────── */
  function initAllQuizzes() {
    document.querySelectorAll('[data-quiz-set]').forEach(container => {
      const setId = container.dataset.quizSet;
      if (!QUIZZES || !QUIZZES[setId]) return;
      initQuiz(container, setId, QUIZZES[setId]);
    });
  }

  function initQuiz(container, moduleId, questions) {
    let currentQ = 0, score = 0, answered = false;
    const questionsEl = container.querySelectorAll('.quiz-question');
    const resultEl    = container.querySelector('.quiz-result');
    const scoreBadge  = container.querySelector('.quiz-score-badge');

    // Auto-inject quiz history container if not in HTML
    if (resultEl && !resultEl.querySelector('.quiz-history')) {
      const retryBtn = resultEl.querySelector('.quiz-retry');
      const histHtml = '<div class="quiz-history"></div>';
      if (retryBtn) retryBtn.insertAdjacentHTML('beforebegin', histHtml);
      else resultEl.insertAdjacentHTML('beforeend', histHtml);
    }

    function renderQuestion(idx) {
      const q   = questions[idx];
      const qEl = questionsEl[idx];
      if (!qEl) return;
      questionsEl.forEach((el, i) => el.classList.toggle('active', i === idx));

      const numEl = qEl.querySelector('.quiz-q-num');
      if (numEl) numEl.textContent = `Pergunta ${idx + 1} de ${questions.length}`;
      const textEl = qEl.querySelector('.quiz-q-text');
      if (textEl) textEl.textContent = q.q;

      const optsEl = qEl.querySelector('.quiz-options');
      if (optsEl) {
        optsEl.innerHTML = q.opts.map((opt, i) =>
          `<button class="quiz-opt" data-index="${i}">
             <span class="quiz-opt-letter">${String.fromCharCode(65 + i)}</span>
             <span>${opt}</span>
           </button>`
        ).join('');
        optsEl.querySelectorAll('.quiz-opt').forEach(btn =>
          btn.addEventListener('click', () => handleAnswer(btn, qEl, q))
        );
      }

      const fb = qEl.querySelector('.quiz-feedback');
      if (fb) { fb.className = 'quiz-feedback'; fb.textContent = ''; }
      const nb = qEl.querySelector('.quiz-next-btn');
      if (nb) { nb.classList.remove('show'); nb.textContent = idx < questions.length - 1 ? 'Próxima →' : 'Ver resultado'; }
      answered = false;
    }

    function handleAnswer(btn, qEl, q) {
      if (answered) return;
      answered = true;
      const chosen = parseInt(btn.dataset.index);
      const ok = chosen === q.correct;
      if (ok) score++;
      qEl.querySelectorAll('.quiz-opt').forEach((el, i) => {
        el.classList.add('disabled');
        if (i === q.correct) el.classList.add('correct');
        else if (i === chosen) el.classList.add('wrong');
      });
      const fb = qEl.querySelector('.quiz-feedback');
      if (fb) {
        fb.textContent = (ok ? '✓ Correto! ' : '✗ Incorreto. ') + q.explanation;
        fb.className   = `quiz-feedback show ${ok ? 'correct-fb' : 'wrong-fb'}`;
      }
      const nb = qEl.querySelector('.quiz-next-btn');
      if (nb) nb.classList.add('show');
    }

    questionsEl.forEach((qEl, idx) => {
      const nb = qEl.querySelector('.quiz-next-btn');
      if (!nb) return;
      nb.addEventListener('click', () => {
        if (idx < questions.length - 1) { currentQ = idx + 1; renderQuestion(currentQ); }
        else showResult();
      });
    });

    function showResult() {
      questionsEl.forEach(el => el.classList.remove('active'));
      if (!resultEl) return;
      const pct = Math.round((score / questions.length) * 100);
      let msg = '';
      if (pct === 100) msg = '🎉 Perfeito!';
      else if (pct >= 66) msg = '👍 Bom resultado! Revise os erros.';
      else if (pct >= 33) msg = '📚 Continue estudando!';
      else msg = '🔄 Recomendamos reler o módulo.';

      resultEl.querySelector('.quiz-result-score').textContent = `${score}/${questions.length}`;
      resultEl.querySelector('.quiz-result-msg').textContent = msg;

      // Quiz history
      saveQuizHistory(moduleId, score, questions.length, pct);
      if (typeof Progress !== 'undefined') {
        Progress.recordQuizAttempt(moduleId, {
          score,
          total: questions.length,
          pct
        });
      }
      const histEl = resultEl.querySelector('.quiz-history');
      if (histEl) renderQuizHistory(histEl, moduleId);

      resultEl.classList.add('show');
      if (scoreBadge) { scoreBadge.textContent = `${pct}%`; scoreBadge.style.display = 'inline-block'; }
    }

    const retryBtn = container.querySelector('.quiz-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        score = 0; currentQ = 0;
        if (resultEl) resultEl.classList.remove('show');
        if (scoreBadge) scoreBadge.style.display = 'none';
        renderQuestion(0);
      });
    }

    renderQuestion(0);
  }

  /* ── Quiz History helpers ───────────────────────────── */
  const HIST_KEY = window.StorageHub?.KEYS?.quizHistory || 'rw-quiz-history';

  function loadHistory() {
    return window.StorageHub
      ? window.StorageHub.loadJson(HIST_KEY, {})
      : (() => {
          try { return JSON.parse(localStorage.getItem(HIST_KEY)) || {}; }
          catch { return {}; }
        })();
  }

  function saveQuizHistory(moduleId, score, total, pct) {
    const h = loadHistory();
    if (!h[moduleId]) h[moduleId] = [];
    h[moduleId].push({ date: new Date().toISOString().slice(0,10), score, total, pct });
    if (h[moduleId].length > 10) h[moduleId] = h[moduleId].slice(-10);
    if (window.StorageHub) window.StorageHub.saveJson(HIST_KEY, h);
    else localStorage.setItem(HIST_KEY, JSON.stringify(h));
  }

  function renderQuizHistory(el, moduleId) {
    const h = loadHistory()[moduleId];
    if (!h || h.length < 2) { el.style.display = 'none'; return; }
    el.style.display = '';
    const recent = h.slice(-6);
    const maxH   = 36;
    el.innerHTML = `
      <div class="qh-label">Últimas tentativas</div>
      <div class="qh-bars">
        ${recent.map(r => {
          const h = Math.max(4, Math.round((r.pct / 100) * maxH));
          const cls = r.pct === 100 ? 'pct100' : r.pct >= 66 ? 'pct66' : '';
          return `<div class="qh-bar-wrap"><div class="qh-bar ${cls}" style="height:${h}px" title="${r.pct}% em ${r.date}"></div><span class="qh-pct">${r.pct}%</span></div>`;
        }).join('')}
      </div>`;
  }

  return { init };
})();
