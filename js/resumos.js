/* ── RedesWiki — Cheat Sheet: busca + copiar ─────────── */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCsSearch();
  initCsCopyButtons();
});

/* ── Busca em tempo real ─────────────────────────────── */
function initCsSearch() {
  const input = document.getElementById('csSearch');
  if (!input) return;

  const sections = Array.from(document.querySelectorAll('.cs-section'));

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let anyVisible = false;

    sections.forEach(section => {
      if (!q) {
        // Show everything
        section.classList.remove('cs-hidden');
        section.querySelectorAll('tr, .cs-glossary-term, .cs-glossary-letter').forEach(el => el.classList.remove('cs-hidden'));
        anyVisible = true;
        return;
      }

      // Glossary terms: search by title + definition
      const terms = section.querySelectorAll('.cs-glossary-term');
      if (terms.length) {
        let letterGroupVisible = {};
        terms.forEach(term => {
          const text = term.textContent.toLowerCase();
          const match = text.includes(q);
          term.classList.toggle('cs-hidden', !match);
          if (match) {
            // Find its preceding letter heading
            let prev = term.previousElementSibling;
            while (prev && !prev.classList.contains('cs-glossary-letter')) prev = prev.previousElementSibling;
            if (prev) letterGroupVisible[prev.id] = true;
          }
        });
        // Show/hide letter headings
        section.querySelectorAll('.cs-glossary-letter').forEach(hdr => {
          hdr.classList.toggle('cs-hidden', !letterGroupVisible[hdr.id]);
        });
        const visibleTerms = section.querySelectorAll('.cs-glossary-term:not(.cs-hidden)').length;
        section.classList.toggle('cs-hidden', visibleTerms === 0);
        if (visibleTerms > 0) anyVisible = true;
        return;
      }

      // Table rows: search each row's text
      const rows = section.querySelectorAll('tbody tr');
      if (rows.length) {
        let visibleRows = 0;
        rows.forEach(row => {
          const match = row.textContent.toLowerCase().includes(q);
          row.classList.toggle('cs-hidden', !match);
          if (match) visibleRows++;
        });
        const sectionText = section.querySelector('h2, h3')?.textContent.toLowerCase() || '';
        const sectionMatch = sectionText.includes(q);
        if (sectionMatch) {
          // Show whole section if title matches
          rows.forEach(row => row.classList.remove('cs-hidden'));
          section.classList.remove('cs-hidden');
          anyVisible = true;
        } else {
          section.classList.toggle('cs-hidden', visibleRows === 0);
          if (visibleRows > 0) anyVisible = true;
        }
        return;
      }

      // Generic section: search full text
      const match = section.textContent.toLowerCase().includes(q);
      section.classList.toggle('cs-hidden', !match);
      if (match) anyVisible = true;
    });

    let noRes = document.getElementById('csNoResults');
    if (!anyVisible && q) {
      if (!noRes) {
        noRes = document.createElement('div');
        noRes.id = 'csNoResults';
        noRes.className = 'cs-no-results';
        document.querySelector('main')?.appendChild(noRes);
      }
      noRes.textContent = `Nenhum resultado para "${input.value.trim()}"`;
      noRes.hidden = false;
    } else if (noRes) {
      noRes.hidden = true;
    }
  });
}

/* ── Botões "Copiar tabela" ──────────────────────────── */
function initCsCopyButtons() {
  document.querySelectorAll('.cs-section').forEach(section => {
    const table = section.querySelector('.cs-table');
    const title = section.querySelector('.cs-title');
    if (!table || !title) return;

    const btn = document.createElement('button');
    btn.className = 'cs-copy-btn';
    btn.type = 'button';
    btn.textContent = '📋 Copiar';
    btn.title = 'Copiar tabela como texto';

    btn.addEventListener('click', () => {
      const lines = [];
      table.querySelectorAll('tr').forEach(row => {
        const cells = Array.from(row.querySelectorAll('th, td')).map(c => c.textContent.trim());
        lines.push(cells.join('\t'));
      });
      navigator.clipboard?.writeText(lines.join('\n')).then(() => {
        btn.textContent = '✓ Copiado!';
        setTimeout(() => { btn.textContent = '📋 Copiar'; }, 2000);
      }).catch(() => {
        btn.textContent = '✗ Erro';
        setTimeout(() => { btn.textContent = '📋 Copiar'; }, 2000);
      });
    });

    title.appendChild(btn);
  });
}
