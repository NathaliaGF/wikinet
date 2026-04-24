/* ── RedesWiki — Pomodoro Timer ───────────────────────── */
'use strict';

(function () {
  const WORK    = 25 * 60;
  const BREAK   = 5  * 60;
  const LONG    = 15 * 60;
  const KEY     = 'rw-pomodoro';

  let mode      = 'idle';   // 'idle' | 'work' | 'break' | 'long'
  let remaining = WORK;
  let sessions  = 0;
  let ticking   = false;
  let timer     = null;
  let panelOpen = false;

  let elFab, elPanel, elTime, elModeLabel, elSessions, elFill, elStart, elReset;

  /* ── Storage ─────────────────────────────────────────── */
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify({ sessions })); } catch {}
  }

  function restore() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d?.sessions) sessions = d.sessions;
    } catch {}
  }

  /* ── Timer logic ─────────────────────────────────────── */
  function tick() {
    if (remaining <= 0) { endPhase(); return; }
    remaining--;
    render();
  }

  function startTimer() {
    if (timer) return;
    timer   = setInterval(tick, 1000);
    ticking = true;
  }

  function stopTimer() {
    clearInterval(timer);
    timer   = null;
    ticking = false;
  }

  function endPhase() {
    stopTimer();
    if (mode === 'work') {
      sessions++;
      persist();
      const isLong = sessions % 4 === 0;
      mode      = isLong ? 'long' : 'break';
      remaining = isLong ? LONG : BREAK;
      pushToast(`Sessão ${sessions} concluída!`, isLong ? 'Pausa longa: 15 min.' : 'Pausa curta: 5 min.');
      fireNotif('Hora de descansar!', mode === 'long' ? 'Pausa longa de 15 minutos.' : 'Pausa de 5 minutos.');
    } else {
      mode      = 'idle';
      remaining = WORK;
      pushToast('Descanso encerrado', 'Pronto para mais 25 minutos?');
      fireNotif('Descanso encerrado', 'Pronto para continuar?');
    }
    render();
    if (!panelOpen) openPanel();
  }

  function handleStartPause() {
    if (mode === 'idle') {
      mode      = 'work';
      remaining = WORK;
    }
    if (ticking) { stopTimer(); }
    else         { startTimer(); }
    render();
  }

  function handleReset() {
    stopTimer();
    mode      = 'idle';
    remaining = WORK;
    render();
  }

  /* ── Total seconds for current mode ─────────────────── */
  function total() {
    return mode === 'long' ? LONG : (mode === 'break' ? BREAK : WORK);
  }

  /* ── Format mm:ss ────────────────────────────────────── */
  function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  /* ── Render ──────────────────────────────────────────── */
  function render() {
    if (!elTime) return;

    const isBreak = mode === 'break' || mode === 'long';
    const pct     = total() > 0 ? (1 - remaining / total()) * 100 : 0;
    const label   = mode === 'idle' ? 'Pronto para começar'
                  : mode === 'work' ? 'Foco — 25 minutos'
                  : mode === 'long' ? 'Pausa longa — 15 min'
                  : 'Pausa — 5 minutos';

    elTime.textContent = fmt(remaining);
    elTime.className   = 'rw-pom-time' + (isBreak ? ' rw-pom-break' : '');
    elModeLabel.textContent = label;
    elSessions.textContent  = `Sessão ${sessions}${sessions ? ` concluída${sessions > 1 ? 's' : ''}` : ''}`;

    elFill.style.width = `${pct}%`;
    elFill.className   = 'rw-pom-fill' + (isBreak ? ' rw-pom-fill-break' : '');

    elStart.textContent = mode === 'idle' ? 'Iniciar' : ticking ? 'Pausar' : 'Continuar';

    elFab.className = 'rw-pom-fab'
      + (mode === 'work'  && ticking ? ' rw-pom-running' : '')
      + (isBreak          && ticking ? ' rw-pom-pause'   : '');

    document.title = ticking
      ? `${fmt(remaining)} — RedesWiki`
      : document.title.replace(/^\d\d:\d\d — /, '');
  }

  /* ── Panel open/toggle ───────────────────────────────── */
  function openPanel() {
    panelOpen = true;
    elPanel.classList.add('open');
    elFab.setAttribute('aria-expanded', 'true');
  }

  function togglePanel() {
    panelOpen = !panelOpen;
    elPanel.classList.toggle('open', panelOpen);
    elFab.setAttribute('aria-expanded', String(panelOpen));
  }

  /* ── Notifications ───────────────────────────────────── */
  function fireNotif(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const icon = window.location.pathname.includes('/pages/')
      ? '../icons/icon-192.png' : 'icons/icon-192.png';
    try { new Notification(title, { body, icon }); } catch {}
  }

  function pushToast(title, body) {
    const t = document.createElement('div');
    t.className = 'rw-toast';
    t.innerHTML = `<span class="rw-toast-icon">⏱</span> <span><strong>${title}</strong> ${body}</span>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('rw-toast--show'));
    setTimeout(() => {
      t.classList.remove('rw-toast--show');
      t.addEventListener('transitionend', () => t.remove(), { once: true });
    }, 4000);
  }

  /* ── Build DOM ───────────────────────────────────────── */
  function build() {
    restore();

    const wrap = document.createElement('div');
    wrap.className = 'rw-pomodoro';
    wrap.innerHTML = `
      <div class="rw-pom-panel" role="complementary" aria-label="Timer Pomodoro">
        <span class="rw-pom-mode-label">Pronto para começar</span>
        <div class="rw-pom-time">25:00</div>
        <div class="rw-pom-sessions">Sessão 0</div>
        <div class="rw-pom-track"><div class="rw-pom-fill"></div></div>
        <div class="rw-pom-btns">
          <button class="rw-pom-btn rw-pom-primary" id="rwPomStart" type="button">Iniciar</button>
          <button class="rw-pom-btn" id="rwPomReset" type="button" title="Resetar">↺</button>
        </div>
        <p style="font-size:0.65rem;color:var(--text-muted);margin:0;text-align:center;line-height:1.4">
          25 min foco → 5 min pausa<br>A cada 4 sessões: 15 min
        </p>
      </div>
      <button class="rw-pom-fab" aria-label="Pomodoro Timer" aria-expanded="false" title="Timer Pomodoro" type="button">
        ⏱
      </button>`;

    document.body.appendChild(wrap);

    elFab      = wrap.querySelector('.rw-pom-fab');
    elPanel    = wrap.querySelector('.rw-pom-panel');
    elTime     = wrap.querySelector('.rw-pom-time');
    elModeLabel= wrap.querySelector('.rw-pom-mode-label');
    elSessions = wrap.querySelector('.rw-pom-sessions');
    elFill     = wrap.querySelector('.rw-pom-fill');
    elStart    = wrap.querySelector('#rwPomStart');
    elReset    = wrap.querySelector('#rwPomReset');

    elFab.addEventListener('click', togglePanel);
    elStart.addEventListener('click', handleStartPause);
    elReset.addEventListener('click', handleReset);

    if ('Notification' in window && Notification.permission === 'default') {
      const notifBtn = document.createElement('button');
      notifBtn.className = 'rw-pom-btn rw-pom-notif-btn';
      notifBtn.type = 'button';
      notifBtn.title = 'Receber alertas ao fim de cada sessão Pomodoro';
      notifBtn.textContent = '🔔 Ativar alertas';
      notifBtn.addEventListener('click', () => {
        Notification.requestPermission().then(() => notifBtn.remove());
      });
      elPanel.querySelector('p').insertAdjacentElement('afterend', notifBtn);
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panelOpen) {
        panelOpen = false;
        elPanel.classList.remove('open');
        elFab.setAttribute('aria-expanded', 'false');
      }
      /* p key toggles timer when not in input */
      if (e.key === 'p' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
        if (!panelOpen) openPanel();
        handleStartPause();
      }
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
