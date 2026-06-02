/* ── RedesWiki — Laboratório Interativo ─────────────── */
'use strict';

const Lab = (() => {

  /* ── Tabs ────────────────────────────────────────────── */
  function initTabs() {
    const tabs = [...document.querySelectorAll('.lab-tab')];
    const panels = [...document.querySelectorAll('.lab-panel')];
    const scroller = document.getElementById('labTabs');
    const prevBtn = document.getElementById('labTabsPrev');
    const nextBtn = document.getElementById('labTabsNext');
    if (!tabs.length || !scroller) return;

    function updateNav() {
      const hasOverflow = scroller.scrollWidth > scroller.clientWidth + 4;
      if (prevBtn) prevBtn.hidden = !hasOverflow || scroller.scrollLeft <= 8;
      if (nextBtn) nextBtn.hidden = !hasOverflow || scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 8;
    }

    function activate(id) {
      tabs.forEach(tab => {
        const isActive = tab.dataset.tab === id;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
        if (isActive) tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
      panels.forEach(panel => {
        const isActive = panel.id === id;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
      });
      updateNav();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab.dataset.tab));
      tab.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const dir = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + dir + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        activate(tabs[nextIndex].dataset.tab);
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', () => scroller.scrollBy({ left: -200, behavior: 'smooth' }));
    if (nextBtn) nextBtn.addEventListener('click', () => scroller.scrollBy({ left: 200, behavior: 'smooth' }));
    scroller.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);

    activate(tabs[0].dataset.tab);
    updateNav();
  }

  /* ══════════════════════════════════════════════════════
     1. PACKET JOURNEY
  ══════════════════════════════════════════════════════ */
  function initPacketJourney() {
    const container = document.getElementById('labPacket');
    if (!container) return;

    const STEPS = [
      {
        title: 'Seu PC (origem)',
        icon: '🖥️',
        color: '#4f8ef7',
        fields: [
          { k: 'IP Origem', v: '192.168.1.10' },
          { k: 'IP Destino', v: '142.250.65.14' },
          { k: 'Porta Origem', v: '54321 (efêmera)' },
          { k: 'Porta Destino', v: '443 (HTTPS)' },
          { k: 'TTL', v: '64' },
          { k: 'Protocolo', v: 'TCP' }
        ],
        note: 'O sistema operacional escolhe uma porta efêmera aleatória e inicia a conexão TCP.'
      },
      {
        title: 'Switch (L2)',
        icon: '🔀',
        color: '#8b5cf6',
        fields: [
          { k: 'MAC Origem', v: 'AA:BB:CC:11:22:33' },
          { k: 'MAC Destino', v: 'FF:GG:HH:44:55:66 (roteador)' },
          { k: 'VLAN', v: '1 (default)' },
          { k: 'TTL', v: '64 (não alterado — L2)' }
        ],
        note: 'O switch opera na camada 2. Ele consulta a tabela MAC e encaminha o quadro sem alterar o TTL.'
      },
      {
        title: 'Roteador (NAT)',
        icon: '🌐',
        color: '#22c55e',
        fields: [
          { k: 'IP Origem', v: '201.22.35.100 (após NAT)' },
          { k: 'IP Destino', v: '142.250.65.14' },
          { k: 'Porta Origem', v: '54321 → 60412 (NAT table)' },
          { k: 'TTL', v: '63 (decrementado)' },
          { k: 'Rota', v: 'via 10.0.0.1 (ISP gateway)' }
        ],
        note: 'O roteador troca IP privado por público e decrementa o TTL em cada salto.'
      },
      {
        title: 'Internet (ISP / Backbone)',
        icon: '☁️',
        color: '#f59e0b',
        fields: [
          { k: 'IP Origem', v: '201.22.35.100' },
          { k: 'IP Destino', v: '142.250.65.14' },
          { k: 'TTL', v: '62 → 59 (múltiplos saltos)' },
          { k: 'Rota', v: 'AS12345 → AS15169 (Google)' },
          { k: 'Latência', v: '~18 ms' }
        ],
        note: 'O backbone usa BGP para rotear entre ASNs; cada roteador decide o próximo salto.'
      },
      {
        title: 'Servidor (destino)',
        icon: '🗄️',
        color: '#ef4444',
        fields: [
          { k: 'IP Destino', v: '142.250.65.14 ✓' },
          { k: 'Porta', v: '443 (HTTPS/TLS)' },
          { k: 'TTL chegou', v: '59 (sobreviveu!)' },
          { k: 'Resposta', v: 'SYN-ACK → dados TLS' }
        ],
        note: 'O servidor recebe o pacote, valida IP e porta, completa o handshake TCP e começa o TLS.'
      }
    ];

    const NODE_LABELS = ['Seu PC', 'Switch', 'Roteador', 'Internet', 'Servidor'];
    const NODE_ICONS = ['🖥️', '🔀', '🌐', '☁️', '🗄️'];
    let step = -1;

    container.innerHTML = `
      <div class="pkt-stage">
        <div class="pkt-nodes" id="pktNodes"></div>
        <div class="pkt-packet" id="pktPacket" aria-hidden="true">📦</div>
      </div>
      <div class="pkt-controls">
        <button class="btn-lab" id="pktStart">▶ Iniciar</button>
        <button class="btn-lab" id="pktNext" disabled>Próximo salto →</button>
        <button class="btn-lab btn-lab--ghost" id="pktReset">↺ Reiniciar</button>
      </div>
      <div class="pkt-info" id="pktInfo" hidden></div>`;

    const nodesEl = container.querySelector('#pktNodes');
    const packetEl = container.querySelector('#pktPacket');
    const infoEl = container.querySelector('#pktInfo');
    const btnStart = container.querySelector('#pktStart');
    const btnNext = container.querySelector('#pktNext');
    const btnReset = container.querySelector('#pktReset');

    NODE_LABELS.forEach((label, index) => {
      const node = document.createElement('div');
      node.className = 'pkt-node';
      node.id = `pktNode${index}`;
      node.innerHTML = `<span class="pkt-node-icon">${NODE_ICONS[index]}</span><span class="pkt-node-label">${label}</span>`;
      nodesEl.appendChild(node);
    });

    function moveTo(index) {
      const targetNode = container.querySelector(`#pktNode${index}`);
      if (!targetNode) return;
      const stageRect = container.querySelector('.pkt-stage').getBoundingClientRect();
      const nodeRect = targetNode.getBoundingClientRect();
      const x = nodeRect.left - stageRect.left + nodeRect.width / 2 - 14;
      packetEl.style.left = `${x}px`;
    }

    function showStep(index) {
      step = index;
      container.querySelectorAll('.pkt-node').forEach((node, i) => {
        node.classList.toggle('active', i === index);
        node.classList.toggle('visited', i < index);
      });
      moveTo(index);

      const data = STEPS[index];
      infoEl.hidden = false;
      infoEl.innerHTML = `
        <div class="pkt-info-head" style="color:${data.color}">
          ${data.icon} <strong>${data.title}</strong>
        </div>
        <table class="pkt-info-table">
          ${data.fields.map(field => `<tr><td class="pkt-field-key">${field.k}</td><td class="pkt-field-val">${field.v}</td></tr>`).join('')}
        </table>
        <p class="pkt-info-note">${data.note}</p>`;

      btnNext.disabled = index >= STEPS.length - 1;
      btnNext.textContent = index >= STEPS.length - 1 ? '✓ Destino alcançado' : 'Próximo salto →';
    }

    btnStart.addEventListener('click', () => {
      btnStart.hidden = true;
      btnNext.disabled = false;
      packetEl.style.display = 'block';
      showStep(0);
    });
    btnNext.addEventListener('click', () => {
      if (step < STEPS.length - 1) showStep(step + 1);
    });
    btnReset.addEventListener('click', () => {
      step = -1;
      btnStart.hidden = false;
      btnNext.disabled = true;
      btnNext.textContent = 'Próximo salto →';
      packetEl.style.display = 'none';
      infoEl.hidden = true;
      container.querySelectorAll('.pkt-node').forEach(node => node.classList.remove('active', 'visited'));
    });
  }

  /* ══════════════════════════════════════════════════════
     2. DNS RECURSIVE SIMULATOR
  ══════════════════════════════════════════════════════ */
  function initDNSSim() {
    const container = document.getElementById('labDNS');
    if (!container) return;

    const DNS_STEPS = [
      { from: 0, to: 1, label: 'Quem é google.com?', resp: null, desc: 'Seu computador pergunta ao resolver local.' },
      { from: 1, to: 2, label: 'Quem é google.com?', resp: null, desc: 'O resolver pergunta ao Root Server (.).' },
      { from: 2, to: 1, label: '→ Pergunte ao .com TLD', resp: 'Pergunte ao .com TLD', desc: 'O Root sabe quem responde por .com.' },
      { from: 1, to: 3, label: 'Quem é google.com?', resp: null, desc: 'O resolver consulta o TLD de .com.' },
      { from: 3, to: 1, label: '→ Pergunte a ns1.google.com', resp: 'Pergunte a ns1.google.com', desc: 'O TLD indica o autoritativo.' },
      { from: 1, to: 4, label: 'Qual o IP de google.com?', resp: null, desc: 'O resolver consulta o servidor autoritativo.' },
      { from: 4, to: 1, label: '→ 142.250.65.14 (TTL: 300s)', resp: '142.250.65.14', desc: 'O autoritativo responde com o IP e TTL.' },
      { from: 1, to: 0, label: '→ 142.250.65.14', resp: '142.250.65.14', desc: 'O resolver entrega a resposta ao cliente.' }
    ];

    const NODES = [
      { label: 'Seu PC', icon: '🖥️' },
      { label: 'Resolver Local', icon: '🔁' },
      { label: 'Root NS (.)', icon: '🌍' },
      { label: 'TLD NS (.com)', icon: '📋' },
      { label: 'Autoritativo', icon: '✅' }
    ];

    container.innerHTML = `
      <div class="dns-input-row">
        <input type="text" id="dnsDomain" class="lab-input" placeholder="ex: google.com" value="google.com" spellcheck="false">
        <button class="btn-lab" id="dnsStart">🔍 Resolver</button>
        <button class="btn-lab btn-lab--ghost" id="dnsReset">↺</button>
      </div>
      <div class="dns-stage" id="dnsStage"></div>
      <div class="dns-desc" id="dnsDesc"></div>
      <div class="dns-progress">
        <button class="btn-lab btn-lab--sm" id="dnsPrev" disabled>← Anterior</button>
        <span class="dns-step-lbl" id="dnsStepLbl">–</span>
        <button class="btn-lab btn-lab--sm" id="dnsNext" disabled>Próximo →</button>
      </div>
      <div class="dns-real-panel" id="dnsRealPanel" hidden>
        <div class="dns-real-header">
          <span class="dns-real-title">📡 Dados DNS Reais</span>
          <span class="dns-real-timing" id="dnsRealTiming"></span>
        </div>
        <div id="dnsRealRecords"></div>
      </div>`;

    const domainInput = container.querySelector('#dnsDomain');
    const stage = container.querySelector('#dnsStage');
    const desc = container.querySelector('#dnsDesc');
    const stepLbl = container.querySelector('#dnsStepLbl');
    const btnStart = container.querySelector('#dnsStart');
    const btnPrev = container.querySelector('#dnsPrev');
    const btnNext = container.querySelector('#dnsNext');
    const btnReset = container.querySelector('#dnsReset');

    let currentStep = -1;
    let arrows = [];

    function buildStage() {
      stage.innerHTML = '';
      arrows = [];

      const positions = [
        { x: 5, y: 40 },
        { x: 30, y: 40 },
        { x: 55, y: 10 },
        { x: 55, y: 40 },
        { x: 55, y: 70 }
      ];

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.position = 'absolute';
      svg.style.inset = '0';
      svg.innerHTML = `<defs>
        <marker id="dns-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="var(--accent)"></path>
        </marker>
        <marker id="dns-arrow-dim" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="var(--border)"></path>
        </marker>
      </defs>`;
      stage.appendChild(svg);

      DNS_STEPS.forEach((step, index) => {
        const from = positions[step.from];
        const to = positions[step.to];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', `${from.x + 5}%`);
        line.setAttribute('y1', `${from.y}%`);
        line.setAttribute('x2', `${to.x + 5}%`);
        line.setAttribute('y2', `${to.y}%`);
        line.setAttribute('stroke', 'var(--border)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#dns-arrow-dim)');
        line.id = `dnsArrow${index}`;
        svg.appendChild(line);
        arrows.push(line);
      });

      NODES.forEach((node, index) => {
        const div = document.createElement('div');
        div.className = 'dns-node';
        div.id = `dnsNode${index}`;
        div.style.left = `${positions[index].x}%`;
        div.style.top = `${positions[index].y}%`;
        div.innerHTML = `<span class="dns-node-icon">${node.icon}</span><span class="dns-node-label">${node.label}</span>`;
        stage.appendChild(div);
      });
    }

    function showStep(index) {
      currentStep = index;
      const domain = domainInput.value.trim() || 'google.com';
      const data = DNS_STEPS[index];

      arrows.forEach((arrow, i) => {
        const active = i <= index;
        arrow.setAttribute('stroke', active ? 'var(--accent)' : 'var(--border)');
        arrow.setAttribute('marker-end', active ? 'url(#dns-arrow)' : 'url(#dns-arrow-dim)');
      });

      container.querySelectorAll('.dns-node').forEach((node, i) => {
        node.classList.toggle('dns-active', i === data.from || i === data.to);
      });

      desc.innerHTML = `
        <div class="dns-step-info">
          <span class="dns-arrow-label">${data.label.replaceAll('google.com', domain)}</span>
          ${data.resp ? `<span class="dns-resp">Resposta: <strong>${data.resp.replaceAll('google.com', domain)}</strong></span>` : ''}
          <p class="dns-step-desc">${data.desc}</p>
        </div>`;

      stepLbl.textContent = `Passo ${index + 1} de ${DNS_STEPS.length}`;
      btnPrev.disabled = index <= 0;
      btnNext.disabled = index >= DNS_STEPS.length - 1;
    }

    function reset() {
      currentStep = -1;
      stage.innerHTML = '';
      arrows = [];
      desc.innerHTML = '';
      stepLbl.textContent = '–';
      btnPrev.disabled = true;
      btnNext.disabled = true;
      const panel = container.querySelector('#dnsRealPanel');
      if (panel) { panel.hidden = true; container.querySelector('#dnsRealRecords').innerHTML = ''; }
    }

    const DNS_REC_TYPES = [
      { type: 'A',    emoji: '📍', label: 'Registros A — IPv4',     help: 'Mapeia o domínio para um endereço IPv4. É o registro mais comum — quando você acessa um site, o navegador busca o tipo A.' },
      { type: 'AAAA', emoji: '🌐', label: 'Registros AAAA — IPv6',  help: 'Mapeia o domínio para um endereço IPv6. Cada vez mais comum conforme o espaço IPv4 se esgota.' },
      { type: 'MX',   emoji: '📧', label: 'MX — Mail Exchange',     help: 'Define quais servidores recebem e-mails do domínio. O número à esquerda é a prioridade: menor = mais preferido.' },
      { type: 'NS',   emoji: '🏷️', label: 'NS — Name Servers',     help: 'Servidores DNS autoritativos do domínio — são eles que respondem definitivamente sobre ele.' },
      { type: 'TXT',  emoji: '📝', label: 'TXT — Texto',           help: 'Registros de texto livres. Usados para SPF (anti-spam), DKIM (assinatura de e-mail) e verificações de propriedade de domínio.' }
    ];

    function renderDnsBlock(rtype, answers, errorMsg) {
      const body = (answers && answers.length)
        ? answers.map(a => `<div class="dns-rr-row"><code>${escapeHtml(a.data)}</code><span class="dns-rr-ttl">TTL ${a.TTL}s</span></div>`).join('')
        : `<div class="dns-rr-empty">${escapeHtml(errorMsg)}</div>`;
      return `
        <details class="dns-rr-block" open>
          <summary class="dns-rr-summary">
            <span>${rtype.emoji} ${rtype.label}</span>
            <span class="dns-rr-tip" title="${escapeAttr(rtype.help)}">❓</span>
          </summary>
          <div class="dns-rr-body">${body}</div>
        </details>`;
    }

    async function fetchRealDNS(domain) {
      const panel = container.querySelector('#dnsRealPanel');
      const recordsEl = container.querySelector('#dnsRealRecords');
      const timingEl = container.querySelector('#dnsRealTiming');
      panel.hidden = false;
      recordsEl.innerHTML = '<div class="dns-rr-loading">Consultando DNS real via DoH (Google)…</div>';
      timingEl.textContent = '';
      const t0 = performance.now();
      const results = await Promise.allSettled(
        DNS_REC_TYPES.map(t =>
          fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(t.type)}`)
            .then(r => r.json())
        )
      );
      timingEl.textContent = `${Math.round(performance.now() - t0)}ms`;
      recordsEl.innerHTML = DNS_REC_TYPES.map((rtype, i) => {
        const res = results[i];
        if (res.status === 'rejected') return renderDnsBlock(rtype, null, 'Erro de rede ao consultar — verifique sua conexão');
        const d = res.value;
        if (d.Status === 3) return renderDnsBlock(rtype, null, 'Domínio não encontrado (NXDOMAIN)');
        if (d.Status !== 0) return renderDnsBlock(rtype, null, `Sem registros (código DoH ${d.Status})`);
        return renderDnsBlock(rtype, d.Answer?.length ? d.Answer : null, 'Sem registros deste tipo');
      }).join('');
    }

    btnStart.addEventListener('click', () => {
      const domain = domainInput.value.trim() || 'google.com';
      buildStage();
      showStep(0);
      fetchRealDNS(domain);
    });
    btnNext.addEventListener('click', () => {
      if (currentStep < DNS_STEPS.length - 1) showStep(currentStep + 1);
    });
    btnPrev.addEventListener('click', () => {
      if (currentStep > 0) showStep(currentStep - 1);
    });
    btnReset.addEventListener('click', reset);
    domainInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        const domain = domainInput.value.trim() || 'google.com';
        buildStage();
        showStep(0);
        fetchRealDNS(domain);
      }
    });
  }

  /* ══════════════════════════════════════════════════════
     3. MITM SIMULATOR
  ══════════════════════════════════════════════════════ */
  function initMITM() {
    const container = document.getElementById('labMITM');
    if (!container) return;

    container.innerHTML = `
      <div class="mitm-toggle-row">
        <button class="mitm-mode-btn active" data-mode="http">🔓 Sem TLS (HTTP)</button>
        <button class="mitm-mode-btn" data-mode="https">🔒 Com TLS (HTTPS)</button>
      </div>
      <div class="mitm-stage" id="mitmStage"></div>
      <div class="mitm-explain" id="mitmExplain"></div>
      <button class="btn-lab" id="mitmAnimate">▶ Animar ataque</button>`;

    const stage = container.querySelector('#mitmStage');
    const explain = container.querySelector('#mitmExplain');
    const btnAnim = container.querySelector('#mitmAnimate');
    let mode = 'http';
    let animating = false;

    const MODES = {
      http: {
        data: 'GET /conta HTTP/1.1\nSenha: minhasenha123',
        attacker: '👁️ Interceptado!\nSENHA: minhasenha123',
        explain: 'Em HTTP puro, o atacante vê tudo em texto claro: senhas, tokens e cookies.'
      },
      https: {
        data: 'TLS 1.3 Handshake\n[dados cifrados: ☒☒☒☒☒☒]',
        attacker: '❓ Dados ilegíveis\n☒☒☒☒☒☒☒☒☒☒',
        explain: 'Com TLS, o atacante vê apenas dados cifrados. Sem a chave privada do servidor, é inútil.'
      }
    };

    function buildStage() {
      const current = MODES[mode];
      stage.innerHTML = `
        <div class="mitm-actor">
          <div class="mitm-actor-icon">👩</div>
          <div class="mitm-actor-name">Alice</div>
        </div>
        <div class="mitm-channel">
          <div class="mitm-data-flow" id="mitm-data1">${mode === 'http' ? current.data.split('\n')[0] : '🔒 cifrado'}</div>
          <svg class="mitm-arrow" viewBox="0 0 60 20"><path d="M0,10 L50,10" stroke="currentColor" stroke-width="2" marker-end="url(#arr)"></path><defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor"></path></marker></defs></svg>
        </div>
        <div class="mitm-actor mitm-attacker">
          <div class="mitm-actor-icon">😈</div>
          <div class="mitm-actor-name">Atacante</div>
          <div class="mitm-attacker-sees" id="mitm-sees">${current.attacker}</div>
        </div>
        <div class="mitm-channel">
          <div class="mitm-data-flow" id="mitm-data2">${mode === 'http' ? current.data.split('\n')[0] : '🔒 cifrado'}</div>
          <svg class="mitm-arrow" viewBox="0 0 60 20"><path d="M0,10 L50,10" stroke="currentColor" stroke-width="2" marker-end="url(#arr2)"></path><defs><marker id="arr2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor"></path></marker></defs></svg>
        </div>
        <div class="mitm-actor">
          <div class="mitm-actor-icon">🖥️</div>
          <div class="mitm-actor-name">Servidor</div>
        </div>`;

      explain.textContent = current.explain;
    }

    async function animate() {
      if (animating) return;
      animating = true;
      btnAnim.disabled = true;

      const data1 = container.querySelector('#mitm-data1');
      const data2 = container.querySelector('#mitm-data2');
      const attacker = container.querySelector('.mitm-attacker');

      await delay(250);
      data1.classList.add('mitm-flow-active');
      await delay(850);
      data1.classList.remove('mitm-flow-active');
      attacker.classList.toggle('mitm-caught', mode === 'http');
      data2.classList.add('mitm-flow-active');
      await delay(850);
      data2.classList.remove('mitm-flow-active');

      btnAnim.disabled = false;
      animating = false;
    }

    container.querySelectorAll('.mitm-mode-btn').forEach(button => {
      button.addEventListener('click', () => {
        mode = button.dataset.mode;
        container.querySelectorAll('.mitm-mode-btn').forEach(btn => btn.classList.toggle('active', btn === button));
        buildStage();
      });
    });

    btnAnim.addEventListener('click', animate);
    buildStage();
  }

  /* ══════════════════════════════════════════════════════
     4. OSI ENCAPSULATION TIMELINE
  ══════════════════════════════════════════════════════ */
  function initOSI() {
    const container = document.getElementById('labOSI');
    if (!container) return;

    const LAYERS = [
      { num: 7, name: 'Aplicação', color: '#4f8ef7', label: 'DATA', fields: 'HTTP Request: GET / HTTP/1.1\nHost: google.com\nAccept: */*' },
      { num: 4, name: 'Transporte', color: '#8b5cf6', label: 'TCP Hdr', fields: 'Src Port: 54321 | Dst Port: 443\nSeq: 1001 | Ack: 0\nFlags: SYN | Window: 65535' },
      { num: 3, name: 'Rede', color: '#22c55e', label: 'IP Hdr', fields: 'Versão: 4 | TTL: 64\nSrc IP: 192.168.1.10\nDst IP: 142.250.65.14\nProtocolo: 6 (TCP)' },
      { num: 2, name: 'Enlace', color: '#f59e0b', label: 'ETH Hdr', fields: 'Src MAC: AA:BB:CC:11:22:33\nDst MAC: FF:GG:HH:44:55:66\nEtherType: 0x0800 (IPv4)' },
      { num: 1, name: 'Física', color: '#ef4444', label: 'BITS', fields: '01001000 01100101 00101110 01101100...\n(frame convertido em sinais elétricos ou luz)' }
    ];

    let encapStep = 0;

    container.innerHTML = `
      <div class="osi-encap-stage">
        <div class="osi-data-block" id="osiDataBlock">
          <div class="osi-segment osi-data" id="osiDataCore">DATA</div>
        </div>
      </div>
      <div class="osi-controls">
        <button class="btn-lab" id="osiEncap">+ Encapsular próxima camada</button>
        <button class="btn-lab btn-lab--ghost" id="osiReset">↺ Reiniciar</button>
      </div>
      <div class="osi-details" id="osiDetails"></div>`;

    const blockEl = container.querySelector('#osiDataBlock');
    const detailsEl = container.querySelector('#osiDetails');
    const btnEncap = container.querySelector('#osiEncap');
    const btnReset = container.querySelector('#osiReset');

    function showDetail(layer) {
      detailsEl.innerHTML = `
        <div class="osi-detail-card" style="border-color:${layer.color}">
          <strong style="color:${layer.color}">Camada ${layer.num} — ${layer.name}</strong>
          <pre class="osi-detail-pre">${layer.fields}</pre>
        </div>`;
    }

    function addLayer(layer) {
      const hdr = document.createElement('div');
      hdr.className = 'osi-segment osi-hdr';
      hdr.style.setProperty('--layer-color', layer.color);
      hdr.innerHTML = `<span class="osi-hdr-tag">L${layer.num} ${layer.name}</span><span class="osi-hdr-label">${layer.label}</span>`;
      hdr.addEventListener('click', () => showDetail(layer));
      blockEl.insertBefore(hdr, blockEl.firstChild);
    }

    btnEncap.addEventListener('click', () => {
      if (encapStep >= LAYERS.length) return;
      const layer = LAYERS[encapStep];
      addLayer(layer);
      showDetail(layer);
      encapStep += 1;
      if (encapStep >= LAYERS.length) {
        btnEncap.textContent = '✓ Encapsulamento completo!';
        btnEncap.disabled = true;
      }
    });

    btnReset.addEventListener('click', () => {
      encapStep = 0;
      blockEl.innerHTML = '<div class="osi-segment osi-data" id="osiDataCore">DATA</div>';
      detailsEl.innerHTML = '';
      btnEncap.textContent = '+ Encapsular próxima camada';
      btnEncap.disabled = false;
      bindDataCore();
    });

    function bindDataCore() {
      const core = blockEl.querySelector('#osiDataCore');
      if (!core) return;
      core.addEventListener('click', () => {
        detailsEl.innerHTML = `
          <div class="osi-detail-card">
            <strong>Dados da aplicação (payload)</strong>
            <pre class="osi-detail-pre">O payload é a mensagem real. Cada camada adiciona seu próprio cabeçalho para controle, endereçamento e detecção de erros.</pre>
          </div>`;
      });
    }

    bindDataCore();
  }

  /* ══════════════════════════════════════════════════════
     5. HTTP REQUEST BUILDER
  ══════════════════════════════════════════════════════ */
  function initHTTPBuilder() {
    const container = document.getElementById('labHTTP');
    if (!container) return;

    container.innerHTML = `
      <div class="http-wrap">
        <div class="http-form">
          <label class="http-label">Método</label>
          <select id="httpMethod" class="lab-select">
            <option>GET</option><option>POST</option><option>PUT</option>
            <option>PATCH</option><option>DELETE</option><option>HEAD</option>
          </select>

          <label class="http-label">URL</label>
          <input type="text" id="httpUrl" class="lab-input" value="https://api.exemplo.com/usuarios/1" spellcheck="false">

          <label class="http-label">Versão HTTP</label>
          <select id="httpVersion" class="lab-select">
            <option value="1.1">HTTP/1.1</option>
            <option value="2">HTTP/2 (binário — mostrado como texto)</option>
          </select>

          <label class="http-label">Headers</label>
          <div id="httpHeaders" class="http-headers-list"></div>
          <button class="btn-lab btn-lab--sm btn-lab--ghost" id="httpAddHeader">+ Adicionar header</button>

          <label class="http-label" id="httpBodyLabel">Body (JSON)</label>
          <textarea id="httpBody" class="lab-textarea http-body" placeholder='{ "nome": "Maria" }' rows="4"></textarea>
        </div>
        <div class="http-preview">
          <div class="http-preview-label">Requisição HTTP bruta</div>
          <pre id="httpRaw" class="http-raw"></pre>
          <button class="btn-lab btn-lab--sm btn-lab--ghost" id="httpCopy">📋 Copiar</button>
        </div>
      </div>
      <div class="http-inspector">
        <div class="http-insp-header">🔬 Inspecionar Headers de Resposta Reais</div>
        <p class="http-insp-desc">Digite uma URL e veja os headers HTTP que o servidor retorna de verdade.</p>
        <div class="http-insp-row">
          <input type="url" id="httpInspUrl" class="lab-input" placeholder="https://example.com" value="https://example.com" spellcheck="false">
          <button class="btn-lab" id="httpInspBtn">Inspecionar</button>
        </div>
        <div id="httpInspResult"></div>
      </div>`;

    const methodEl = container.querySelector('#httpMethod');
    const urlEl = container.querySelector('#httpUrl');
    const versionEl = container.querySelector('#httpVersion');
    const headersEl = container.querySelector('#httpHeaders');
    const bodyLabel = container.querySelector('#httpBodyLabel');
    const bodyEl = container.querySelector('#httpBody');
    const rawEl = container.querySelector('#httpRaw');
    const addHdrBtn = container.querySelector('#httpAddHeader');
    const copyBtn = container.querySelector('#httpCopy');

    const defaultHeaders = [
      { k: 'Host', v: 'api.exemplo.com' },
      { k: 'Accept', v: 'application/json' },
      { k: 'Authorization', v: 'Bearer eyJhbGci...' }
    ];

    function addHeaderRow(key = '', value = '') {
      const row = document.createElement('div');
      row.className = 'http-header-row';
      row.innerHTML = `
        <input type="text" class="lab-input http-hkey" placeholder="Header" value="${key}" spellcheck="false">
        <span>:</span>
        <input type="text" class="lab-input http-hval" placeholder="Valor" value="${value}" spellcheck="false">
        <button class="btn-lab btn-lab--icon" aria-label="Remover">✕</button>`;
      row.querySelector('button').addEventListener('click', () => {
        row.remove();
        update();
      });
      row.querySelectorAll('input').forEach(input => input.addEventListener('input', update));
      headersEl.appendChild(row);
    }

    function getHeaders() {
      return [...headersEl.querySelectorAll('.http-header-row')].map(row => ({
        k: row.querySelector('.http-hkey').value.trim(),
        v: row.querySelector('.http-hval').value.trim()
      })).filter(header => header.k);
    }

    function update() {
      const method = methodEl.value;
      const rawUrl = urlEl.value.trim() || '/';
      const version = versionEl.value;
      const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
      bodyLabel.style.opacity = hasBody ? '1' : '0.4';
      bodyEl.disabled = !hasBody;

      let path;
      let host;
      try {
        const parsed = new URL(rawUrl);
        path = parsed.pathname + parsed.search;
        host = parsed.host;
      } catch {
        path = rawUrl;
        host = 'api.exemplo.com';
      }

      let raw = `${method} ${path} HTTP/${version}\r\n`;
      const headers = getHeaders();
      if (!headers.find(header => header.k.toLowerCase() === 'host')) headers.unshift({ k: 'Host', v: host });
      headers.forEach(header => { raw += `${header.k}: ${header.v}\r\n`; });

      const body = hasBody ? bodyEl.value.trim() : '';
      if (body) {
        if (!headers.find(header => header.k.toLowerCase() === 'content-type')) raw += 'Content-Type: application/json\r\n';
        raw += `Content-Length: ${new TextEncoder().encode(body).length}\r\n`;
      }
      raw += '\r\n';
      if (body) raw += body;

      rawEl.textContent = raw;
    }

    defaultHeaders.forEach(header => addHeaderRow(header.k, header.v));
    addHdrBtn.addEventListener('click', () => {
      addHeaderRow();
      update();
    });
    [methodEl, urlEl, versionEl, bodyEl].forEach(input => input.addEventListener('input', update));
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(rawEl.textContent).then(() => {
        copyBtn.textContent = '✓ Copiado!';
        setTimeout(() => { copyBtn.textContent = '📋 Copiar'; }, 2000);
      });
    });

    update();

    /* ── HTTP Inspector ──────────────────────────────── */
    const HDR_CATS = [
      { label: '🔒 Segurança',  keys: ['strict-transport-security','x-frame-options','content-security-policy','x-xss-protection','x-content-type-options','referrer-policy','permissions-policy'] },
      { label: '📦 Cache',      keys: ['cache-control','etag','last-modified','expires','age','vary'] },
      { label: '🖥️ Servidor',  keys: ['server','x-powered-by','via','x-served-by','x-cache'] },
      { label: '📄 Conteúdo',  keys: ['content-type','content-length','content-encoding','content-language','transfer-encoding'] }
    ];

    const HDR_HINTS = {
      'cache-control':              'Define como e por quanto tempo o recurso pode ser armazenado em cache.',
      'content-type':               'Tipo MIME do conteúdo retornado (ex: text/html, application/json).',
      'strict-transport-security':  'Força HTTPS pelo período max-age. Protege contra downgrade para HTTP.',
      'x-frame-options':            'Controla se a página pode ser embutida em <iframe>. Previne clickjacking.',
      'content-security-policy':    'Política que restringe origens de scripts e recursos. Mitiga ataques XSS.',
      'x-xss-protection':           'Header legado que ativava filtro anti-XSS do navegador (obsoleto no Chrome).',
      'x-content-type-options':     'Impede que o browser adivinhe o tipo MIME (MIME sniffing). Sempre "nosniff".',
      'referrer-policy':            'Controla quais informações de referer são enviadas com as requisições.',
      'etag':                       'Hash do conteúdo usado para cache condicional — o browser envia If-None-Match e recebe 304 se não mudou.',
      'last-modified':              'Data da última modificação. Usada com If-Modified-Since para cache condicional.',
      'server':                     'Identifica o software do servidor (ex: nginx/1.18). Às vezes omitido por segurança.',
      'x-powered-by':               'Tecnologia backend (ex: PHP/8.1). Frequentemente removido por segurança.',
      'transfer-encoding':          'Como o corpo é transmitido. "chunked" = em pedaços sem Content-Length conhecido.',
      'content-encoding':           'Compressão aplicada ao conteúdo (gzip, br=Brotli). O browser descomprime automaticamente.',
      'vary':                       'Indica ao cache quais headers de request afetam a resposta (ex: Vary: Accept-Encoding).'
    };

    const HTTP_STATUS_DESC = {
      200:'OK',201:'Created',204:'No Content',301:'Moved Permanently',302:'Found',
      304:'Not Modified',400:'Bad Request',401:'Unauthorized',403:'Forbidden',
      404:'Not Found',408:'Request Timeout',429:'Too Many Requests',
      500:'Internal Server Error',502:'Bad Gateway',503:'Service Unavailable',504:'Gateway Timeout'
    };

    async function inspectUrl(rawUrl) {
      const resultEl = container.querySelector('#httpInspResult');
      let url;
      try { url = new URL(rawUrl); } catch {
        resultEl.innerHTML = '<div class="http-insp-error">URL inválida. Use o formato https://example.com</div>';
        return;
      }
      resultEl.innerHTML = '<div class="http-insp-loading">Consultando…</div>';
      const t0 = performance.now();
      let status = null, headers = {}, corsBlocked = false, failed = false;
      try {
        const resp = await fetch(url.href, { method: 'HEAD' });
        status = resp.status;
        resp.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
      } catch {
        corsBlocked = true;
        try {
          const proxyResp = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url.href)}`);
          const data = await proxyResp.json();
          status = data.status?.http_code;
          if (data.status?.content_type) headers['content-type'] = data.status.content_type;
        } catch { failed = true; }
      }
      const elapsed = Math.round(performance.now() - t0);
      if (failed && !status) {
        resultEl.innerHTML = `<div class="http-insp-error">Não foi possível alcançar <strong>${escapeHtml(url.hostname)}</strong>. Verifique a URL e sua conexão.</div>`;
        return;
      }
      const statusClass = !status ? 'err' : status < 300 ? 'ok' : status < 400 ? 'redir' : 'err';
      const statusColors = { ok:'#4ade80', redir:'#fbbf24', err:'#f87171' };
      let html = `<div class="http-insp-meta">`;
      if (status) {
        const stText = HTTP_STATUS_DESC[status] || '';
        html += `<span class="http-insp-status" style="color:${statusColors[statusClass]}">${status}${stText ? ' ' + stText : ''}</span>`;
      }
      html += `<span class="http-insp-time">⏱ ${elapsed}ms</span>`;
      if (corsBlocked) html += `<span class="http-insp-cors-badge" title="HEAD bloqueado por CORS — dados via proxy, limitados">⚠️ CORS</span>`;
      html += `</div>`;
      if (corsBlocked) {
        html += `<div class="http-insp-cors-note">Este servidor bloqueou a inspeção direta (política CORS). Isso é uma medida de segurança — o servidor decide quais origens podem ler seus cabeçalhos via JS. Dados limitados obtidos via proxy.</div>`;
      }
      const allKeys = Object.keys(headers);
      if (!allKeys.length) {
        html += '<div class="http-insp-no-hdr">Nenhum header disponível para exibição.</div>';
      } else {
        const usedKeys = new Set();
        HDR_CATS.forEach(cat => {
          const present = cat.keys.filter(k => headers[k]);
          if (!present.length) return;
          html += `<div class="http-cat-block"><div class="http-cat-title">${cat.label}</div>`;
          present.forEach(k => {
            usedKeys.add(k);
            const hint = HDR_HINTS[k] || '';
            html += `<div class="http-hdr-row"><span class="http-hdr-key">${escapeHtml(k)}</span><span class="http-hdr-val">${escapeHtml(headers[k])}</span>${hint ? `<span class="http-hdr-hint" title="${escapeAttr(hint)}">❓</span>` : ''}</div>`;
          });
          html += `</div>`;
        });
        const extras = allKeys.filter(k => !usedKeys.has(k));
        if (extras.length) {
          html += `<div class="http-cat-block"><div class="http-cat-title">📋 Outros</div>`;
          extras.forEach(k => {
            html += `<div class="http-hdr-row"><span class="http-hdr-key">${escapeHtml(k)}</span><span class="http-hdr-val">${escapeHtml(headers[k])}</span></div>`;
          });
          html += `</div>`;
        }
      }
      resultEl.innerHTML = html;
    }

    const inspBtn = container.querySelector('#httpInspBtn');
    const inspUrlEl = container.querySelector('#httpInspUrl');
    inspBtn.addEventListener('click', () => inspectUrl(inspUrlEl.value.trim()));
    inspUrlEl.addEventListener('keydown', e => { if (e.key === 'Enter') inspectUrl(inspUrlEl.value.trim()); });
  }

  /* ══════════════════════════════════════════════════════
     6. TCP/IP HEADER BUILDER
  ══════════════════════════════════════════════════════ */
  function initTCPHeader() {
    const container = document.getElementById('labTCP');
    if (!container) return;

    container.innerHTML = `
      <div class="tcp-wrap">
        <div class="tcp-form">
          <fieldset class="tcp-fieldset">
            <legend>Cabeçalho IP</legend>
            <label>Versão <select id="tcpIpVer" class="lab-select"><option value="4">IPv4</option><option value="6">IPv6</option></select></label>
            <label>TTL <input type="number" id="tcpTTL" class="lab-input tcp-num" min="1" max="255" value="64"></label>
            <label>Protocolo
              <select id="tcpProto" class="lab-select">
                <option value="6">TCP (6)</option><option value="17">UDP (17)</option>
                <option value="1">ICMP (1)</option><option value="89">OSPF (89)</option>
              </select>
            </label>
            <label>IP Origem <input type="text" id="tcpSrcIP" class="lab-input" value="192.168.1.10" spellcheck="false"></label>
            <label>IP Destino <input type="text" id="tcpDstIP" class="lab-input" value="142.250.65.14" spellcheck="false"></label>
          </fieldset>
          <fieldset class="tcp-fieldset" id="tcpTcpSection">
            <legend>Cabeçalho TCP</legend>
            <label>Porta Origem <input type="number" id="tcpSrcPort" class="lab-input tcp-num" min="0" max="65535" value="54321"></label>
            <label>Porta Destino <input type="number" id="tcpDstPort" class="lab-input tcp-num" min="0" max="65535" value="443"></label>
            <label>Seq Number <input type="number" id="tcpSeq" class="lab-input tcp-num" value="1001"></label>
            <label>Ack Number <input type="number" id="tcpAck" class="lab-input tcp-num" value="0"></label>
            <label>Flags
              <div class="tcp-flags" id="tcpFlags">
                ${['SYN', 'ACK', 'FIN', 'RST', 'PSH', 'URG'].map(flag => `<label class="tcp-flag"><input type="checkbox" value="${flag}" ${flag === 'SYN' ? 'checked' : ''}> ${flag}</label>`).join('')}
              </div>
            </label>
            <label>Window Size <input type="number" id="tcpWindow" class="lab-input tcp-num" value="65535"></label>
          </fieldset>
        </div>
        <div class="tcp-visual" id="tcpVisual"></div>
      </div>`;

    function getFlags() {
      return [...container.querySelectorAll('#tcpFlags input:checked')].map(input => input.value);
    }

    function validateIP(ip) {
      return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && ip.split('.').every(part => Number(part) <= 255);
    }

    function render() {
      const ver = container.querySelector('#tcpIpVer').value;
      const ttl = container.querySelector('#tcpTTL').value;
      const proto = container.querySelector('#tcpProto');
      const protoValue = proto.value;
      const srcIP = container.querySelector('#tcpSrcIP').value.trim();
      const dstIP = container.querySelector('#tcpDstIP').value.trim();
      const srcPort = container.querySelector('#tcpSrcPort').value;
      const dstPort = container.querySelector('#tcpDstPort').value;
      const seq = container.querySelector('#tcpSeq').value;
      const ack = container.querySelector('#tcpAck').value;
      const flags = getFlags();
      const windowSize = container.querySelector('#tcpWindow').value;

      const isTCP = protoValue === '6';
      container.querySelector('#tcpTcpSection').style.display = isTCP ? '' : 'none';

      const srcValid = validateIP(srcIP);
      const dstValid = validateIP(dstIP);
      container.querySelector('#tcpSrcIP').classList.toggle('lab-input--error', !srcValid);
      container.querySelector('#tcpDstIP').classList.toggle('lab-input--error', !dstValid);

      const visual = container.querySelector('#tcpVisual');
      visual.innerHTML = `
        <div class="tcp-diagram-label">Diagrama do pacote</div>
        <div class="tcp-diagram">
          <div class="tcp-layer tcp-layer--ip">
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:0.5">Ver: ${ver}</div>
              <div class="tcp-field" style="flex:0.5">IHL: ${ver === '4' ? '5' : 'N/A'}</div>
              <div class="tcp-field" style="flex:1">DSCP: 0x00</div>
              <div class="tcp-field" style="flex:1">Length: auto</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:1.5">ID: 0x${Math.floor(Math.random() * 65535).toString(16).padStart(4, '0')}</div>
              <div class="tcp-field" style="flex:0.5">Flags: DF</div>
              <div class="tcp-field" style="flex:1">Frag Off: 0</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:0.5">TTL: ${ttl}</div>
              <div class="tcp-field" style="flex:0.5">Proto: ${protoValue}</div>
              <div class="tcp-field" style="flex:1">Checksum: 0x????</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field ${srcValid ? '' : 'tcp-field--error'}" style="flex:2">Src: ${srcIP}</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field ${dstValid ? '' : 'tcp-field--error'}" style="flex:2">Dst: ${dstIP}</div>
            </div>
            <div class="tcp-layer-label">IPv${ver} Header (20 bytes)</div>
          </div>
          ${isTCP ? `
          <div class="tcp-layer tcp-layer--tcp">
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:1">Src Port: ${srcPort}</div>
              <div class="tcp-field" style="flex:1">Dst Port: ${dstPort}</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:2">Seq: ${seq}</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:2">Ack: ${ack}</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:0.5">Off: 5</div>
              <div class="tcp-field ${flags.length ? 'tcp-field--active' : ''}" style="flex:1.5">${flags.length ? flags.join(' | ') : '(nenhum)'}</div>
              <div class="tcp-field" style="flex:1">Win: ${windowSize}</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:1">Checksum: 0x????</div>
              <div class="tcp-field" style="flex:1">Urgent: 0</div>
            </div>
            <div class="tcp-layer-label">TCP Header (20 bytes)</div>
          </div>` : ''}
          <div class="tcp-layer tcp-layer--data">
            <div class="tcp-field" style="flex:2;color:var(--text-muted)">PAYLOAD (dados da aplicação)</div>
            <div class="tcp-layer-label">Application Data</div>
          </div>
        </div>`;
    }

    container.querySelectorAll('input, select').forEach(el => el.addEventListener('input', render));
    render();
  }

  /* ══════════════════════════════════════════════════════
     9. TCP THREE-WAY HANDSHAKE
  ══════════════════════════════════════════════════════ */
  function initHandshake() {
    const container = document.getElementById('labHandshake');
    if (!container) return;

    const STEPS = [
      { phase: 'SYN', from: 'client', label: 'SYN', seqAck: 'SEQ=1000, ACK=—', clientState: 'SYN_SENT', serverState: 'LISTEN', desc: 'O cliente envia SYN com seu número de sequência inicial (ISN=1000). Indica que quer iniciar uma conexão.', flags: ['SYN'] },
      { phase: 'SYN-ACK', from: 'server', label: 'SYN-ACK', seqAck: 'SEQ=5000, ACK=1001', clientState: 'SYN_SENT', serverState: 'SYN_RECEIVED', desc: 'O servidor confirma o SEQ do cliente (ACK=1001) e envia seu próprio ISN (SEQ=5000). Dois handshakes em um.', flags: ['SYN', 'ACK'] },
      { phase: 'ACK', from: 'client', label: 'ACK', seqAck: 'SEQ=1001, ACK=5001', clientState: 'ESTABLISHED', serverState: 'ESTABLISHED', desc: 'O cliente confirma o SEQ do servidor (ACK=5001). Conexão estabelecida — os dois lados estão sincronizados.', flags: ['ACK'] }
    ];

    container.insertAdjacentHTML('beforeend', `
      <div class="hs-wrap">
        <div class="pkt-controls">
          <button class="btn-lab" id="hsBtnPlay">▶ Auto-Play</button>
          <button class="btn-lab" id="hsBtnStep">Próximo Passo</button>
          <button class="btn-lab btn-lab--ghost" id="hsBtnReset">↺ Reiniciar</button>
        </div>
        <div class="hs-stage">
          <div class="hs-actor">
            <div class="hs-actor-icon">🖥️</div>
            <div class="hs-actor-name">Cliente</div>
            <div class="hs-state" id="hsClientState">CLOSED</div>
          </div>
          <div class="hs-middle" id="hsTimeline"><div class="hs-vline"></div></div>
          <div class="hs-actor">
            <div class="hs-actor-icon">🖥️</div>
            <div class="hs-actor-name">Servidor</div>
            <div class="hs-state" id="hsServerState">LISTEN</div>
          </div>
        </div>
        <div class="hs-info" id="hsInfo">
          <p>Clique em <strong>Próximo Passo</strong> ou em <strong>Auto-Play</strong> para ver o handshake.</p>
        </div>
      </div>
    `);

    let step = -1, playing = false, playTimer = null;
    const timeline = document.getElementById('hsTimeline');
    const clientStateEl = document.getElementById('hsClientState');
    const serverStateEl = document.getElementById('hsServerState');
    const info = document.getElementById('hsInfo');

    function renderArrow(s) {
      const dir = s.from === 'client' ? 'right' : 'left';
      const el = document.createElement('div');
      el.className = `hs-arrow hs-arrow-${dir}`;
      el.innerHTML = `<div class="hs-arrow-label">
        <span class="hs-arrow-name">${escapeHtml(s.label)}</span>
        <span class="hs-arrow-seq">${escapeHtml(s.seqAck)}</span>
        <span class="hs-arrow-flags">${s.flags.map(f => `<em>${escapeHtml(f)}</em>`).join(' ')}</span>
      </div>
      <div class="hs-arrow-line"><div class="hs-arrow-head hs-head-${dir}"></div></div>`;
      timeline.appendChild(el);
    }

    function advance() {
      step++;
      if (step >= STEPS.length) {
        clientStateEl.className = 'hs-state hs-state-ok';
        serverStateEl.className = 'hs-state hs-state-ok';
        info.innerHTML = '<p class="hs-done">✅ Conexão estabelecida! Dados podem fluir nos dois sentidos.</p>';
        stopPlay(); return;
      }
      const s = STEPS[step];
      renderArrow(s);
      clientStateEl.textContent = s.clientState;
      serverStateEl.textContent = s.serverState;
      clientStateEl.className = 'hs-state' + (s.clientState === 'ESTABLISHED' ? ' hs-state-ok' : '');
      serverStateEl.className = 'hs-state' + (s.serverState === 'ESTABLISHED' ? ' hs-state-ok' : '');
      info.innerHTML = `<p><strong>${escapeHtml(s.label)}:</strong> ${escapeHtml(s.desc)}</p>`;
    }

    function reset() {
      step = -1; stopPlay();
      timeline.querySelectorAll('.hs-arrow').forEach(a => a.remove());
      clientStateEl.textContent = 'CLOSED'; clientStateEl.className = 'hs-state';
      serverStateEl.textContent = 'LISTEN'; serverStateEl.className = 'hs-state';
      info.innerHTML = '<p>Clique em <strong>Próximo Passo</strong> ou em <strong>Auto-Play</strong> para ver o handshake.</p>';
    }

    function stopPlay() {
      playing = false; clearInterval(playTimer);
      document.getElementById('hsBtnPlay').textContent = '▶ Auto-Play';
    }

    document.getElementById('hsBtnStep').addEventListener('click', () => { stopPlay(); advance(); });
    document.getElementById('hsBtnReset').addEventListener('click', reset);
    document.getElementById('hsBtnPlay').addEventListener('click', () => {
      if (playing) { stopPlay(); return; }
      if (step >= STEPS.length) reset();
      playing = true;
      document.getElementById('hsBtnPlay').textContent = '⏸ Pausar';
      advance();
      playTimer = setInterval(() => { if (step >= STEPS.length) { stopPlay(); return; } advance(); }, 1800);
    });
  }

  /* ══════════════════════════════════════════════════════
     10. ARP SIMULATOR
  ══════════════════════════════════════════════════════ */
  function initARP() {
    const container = document.getElementById('labARP');
    if (!container) return;

    const HOSTS = [
      { id: 'A',  label: 'Host A',  ip: '192.168.1.10', mac: 'AA:BB:CC:11:22:33', icon: '🖥️' },
      { id: 'B',  label: 'Host B',  ip: '192.168.1.20', mac: 'AA:BB:CC:44:55:66', icon: '💻' },
      { id: 'C',  label: 'Host C',  ip: '192.168.1.30', mac: 'AA:BB:CC:77:88:99', icon: '🖨️' },
      { id: 'GW', label: 'Gateway', ip: '192.168.1.1',  mac: 'AA:BB:CC:00:FF:FF', icon: '🔀' }
    ];

    container.insertAdjacentHTML('beforeend', `
      <div class="arp-wrap">
        <div class="arp-controls">
          <label class="arp-label">Origem: <select id="arpSrc" class="lab-select">
            ${HOSTS.map(h => `<option value="${h.id}">${h.label} (${h.ip})</option>`).join('')}
          </select></label>
          <label class="arp-label">IP destino: <input type="text" id="arpTarget" class="lab-input" value="192.168.1.20" spellcheck="false" /></label>
          <div class="pkt-controls">
            <button class="btn-lab" id="arpBtnPlay">▶ Simular ARP</button>
            <button class="btn-lab btn-lab--danger" id="arpBtnSpoof">☠ ARP Spoofing</button>
            <button class="btn-lab btn-lab--ghost" id="arpBtnReset">↺ Limpar</button>
          </div>
        </div>
        <div class="arp-stage">
          ${HOSTS.map(h => `
            <div class="arp-host" id="arpHost${h.id}">
              <div class="arp-host-icon">${h.icon}</div>
              <div class="arp-host-name">${h.label}</div>
              <div class="arp-host-ip">${h.ip}</div>
              <div class="arp-host-mac">${h.mac}</div>
            </div>`).join('')}
          <div class="arp-sw">🔀<br><small>Switch</small></div>
          <div class="arp-msg" id="arpMsg" hidden></div>
        </div>
        <div class="arp-log" id="arpLog"><em>Sem eventos ainda.</em></div>
        <h3 class="arp-cache-title">📋 Tabela ARP — Host A</h3>
        <table class="arp-cache-table">
          <thead><tr><th>IP</th><th>MAC</th><th>Tipo</th></tr></thead>
          <tbody id="arpCacheBody"><tr><td colspan="3" class="arp-empty">Tabela vazia</td></tr></tbody>
        </table>
      </div>
    `);

    let arpCache = {}, arpRunning = false;

    function arpLog(msg, cls) {
      const el = document.getElementById('arpLog');
      if (el.querySelector('em')) el.innerHTML = '';
      const d = document.createElement('div');
      d.className = 'arp-log-entry' + (cls ? ' ' + cls : '');
      d.innerHTML = msg;
      el.prepend(d);
    }

    function updateCache(ip, mac, type) {
      arpCache[ip] = { mac, type };
      const tbody = document.getElementById('arpCacheBody');
      tbody.innerHTML = Object.entries(arpCache).map(([ip, {mac, type}]) =>
        `<tr${type === 'poisoned' ? ' class="arp-row-poisoned"' : ''}><td>${escapeHtml(ip)}</td><td><code>${escapeHtml(mac)}</code></td><td>${escapeHtml(type)}</td></tr>`
      ).join('') || '<tr><td colspan="3" class="arp-empty">Tabela vazia</td></tr>';
    }

    function showArpMsg(text, cls) {
      const msg = document.getElementById('arpMsg');
      msg.className = 'arp-msg' + (cls ? ' ' + cls : '');
      msg.textContent = text;
      msg.hidden = false;
      setTimeout(() => { msg.hidden = true; }, 2800);
    }

    async function simulate() {
      if (arpRunning) return;
      arpRunning = true;
      document.getElementById('arpBtnPlay').disabled = true;
      const srcId = document.getElementById('arpSrc').value;
      const targetIp = document.getElementById('arpTarget').value.trim();
      const src = HOSTS.find(h => h.id === srcId);
      const target = HOSTS.find(h => h.ip === targetIp);

      arpLog(`🔍 <strong>${escapeHtml(src.label)}</strong> quer comunicar com <strong>${escapeHtml(targetIp)}</strong>…`);
      await delay(600);

      if (arpCache[targetIp]) {
        arpLog(`✅ Cache hit! MAC de ${escapeHtml(targetIp)} já conhecido: <code>${escapeHtml(arpCache[targetIp].mac)}</code>`, 'arp-ok');
        arpRunning = false; document.getElementById('arpBtnPlay').disabled = false; return;
      }

      arpLog(`📢 <strong>ARP Request</strong> (broadcast): "Quem tem ${escapeHtml(targetIp)}? Me diga ${escapeHtml(src.ip)}"`, 'arp-broadcast');
      showArpMsg('ARP Request → FF:FF:FF:FF:FF:FF', 'arp-msg-bcast');
      HOSTS.forEach(h => document.getElementById('arpHost' + h.id)?.classList.add('arp-recv'));
      await delay(1100);
      HOSTS.forEach(h => document.getElementById('arpHost' + h.id)?.classList.remove('arp-recv'));

      if (!target) {
        arpLog(`❌ Nenhum host respondeu. IP ${escapeHtml(targetIp)} não encontrado na rede.`, 'arp-error');
        arpRunning = false; document.getElementById('arpBtnPlay').disabled = false; return;
      }

      await delay(400);
      arpLog(`📨 <strong>ARP Reply</strong> (unicast → ${escapeHtml(src.mac)}): "${escapeHtml(target.ip)} está em <code>${escapeHtml(target.mac)}</code>"`, 'arp-reply');
      showArpMsg(`ARP Reply ← ${target.label}`, 'arp-msg-reply');
      document.getElementById('arpHost' + target.id)?.classList.add('arp-reply-hi');
      await delay(800);
      document.getElementById('arpHost' + target.id)?.classList.remove('arp-reply-hi');
      updateCache(targetIp, target.mac, 'dynamic');
      arpLog(`💾 Tabela ARP atualizada: ${escapeHtml(targetIp)} → <code>${escapeHtml(target.mac)}</code>`, 'arp-ok');
      arpRunning = false; document.getElementById('arpBtnPlay').disabled = false;
    }

    async function simulateSpoof() {
      if (arpRunning) return;
      arpRunning = true;
      document.getElementById('arpBtnPlay').disabled = true;
      document.getElementById('arpBtnSpoof').disabled = true;
      arpLog('⚠️ <strong>ARP Spoofing!</strong> Atacante envia ARP Reply falso…', 'arp-error');
      await delay(700);
      arpLog('☠ "192.168.1.1 está em <code>DE:AD:BE:EF:00:01</code>" (MAC do atacante, não do gateway!)', 'arp-error');
      await delay(600);
      updateCache('192.168.1.1', 'DE:AD:BE:EF:00:01 (ATACANTE)', 'poisoned');
      await delay(400);
      arpLog('🔀 Tráfego do Host A para o gateway agora passa pelo atacante (MITM!)', 'arp-error');
      await delay(500);
      arpLog('🛡️ Defesa: DAI (Dynamic ARP Inspection), monitoramento de tabela ARP, VPN.', 'arp-ok');
      arpRunning = false;
      document.getElementById('arpBtnPlay').disabled = false;
      document.getElementById('arpBtnSpoof').disabled = false;
    }

    document.getElementById('arpBtnPlay').addEventListener('click', simulate);
    document.getElementById('arpBtnSpoof').addEventListener('click', simulateSpoof);
    document.getElementById('arpBtnReset').addEventListener('click', () => {
      arpCache = {};
      document.getElementById('arpCacheBody').innerHTML = '<tr><td colspan="3" class="arp-empty">Tabela vazia</td></tr>';
      document.getElementById('arpLog').innerHTML = '<em>Sem eventos ainda.</em>';
      document.getElementById('arpMsg').hidden = true;
    });
  }

  /* ══════════════════════════════════════════════════════
     12. IP / ASN LOOKUP
  ══════════════════════════════════════════════════════ */
  function initIPASN() {
    const container = document.getElementById('labIPASN');
    if (!container) return;

    container.insertAdjacentHTML('beforeend', `
      <div class="ipasn-wrap">
        <div class="dns-input-row">
          <input type="text" id="ipasnTarget" class="lab-input" placeholder="Ex: 8.8.8.8 ou 1.1.1.1" value="8.8.8.8" spellcheck="false" />
          <button class="btn-lab" id="ipasnBtnFetch">🔍 Consultar</button>
        </div>
        <div id="ipasnResult" class="ipasn-result" hidden></div>
        <p class="dns-step-desc" style="margin-top:.5rem">Dados via <a href="https://ip-api.com" target="_blank" rel="noopener">ip-api.com</a> e <a href="https://rdap.org" target="_blank" rel="noopener">rdap.org</a>.</p>
      </div>
    `);

    async function fetchIPInfo(target) {
      const result = document.getElementById('ipasnResult');
      result.innerHTML = '<p class="ipasn-loading">⏳ Consultando…</p>';
      result.hidden = false;

      const [ipApiRes, rdapRes] = await Promise.allSettled([
        fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`http://ip-api.com/json/${encodeURIComponent(target)}?fields=status,message,country,countryCode,regionName,city,isp,org,as,asname,query`)}`)
          .then(r => r.json()).then(w => JSON.parse(w.contents)),
        fetch(`https://rdap.org/ip/${encodeURIComponent(target)}`).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      const ip = ipApiRes.status === 'fulfilled' && ipApiRes.value?.status === 'success' ? ipApiRes.value : null;
      const rdap = rdapRes.status === 'fulfilled' ? rdapRes.value : null;

      if (!ip && !rdap) {
        result.innerHTML = '<p class="ipasn-error">Não foi possível obter informações. Verifique o endereço IP.</p>';
        return;
      }

      let html = '<div class="ipasn-card">';
      if (ip) {
        html += `
          <table class="ipasn-table">
            <tr><th>IP consultado</th><td><code>${escapeHtml(ip.query || target)}</code></td></tr>
            <tr><th>País</th><td>${escapeHtml(ip.country || '—')}${ip.countryCode ? ` <span class="ipasn-cc">(${escapeHtml(ip.countryCode)})</span>` : ''}</td></tr>
            <tr><th>Região / Cidade</th><td>${escapeHtml([ip.regionName, ip.city].filter(Boolean).join(', ') || '—')}</td></tr>
            <tr><th>ISP</th><td>${escapeHtml(ip.isp || '—')}</td></tr>
            <tr><th>Organização</th><td>${escapeHtml(ip.org || '—')}</td></tr>
            <tr><th>ASN</th><td><code>${escapeHtml(ip.as || '—')}</code></td></tr>
            <tr><th>Nome do AS</th><td>${escapeHtml(ip.asname || '—')}</td></tr>
          </table>`;
      }
      if (rdap) {
        const events = (rdap.events || []).reduce((a, e) => { a[e.eventAction] = e.eventDate; return a; }, {});
        html += `
          <h4 class="ipasn-rdap-title">Dados RDAP</h4>
          <table class="ipasn-table">
            <tr><th>Prefixo / Handle</th><td><code>${escapeHtml(rdap.handle || rdap.name || '—')}</code></td></tr>
            <tr><th>Nome</th><td>${escapeHtml(rdap.name || '—')}</td></tr>
            <tr><th>País</th><td>${escapeHtml(rdap.country || '—')}</td></tr>
            ${events.registration ? `<tr><th>Registrado</th><td>${escapeHtml(events.registration.slice(0, 10))}</td></tr>` : ''}
            ${events['last changed'] ? `<tr><th>Última alteração</th><td>${escapeHtml(events['last changed'].slice(0, 10))}</td></tr>` : ''}
          </table>`;
      }
      html += '</div>';
      result.innerHTML = html;
      result.hidden = false;
    }

    document.getElementById('ipasnBtnFetch').addEventListener('click', () => {
      const t = document.getElementById('ipasnTarget').value.trim();
      if (t) fetchIPInfo(t);
    });
    document.getElementById('ipasnTarget').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('ipasnBtnFetch').click();
    });
  }

  /* ── Utility ─────────────────────────────────────────── */
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  /* ── Public ──────────────────────────────────────────── */
  function init() {
    initTabs();
    initPacketJourney();
    initDNSSim();
    initMITM();
    initOSI();
    initHTTPBuilder();
    initTCPHeader();
    initHandshake();
    initARP();
    initIPASN();
  }

  return { init };
})();

window.Lab = Lab;
