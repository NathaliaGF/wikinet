/* ── RedesWiki — Navigation & Scroll ─────────────────── */
'use strict';

const Navigation = (() => {
  let sections = [];
  let ticking = false;

  function init() {
    collectSections();
    initScrollSpy();
    syncCurrentModuleTopics();
    bindCurrentModuleSubnav();
    highlightActive();
  }

  function collectSections() {
    sections = Array.from(document.querySelectorAll('.section[id]'));
  }

  function initScrollSpy() {
    if (sections.length === 0) return;
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateActiveSection();
    });
  }

  function updateActiveSection() {
    const scrollY = window.scrollY + 120;
    let current = sections[0];

    for (const sec of sections) {
      if (sec.offsetTop <= scrollY) {
        current = sec;
      }
    }

    if (!current) return;

    // Highlight in sub-nav
    document.querySelectorAll('.nav-sub li a').forEach(a => {
      const href = a.getAttribute('href');
      const id = href && href.startsWith('#') ? href.slice(1) : null;
      if (!id) return;
      const active = id === current.id;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }

  function syncCurrentModuleTopics() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || sections.length === 0) return;

    const pageId = getCurrentPageIdNav();
    const topicLinks = sidebar.querySelectorAll(`a[data-module-topic="${pageId}"]`);
    if (!topicLinks.length) return;

    topicLinks.forEach((link, index) => {
      const sec = sections[index];
      if (!sec) return;

      const heading = sec.querySelector('h2, h3');
      const title = heading ? heading.textContent.replace(/[★⭐]/g, '').trim() : sec.id;
      link.setAttribute('href', `#${sec.id}`);
      link.dataset.topicId = sec.id;

      const indexEl = link.querySelector('.nav-sub-index');
      const labelEl = link.querySelector('.nav-sub-label');
      if (indexEl) indexEl.textContent = `${index + 1}.`;
      if (labelEl) labelEl.textContent = title;

      const item = link.closest('[data-module-item]');
      const wrap = item?.querySelector('.nav-sub-wrap');
      const trigger = item?.querySelector('.nav-module-trigger');
      if (item && wrap && trigger) {
        item.classList.add('expanded', 'current');
        wrap.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        link.closest('a')?.setAttribute('aria-current', 'location');
      }
    });
  }

  function bindCurrentModuleSubnav() {
    document.querySelectorAll('.nav-sub a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.getElementById('sidebar')?.classList.remove('open');
          document.getElementById('sidebarOverlay')?.classList.remove('visible');
        }
      });
    });
  }

  function highlightActive() {
    const pageId = getCurrentPageIdNav();
    document.querySelectorAll('.nav-module-item').forEach(item => {
      const isCurrent = item.dataset.moduleItem === pageId;
      item.classList.toggle('current', isCurrent);
      item.classList.toggle('expanded', isCurrent || item.classList.contains('expanded'));
      const trigger = item.querySelector('.nav-module-trigger');
      if (trigger) {
        if (isCurrent) trigger.setAttribute('aria-current', 'page');
        else trigger.removeAttribute('aria-current');
      }
    });
  }

  function getCurrentPageIdNav() {
    return Progress.getCurrentPageId();
  }

  return { init };
})();
