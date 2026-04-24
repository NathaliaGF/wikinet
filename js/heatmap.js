/* ── RedesWiki — Study Heatmap + Weekly Report ─────── */
'use strict';

const Heatmap = (() => {
  const DAILY_KEY  = 'rw-daily-study';
  const REPORT_KEY = 'rw-weekly-shown';
  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const DAY_ABBR = ['D','S','T','Q','Q','S','S'];

  function getDaily() {
    try { return JSON.parse(localStorage.getItem(DAILY_KEY)) || {}; } catch { return {}; }
  }

  function saveDaily(d) {
    try { localStorage.setItem(DAILY_KEY, JSON.stringify(d)); } catch {}
  }

  /* Call once per page load to record today's activity */
  function trackToday() {
    const key = new Date().toISOString().slice(0, 10);
    const d = getDaily();
    d[key] = (d[key] || 0) + 1;
    // Keep only last 100 days
    const keys = Object.keys(d).sort();
    if (keys.length > 100) keys.slice(0, keys.length - 100).forEach(k => delete d[k]);
    saveDaily(d);
  }

  function computeStreak(daily) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let streak = 0;
    for (let i = 0; i <= 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (daily[d.toISOString().slice(0, 10)]) streak++;
      else if (i > 0) break;
    }
    return streak;
  }

  function render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const daily = getDaily();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    // Build 91-day array (13 weeks)
    const days = [];
    for (let i = 90; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: d, key, count: daily[key] || 0 });
    }
    const max = Math.max(...days.map(d => d.count), 1);
    const studied = days.filter(d => d.count > 0).length;
    const streak  = computeStreak(daily);

    // Pad front to align with Sunday
    const padded = Array(days[0].date.getDay()).fill(null).concat(days);
    while (padded.length % 7) padded.push(null);

    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

    // Summary
    let html = `<div class="hm-summary">
      <span class="hm-badge"><strong>${studied}</strong> dias estudados (últimos 3 meses)</span>
      <span class="hm-badge hm-streak"><strong>${streak}</strong> 🔥 sequência atual</span>
    </div>`;

    // Month labels
    html += `<div class="hm-outer"><div class="hm-month-row">`;
    let lastM = -1;
    weeks.forEach(wk => {
      const first = wk.find(Boolean);
      const m = first ? first.date.getMonth() : lastM;
      html += `<div class="hm-month-cell">${m !== lastM && first ? MONTHS[m] : ''}</div>`;
      if (first) lastM = m;
    });
    html += `</div>`;

    // Day labels + grid
    html += `<div class="hm-body">`;
    html += `<div class="hm-day-col">`;
    DAY_ABBR.forEach((l, i) => {
      html += `<div class="hm-day-lbl">${i % 2 === 1 ? l : ''}</div>`;
    });
    html += `</div>`;

    html += `<div class="hm-weeks">`;
    weeks.forEach(wk => {
      html += `<div class="hm-week">`;
      wk.forEach(cell => {
        if (!cell) { html += `<div class="hm-cell hm-cell--empty"></div>`; return; }
        const lv = cell.count === 0 ? 0 : Math.min(4, Math.ceil((cell.count / max) * 4));
        html += `<div class="hm-cell hm-lv${lv}" title="${cell.key}: ${cell.count} atividade${cell.count !== 1 ? 's' : ''}"></div>`;
      });
      html += `</div>`;
    });
    html += `</div></div>`; // hm-weeks, hm-body

    // Legend
    html += `<div class="hm-legend"><span>Menos</span>`;
    for (let i = 0; i <= 4; i++) html += `<div class="hm-cell hm-lv${i}"></div>`;
    html += `<span>Mais</span></div>`;

    html += `</div>`; // hm-outer
    el.innerHTML = html;
  }

  function maybeShowWeeklyReport() {
    const now = new Date();
    if (now.getDay() !== 1) return;
    if (sessionStorage.getItem(REPORT_KEY)) return;
    sessionStorage.setItem(REPORT_KEY, '1');

    const daily = getDaily();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let daysStudied = 0, totalAct = 0;
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const v = daily[d.toISOString().slice(0, 10)] || 0;
      if (v) { daysStudied++; totalAct += v; }
    }
    if (!daysStudied) return;

    let quizAvg = null;
    try {
      const insights = JSON.parse(localStorage.getItem('rw-quiz-insights')) || {};
      const cutoff = Date.now() - 8 * 86400000;
      const atts = Object.values(insights).flatMap(v => v.attempts || []).filter(a => new Date(a.at) > cutoff);
      if (atts.length) quizAvg = Math.round(atts.reduce((s, a) => s + (a.pct || 0), 0) / atts.length);
    } catch {}

    showReport(daysStudied, quizAvg, computeStreak(daily));
  }

  function showReport(days, quizAvg, streak) {
    const el = document.createElement('div');
    el.className = 'rw-weekly-report';
    el.setAttribute('role', 'status');
    el.innerHTML = `
      <div class="wr-head">
        <span>📊 <strong>Resumo da semana</strong></span>
        <button class="wr-close" aria-label="Fechar">✕</button>
      </div>
      <div class="wr-stats">
        <div class="wr-stat"><span class="wr-num">${days}</span><span class="wr-lbl">dia${days !== 1 ? 's' : ''} estudado${days !== 1 ? 's' : ''}</span></div>
        ${quizAvg !== null ? `<div class="wr-stat"><span class="wr-num">${quizAvg}%</span><span class="wr-lbl">média nos quizzes</span></div>` : ''}
        <div class="wr-stat"><span class="wr-num">${streak}🔥</span><span class="wr-lbl">sequência atual</span></div>
      </div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('wr-show'));

    function dismiss() {
      if (!el.isConnected) return;
      el.classList.remove('wr-show');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }
    el.querySelector('.wr-close').addEventListener('click', dismiss);
    setTimeout(dismiss, 12000);
  }

  return { trackToday, render, maybeShowWeeklyReport };
})();

window.Heatmap = Heatmap;
