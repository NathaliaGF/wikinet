/* ── RedesWiki — Quizzes, Flashcards, Search ─────────── */
'use strict';

const Interactive = (() => {

  /* ── Init ───────────────────────────────────────────── */
  function init() {
    initSearch();
    initAllFlashcards();
    initAllQuizzes();
  }

  /* ── Search ─────────────────────────────────────────── */
  function initSearch() {
    const input = document.getElementById('sidebarSearch');
    if (!input) return;

    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => performSearch(input.value.trim()), 200);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        input.value = '';
        clearHighlights();
      }
    });
  }

  function performSearch(term) {
    clearHighlights();
    if (!term || term.length < 2) return;

    const article = document.querySelector('.article-wrapper');
    if (!article) return;

    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (['SCRIPT','STYLE','MARK','INPUT','TEXTAREA'].includes(parent.tagName))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const matches = [];
    const re = new RegExp(`(${escapeRegex(term)})`, 'gi');
    let node;
    while ((node = walker.nextNode())) {
      if (re.test(node.textContent)) matches.push(node);
    }

    matches.forEach(textNode => {
      const frag = document.createDocumentFragment();
      const parts = textNode.textContent.split(re);
      parts.forEach(part => {
        if (re.test(part)) {
          const mark = document.createElement('mark');
          mark.className = 'search-hl';
          mark.textContent = part;
          frag.appendChild(mark);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });

    // Scroll to first match
    const first = document.querySelector('mark.search-hl');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearHighlights() {
    document.querySelectorAll('mark.search-hl').forEach(mark => {
      const parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ── Flashcards ─────────────────────────────────────── */
  function initAllFlashcards() {
    document.querySelectorAll('[data-flashcard-set]').forEach(container => {
      const setId = container.dataset.flashcardSet;
      if (!FLASHCARDS || !FLASHCARDS[setId]) return;
      initFlashcardSet(container, [...FLASHCARDS[setId]]);
    });
  }

  function initFlashcardSet(container, cards) {
    let index = 0;
    let flipped = false;
    let deck = [...cards];

    const viewport = container.querySelector('.fc-viewport');
    const counter  = container.querySelector('.fc-counter');
    const prevBtn  = container.querySelector('[data-fc-prev]');
    const nextBtn  = container.querySelector('[data-fc-next]');
    const shuffBtn = container.querySelector('[data-fc-shuffle]');

    function render() {
      const card = deck[index];
      const cardEl = viewport.querySelector('.fc-card');
      if (!cardEl) return;

      flipped = false;
      cardEl.classList.remove('flipped');

      cardEl.querySelector('.fc-question').textContent = card.q;
      cardEl.querySelector('.fc-answer').textContent   = card.a;

      if (counter) counter.textContent = `${index + 1} / ${deck.length}`;
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === deck.length - 1;
    }

    // Flip on click
    const cardEl = viewport.querySelector('.fc-card');
    if (cardEl) {
      cardEl.addEventListener('click', () => {
        flipped = !flipped;
        cardEl.classList.toggle('flipped', flipped);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { if (index > 0) { index--; render(); } });
    if (nextBtn) nextBtn.addEventListener('click', () => { if (index < deck.length - 1) { index++; render(); } });
    if (shuffBtn) shuffBtn.addEventListener('click', () => {
      deck = shuffle([...cards]);
      index = 0;
      render();
    });

    render();
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ── Quiz ───────────────────────────────────────────── */
  function initAllQuizzes() {
    document.querySelectorAll('[data-quiz-set]').forEach(container => {
      const setId = container.dataset.quizSet;
      if (!QUIZZES || !QUIZZES[setId]) return;
      initQuiz(container, QUIZZES[setId]);
    });
  }

  function initQuiz(container, questions) {
    let currentQ = 0;
    let score = 0;
    let answered = false;

    const questionsEl = container.querySelectorAll('.quiz-question');
    const resultEl    = container.querySelector('.quiz-result');
    const scoreBadge  = container.querySelector('.quiz-score-badge');

    function renderQuestion(idx) {
      const q = questions[idx];
      const qEl = questionsEl[idx];
      if (!qEl) return;

      // Show only current question
      questionsEl.forEach((el, i) => el.classList.toggle('active', i === idx));

      const numEl = qEl.querySelector('.quiz-q-num');
      if (numEl) numEl.textContent = `Pergunta ${idx + 1} de ${questions.length}`;

      const textEl = qEl.querySelector('.quiz-q-text');
      if (textEl) textEl.textContent = q.q;

      const optsEl = qEl.querySelector('.quiz-options');
      if (optsEl) {
        optsEl.innerHTML = q.opts.map((opt, i) => `
          <button class="quiz-opt" data-index="${i}">
            <span class="quiz-opt-letter">${String.fromCharCode(65 + i)}</span>
            <span>${opt}</span>
          </button>`).join('');

        optsEl.querySelectorAll('.quiz-opt').forEach(btn => {
          btn.addEventListener('click', () => handleAnswer(btn, qEl, q));
        });
      }

      const feedbackEl = qEl.querySelector('.quiz-feedback');
      if (feedbackEl) { feedbackEl.className = 'quiz-feedback'; feedbackEl.textContent = ''; }

      const nextBtn = qEl.querySelector('.quiz-next-btn');
      if (nextBtn) { nextBtn.classList.remove('show'); nextBtn.textContent = idx < questions.length - 1 ? 'Próxima →' : 'Ver resultado'; }

      answered = false;
    }

    function handleAnswer(btn, qEl, q) {
      if (answered) return;
      answered = true;

      const chosen = parseInt(btn.dataset.index);
      const correct = q.correct;
      const isCorrect = chosen === correct;
      if (isCorrect) score++;

      // Style options
      qEl.querySelectorAll('.quiz-opt').forEach((el, i) => {
        el.classList.add('disabled');
        if (i === correct) el.classList.add('correct');
        else if (i === chosen) el.classList.add('wrong');
      });

      // Feedback
      const feedbackEl = qEl.querySelector('.quiz-feedback');
      if (feedbackEl) {
        feedbackEl.textContent = (isCorrect ? '✓ Correto! ' : '✗ Incorreto. ') + q.explanation;
        feedbackEl.className = `quiz-feedback show ${isCorrect ? 'correct-fb' : 'wrong-fb'}`;
      }

      // Next button
      const nextBtn = qEl.querySelector('.quiz-next-btn');
      if (nextBtn) nextBtn.classList.add('show');
    }

    // Wire next buttons
    questionsEl.forEach((qEl, idx) => {
      const nextBtn = qEl.querySelector('.quiz-next-btn');
      if (!nextBtn) return;
      nextBtn.addEventListener('click', () => {
        if (idx < questions.length - 1) {
          currentQ = idx + 1;
          renderQuestion(currentQ);
        } else {
          showResult();
        }
      });
    });

    function showResult() {
      questionsEl.forEach(el => el.classList.remove('active'));
      if (resultEl) {
        const pct = Math.round((score / questions.length) * 100);
        let msg = '';
        if (pct === 100) msg = '🎉 Perfeito! Você domina este módulo.';
        else if (pct >= 66) msg = '👍 Bom resultado! Revise os erros para fixar melhor.';
        else if (pct >= 33) msg = '📚 Continue estudando! Releia as seções relacionadas.';
        else msg = '🔄 Recomendamos reler este módulo antes de tentar novamente.';

        resultEl.querySelector('.quiz-result-score').textContent = `${score}/${questions.length}`;
        resultEl.querySelector('.quiz-result-msg').textContent = msg;
        resultEl.classList.add('show');

        if (scoreBadge) {
          scoreBadge.textContent = `${pct}%`;
          scoreBadge.style.display = 'inline-block';
        }
      }
    }

    // Retry
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

  return { init };
})();
