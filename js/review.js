/* ── RedesWiki — Central de revisão ─────────────────── */
'use strict';

(() => {
  async function init() {
    const root = document.getElementById('reviewHub');
    if (!root || typeof Progress === 'undefined') return;

    renderReviewHub();
    await renderConsistencyAudit();
  }

  function renderReviewHub() {
    const dashboard = Progress.getStudyDashboard();
    const reviewQueue = dashboard.reviewQueue;
    const weakModules = dashboard.weakModules;
    const readiness = dashboard.readiness || [];
    const goals = dashboard.goalProgress || [];
    const simHistory = dashboard.simuladoHistory || [];
    const lastSim = simHistory.at(-1);
    const exerciseHistory = dashboard.exercises || {};
    const pendingExercises = Object.entries(exerciseHistory).filter(([, value]) => value.status !== 'completed');

    setHtml('reviewQueueCards', reviewQueue.length ? reviewQueue.map(item => `
      <article class="review-card">
        <div class="dashboard-kicker">${item.type === 'flashcards' ? 'Flashcards' : 'Seção marcada'}</div>
        <h3>${item.moduleTitle}</h3>
        <p>${item.label}</p>
        <a class="dashboard-link" href="${resolveModuleLink(item.moduleId, item.sectionId)}">Abrir revisão →</a>
      </article>
    `).join('') : '<p class="review-empty">Nada urgente na fila de revisão.</p>');

    setHtml('weakThemeCards', weakModules.length ? weakModules.map(entry => `
      <article class="review-card">
        <div class="dashboard-kicker">Tema fraco</div>
        <h3>${entry.module.title}</h3>
        <p>Aprendizagem ${entry.learning.pct}% • Quiz ${entry.quiz.attempts ? `${entry.quiz.avgPct}%` : 'não feito'}.</p>
        <a class="dashboard-link" href="${entry.module.url}">Revisar módulo →</a>
      </article>
    `).join('') : '<p class="review-empty">Sem temas fracos detectados ainda.</p>');

    setHtml('goalReviewCards', goals.length ? goals.map(goal => `
      <article class="review-card">
        <div class="dashboard-kicker">Objetivo</div>
        <h3>${goal.goal.title}</h3>
        <p>${goal.pct}% concluído • faltam ${goal.remaining.length} módulos prontos.</p>
        <p>${goal.remaining[0] ? `Próximo gargalo: ${goal.remaining[0].title}.` : 'Trilha pronta para revisão final.'}</p>
      </article>
    `).join('') : '<p class="review-empty">Sem objetivos configurados.</p>');

    setHtml('simuladoPanel', lastSim ? `
      <article class="review-card wide">
        <div class="dashboard-kicker">Último simulado</div>
        <h3>${lastSim.pct}% em ${new Date(lastSim.at).toLocaleDateString('pt-BR')}</h3>
        <p>Temas abaixo de 70%: ${(lastSim.weakThemes || []).join(', ') || 'nenhum'}.</p>
        <div class="review-link-row">
          <a class="dashboard-link" href="simulado.html">Refazer simulado →</a>
          <a class="dashboard-link" href="simulado.html#simuladoApp">Refazer só erros/temas fracos →</a>
        </div>
      </article>
    ` : '<p class="review-empty">Faça um simulado para alimentar esta área.</p>');

    setHtml('exercisePanel', pendingExercises.length ? pendingExercises.map(([id, value]) => `
      <article class="review-card">
        <div class="dashboard-kicker">Exercício pendente</div>
        <h3>${humanizeExerciseId(id)}</h3>
        <p>Status atual: ${value.status || 'aberto'}.</p>
        <a class="dashboard-link" href="exercicios.html">Voltar ao laboratório →</a>
      </article>
    `).join('') : '<p class="review-empty">Nenhum exercício aberto. Bom sinal.</p>');

    setHtml('readinessPanel', readiness.filter(Boolean).map(item => `
      <article class="review-card">
        <div class="dashboard-kicker">Prontidão</div>
        <h3>${item.module.title}</h3>
        <p>${item.label}</p>
        <ul class="dashboard-list compact">
          <li><strong>Seções</strong><span>${item.completion.pct}%</span></li>
          <li><strong>Quiz</strong><span>${item.quiz.attempts ? `${item.quiz.lastPct}%` : 'não feito'}</span></li>
          <li><strong>Termos centrais</strong><span>${item.flashcards.total ? `${item.flashcards.pct}% revisados` : 'n/a'}</span></li>
        </ul>
      </article>
    `).join(''));
  }

  async function renderConsistencyAudit() {
    const container = document.getElementById('consistencyAudit');
    if (!container || typeof MODULES === 'undefined') return;

    const results = await Promise.all(MODULES.map(async module => {
      try {
        const siteRoot = window.location.href.replace(/\/pages\/[^/]+$/, '/');
        const response = await fetch(siteRoot + module.url);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const ids = Array.from(doc.querySelectorAll('.section[id]')).map(section => section.id);
        const missingInHtml = module.sections.filter(id => !ids.includes(id));
        const missingInData = ids.filter(id => !module.sections.includes(id));
        const missingMeta = typeof MODULE_META !== 'undefined' && MODULE_META[module.id]
          ? ['difficulty', 'estTime', 'outcomes'].filter(key => !MODULE_META[module.id][key] || !MODULE_META[module.id][key].length)
          : ['difficulty', 'estTime', 'outcomes'];
        return { module, ids, missingInHtml, missingInData, missingMeta, ok: !missingInHtml.length && !missingInData.length && !missingMeta.length };
      } catch (error) {
        return { module, error: error.message, ok: false, missingInHtml: [], missingInData: [], missingMeta: [] };
      }
    }));

    container.innerHTML = results.map(result => `
      <article class="review-card ${result.ok ? 'ok' : 'warn'}">
        <div class="dashboard-kicker">${result.ok ? 'Consistente' : 'Atenção'}</div>
        <h3>${result.module.title}</h3>
        ${result.error ? `<p>Falha ao ler a página: ${result.error}</p>` : `
          <p>${result.ok ? 'IDs, âncoras e metadados principais batem com o conteúdo.' : 'Há diferenças entre HTML e data/content.js ou metadados incompletos.'}</p>
          ${result.missingInHtml.length ? `<p><strong>Faltando no HTML:</strong> ${result.missingInHtml.join(', ')}</p>` : ''}
          ${result.missingInData.length ? `<p><strong>Faltando em content.js:</strong> ${result.missingInData.join(', ')}</p>` : ''}
          ${result.missingMeta.length ? `<p><strong>Metadados incompletos:</strong> ${result.missingMeta.join(', ')}</p>` : ''}
        `}
      </article>
    `).join('');
  }

  function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function resolveModuleLink(moduleId, sectionId = '') {
    const module = MODULES.find(item => item.id === moduleId);
    if (!module) return 'exercicios.html';
    return `${module.url.replace(/^pages\//, '')}${sectionId ? `#${sectionId}` : ''}`;
  }

  function humanizeExerciseId(id) {
    return ({
      'dns-ip-ok-domain-fail': 'DNS: IP funciona, domínio falha',
      'single-site-down': 'Apenas um site falha',
      'gateway-ok-internet-down': 'LAN ok, internet não',
      'service-port-closed': 'Serviço/porta parece fechado',
      'latency-after-hops': 'Latência alta após alguns hops',
      'dns-interno-divergente': 'DNS interno divergente'
    })[id] || id;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
