/* ── RedesWiki — SM-2 Spaced Repetition ──────────────── */
'use strict';

const SR = (() => {
  const KEY = window.StorageHub?.KEYS?.sm2 || 'rw-sm2';

  function loadAll() {
    if (window.StorageHub) return window.StorageHub.loadJson(KEY, {});
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { return {}; }
  }

  function saveAll(data) {
    if (window.StorageHub) window.StorageHub.saveJson(KEY, data);
    else localStorage.setItem(KEY, JSON.stringify(data));
  }

  function cardKey(moduleId, index) {
    return `${moduleId}:${index}`;
  }

  function getCard(moduleId, index) {
    const data = loadAll();
    return data[cardKey(moduleId, index)] || { ef: 2.5, interval: 1, reps: 0, due: todayStr() };
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function isDue(card) {
    return card.due <= todayStr();
  }

  /* SM-2 update after a response
   * quality: 1 = forgot, 3 = hard, 4 = good, 5 = easy */
  function review(moduleId, index, quality) {
    const data  = loadAll();
    const key   = cardKey(moduleId, index);
    const card  = data[key] || { ef: 2.5, interval: 1, reps: 0, due: todayStr() };

    let { ef, interval, reps } = card;

    if (quality >= 3) {
      if (reps === 0)      interval = 1;
      else if (reps === 1) interval = 6;
      else                 interval = Math.round(interval * ef);
      reps++;
    } else {
      reps     = 0;
      interval = 1;
    }

    ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    ef = Math.max(1.3, Math.round(ef * 100) / 100);

    data[key] = { ef, interval, reps, due: addDays(todayStr(), interval) };
    saveAll(data);
    return data[key];
  }

  /* Return indices sorted by due date (most overdue first) */
  function sortedIndices(moduleId, total) {
    const data = loadAll();
    return Array.from({ length: total }, (_, i) => {
      const key  = cardKey(moduleId, i);
      const card = data[key] || { due: todayStr() };
      return { index: i, due: card.due, reps: (data[key] || {}).reps || 0 };
    }).sort((a, b) => {
      if (a.due < b.due) return -1;
      if (a.due > b.due) return 1;
      return a.reps - b.reps;
    }).map(x => x.index);
  }

  function dueCount(moduleId, total) {
    const data  = loadAll();
    const today = todayStr();
    let count   = 0;
    for (let i = 0; i < total; i++) {
      const card = data[cardKey(moduleId, i)];
      if (!card || card.due <= today) count++;
    }
    return count;
  }

  function getNextInterval(moduleId, index) {
    const card = getCard(moduleId, index);
    return card.interval;
  }

  function resetModule(moduleId, total) {
    const data = loadAll();
    for (let i = 0; i < total; i++) delete data[cardKey(moduleId, i)];
    saveAll(data);
  }

  function resetAll() {
    if (window.StorageHub) window.StorageHub.remove(KEY);
    else localStorage.removeItem(KEY);
  }

  return { review, sortedIndices, dueCount, getCard, isDue, resetModule, resetAll, todayStr };
})();
