/* ── RedesWiki — Simulado avançado ───────────────────── */
'use strict';

(() => {
  const TOTAL_QUESTIONS = 30;
  const TOTAL_TIME = 30 * 60;

  const state = {
    questions: [],
    index: 0,
    score: 0,
    answered: false,
    answers: [],
    remaining: TOTAL_TIME,
    timerId: null,
    mode: 'mixed',
    theme: ''
  };

  function questionKey(question) {
    return `${question.tema}::${question.q}`;
  }

  function init() {
    const wrap = document.getElementById('simQuestionWrap');
    if (!wrap || !Array.isArray(window.CERT_QUESTIONS)) return;

    const els = getEls();
    populateThemeSelect(els);
    buildQuestionSet(els);
    bindEvents(els);
    renderQuestion(els);
    startTimer(els);
    renderHistory(els);
  }

  function getEls() {
    return {
      count: document.getElementById('simQuestionCount'),
      timer: document.getElementById('simTimer'),
      fill: document.getElementById('simProgressFill'),
      wrap: document.getElementById('simQuestionWrap'),
      tema: document.getElementById('simTema'),
      qnum: document.getElementById('simQNum'),
      qtext: document.getElementById('simQText'),
      options: document.getElementById('simOptions'),
      feedback: document.getElementById('simFeedback'),
      next: document.getElementById('simNextBtn'),
      navHint: document.getElementById('simNavHint'),
      result: document.getElementById('simResult'),
      resultScore: document.getElementById('simResultScore'),
      resultMsg: document.getElementById('simResultMsg'),
      recommendations: document.getElementById('simRecommendations'),
      breakdown: document.getElementById('simBreakdown'),
      retry: document.getElementById('simRetryBtn'),
      scoreBadge: document.getElementById('simScoreBadge'),
      modeSelect: document.getElementById('simModeSelect'),
      themeSelect: document.getElementById('simThemeSelect'),
      applyModeBtn: document.getElementById('simApplyModeBtn'),
      history: document.getElementById('simHistory')
    };
  }

  function bindEvents(els) {
    els.next?.addEventListener('click', () => {
      if (!state.answered) return;
      if (state.index < state.questions.length - 1) {
        state.index += 1;
        renderQuestion(els);
      } else {
        showResult(els);
      }
    });

    els.retry?.addEventListener('click', () => resetSimulado(els));
    els.applyModeBtn?.addEventListener('click', () => {
      state.mode = els.modeSelect?.value || 'mixed';
      state.theme = els.themeSelect?.value || '';
      resetSimulado(els);
    });

    els.modeSelect?.addEventListener('change', () => {
      const onlyTheme = els.modeSelect.value === 'theme';
      if (els.themeSelect) els.themeSelect.disabled = !onlyTheme;
    });
  }

  function populateThemeSelect(els) {
    if (!els.themeSelect) return;
    const themes = [...new Set(window.CERT_QUESTIONS.map(q => q.tema))].sort();
    els.themeSelect.innerHTML = '<option value="">Todos os temas</option>' + themes.map(theme => `
      <option value="${theme}">${theme}</option>
    `).join('');
    els.themeSelect.disabled = true;
  }

  function buildQuestionSet(els) {
    const pool = getQuestionPool();
    state.questions = shuffle([...pool]).slice(0, Math.min(TOTAL_QUESTIONS, pool.length));
    if (els.count) els.count.textContent = state.questions.length;
  }

  function getQuestionPool() {
    const all = [...window.CERT_QUESTIONS];
    if (state.mode === 'theme' && state.theme) {
      const filtered = all.filter(q => q.tema === state.theme);
      return filtered.length ? filtered : all;
    }

    if (state.mode === 'weak' && typeof Progress !== 'undefined') {
      const history = Progress.loadSimHistory ? Progress.loadSimHistory() : [];
      const weakThemes = [...new Set(history.flatMap(entry => entry.weakThemes || []).slice(-6))];
      const filtered = all.filter(q => weakThemes.includes(q.tema));
      return filtered.length >= 8 ? filtered : all;
    }

    if (state.mode === 'wrong' && typeof Progress !== 'undefined') {
      const history = Progress.loadSimHistory ? Progress.loadSimHistory() : [];
      const last = history.at(-1);
      const wrongKeys = last?.wrongQuestions || [];
      const filtered = all.filter(q => wrongKeys.includes(questionKey(q)));
      return filtered.length ? filtered : all;
    }

    return all;
  }

  function renderQuestion(els) {
    const question = state.questions[state.index];
    if (!question) return;

    state.answered = false;
    els.tema.textContent = question.tema;
    els.qnum.textContent = `Questão ${state.index + 1} de ${state.questions.length}`;
    els.qtext.textContent = question.q;
    els.feedback.className = 'quiz-feedback';
    els.feedback.textContent = '';
    els.next.classList.remove('show');
    els.next.textContent = state.index === state.questions.length - 1 ? 'Ver resultado' : 'Próxima →';
    els.navHint.textContent = 'Responda para continuar';

    els.options.innerHTML = question.opts.map((opt, i) => `
      <button class="quiz-opt" data-index="${i}">
        <span class="quiz-opt-letter">${String.fromCharCode(65 + i)}</span>
        <span>${opt}</span>
      </button>
    `).join('');

    els.options.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn, question, els));
    });

    updateProgress(els);
  }

  function handleAnswer(btn, question, els) {
    if (state.answered) return;
    state.answered = true;

    const chosen = Number(btn.dataset.index);
    const correct = chosen === question.correct;
    if (correct) state.score += 1;

    state.answers.push({
      tema: question.tema,
      correct,
      chosen,
      expected: question.correct,
      key: questionKey(question)
    });

    els.options.querySelectorAll('.quiz-opt').forEach((el, i) => {
      el.classList.add('disabled');
      if (i === question.correct) el.classList.add('correct');
      else if (i === chosen) el.classList.add('wrong');
    });

    els.feedback.textContent = `${correct ? '✓ Correto! ' : '✗ Incorreto. '}${question.exp}`;
    els.feedback.className = `quiz-feedback show ${correct ? 'correct-fb' : 'wrong-fb'}`;
    els.next.classList.add('show');
    els.navHint.textContent = correct ? 'Boa. Continue.' : 'Use a explicação para revisar o conceito.';
  }

  function updateProgress(els) {
    const pct = Math.round((state.index / state.questions.length) * 100);
    if (els.fill) els.fill.style.width = `${pct}%`;
  }

  function startTimer(els) {
    renderTimer(els);
    clearInterval(state.timerId);
    state.timerId = setInterval(() => {
      state.remaining -= 1;
      renderTimer(els);
      if (state.remaining <= 0) {
        clearInterval(state.timerId);
        showResult(els);
      }
    }, 1000);
  }

  function renderTimer(els) {
    const min = String(Math.max(0, Math.floor(state.remaining / 60))).padStart(2, '0');
    const sec = String(Math.max(0, state.remaining % 60)).padStart(2, '0');
    if (els.timer) {
      els.timer.textContent = `${min}:${sec}`;
      els.timer.classList.toggle('warning', state.remaining <= 300);
    }
  }

  function showResult(els) {
    clearInterval(state.timerId);
    els.wrap.style.display = 'none';
    els.result.classList.add('show');
    const total = state.questions.length;
    const pct = Math.round((state.score / total) * 100);

    els.resultScore.textContent = `${state.score}/${total}`;
    els.resultMsg.textContent =
      pct >= 85 ? 'Base muito boa. Seu próximo ganho vem de revisar temas com erros pontuais.' :
      pct >= 70 ? 'Resultado sólido. Revise os temas abaixo para fechar lacunas.' :
      pct >= 50 ? 'Você já tem parte da base, mas ainda há lacunas importantes.' :
      'O simulado mostrou que vale consolidar os módulos centrais antes de repetir a prova.';

    if (els.scoreBadge) {
      els.scoreBadge.textContent = `${pct}%`;
      els.scoreBadge.style.display = 'inline-block';
    }

    renderRecommendations(els);
    renderBreakdown(els);
    renderHistory(els);
    if (els.fill) els.fill.style.width = '100%';

    const perTheme = getPerThemeBreakdown();
    if (typeof Progress !== 'undefined') {
      Progress.recordSimuladoAttempt({
        pct,
        score: state.score,
        total,
        mode: state.mode,
        theme: state.theme,
        weakThemes: getWeakThemes(),
        perTheme,
        wrongQuestions: state.answers.filter(answer => !answer.correct).map(answer => answer.key)
      });
    }
  }

  function getPerThemeBreakdown() {
    const perTheme = {};
    state.questions.forEach((question, idx) => {
      if (!perTheme[question.tema]) perTheme[question.tema] = { total: 0, score: 0 };
      perTheme[question.tema].total += 1;
      if (state.answers[idx]?.correct) perTheme[question.tema].score += 1;
    });
    return perTheme;
  }

  function renderBreakdown(els) {
    const perTheme = getPerThemeBreakdown();
    els.breakdown.innerHTML = Object.entries(perTheme).map(([theme, stats]) => {
      const pct = Math.round((stats.score / stats.total) * 100);
      const moduleId = window.THEME_TO_MODULE?.[theme];
      const module = window.MODULES?.find(item => item.id === moduleId);
      return `
        <div class="sim-bd-item">
          <div class="sim-bd-tema">${theme}</div>
          <div class="sim-bd-score">${stats.score}/${stats.total} • ${pct}%</div>
          ${module ? `<a class="sim-bd-link" href="${resolveModuleHref(module.url)}">Revisar módulo →</a>` : ''}
        </div>
      `;
    }).join('');
  }

  function renderRecommendations(els) {
    const weakThemes = getWeakThemes();
    if (!els.recommendations) return;
    if (!weakThemes.length) {
      els.recommendations.innerHTML = `
        <div class="sim-rec-card">
          <strong>Revisão sugerida</strong>
          <p>Sem um tema crítico dominante. O melhor próximo passo é repetir o simulado em alguns dias ou praticar exercícios de troubleshooting.</p>
        </div>
      `;
      return;
    }

    els.recommendations.innerHTML = weakThemes.map(theme => {
      const moduleId = window.THEME_TO_MODULE?.[theme];
      const module = window.MODULES?.find(item => item.id === moduleId);
      return `
        <div class="sim-rec-card">
          <strong>${theme}</strong>
          <p>Score abaixo do ideal neste tema. Revise o módulo relacionado antes de tentar novamente.</p>
          ${module ? `<a class="dashboard-link" href="${resolveModuleHref(module.url)}">Abrir ${module.title} →</a>` : ''}
        </div>
      `;
    }).join('');
  }

  function renderHistory(els) {
    if (!els.history || typeof Progress === 'undefined') return;
    const history = Progress.loadSimHistory ? Progress.loadSimHistory() : [];
    if (!history.length) {
      els.history.innerHTML = '<p class="sim-history-empty">Sem tentativas anteriores ainda.</p>';
      return;
    }
    const recent = history.slice(-6);
    els.history.innerHTML = `
      <div class="sim-history-chart">
        ${recent.map(item => `
          <div class="sim-history-item">
            <div class="sim-history-bar" style="height:${Math.max(12, item.pct)}px"></div>
            <span>${item.pct}%</span>
          </div>
        `).join('')}
      </div>
      <p class="sim-history-copy">Últimas tentativas: ${recent.map(item => item.pct + '%').join(' • ')}</p>
    `;
  }

  function getWeakThemes() {
    return Object.entries(getPerThemeBreakdown())
      .map(([theme, stats]) => ({ theme, pct: Math.round((stats.score / stats.total) * 100) }))
      .filter(item => item.pct < 70)
      .sort((a, b) => a.pct - b.pct)
      .map(item => item.theme);
  }

  function resetSimulado(els) {
    clearInterval(state.timerId);
    buildQuestionSet(els);
    state.index = 0;
    state.score = 0;
    state.answered = false;
    state.answers = [];
    state.remaining = TOTAL_TIME;
    els.wrap.style.display = '';
    els.result.classList.remove('show');
    if (els.scoreBadge) els.scoreBadge.style.display = 'none';
    if (els.recommendations) els.recommendations.innerHTML = '';
    renderQuestion(els);
    startTimer(els);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function resolveModuleHref(url) {
    return url.replace(/^pages\//, '');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
