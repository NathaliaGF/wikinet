/* ── RedesWiki — Navigation & Scroll ─────────────────── */
'use strict';

const Navigation = (() => {
  let sections = [];
  let ticking = false;

  function init() {
    collectSections();
    initScrollSpy();
    buildSubNav();
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
      a.classList.toggle('active', id === current.id);
    });
  }

  function buildSubNav() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || sections.length === 0) return;

    const pageId = getCurrentPageIdNav();
    const mod = typeof MODULES !== 'undefined' ? MODULES.find(m => m.id === pageId) : null;
    if (!mod) return;

    // Find the active nav link for this module and append sub-items
    const activeLink = sidebar.querySelector(`a[data-module="${pageId}"]`);
    if (!activeLink) return;

    const navItem = activeLink.closest('.nav-item');
    if (!navItem) return;

    const ul = document.createElement('ul');
    ul.className = 'nav-sub';

    sections.forEach(sec => {
      const heading = sec.querySelector('h2, h3');
      const title = heading ? heading.textContent.replace(/[★⭐]/g, '').trim() : sec.id;
      const li = document.createElement('li');
      li.innerHTML = `<a href="#${sec.id}">${title}</a>`;
      ul.appendChild(li);
    });

    navItem.appendChild(ul);

    // Smooth scroll for sub-nav links
    ul.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Close mobile sidebar
          document.getElementById('sidebar')?.classList.remove('open');
          document.getElementById('sidebarOverlay')?.classList.remove('visible');
        }
      });
    });
  }

  function highlightActive() {
    const pageId = getCurrentPageIdNav();
    document.querySelectorAll('.nav-item a[data-module]').forEach(a => {
      a.classList.toggle('active', a.dataset.module === pageId);
    });
  }

  function getCurrentPageIdNav() {
    const path = window.location.pathname;
    const match = path.match(/\/([^\/]+)\.html$/);
    if (!match) return 'home';
    const raw = decodeURIComponent(match[1]);
    if (raw === 'endereçamento') return 'enderecamento';
    if (raw === 'segurança')     return 'seguranca';
    return raw;
  }

  return { init };
})();
