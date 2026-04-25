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
     7. NETWORK TOPOLOGY BUILDER V2
  ══════════════════════════════════════════════════════ */
  function initTopology() {
    const container = document.getElementById('labTopo');
    if (!container) return;
    initTopologyV3(container);
    return;

    const STORAGE_KEY = 'rw-topology-v2';
    const GRID = 80;
    const CANVAS_WIDTH = 1200;
    const CANVAS_HEIGHT = 700;
    const GRID_COLS = CANVAS_WIDTH / GRID;
    const GRID_ROWS = CANVAS_HEIGHT / GRID;

    const DEVICES = {
      pc: {
        icon: '🖥️',
        label: 'PC',
        description: 'Host final usado pelo aluno ou colaborador. Gera tráfego de aplicação e depende de switch/roteador para alcançar outras redes.',
        moduleUrl: 'fundamentos.html',
        typeLabel: 'Host final'
      },
      laptop: {
        icon: '💻',
        label: 'Laptop',
        description: 'Outro host final. Funciona como PC, mas ajuda a visualizar mobilidade e acesso Wi-Fi na topologia.',
        moduleUrl: 'fundamentos.html',
        typeLabel: 'Host final'
      },
      router: {
        icon: '🌐',
        label: 'Roteador',
        description: 'Opera na camada 3. Interliga redes diferentes, toma decisão de rota e costuma fazer NAT.',
        moduleUrl: 'equipamentos.html',
        typeLabel: 'Camada 3'
      },
      switch: {
        icon: '🔀',
        label: 'Switch',
        description: 'Opera na camada 2. Aprende endereços MAC e encaminha quadros para a porta certa.',
        moduleUrl: 'equipamentos.html',
        typeLabel: 'Camada 2'
      },
      server: {
        icon: '🗄️',
        label: 'Servidor',
        description: 'Host que responde a serviços como HTTP, DNS, SSH ou bancos de dados.',
        moduleUrl: 'protocolos.html',
        typeLabel: 'Serviço'
      },
      firewall: {
        icon: '🔒',
        label: 'Firewall',
        description: 'Inspeciona tráfego e aplica políticas de permitir, negar ou registrar conexões.',
        moduleUrl: 'seguranca.html',
        typeLabel: 'Segurança'
      },
      internet: {
        icon: '☁️',
        label: 'Internet',
        description: 'Representa a rede externa. Útil para treinar NAT, saída para WAN e DMZ.',
        moduleUrl: 'acesso-site.html',
        typeLabel: 'Rede externa'
      },
      dns: {
        icon: '🌐',
        label: 'DNS',
        description: 'Servidor que traduz nomes em IPs. Essencial para navegação e descoberta de serviços.',
        moduleUrl: 'protocolos.html',
        typeLabel: 'Serviço de nomes'
      },
      dhcp: {
        icon: '📋',
        label: 'DHCP',
        description: 'Servidor que entrega IP, máscara, gateway e DNS automaticamente para os clientes.',
        moduleUrl: 'protocolos.html',
        typeLabel: 'Configuração automática'
      },
      attacker: {
        icon: '😈',
        label: 'Atacante',
        description: 'Nó usado para simular ataque MITM e interceptação de tráfego.',
        moduleUrl: 'seguranca.html',
        typeLabel: 'Ameaça'
      }
    };

    const TEMPLATES = {
      home: {
        label: 'Rede doméstica',
        hint: 'Rede simples: hosts internos saem para a internet por um único roteador residencial.',
        nodes: [
          { type: 'pc', label: 'PC Casa', col: 2, row: 5 },
          { type: 'laptop', label: 'Laptop', col: 4, row: 5 },
          { type: 'router', label: 'Roteador Wi-Fi', col: 6, row: 3 },
          { type: 'internet', label: 'Internet', col: 9, row: 2 }
        ],
        edges: [
          { from: 'PC Casa', to: 'Roteador Wi-Fi', label: 'LAN' },
          { from: 'Laptop', to: 'Roteador Wi-Fi', label: 'Wi-Fi' },
          { from: 'Roteador Wi-Fi', to: 'Internet', label: 'WAN' }
        ]
      },
      corporate: {
        label: 'Rede corporativa simples',
        hint: 'Hosts internos convergem em um switch, passam por roteador e firewall antes de chegar ao servidor.',
        nodes: [
          { type: 'pc', label: 'PC 1', col: 1, row: 5 },
          { type: 'pc', label: 'PC 2', col: 2, row: 6 },
          { type: 'pc', label: 'PC 3', col: 3, row: 5 },
          { type: 'switch', label: 'Switch Core', col: 4, row: 4 },
          { type: 'router', label: 'Roteador', col: 6, row: 4 },
          { type: 'firewall', label: 'Firewall', col: 8, row: 4 },
          { type: 'server', label: 'Servidor App', col: 10, row: 4 }
        ],
        edges: [
          { from: 'PC 1', to: 'Switch Core', label: 'Acesso' },
          { from: 'PC 2', to: 'Switch Core', label: 'Acesso' },
          { from: 'PC 3', to: 'Switch Core', label: 'Acesso' },
          { from: 'Switch Core', to: 'Roteador', label: 'Trunk' },
          { from: 'Roteador', to: 'Firewall', label: 'L3' },
          { from: 'Firewall', to: 'Servidor App', label: 'DMZ' }
        ]
      },
      dmz: {
        label: 'Rede com DMZ',
        hint: 'Há uma zona exposta para serviços web e uma rede interna separada por firewall interno.',
        nodes: [
          { type: 'internet', label: 'Internet', col: 1, row: 3 },
          { type: 'firewall', label: 'FW Externo', col: 3, row: 3 },
          { type: 'switch', label: 'Switch DMZ', col: 5, row: 3 },
          { type: 'server', label: 'Servidor Web', col: 7, row: 2 },
          { type: 'firewall', label: 'FW Interno', col: 7, row: 4 },
          { type: 'pc', label: 'Rede Interna', col: 10, row: 4 }
        ],
        edges: [
          { from: 'Internet', to: 'FW Externo', label: 'WAN' },
          { from: 'FW Externo', to: 'Switch DMZ', label: 'DMZ' },
          { from: 'Switch DMZ', to: 'Servidor Web', label: 'VLAN DMZ' },
          { from: 'Switch DMZ', to: 'FW Interno', label: 'Segregado' },
          { from: 'FW Interno', to: 'Rede Interna', label: 'LAN' }
        ]
      },
      attack: {
        label: 'Cenário de ataque',
        hint: 'O atacante fica no caminho entre cliente e destino para ilustrar interceptação e MITM.',
        nodes: [
          { type: 'pc', label: 'Cliente', col: 2, row: 4 },
          { type: 'attacker', label: 'Atacante', col: 4, row: 4 },
          { type: 'switch', label: 'Switch', col: 6, row: 4 },
          { type: 'server', label: 'Servidor', col: 8, row: 4 }
        ],
        edges: [
          { from: 'Cliente', to: 'Atacante', label: 'Interceptado' },
          { from: 'Atacante', to: 'Switch', label: 'Relay' },
          { from: 'Switch', to: 'Servidor', label: 'HTTP' }
        ]
      }
    };

    const refs = {};
    const state = {
      nodes: [],
      edges: [],
      nextNodeId: 1,
      nextEdgeId: 1,
      activeDevice: 'pc',
      mode: 'place',
      selectedNodeId: null,
      connectFrom: null,
      freePathSelection: [],
      drag: null,
      activeEdgeIds: new Set(),
      activeCallout: null,
      calloutTimer: null,
      toastTimer: null
    };

    container.innerHTML = `
      <div class="topo-workspace">
        <div class="topo-toolbar">
          <div class="topo-tools-group" id="topoDeviceTools">
            ${Object.entries(DEVICES).map(([key, device]) => `<button class="topo-tool ${key === 'pc' ? 'active' : ''}" type="button" data-device="${key}">${device.icon}<span>${device.label}</span></button>`).join('')}
          </div>
          <div class="topo-actions-group">
            <select class="topo-template" id="topoTemplateSelect" aria-label="Carregar exemplo">
              <option value="">Carregar exemplo:</option>
              <option value="home">1. Rede doméstica</option>
              <option value="corporate">2. Rede corporativa simples</option>
              <option value="dmz">3. Rede com DMZ</option>
              <option value="attack">4. Cenário de ataque</option>
            </select>
            <button class="topo-action-btn" id="topoConnectBtn" type="button">🔗 Conectar</button>
            <button class="topo-action-btn" id="topoOrganizeBtn" type="button">🧭 Organizar</button>
            <button class="topo-action-btn" id="topoSimBtn" type="button">▶ Simular</button>
            <button class="topo-action-btn" id="topoSaveBtn" type="button">💾 Salvar</button>
            <button class="topo-action-btn" id="topoLoadBtn" type="button">📂 Carregar</button>
            <button class="topo-action-btn" id="topoExportBtn" type="button">🖼️ Exportar PNG</button>
            <button class="topo-action-btn" id="topoClearBtn" type="button">🧹 Limpar</button>
          </div>
        </div>

        <div class="topo-main">
          <div class="topo-stage">
            <div class="topo-stage-topbar">
              <div class="topo-stage-copy" id="topoStageCopy">Clique em um dispositivo na barra acima e depois em uma célula do grid para posicioná-lo.</div>
              <label class="topo-port-select">Porta alvo
                <select id="topoPortSelect">
                  <option value="80">80</option>
                  <option value="22">22</option>
                  <option value="443" selected>443</option>
                </select>
              </label>
            </div>

            <div class="topo-canvas-scroll" id="topoCanvasScroll">
              <div class="topo-canvas-wrap" id="topoCanvas">
                <svg class="topo-svg" id="topoSVG" aria-hidden="true"></svg>
                <div class="topo-grid-highlight" id="topoGridHighlight"></div>
                <div class="topo-drop-feedback" id="topoDropFeedback"></div>
                <div class="topo-nodes" id="topoNodes"></div>
                <div class="topo-traffic-layer" id="topoTrafficLayer"></div>
                <div class="topo-overlay-layer" id="topoOverlayLayer"></div>
                <div class="topo-hint" id="topoHint">Grid 80x80: cada dispositivo ocupa exatamente uma célula.</div>
              </div>
            </div>

            <div class="topo-sim-panel">
              <div>
                <div class="topo-sim-title" id="topoSimTitle">Topologia pronta</div>
                <div class="topo-sim-subtitle" id="topoSimSubtitle">Monte o cenário e clique em "Simular". Se a topologia não for reconhecida, o modo livre usa BFS para achar o menor caminho.</div>
              </div>
              <div class="topo-sim-log" id="topoSimLog">
                <div class="topo-sim-step"><strong>Dica</strong><span>Use "Conectar" e clique em dois dispositivos para criar o enlace.</span></div>
              </div>
            </div>
          </div>

          <aside class="topo-sidepanel" id="topoInspector">
            <div class="topo-sidepanel-head">
              <div class="topo-sidepanel-title">Painel do dispositivo</div>
            </div>
            <div class="topo-sidepanel-body" id="topoInspectorBody">
              <div class="topo-inspector-empty">Clique em qualquer dispositivo no canvas para editar nome, IP, revisar conexões e abrir o módulo relacionado.</div>
            </div>
          </aside>
        </div>
      </div>`;

    refs.deviceTools = container.querySelector('#topoDeviceTools');
    refs.templateSelect = container.querySelector('#topoTemplateSelect');
    refs.connectBtn = container.querySelector('#topoConnectBtn');
    refs.organizeBtn = container.querySelector('#topoOrganizeBtn');
    refs.simBtn = container.querySelector('#topoSimBtn');
    refs.saveBtn = container.querySelector('#topoSaveBtn');
    refs.loadBtn = container.querySelector('#topoLoadBtn');
    refs.exportBtn = container.querySelector('#topoExportBtn');
    refs.clearBtn = container.querySelector('#topoClearBtn');
    refs.portSelect = container.querySelector('#topoPortSelect');
    refs.stageCopy = container.querySelector('#topoStageCopy');
    refs.scroll = container.querySelector('#topoCanvasScroll');
    refs.canvas = container.querySelector('#topoCanvas');
    refs.svg = container.querySelector('#topoSVG');
    refs.nodesLayer = container.querySelector('#topoNodes');
    refs.trafficLayer = container.querySelector('#topoTrafficLayer');
    refs.overlayLayer = container.querySelector('#topoOverlayLayer');
    refs.gridHighlight = container.querySelector('#topoGridHighlight');
    refs.dropFeedback = container.querySelector('#topoDropFeedback');
    refs.hint = container.querySelector('#topoHint');
    refs.inspector = container.querySelector('#topoInspector');
    refs.inspectorBody = container.querySelector('#topoInspectorBody');
    refs.simTitle = container.querySelector('#topoSimTitle');
    refs.simSubtitle = container.querySelector('#topoSimSubtitle');
    refs.simLog = container.querySelector('#topoSimLog');

    function makeNodeId() {
      const id = state.nextNodeId;
      state.nextNodeId += 1;
      return id;
    }

    function makeEdgeId() {
      const id = state.nextEdgeId;
      state.nextEdgeId += 1;
      return id;
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function getNodeById(id) {
      return state.nodes.find(node => node.id === id) || null;
    }

    function getEdgeById(id) {
      return state.edges.find(edge => edge.id === id) || null;
    }

    function isEndpoint(node) {
      return !!node && (node.type === 'pc' || node.type === 'laptop');
    }

    function gridToLeft(col) {
      return col * GRID;
    }

    function gridToTop(row) {
      return row * GRID;
    }

    function getNodeCenter(node) {
      return { x: gridToLeft(node.col) + GRID / 2, y: gridToTop(node.row) + GRID / 2 };
    }

    function getRelativePoint(event) {
      const source = event.touches?.[0] || event.changedTouches?.[0] || event;
      const rect = refs.canvas.getBoundingClientRect();
      return {
        x: source.clientX - rect.left + refs.scroll.scrollLeft,
        y: source.clientY - rect.top + refs.scroll.scrollTop
      };
    }

    function snapFromPoint(x, y) {
      return {
        col: clamp(Math.round((x - GRID / 2) / GRID), 0, GRID_COLS - 1),
        row: clamp(Math.round((y - GRID / 2) / GRID), 0, GRID_ROWS - 1)
      };
    }

    function getOccupant(col, row, exceptId) {
      return state.nodes.find(node => node.col === col && node.row === row && node.id !== exceptId) || null;
    }

    function buildAdjacency(nodesList = state.nodes, edgesList = state.edges) {
      const map = new Map(nodesList.map(node => [node.id, []]));
      edgesList.forEach(edge => {
        if (!map.has(edge.from) || !map.has(edge.to)) return;
        map.get(edge.from).push(edge.to);
        map.get(edge.to).push(edge.from);
      });
      return map;
    }

    function getNeighbors(nodeId) {
      return buildAdjacency().get(nodeId) || [];
    }

    function getEdgeBetween(a, b) {
      return state.edges.find(edge => (edge.from === a && edge.to === b) || (edge.from === b && edge.to === a)) || null;
    }

    function shortestPath(startId, endId) {
      if (startId === endId) return [startId];
      const adjacency = buildAdjacency();
      const queue = [[startId]];
      const visited = new Set([startId]);

      while (queue.length) {
        const path = queue.shift();
        const last = path[path.length - 1];
        const neighbors = adjacency.get(last) || [];
        for (const next of neighbors) {
          if (visited.has(next)) continue;
          const candidate = [...path, next];
          if (next === endId) return candidate;
          visited.add(next);
          queue.push(candidate);
        }
      }
      return null;
    }

    function findChain(pattern, nodesList = state.nodes, edgesList = state.edges) {
      const adjacency = buildAdjacency(nodesList, edgesList);

      function getNodeLocal(id) {
        return nodesList.find(node => node.id === id) || null;
      }

      function typeMatches(node, expected) {
        if (!node) return false;
        if (expected === 'endpoint') return isEndpoint(node);
        return node.type === expected;
      }

      function walk(nodeId, index, visited) {
        const node = getNodeLocal(nodeId);
        if (!typeMatches(node, pattern[index])) return null;
        if (index === pattern.length - 1) return [nodeId];

        const neighbors = adjacency.get(nodeId) || [];
        for (const neighborId of neighbors) {
          if (visited.has(neighborId)) continue;
          const match = walk(neighborId, index + 1, new Set([...visited, neighborId]));
          if (match) return [nodeId, ...match];
        }
        return null;
      }

      for (const node of state.nodes) {
        const result = walk(node.id, 0, new Set([node.id]));
        if (result) return result;
      }
      return null;
    }

    function detectScenario(nodesList, edgesList) {
      const adjacency = buildAdjacency(nodesList, edgesList);
      const endpoints = nodesList.filter(isEndpoint);
      const servers = nodesList.filter(node => node.type === 'server');

      const corporate = findChain(['endpoint', 'switch', 'router', 'firewall', 'server'], nodesList, edgesList);
      if (corporate) return { kind: 'corporate', title: 'Rede corporativa', path: corporate };

      for (const endpoint of endpoints) {
        for (const server of servers) {
          const path = shortestPath(endpoint.id, server.id);
          if (!path) continue;
          const typedPath = path.map(id => getNodeById(id)?.type);
          const attackerIndex = typedPath.indexOf('attacker');
          if (attackerIndex !== -1 && attackerIndex > 0) {
            const firewallAfter = typedPath.slice(attackerIndex + 1).includes('firewall');
            return {
              kind: firewallAfter ? 'mitm-blocked' : 'mitm',
              title: firewallAfter ? 'MITM bloqueado' : 'MITM ativo',
              path
            };
          }
        }
      }

      const firewallBasic = findChain(['endpoint', 'firewall', 'server'], nodesList, edgesList);
      if (firewallBasic) return { kind: 'firewall-basic', title: 'PC → Firewall → Servidor', path: firewallBasic };

      for (const endpoint of endpoints) {
        const neighbors = adjacency.get(endpoint.id) || [];
        for (const switchId of neighbors) {
          const sw = nodesList.find(node => node.id === switchId);
          if (!sw || sw.type !== 'switch') continue;
          const serverNeighbors = (adjacency.get(sw.id) || []).filter(nodeId => nodesList.find(node => node.id === nodeId)?.type === 'server');
          if (serverNeighbors.length >= 2) {
            return { kind: 'switch-broadcast', title: 'Broadcast no switch', path: [endpoint.id, sw.id], targets: serverNeighbors };
          }
        }
      }

      const nat = findChain(['endpoint', 'router', 'internet'], nodesList, edgesList);
      if (nat) return { kind: 'nat', title: 'PC → Roteador → Internet', path: nat };

      const firewallOnly = findChain(['endpoint', 'firewall'], nodesList, edgesList);
      if (firewallOnly) {
        const firewall = nodesList.find(node => node.id === firewallOnly[1]);
        if (firewall && (adjacency.get(firewall.id) || []).length === 1) {
          return { kind: 'firewall-blocked', title: 'Firewall sem saída', path: firewallOnly };
        }
      }

      return { kind: 'free', title: 'Topologia livre' };
    }

    function autoIpFor(type) {
      const existing = state.nodes.filter(node => node.type === type).length;
      const seq = existing + 2;
      const map = {
        pc: `192.168.1.${seq}`,
        laptop: `192.168.1.${seq + 20}`,
        switch: `L2 bridge ${existing + 1}`,
        router: `192.168.1.1`,
        firewall: `10.0.0.${existing + 1}`,
        server: `10.0.0.${10 + existing}`,
        internet: `201.34.56.78`,
        dns: `8.8.8.${existing + 8}`,
        dhcp: `192.168.1.254`,
        attacker: `192.168.1.${66 + existing}`
      };
      return map[type] || `10.0.0.${seq}`;
    }

    function createNode(type, col, row, data = {}) {
      return {
        id: data.id ?? makeNodeId(),
        type,
        label: data.label || DEVICES[type].label,
        ip: data.ip || autoIpFor(type),
        col,
        row
      };
    }

    function createEdge(from, to, data = {}) {
      return {
        id: data.id ?? makeEdgeId(),
        from,
        to,
        label: data.label || '',
        warning: data.warning || ''
      };
    }

    function clearTransient() {
      refs.trafficLayer.innerHTML = '';
      refs.overlayLayer.innerHTML = '';
      refs.gridHighlight.classList.remove('visible');
      state.activeEdgeIds.clear();
      state.activeCallout = null;
      if (state.calloutTimer) clearTimeout(state.calloutTimer);
      renderEdges();
    }

    function showToast(message, tone = 'info', timeout = 2600) {
      document.querySelectorAll('.topo-toast').forEach(toast => toast.remove());
      const toast = document.createElement('div');
      toast.className = `topo-toast${tone === 'warn' ? ' topo-toast--warn' : ''}${tone === 'danger' ? ' topo-toast--danger' : ''}`;
      toast.textContent = message;
      document.body.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('show'));
      if (state.toastTimer) clearTimeout(state.toastTimer);
      state.toastTimer = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
      }, timeout);
    }

    function showCallout(nodeId, html, tone = 'info', timeout = 2600) {
      if (state.calloutTimer) clearTimeout(state.calloutTimer);
      refs.overlayLayer.innerHTML = '';
      const node = getNodeById(nodeId);
      if (!node) return;
      const callout = document.createElement('div');
      callout.className = `topo-callout${tone === 'danger' ? ' topo-callout--danger' : ''}${tone === 'warn' ? ' topo-callout--warn' : ''}`;
      callout.innerHTML = html;
      const left = clamp(gridToLeft(node.col) + GRID + 10, 10, CANVAS_WIDTH - 290);
      const top = clamp(gridToTop(node.row) - 5, 10, CANVAS_HEIGHT - 160);
      callout.style.left = `${left}px`;
      callout.style.top = `${top}px`;
      refs.overlayLayer.appendChild(callout);
      state.activeCallout = callout;
      state.calloutTimer = setTimeout(() => {
        callout.remove();
        state.activeCallout = null;
      }, timeout);
    }

    function updateModeUI() {
      refs.deviceTools.querySelectorAll('[data-device]').forEach(btn => {
        btn.classList.toggle('active', state.mode === 'place' && state.activeDevice === btn.dataset.device);
      });
      refs.connectBtn.classList.toggle('active', state.mode === 'connect');
      if (state.mode === 'connect') {
        refs.stageCopy.textContent = state.connectFrom ? 'Escolha o segundo dispositivo para criar o enlace.' : 'Modo conectar: clique em dois dispositivos.';
      } else if (state.mode === 'free-path') {
        refs.stageCopy.textContent = state.freePathSelection.length ? 'Agora escolha o destino para animar o menor caminho.' : 'Topologia livre: clique em dois dispositivos conectados.';
      } else {
        const current = DEVICES[state.activeDevice];
        refs.stageCopy.textContent = `Dispositivo atual: ${current.label}. Clique no grid para posicionar e arraste para reorganizar.`;
      }
    }

    function updateHint() {
      if (!state.nodes.length) {
        refs.hint.textContent = 'Grid 80x80: clique em uma célula vazia para adicionar o primeiro dispositivo.';
      } else if (state.mode === 'connect') {
        refs.hint.textContent = state.connectFrom ? 'Conectar: clique no segundo dispositivo.' : 'Conectar: clique em dois dispositivos para criar o enlace.';
      } else if (state.mode === 'free-path') {
        refs.hint.textContent = state.freePathSelection.length ? 'Escolha o destino do pacote.' : 'Clique na origem e no destino para usar BFS no grafo.';
      } else {
        refs.hint.textContent = 'Arraste para mover. Células ocupadas são rejeitadas automaticamente.';
      }
    }

    function renderEdges() {
      const defs = `
        <defs>
          <marker id="topoArrowHead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#4f8ef7"></path>
          </marker>
        </defs>`;

      refs.svg.innerHTML = defs + state.edges.map(edge => {
        const from = getNodeById(edge.from);
        const to = getNodeById(edge.to);
        if (!from || !to) return '';
        const a = getNodeCenter(from);
        const b = getNodeCenter(to);
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        const active = state.activeEdgeIds.has(edge.id);
        const label = edge.label || (edge.warning ? 'incomum' : 'enlace');
        const rectWidth = Math.max(52, label.length * 7.4);
        return `
          <g class="topo-edge-group" data-edge-id="${edge.id}">
            <path class="topo-edge${edge.warning ? ' topo-edge--warn' : ''}${active ? ' topo-edge--active' : ''}" d="M ${a.x} ${a.y} L ${b.x} ${b.y}"></path>
            <rect class="topo-edge-label-bg" x="${midX - rectWidth / 2}" y="${midY - 15}" width="${rectWidth}" height="22"></rect>
            <text class="topo-edge-label" x="${midX}" y="${midY}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(label)}</text>
          </g>`;
      }).join('');

      refs.svg.querySelectorAll('.topo-edge-group').forEach(group => {
        group.addEventListener('dblclick', () => {
          const edge = getEdgeById(Number(group.dataset.edgeId));
          if (!edge) return;
          const value = window.prompt('Nome do enlace', edge.label || '');
          if (value === null) return;
          edge.label = value.trim();
          renderEdges();
          updateInspector();
        });
      });
    }

    function renderNodes() {
      refs.nodesLayer.innerHTML = state.nodes.map(node => `
        <div
          class="topo-node${state.selectedNodeId === node.id ? ' topo-node--selected' : ''}${state.connectFrom === node.id ? ' topo-node--connect' : ''}"
          data-node-id="${node.id}"
          draggable="true"
          style="left:${gridToLeft(node.col)}px;top:${gridToTop(node.row)}px"
        >
          <div class="topo-node-icon">${DEVICES[node.type].icon}</div>
          <div class="topo-node-label">${escapeHtml(node.label)}</div>
          <div class="topo-node-ip">${escapeHtml(node.ip)}</div>
        </div>`).join('');

      refs.nodesLayer.querySelectorAll('.topo-node').forEach(el => {
        const nodeId = Number(el.dataset.nodeId);
        el.addEventListener('dragstart', event => event.preventDefault());
        el.addEventListener('mousedown', event => startNodeInteraction(event, nodeId));
        el.addEventListener('touchstart', event => startNodeInteraction(event, nodeId), { passive: false });
      });
    }

    function render() {
      renderEdges();
      renderNodes();
      updateInspector();
      updateModeUI();
      updateHint();
    }

    function updateInspector() {
      const node = getNodeById(state.selectedNodeId);
      if (!node) {
        refs.inspector.classList.remove('open');
        refs.inspectorBody.innerHTML = '<div class="topo-inspector-empty">Clique em qualquer dispositivo no canvas para editar nome, IP, revisar conexões e abrir o módulo relacionado.</div>';
        return;
      }

      refs.inspector.classList.add('open');
      const device = DEVICES[node.type];
      const connections = state.edges
        .filter(edge => edge.from === node.id || edge.to === node.id)
        .map(edge => {
          const other = getNodeById(edge.from === node.id ? edge.to : edge.from);
          const label = edge.label ? ` • ${edge.label}` : '';
          const warning = edge.warning ? ` • ${edge.warning}` : '';
          return `<div class="topo-conn-chip">${other ? `${other.label} (${DEVICES[other.type].label})` : 'Nó removido'}${label}${warning}</div>`;
        }).join('');

      refs.inspectorBody.innerHTML = `
        <label class="topo-inspector-field">Nome do dispositivo
          <input class="topo-inspector-input" id="topoNodeName" type="text" value="${escapeAttr(node.label)}">
        </label>
        <div class="topo-inspector-field">
          <span>Tipo e função</span>
          <div class="topo-conn-chip"><strong>${device.label}</strong> • ${device.typeLabel}<br>${device.description}</div>
        </div>
        <label class="topo-inspector-field">IP fictício
          <input class="topo-inspector-input" id="topoNodeIp" type="text" value="${escapeAttr(node.ip)}">
        </label>
        <div class="topo-inspector-field">
          <span>Conexões atuais</span>
          <div class="topo-conn-list">${connections || '<div class="topo-conn-chip">Sem conexões ainda.</div>'}</div>
        </div>
        <div class="topo-sidepanel-actions">
          <a class="topo-info-link" href="${device.moduleUrl}">📚 Ver no conteúdo</a>
        </div>`;

      refs.inspectorBody.querySelector('#topoNodeName')?.addEventListener('input', event => {
        node.label = event.target.value.trim() || DEVICES[node.type].label;
        render();
      });
      refs.inspectorBody.querySelector('#topoNodeIp')?.addEventListener('input', event => {
        node.ip = event.target.value.trim() || autoIpFor(node.type);
        render();
      });
    }

    function selectNode(nodeId) {
      state.selectedNodeId = nodeId;
      render();
    }

    function highlightSnap(col, row) {
      refs.gridHighlight.style.left = `${gridToLeft(col)}px`;
      refs.gridHighlight.style.top = `${gridToTop(row)}px`;
      refs.gridHighlight.classList.add('visible');
    }

    function showDropRejected(col, row, nodeId) {
      refs.dropFeedback.style.left = `${gridToLeft(col)}px`;
      refs.dropFeedback.style.top = `${gridToTop(row)}px`;
      refs.dropFeedback.classList.remove('active');
      void refs.dropFeedback.offsetWidth;
      refs.dropFeedback.classList.add('active');
      const nodeEl = refs.nodesLayer.querySelector(`[data-node-id="${nodeId}"]`);
      if (nodeEl) {
        nodeEl.classList.add('topo-node--invalid');
        setTimeout(() => nodeEl.classList.remove('topo-node--invalid'), 500);
      }
      setTimeout(() => refs.dropFeedback.classList.remove('active'), 500);
    }

    function placeNodeAtCell(type, col, row, data = {}) {
      if (getOccupant(col, row, data.id)) return false;
      const node = createNode(type, col, row, data);
      state.nodes.push(node);
      if (data.id && data.id >= state.nextNodeId) state.nextNodeId = data.id + 1;
      render();
      return node;
    }

    function addNodeFromGrid(col, row) {
      if (getOccupant(col, row)) {
        showToast('Essa célula já está ocupada.', 'danger');
        showDropRejected(col, row, state.selectedNodeId);
        return;
      }
      const node = placeNodeAtCell(state.activeDevice, col, row);
      if (node) {
        selectNode(node.id);
        showToast(`${DEVICES[node.type].label} adicionado no grid.`, 'info', 1800);
      }
    }

    function getWarningForConnection(fromNode, toNode) {
      if (!fromNode || !toNode) return '';
      if (fromNode.type === 'router' && toNode.type === 'router') return 'Dois roteadores direto é incomum sem enlace L3 dedicado.';
      if (fromNode.type === 'firewall' && toNode.type === 'firewall') return 'Dois firewalls seguidos exigem política bem definida para evitar bloqueios duplicados.';
      return '';
    }

    function handleConnect(nodeId) {
      if (!state.connectFrom) {
        state.connectFrom = nodeId;
        render();
        return;
      }

      if (state.connectFrom === nodeId) {
        state.connectFrom = null;
        render();
        return;
      }

      if (getEdgeBetween(state.connectFrom, nodeId)) {
        showToast('Esse enlace já existe.', 'warn');
        state.connectFrom = null;
        render();
        return;
      }

      const fromNode = getNodeById(state.connectFrom);
      const toNode = getNodeById(nodeId);
      const warning = getWarningForConnection(fromNode, toNode);
      state.edges.push(createEdge(state.connectFrom, nodeId, { warning }));
      if (warning) showToast(`${warning} Mesmo assim o enlace foi criado para fins didáticos.`, 'warn', 4200);
      state.connectFrom = null;
      render();
    }

    function startNodeInteraction(event, nodeId) {
      if (state.mode === 'connect') {
        event.preventDefault();
        handleConnect(nodeId);
        return;
      }

      if (state.mode === 'free-path') {
        event.preventDefault();
        handleFreePathSelect(nodeId);
        return;
      }

      if (state.mode !== 'place') return;
      event.preventDefault();
      const node = getNodeById(nodeId);
      if (!node) return;
      const point = getRelativePoint(event);
      state.drag = {
        nodeId,
        startX: point.x,
        startY: point.y,
        moved: false
      };
      selectNode(nodeId);
    }

    function onPointerMove(event) {
      if (!state.drag) return;
      if (event.cancelable) event.preventDefault();
      const node = getNodeById(state.drag.nodeId);
      const nodeEl = refs.nodesLayer.querySelector(`[data-node-id="${state.drag.nodeId}"]`);
      if (!node || !nodeEl) return;

      const point = getRelativePoint(event);
      const left = clamp(point.x - GRID / 2, 0, CANVAS_WIDTH - GRID);
      const top = clamp(point.y - GRID / 2, 0, CANVAS_HEIGHT - GRID);
      const col = clamp(Math.round(left / GRID), 0, GRID_COLS - 1);
      const row = clamp(Math.round(top / GRID), 0, GRID_ROWS - 1);

      state.drag.moved = state.drag.moved || Math.abs(point.x - state.drag.startX) > 5 || Math.abs(point.y - state.drag.startY) > 5;
      nodeEl.style.left = `${left}px`;
      nodeEl.style.top = `${top}px`;
      highlightSnap(col, row);
    }

    function onPointerUp(event) {
      if (!state.drag) return;
      const drag = state.drag;
      state.drag = null;
      refs.gridHighlight.classList.remove('visible');

      const node = getNodeById(drag.nodeId);
      if (!node) return;

      if (!drag.moved) {
        selectNode(node.id);
        return;
      }

      const point = getRelativePoint(event);
      const snapped = snapFromPoint(point.x, point.y);
      if (getOccupant(snapped.col, snapped.row, node.id)) {
        showDropRejected(snapped.col, snapped.row, node.id);
        render();
        showToast('A célula já está ocupada. O drop foi rejeitado.', 'danger');
        return;
      }

      node.col = snapped.col;
      node.row = snapped.row;
      render();
    }

    function addCanvasListeners() {
      refs.canvas.addEventListener('click', event => {
        if (event.target.closest('.topo-node')) return;
        if (state.mode !== 'place') return;
        const point = getRelativePoint(event);
        const snapped = snapFromPoint(point.x, point.y);
        addNodeFromGrid(snapped.col, snapped.row);
      });

      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('touchend', onPointerUp, { passive: false });
    }

    function setPlaceMode(device) {
      state.mode = 'place';
      state.activeDevice = device || state.activeDevice;
      state.connectFrom = null;
      state.freePathSelection = [];
      render();
    }

    function pulseNode(nodeId) {
      const nodeEl = refs.nodesLayer.querySelector(`[data-node-id="${nodeId}"]`);
      if (!nodeEl) return;
      nodeEl.classList.remove('topo-node--pulse');
      void nodeEl.offsetWidth;
      nodeEl.classList.add('topo-node--pulse');
      setTimeout(() => nodeEl.classList.remove('topo-node--pulse'), 900);
    }

    function setSimulationPanel(title, subtitle, steps) {
      refs.simTitle.textContent = title;
      refs.simSubtitle.textContent = subtitle;
      refs.simLog.innerHTML = steps.map(step => `<div class="topo-sim-step"><strong>${escapeHtml(step.title)}</strong><span>${escapeHtml(step.body)}</span></div>`).join('');
    }

    function showStatusBadge(nodeId, symbol) {
      const node = getNodeById(nodeId);
      if (!node) return;
      const badge = document.createElement('div');
      badge.className = 'topo-status-badge';
      badge.textContent = symbol;
      const center = getNodeCenter(node);
      badge.style.left = `${center.x}px`;
      badge.style.top = `${center.y - 36}px`;
      refs.overlayLayer.appendChild(badge);
      setTimeout(() => badge.remove(), 1300);
    }

    function activateEdge(edgeId, active) {
      if (active) state.activeEdgeIds.add(edgeId);
      else state.activeEdgeIds.delete(edgeId);
      renderEdges();
    }

    function animateSegment(fromId, toId, options = {}) {
      const from = getNodeById(fromId);
      const to = getNodeById(toId);
      const edge = getEdgeBetween(fromId, toId);
      if (!from || !to) return Promise.resolve();

      const fromCenter = getNodeCenter(from);
      const toCenter = getNodeCenter(to);
      const token = document.createElement('div');
      token.className = `topo-packet${options.danger ? ' topo-packet--danger' : ''}`;
      token.style.left = `${fromCenter.x}px`;
      token.style.top = `${fromCenter.y}px`;
      refs.trafficLayer.appendChild(token);
      if (edge) activateEdge(edge.id, true);

      return new Promise(resolve => {
        const start = performance.now();
        const duration = options.duration || 850;

        function frame(now) {
          const progress = Math.min(1, (now - start) / duration);
          const x = fromCenter.x + (toCenter.x - fromCenter.x) * progress;
          const y = fromCenter.y + (toCenter.y - fromCenter.y) * progress;
          token.style.left = `${x}px`;
          token.style.top = `${y}px`;
          if (progress < 1) {
            requestAnimationFrame(frame);
            return;
          }
          token.remove();
          if (edge) activateEdge(edge.id, false);
          resolve();
        }

        requestAnimationFrame(frame);
      });
    }

    async function animatePath(nodeIds, options = {}) {
      for (let i = 0; i < nodeIds.length - 1; i += 1) {
        const fromId = nodeIds[i];
        const toId = nodeIds[i + 1];
        pulseNode(fromId);
        await animateSegment(fromId, toId, options);
      }
      pulseNode(nodeIds[nodeIds.length - 1]);
    }

    async function animateBroadcast(fromId, targetIds) {
      await Promise.all(targetIds.map(targetId => animateSegment(fromId, targetId, { duration: 800 })));
    }

    async function simulateFirewallBasic(path) {
      const [clientId, firewallId, serverId] = path;
      const port = refs.portSelect.value;
      setSimulationPanel(
        'Simulação: PC → Firewall → Servidor',
        'O pacote sai do host, é inspecionado pelo firewall e segue apenas se a política permitir.',
        [
          { title: 'PC envia', body: 'Host monta o pacote com IP de origem e porta de destino.' },
          { title: 'Firewall inspeciona', body: 'Regras fictícias: 80 ALLOW, 22 BLOCK, 443 ALLOW.' },
          { title: 'Servidor recebe', body: 'Se permitido, o pacote chega e o servidor responde.' }
        ]
      );

      clearTransient();
      await animateSegment(clientId, firewallId);
      showCallout(
        firewallId,
        `<strong>Firewall</strong><br>Porta 80: ALLOW<br>Porta 22: BLOCK<br>Porta 443: ALLOW`,
        port === '22' ? 'danger' : 'info',
        3200
      );

      if (port === '22') {
        showStatusBadge(firewallId, '✖');
        showToast('Bloqueado pelo Firewall.', 'danger');
        return;
      }

      await animateSegment(firewallId, serverId);
      showStatusBadge(serverId, '✓');
      showCallout(serverId, '<strong>Servidor</strong><br>Pacote aceito. Resposta pronta.', 'info', 2400);
    }

    async function simulateSwitchBroadcast(scenario) {
      const clientId = scenario.path[0];
      const switchId = scenario.path[1];
      const targets = scenario.targets || [];

      setSimulationPanel(
        'Simulação: Switch com múltiplos servidores',
        'O host envia um quadro para o switch, que difunde até aprender melhor o MAC de destino.',
        [
          { title: 'Cliente envia', body: 'O PC entrega o quadro ao switch.' },
          { title: 'Switch faz broadcast', body: 'Sem MAC aprendido, o switch replica para as portas relevantes.' },
          { title: 'Aprendizado de MAC', body: 'Depois o switch passa a encaminhar só para o destino correto.' }
        ]
      );

      clearTransient();
      await animateSegment(clientId, switchId);
      showCallout(
        switchId,
        '<strong>Switch opera na camada 2</strong><br>Envia para todas as portas até aprender o MAC de destino.',
        'warn',
        3200
      );
      pulseNode(switchId);
      await animateBroadcast(switchId, targets);
      targets.forEach(id => showStatusBadge(id, '✓'));
    }

    async function simulateNat(path) {
      const [clientId, routerId, internetId] = path;
      const client = getNodeById(clientId);
      setSimulationPanel(
        'Simulação: PC → Roteador → Internet',
        'O roteador troca IP privado por IP público antes de encaminhar o pacote para fora da LAN.',
        [
          { title: 'Host interno', body: `Origem privada ${client?.ip || '192.168.1.x'}.` },
          { title: 'NAT no roteador', body: 'IP privado é traduzido para um IP público de saída.' },
          { title: 'Pacote externo', body: 'A internet vê apenas o IP público resultante.' }
        ]
      );

      clearTransient();
      await animateSegment(clientId, routerId);
      showCallout(
        routerId,
        `<strong>NAT</strong><br>Trocando IP ${escapeHtml(client?.ip || '192.168.1.5')} → 201.34.56.78<br><em>Isso é NAT — Network Address Translation.</em>`,
        'info',
        3400
      );
      await animateSegment(routerId, internetId);
      showStatusBadge(internetId, '✓');
    }

    async function simulateFirewallNoDest(path) {
      const [clientId, firewallId] = path;
      setSimulationPanel(
        'Simulação: Firewall sem destino',
        'O pacote chega ao firewall, mas não existe rota ou serviço atrás dele para continuar o fluxo.',
        [
          { title: 'Origem envia', body: 'O host tenta alcançar um destino inexistente.' },
          { title: 'Firewall recebe', body: 'Sem rota para o destino, o fluxo é interrompido.' }
        ]
      );

      clearTransient();
      await animateSegment(clientId, firewallId, { danger: true });
      showStatusBadge(firewallId, '✖');
      showCallout(
        firewallId,
        '<strong>Sem rota para o destino</strong><br>O firewall não tem para onde encaminhar o pacote.',
        'danger',
        3200
      );
    }

    async function simulateCorporate(path) {
      const [clientId, switchId, routerId, firewallId, serverId] = path;
      const client = getNodeById(clientId);
      const server = getNodeById(serverId);
      const port = refs.portSelect.value;

      setSimulationPanel(
        'Simulação: rede corporativa completa',
        'Cada hop pausa para explicar encapsulamento, encaminhamento, roteamento, inspeção e resposta.',
        [
          { title: '1. PC monta pacote', body: `Origem ${client?.ip || '192.168.1.10'} → destino ${server?.ip || '10.0.0.10'}.` },
          { title: '2. Switch encaminha', body: 'Camada 2: olha MAC e escolhe a porta certa.' },
          { title: '3. Roteador roteia', body: 'Camada 3: mantém IP, troca MAC para o próximo salto.' },
          { title: '4. Firewall inspeciona', body: 'Regras: 80 ALLOW, 22 BLOCK, 443 ALLOW.' },
          { title: '5. Servidor responde', body: port === '22' ? 'Conexão barrada antes da aplicação.' : 'Resposta HTTP 200 entregue ao cliente.' }
        ]
      );

      clearTransient();
      showCallout(clientId, `<strong>Pacote montado</strong><br>IP origem: ${escapeHtml(client?.ip || '192.168.1.10')}<br>IP destino: ${escapeHtml(server?.ip || '10.0.0.10')}`, 'info', 2600);
      await animateSegment(clientId, switchId);
      showCallout(switchId, '<strong>Switch (L2)</strong><br>Encaminhando quadro pela porta correta.', 'info', 2400);
      await animateSegment(switchId, routerId);
      showCallout(routerId, '<strong>Roteador (L3)</strong><br>Roteia o pacote e troca o MAC do próximo salto.', 'info', 2600);
      await animateSegment(routerId, firewallId);
      showCallout(firewallId, '<strong>Firewall</strong><br>Porta 80: ALLOW<br>Porta 22: BLOCK<br>Porta 443: ALLOW', port === '22' ? 'danger' : 'info', 3200);

      if (port === '22') {
        showStatusBadge(firewallId, '✖');
        showToast('O acesso SSH foi bloqueado pela política do firewall.', 'danger');
        return;
      }

      await animateSegment(firewallId, serverId);
      showCallout(serverId, '<strong>Servidor</strong><br>HTTP 200 OK — aplicação respondeu com sucesso.', 'info', 2600);
      showStatusBadge(serverId, '✓');
    }

    async function simulateMitm(path, blockedByFirewall) {
      const attackerIndex = path.findIndex(id => getNodeById(id)?.type === 'attacker');
      const attackerId = path[attackerIndex];
      const firewallId = blockedByFirewall ? path.find(id => getNodeById(id)?.type === 'firewall') : null;

      setSimulationPanel(
        blockedByFirewall ? 'Simulação: MITM bloqueado' : 'Simulação: MITM ativo',
        blockedByFirewall
          ? 'O atacante tenta interceptar o fluxo, mas o firewall da rota corta a comunicação.'
          : 'O atacante entra no caminho entre cliente e servidor e lê conteúdo em texto claro.',
        [
          { title: 'Intercepção', body: 'O atacante recebe o tráfego antes do destino final.' },
          { title: 'Exposição', body: 'Exemplo capturado: GET /login HTTP/1.1 | senha=abc123.' },
          { title: 'Mitigação', body: blockedByFirewall ? 'Firewall interrompe o fluxo.' : 'Adicione firewall ou use HTTPS/TLS.' }
        ]
      );

      clearTransient();
      for (let i = 0; i < attackerIndex; i += 1) {
        await animateSegment(path[i], path[i + 1], { danger: true });
      }

      showCallout(attackerId, '<strong>Interceptei</strong><br>GET /login HTTP/1.1<br>senha=abc123', 'danger', 3400);

      if (blockedByFirewall && firewallId) {
        const firewallIndex = path.indexOf(firewallId);
        for (let i = attackerIndex; i < firewallIndex; i += 1) {
          await animateSegment(path[i], path[i + 1], { danger: true });
        }
        showStatusBadge(firewallId, '✖');
        showCallout(firewallId, '<strong>Firewall</strong><br>Fluxo suspeito bloqueado antes de chegar ao servidor.', 'danger', 3000);
        return;
      }

      for (let i = attackerIndex; i < path.length - 1; i += 1) {
        await animateSegment(path[i], path[i + 1], { danger: true });
      }
      showToast('MITM ativo — adicione um Firewall ou use HTTPS.', 'danger', 3800);
      showStatusBadge(path[path.length - 1], '⚠');
    }

    async function simulateFreePath(path) {
      const labels = path.map(id => getNodeById(id)?.label || '?').join(' → ');
      setSimulationPanel(
        'Topologia livre',
        'O caminho abaixo foi escolhido pelo BFS simples no grafo de conexões.',
        [{ title: 'Menor caminho encontrado', body: labels }]
      );
      clearTransient();
      await animatePath(path);
      showToast(`Caminho animado: ${labels}`, 'info', 2600);
    }

    async function runSimulation() {
      const scenario = detectScenario(state.nodes, state.edges);
      if (!state.nodes.length) {
        showToast('Monte a topologia primeiro.', 'warn');
        return;
      }

      if (scenario.kind === 'free') {
        state.mode = 'free-path';
        state.freePathSelection = [];
        render();
        setSimulationPanel(
          'Topologia livre',
          'Clique em dois dispositivos conectados para animar o menor caminho usando BFS simples no grafo.',
          [{ title: 'Aguardando seleção', body: 'Primeiro clique: origem. Segundo clique: destino.' }]
        );
        showToast('Topologia livre detectada. Escolha origem e destino.', 'warn', 3200);
        return;
      }

      state.mode = 'simulating';
      render();
      if (scenario.kind === 'firewall-basic') await simulateFirewallBasic(scenario.path);
      else if (scenario.kind === 'switch-broadcast') await simulateSwitchBroadcast(scenario);
      else if (scenario.kind === 'nat') await simulateNat(scenario.path);
      else if (scenario.kind === 'firewall-blocked') await simulateFirewallNoDest(scenario.path);
      else if (scenario.kind === 'corporate') await simulateCorporate(scenario.path);
      else if (scenario.kind === 'mitm') await simulateMitm(scenario.path, false);
      else if (scenario.kind === 'mitm-blocked') await simulateMitm(scenario.path, true);
      state.mode = 'place';
      render();
    }

    function handleFreePathSelect(nodeId) {
      const current = state.freePathSelection;
      if (!current.length) {
        state.freePathSelection = [nodeId];
        selectNode(nodeId);
        updateModeUI();
        updateHint();
        return;
      }

      if (current[0] === nodeId) {
        state.freePathSelection = [];
        render();
        return;
      }

      const path = shortestPath(current[0], nodeId);
      state.freePathSelection = [];
      state.mode = 'place';
      render();
      if (!path) {
        showToast('Esses dois dispositivos não estão conectados.', 'danger');
        return;
      }
      simulateFreePath(path);
    }

    function organizeNodes() {
      const sorted = [...state.nodes].sort((a, b) => {
        if (a.type === b.type) return a.label.localeCompare(b.label, 'pt-BR');
        return a.type.localeCompare(b.type, 'pt-BR');
      });
      sorted.forEach((node, index) => {
        node.col = index % GRID_COLS;
        node.row = Math.floor(index / GRID_COLS);
      });
      render();
      showToast('Topologia reorganizada no grid.', 'info');
    }

    function saveTopology() {
      const payload = {
        nodes: state.nodes,
        edges: state.edges,
        nextNodeId: state.nextNodeId,
        nextEdgeId: state.nextEdgeId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      showToast('Topologia salva no navegador.', 'info');
    }

    function loadTopology() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        showToast('Nenhuma topologia salva encontrada.', 'warn');
        return;
      }
      try {
        const data = JSON.parse(raw);
        state.nodes = Array.isArray(data.nodes) ? data.nodes : [];
        state.edges = Array.isArray(data.edges) ? data.edges : [];
        state.nextNodeId = Number(data.nextNodeId) || 1;
        state.nextEdgeId = Number(data.nextEdgeId) || 1;
        state.selectedNodeId = state.nodes[0]?.id || null;
        state.connectFrom = null;
        state.mode = 'place';
        clearTransient();
        render();
        showToast('Topologia carregada do localStorage.', 'info');
      } catch {
        showToast('Falha ao carregar a topologia salva.', 'danger');
      }
    }

    function roundedRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    function exportPng() {
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#0f1117';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = 'rgba(79,142,247,0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= CANVAS_WIDTH; x += GRID) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += GRID) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      state.edges.forEach(edge => {
        const from = getNodeById(edge.from);
        const to = getNodeById(edge.to);
        if (!from || !to) return;
        const a = getNodeCenter(from);
        const b = getNodeCenter(to);
        ctx.strokeStyle = edge.warning ? '#f59e0b' : '#475063';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        const label = edge.label || (edge.warning ? 'incomum' : '');
        if (label) {
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          ctx.font = '12px sans-serif';
          const width = Math.max(52, ctx.measureText(label).width + 14);
          ctx.fillStyle = 'rgba(15,17,23,0.9)';
          roundedRect(ctx, midX - width / 2, midY - 14, width, 22, 10);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.stroke();
          ctx.fillStyle = '#e5e7eb';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, midX, midY - 2);
        }
      });

      state.nodes.forEach(node => {
        const x = gridToLeft(node.col);
        const y = gridToTop(node.row);
        roundedRect(ctx, x + 3, y + 3, GRID - 6, GRID - 6, 16);
        ctx.fillStyle = 'rgba(26,29,39,0.98)';
        ctx.fill();
        ctx.strokeStyle = '#2a3345';
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '28px sans-serif';
        ctx.fillText(DEVICES[node.type].icon, x + GRID / 2, y + 30);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#e5e7eb';
        ctx.fillText(node.label.slice(0, 12), x + GRID / 2, y + 52);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText(node.ip.slice(0, 14), x + GRID / 2, y + 66);
      });

      const done = blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'topologia-wikinet.png';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };

      if (canvas.toBlob) canvas.toBlob(done);
      else {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'topologia-wikinet.png';
        link.click();
      }
    }

    function clearTopology() {
      state.nodes = [];
      state.edges = [];
      state.nextNodeId = 1;
      state.nextEdgeId = 1;
      state.selectedNodeId = null;
      state.connectFrom = null;
      state.freePathSelection = [];
      state.mode = 'place';
      clearTransient();
      render();
      setSimulationPanel(
        'Canvas limpo',
        'Adicione dispositivos, conecte e simule novamente.',
        [{ title: 'Próximo passo', body: 'Escolha um dispositivo na barra e clique em uma célula vazia do grid.' }]
      );
    }

    function loadTemplate(templateKey, silent = false) {
      const template = TEMPLATES[templateKey];
      if (!template) return;
      clearTopology();

      const lookup = new Map();
      template.nodes.forEach(item => {
        const node = placeNodeAtCell(item.type, item.col, item.row, { label: item.label, ip: item.ip });
        if (node) lookup.set(item.label, node.id);
      });
      template.edges.forEach(edge => {
        const from = lookup.get(edge.from);
        const to = lookup.get(edge.to);
        if (!from || !to || getEdgeBetween(from, to)) return;
        state.edges.push(createEdge(from, to, { label: edge.label }));
      });

      state.selectedNodeId = state.nodes[0]?.id || null;
      render();
      setSimulationPanel(
        template.label,
        template.hint,
        [{ title: 'Template carregado', body: template.hint }]
      );
      if (!silent) showToast(`${template.label} carregada.`, 'info', 2600);
    }

    refs.deviceTools.querySelectorAll('[data-device]').forEach(button => {
      button.addEventListener('click', () => setPlaceMode(button.dataset.device));
    });
    refs.connectBtn.addEventListener('click', () => {
      state.mode = state.mode === 'connect' ? 'place' : 'connect';
      state.connectFrom = null;
      state.freePathSelection = [];
      render();
    });
    refs.organizeBtn.addEventListener('click', organizeNodes);
    refs.simBtn.addEventListener('click', runSimulation);
    refs.saveBtn.addEventListener('click', saveTopology);
    refs.loadBtn.addEventListener('click', loadTopology);
    refs.exportBtn.addEventListener('click', exportPng);
    refs.clearBtn.addEventListener('click', clearTopology);
    refs.templateSelect.addEventListener('change', () => {
      if (!refs.templateSelect.value) return;
      loadTemplate(refs.templateSelect.value);
      refs.templateSelect.value = '';
    });

    addCanvasListeners();
    render();

    if (localStorage.getItem(STORAGE_KEY)) loadTopology();
    else loadTemplate('home', true);
  }

  function initTopologyV3(container) {
    const STORAGE_KEY = 'rw-topology-v3';
    const GRID = 90;
    const CANVAS_WIDTH = 1400;
    const CANVAS_HEIGHT = 800;
    const GRID_COLS = Math.floor(CANVAS_WIDTH / GRID);
    const GRID_ROWS = Math.floor(CANVAS_HEIGHT / GRID);
    const HISTORY_LIMIT = 20;
    const ZOOM_MIN = 0.5;
    const ZOOM_MAX = 1.5;
    const ZOOM_STEP = 0.1;
    const SVG_NS = 'http://www.w3.org/2000/svg';

    const DEVICES = {
      pc: { icon: '💻', label: 'PC', moduleUrl: 'fundamentos.html', description: 'Host final que gera tráfego de aplicação.' },
      laptop: { icon: '🖥️', label: 'Laptop', moduleUrl: 'fundamentos.html', description: 'Outro endpoint para treinar cenários de acesso.' },
      router: { icon: '📡', label: 'Roteador', moduleUrl: 'equipamentos.html', description: 'Camada 3: roteia pacotes e faz NAT.' },
      switch: { icon: '🔀', label: 'Switch', moduleUrl: 'equipamentos.html', description: 'Camada 2: encaminha por MAC.' },
      server: { icon: '🖥️', label: 'Servidor', moduleUrl: 'protocolos.html', description: 'Publica serviços e responde requisições.' },
      firewall: { icon: '🔒', label: 'Firewall', moduleUrl: 'seguranca.html', description: 'Inspeciona e bloqueia ou permite tráfego.' },
      internet: { icon: '🌐', label: 'Internet', moduleUrl: 'acesso-site.html', description: 'Representa a rede externa.' },
      attacker: { icon: '😈', label: 'Atacante', moduleUrl: 'seguranca.html', description: 'Simula MITM e interceptação.' }
    };

    const TEMPLATES = {
      home: {
        label: 'Rede doméstica',
        hint: 'Rede simples com hosts internos saindo por um roteador até a internet.',
        nodes: [
          { type: 'pc', label: 'PC-1', col: 2, row: 4 },
          { type: 'laptop', label: 'Laptop-1', col: 2, row: 6 },
          { type: 'router', label: 'Roteador', col: 5, row: 5 },
          { type: 'internet', label: 'Internet', col: 9, row: 3 }
        ],
        edges: [
          { from: 'PC-1', to: 'Roteador', label: 'LAN' },
          { from: 'Laptop-1', to: 'Roteador', label: 'Wi-Fi' },
          { from: 'Roteador', to: 'Internet', label: 'WAN' }
        ]
      },
      corporate: {
        label: 'Rede corporativa',
        hint: 'Clientes convergem em switch, seguem por roteador e firewall até o servidor.',
        nodes: [
          { type: 'pc', label: 'PC-1', col: 1, row: 4 },
          { type: 'pc', label: 'PC-2', col: 1, row: 5 },
          { type: 'pc', label: 'PC-3', col: 1, row: 6 },
          { type: 'switch', label: 'Switch', col: 4, row: 5 },
          { type: 'router', label: 'Roteador', col: 7, row: 5 },
          { type: 'firewall', label: 'Firewall', col: 10, row: 5 },
          { type: 'server', label: 'Servidor', col: 13, row: 5 }
        ],
        edges: [
          { from: 'PC-1', to: 'Switch', label: 'Acesso' },
          { from: 'PC-2', to: 'Switch', label: 'Acesso' },
          { from: 'PC-3', to: 'Switch', label: 'Acesso' },
          { from: 'Switch', to: 'Roteador', label: 'Trunk' },
          { from: 'Roteador', to: 'Firewall', label: 'L3' },
          { from: 'Firewall', to: 'Servidor', label: 'DMZ' }
        ]
      },
      attack: {
        label: 'Cenário de ataque',
        hint: 'O atacante fica entre cliente e destino para ilustrar MITM.',
        nodes: [
          { type: 'pc', label: 'Cliente', col: 2, row: 5 },
          { type: 'attacker', label: 'Atacante', col: 5, row: 5 },
          { type: 'switch', label: 'Switch', col: 8, row: 5 },
          { type: 'server', label: 'Servidor', col: 11, row: 5 }
        ],
        edges: [
          { from: 'Cliente', to: 'Atacante', label: 'Interceptado' },
          { from: 'Atacante', to: 'Switch', label: 'Relay' },
          { from: 'Switch', to: 'Servidor', label: 'HTTP' }
        ]
      },
      dmz: {
        label: 'Rede com DMZ',
        hint: 'A DMZ expõe serviços públicos enquanto a rede interna fica atrás de outra camada de proteção.',
        nodes: [
          { type: 'internet', label: 'Internet', col: 1, row: 4 },
          { type: 'firewall', label: 'FW Externo', col: 4, row: 4 },
          { type: 'switch', label: 'Switch DMZ', col: 7, row: 4 },
          { type: 'server', label: 'Servidor Web', col: 10, row: 3 },
          { type: 'firewall', label: 'FW Interno', col: 10, row: 6 },
          { type: 'pc', label: 'Rede Interna', col: 13, row: 6 }
        ],
        edges: [
          { from: 'Internet', to: 'FW Externo', label: 'WAN' },
          { from: 'FW Externo', to: 'Switch DMZ', label: 'DMZ' },
          { from: 'Switch DMZ', to: 'Servidor Web', label: 'Web' },
          { from: 'Switch DMZ', to: 'FW Interno', label: 'Segregado' },
          { from: 'FW Interno', to: 'Rede Interna', label: 'LAN' }
        ]
      }
    };

    const refs = {};
    const state = {
      nodes: [],
      edges: [],
      nextNodeId: 1,
      nextEdgeId: 1,
      selectedNodeId: null,
      placingType: null,
      mode: 'idle',
      connectFrom: null,
      freePathSelection: [],
      zoom: 1,
      history: [],
      drag: null,
      edgeDrag: null,
      hoveredEdgeId: null,
      hoverNodeId: null,
      tooltipNodeId: null,
      hoverTimer: null,
      editingNodeId: null,
      editingEdgeId: null,
      toastTimer: null,
      simEdgeIds: new Set()
    };

    container.innerHTML = `
      <div class="topo-workspace topo-workspace--v3">
        <div class="topo-toolbar">
          <div class="topo-toolbar-group topo-toolbar-group--devices" id="topoDeviceTools">
            ${Object.entries(DEVICES).map(([key, device]) => `
              <button class="topo-tool" type="button" data-device="${key}" draggable="true">
                <span class="topo-tool-icon">${device.icon}</span>
                <span>${device.label}</span>
              </button>
            `).join('')}
          </div>
          <div class="topo-toolbar-divider" aria-hidden="true"></div>
          <div class="topo-toolbar-group topo-toolbar-group--actions">
            <button class="topo-action-btn" id="topoConnectBtn" type="button">🔗 Conectar</button>
            <button class="topo-action-btn" id="topoUndoBtn" type="button">↩ Desfazer</button>
            <button class="topo-action-btn" id="topoDeleteBtn" type="button">🗑️ Deletar</button>
            <button class="topo-action-btn" id="topoClearBtn" type="button">🧹 Limpar</button>
            <button class="topo-action-btn" id="topoOrganizeBtn" type="button">🧭 Organizar</button>
            <button class="topo-action-btn" id="topoSimBtn" type="button">⚡ Simular</button>
          </div>
          <div class="topo-toolbar-divider" aria-hidden="true"></div>
          <div class="topo-toolbar-group topo-toolbar-group--storage">
            <select class="topo-template" id="topoTemplateSelect" aria-label="Templates">
              <option value="">📂 Templates ▾</option>
              <option value="home">Rede doméstica</option>
              <option value="corporate">Rede corporativa</option>
              <option value="attack">Cenário de ataque</option>
              <option value="dmz">Rede com DMZ</option>
            </select>
            <button class="topo-action-btn" id="topoSaveBtn" type="button">💾 Salvar</button>
            <button class="topo-action-btn" id="topoLoadBtn" type="button">📂 Carregar</button>
            <button class="topo-action-btn" id="topoExportBtn" type="button">🖼️ Exportar PNG</button>
          </div>
        </div>

        <div class="topo-main">
          <div class="topo-stage">
            <div class="topo-stage-topbar">
              <div class="topo-stage-copy" id="topoStageCopy">Clique em um dispositivo na barra acima para começar ou arraste para o canvas.</div>
              <label class="topo-port-select">Porta alvo
                <select id="topoPortSelect">
                  <option value="80">80</option>
                  <option value="22">22</option>
                  <option value="443" selected>443</option>
                </select>
              </label>
            </div>

            <div class="topo-canvas-shell">
              <div class="topo-canvas-scroll" id="topoCanvasScroll">
                <div class="topo-canvas-viewport" id="topoCanvasViewport">
                  <div class="topo-canvas-wrap" id="topoCanvas">
                    <svg class="topo-svg" id="topoSVG" aria-hidden="true"></svg>
                    <div class="topo-edge-html" id="topoEdgeHtml"></div>
                    <div class="topo-grid-highlight" id="topoGridHighlight"></div>
                    <div class="topo-drop-feedback" id="topoDropFeedback"></div>
                    <div class="topo-empty-state" id="topoEmptyState">
                      <div class="topo-empty-card">
                        <strong>👆 Clique em um dispositivo</strong>
                        <span>na barra acima para começar</span>
                        <span>ou carregue um template →</span>
                      </div>
                    </div>
                    <div class="topo-nodes" id="topoNodes"></div>
                    <div class="topo-traffic-layer" id="topoTrafficLayer"></div>
                    <div class="topo-overlay-layer" id="topoOverlayLayer"></div>
                    <button class="topo-undo-float" id="topoUndoFloat" type="button">↩ Desfazer</button>
                  </div>
                </div>
              </div>

              <div class="topo-zoom-controls">
                <button class="topo-zoom-btn" id="topoZoomOut" type="button">−</button>
                <span class="topo-zoom-value" id="topoZoomValue">100%</span>
                <button class="topo-zoom-btn" id="topoZoomIn" type="button">+</button>
              </div>
            </div>

            <div class="topo-sim-panel">
              <div>
                <div class="topo-sim-title" id="topoSimTitle">Topologia pronta</div>
                <div class="topo-sim-subtitle" id="topoSimSubtitle">Monte o cenário e clique em "Simular". Em topologia livre, escolha origem e destino para usar BFS.</div>
              </div>
              <div class="topo-sim-log" id="topoSimLog">
                <div class="topo-sim-step"><strong>Dica</strong><span>Posicione por clique, mova com drag e conecte pelo botão ou pelos pontos azuis.</span></div>
              </div>
            </div>
          </div>

          <aside class="topo-sidepanel" id="topoInspector">
            <div class="topo-sidepanel-head">
              <div class="topo-sidepanel-title">Painel do dispositivo</div>
            </div>
            <div class="topo-sidepanel-body" id="topoInspectorBody">
              <div class="topo-inspector-empty">Clique em um dispositivo do canvas para editar nome, IP, revisar conexões e navegar para o conteúdo relacionado.</div>
            </div>
          </aside>
        </div>
      </div>`;

    refs.deviceTools = container.querySelector('#topoDeviceTools');
    refs.templateSelect = container.querySelector('#topoTemplateSelect');
    refs.connectBtn = container.querySelector('#topoConnectBtn');
    refs.undoBtn = container.querySelector('#topoUndoBtn');
    refs.undoFloat = container.querySelector('#topoUndoFloat');
    refs.deleteBtn = container.querySelector('#topoDeleteBtn');
    refs.clearBtn = container.querySelector('#topoClearBtn');
    refs.organizeBtn = container.querySelector('#topoOrganizeBtn');
    refs.simBtn = container.querySelector('#topoSimBtn');
    refs.saveBtn = container.querySelector('#topoSaveBtn');
    refs.loadBtn = container.querySelector('#topoLoadBtn');
    refs.exportBtn = container.querySelector('#topoExportBtn');
    refs.portSelect = container.querySelector('#topoPortSelect');
    refs.stageCopy = container.querySelector('#topoStageCopy');
    refs.scroll = container.querySelector('#topoCanvasScroll');
    refs.viewport = container.querySelector('#topoCanvasViewport');
    refs.canvas = container.querySelector('#topoCanvas');
    refs.svg = container.querySelector('#topoSVG');
    refs.edgeHtml = container.querySelector('#topoEdgeHtml');
    refs.gridHighlight = container.querySelector('#topoGridHighlight');
    refs.dropFeedback = container.querySelector('#topoDropFeedback');
    refs.emptyState = container.querySelector('#topoEmptyState');
    refs.nodesLayer = container.querySelector('#topoNodes');
    refs.trafficLayer = container.querySelector('#topoTrafficLayer');
    refs.overlayLayer = container.querySelector('#topoOverlayLayer');
    refs.inspector = container.querySelector('#topoInspector');
    refs.inspectorBody = container.querySelector('#topoInspectorBody');
    refs.simTitle = container.querySelector('#topoSimTitle');
    refs.simSubtitle = container.querySelector('#topoSimSubtitle');
    refs.simLog = container.querySelector('#topoSimLog');
    refs.zoomOut = container.querySelector('#topoZoomOut');
    refs.zoomIn = container.querySelector('#topoZoomIn');
    refs.zoomValue = container.querySelector('#topoZoomValue');

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function persist(showToastMessage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        nodes: state.nodes,
        edges: state.edges,
        nextNodeId: state.nextNodeId,
        nextEdgeId: state.nextEdgeId
      }));
      if (showToastMessage) showToast('Topologia salva no navegador.');
    }

    function cloneSnapshot() {
      return JSON.parse(JSON.stringify({
        nodes: state.nodes,
        edges: state.edges,
        nextNodeId: state.nextNodeId,
        nextEdgeId: state.nextEdgeId,
        selectedNodeId: state.selectedNodeId
      }));
    }

    function pushHistory() {
      state.history.push(cloneSnapshot());
      if (state.history.length > HISTORY_LIMIT) state.history.shift();
    }

    function restoreSnapshot(snapshot) {
      if (!snapshot) return;
      state.nodes = snapshot.nodes || [];
      state.edges = snapshot.edges || [];
      state.nextNodeId = snapshot.nextNodeId || 1;
      state.nextEdgeId = snapshot.nextEdgeId || 1;
      state.selectedNodeId = snapshot.selectedNodeId || state.nodes[0]?.id || null;
      state.connectFrom = null;
      state.freePathSelection = [];
      state.mode = 'idle';
      persist(false);
      render();
    }

    function undoLastAction() {
      restoreSnapshot(state.history.pop());
    }

    function getNodeById(id) {
      return state.nodes.find(node => node.id === id) || null;
    }

    function getEdgeBetween(a, b) {
      return state.edges.find(edge => (edge.from === a && edge.to === b) || (edge.from === b && edge.to === a)) || null;
    }

    function buildAdjacency(nodesList = state.nodes, edgesList = state.edges) {
      const adjacency = new Map(nodesList.map(node => [node.id, []]));
      edgesList.forEach(edge => {
        if (!adjacency.has(edge.from) || !adjacency.has(edge.to)) return;
        adjacency.get(edge.from).push(edge.to);
        adjacency.get(edge.to).push(edge.from);
      });
      return adjacency;
    }

    function shortestPath(startId, endId) {
      if (startId === endId) return [startId];
      const adjacency = buildAdjacency();
      const queue = [[startId]];
      const seen = new Set([startId]);
      while (queue.length) {
        const path = queue.shift();
        const current = path[path.length - 1];
        for (const next of adjacency.get(current) || []) {
          if (seen.has(next)) continue;
          const candidate = [...path, next];
          if (next === endId) return candidate;
          seen.add(next);
          queue.push(candidate);
        }
      }
      return null;
    }

    function isEndpoint(node) {
      return !!node && (node.type === 'pc' || node.type === 'laptop');
    }

    function findChain(pattern, nodesList = state.nodes, edgesList = state.edges) {
      const adjacency = buildAdjacency(nodesList, edgesList);
      function matches(node, expected) {
        return expected === 'endpoint' ? isEndpoint(node) : node?.type === expected;
      }
      function walk(nodeId, index, visited) {
        const node = nodesList.find(item => item.id === nodeId);
        if (!matches(node, pattern[index])) return null;
        if (index === pattern.length - 1) return [nodeId];
        for (const next of adjacency.get(nodeId) || []) {
          if (visited.has(next)) continue;
          const result = walk(next, index + 1, new Set([...visited, next]));
          if (result) return [nodeId, ...result];
        }
        return null;
      }
      for (const node of nodesList) {
        const result = walk(node.id, 0, new Set([node.id]));
        if (result) return result;
      }
      return null;
    }

    function detectScenario(nodesList, edgesList) {
      const adjacency = buildAdjacency(nodesList, edgesList);
      const endpoints = nodesList.filter(isEndpoint);
      const servers = nodesList.filter(node => node.type === 'server');

      const corporate = findChain(['endpoint', 'switch', 'router', 'firewall', 'server'], nodesList, edgesList);
      if (corporate) return { kind: 'corporate', path: corporate };

      for (const endpoint of endpoints) {
        for (const server of servers) {
          const path = shortestPath(endpoint.id, server.id);
          if (!path) continue;
          const types = path.map(id => getNodeById(id)?.type);
          const attackerIndex = types.indexOf('attacker');
          if (attackerIndex !== -1) {
            const blocked = types.slice(attackerIndex + 1).includes('firewall');
            return { kind: blocked ? 'mitm-blocked' : 'mitm', path };
          }
        }
      }

      const firewallBasic = findChain(['endpoint', 'firewall', 'server'], nodesList, edgesList);
      if (firewallBasic) return { kind: 'firewall-basic', path: firewallBasic };

      for (const endpoint of endpoints) {
        for (const next of adjacency.get(endpoint.id) || []) {
          const sw = getNodeById(next);
          if (!sw || sw.type !== 'switch') continue;
          const targets = (adjacency.get(sw.id) || []).filter(id => getNodeById(id)?.type === 'server');
          if (targets.length >= 2) return { kind: 'switch-broadcast', path: [endpoint.id, sw.id], targets };
        }
      }

      const nat = findChain(['endpoint', 'router', 'internet'], nodesList, edgesList);
      if (nat) return { kind: 'nat', path: nat };

      const firewallOnly = findChain(['endpoint', 'firewall'], nodesList, edgesList);
      if (firewallOnly) {
        const firewall = getNodeById(firewallOnly[1]);
        if (firewall && (adjacency.get(firewall.id) || []).length === 1) return { kind: 'firewall-blocked', path: firewallOnly };
      }

      return { kind: 'free' };
    }

    function autoIpFor(type) {
      const seq = state.nodes.filter(node => node.type === type).length + 1;
      const table = {
        pc: `192.168.1.${10 + seq}`,
        laptop: `192.168.1.${30 + seq}`,
        router: '192.168.1.1',
        switch: `192.168.1.${200 + seq}`,
        server: `10.0.0.${10 + seq}`,
        firewall: `10.0.0.${100 + seq}`,
        internet: '201.34.56.78',
        attacker: `192.168.1.${60 + seq}`
      };
      return table[type] || `10.0.0.${10 + seq}`;
    }

    function gridToLeft(col) {
      return col * GRID;
    }

    function gridToTop(row) {
      return row * GRID;
    }

    function getRenderCell(nodeId) {
      if (state.drag && state.drag.nodeId === nodeId) return state.drag.previewCell || state.drag.startCell;
      const node = getNodeById(nodeId);
      return node ? { col: node.col, row: node.row } : { col: 0, row: 0 };
    }

    function getNodeCenter(nodeOrId) {
      const cell = typeof nodeOrId === 'number' ? getRenderCell(nodeOrId) : { col: nodeOrId.col, row: nodeOrId.row };
      return { x: gridToLeft(cell.col) + GRID / 2, y: gridToTop(cell.row) + GRID / 2 };
    }

    function getCanvasPoint(event) {
      const source = event.touches?.[0] || event.changedTouches?.[0] || event;
      const rect = refs.viewport.getBoundingClientRect();
      return {
        x: clamp((source.clientX - rect.left) / state.zoom, 0, CANVAS_WIDTH),
        y: clamp((source.clientY - rect.top) / state.zoom, 0, CANVAS_HEIGHT)
      };
    }

    function snapPoint(x, y) {
      return {
        col: clamp(Math.round((x - GRID / 2) / GRID), 0, GRID_COLS - 1),
        row: clamp(Math.round((y - GRID / 2) / GRID), 0, GRID_ROWS - 1)
      };
    }

    function getOccupant(col, row, exceptId) {
      return state.nodes.find(node => node.col === col && node.row === row && node.id !== exceptId) || null;
    }

    function findNearestFreeCell(col, row, exceptId) {
      if (!getOccupant(col, row, exceptId)) return { col, row, moved: false };
      for (let radius = 1; radius <= Math.max(GRID_COLS, GRID_ROWS); radius += 1) {
        for (let r = row - radius; r <= row + radius; r += 1) {
          for (let c = col - radius; c <= col + radius; c += 1) {
            if (Math.abs(c - col) !== radius && Math.abs(r - row) !== radius) continue;
            if (c < 0 || r < 0 || c >= GRID_COLS || r >= GRID_ROWS) continue;
            if (!getOccupant(c, r, exceptId)) return { col: c, row: r, moved: true };
          }
        }
      }
      return null;
    }

    function createNode(type, col, row, data = {}) {
      const count = state.nodes.filter(node => node.type === type).length + 1;
      return {
        id: data.id ?? state.nextNodeId++,
        type,
        label: data.label || `${DEVICES[type].label}-${count}`,
        ip: data.ip || autoIpFor(type),
        col,
        row
      };
    }

    function createEdge(from, to, data = {}) {
      return {
        id: data.id ?? state.nextEdgeId++,
        from,
        to,
        label: data.label || '',
        warning: data.warning || ''
      };
    }

    function updateUndoButtons() {
      const disabled = !state.history.length;
      refs.undoBtn.disabled = disabled;
      refs.undoFloat.disabled = disabled;
      refs.undoFloat.classList.toggle('show', !disabled);
    }

    function updateZoom() {
      refs.canvas.style.transform = `scale(${state.zoom})`;
      refs.viewport.style.width = `${CANVAS_WIDTH * state.zoom}px`;
      refs.viewport.style.height = `${CANVAS_HEIGHT * state.zoom}px`;
      refs.zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;
    }

    function showToast(message, tone = 'info', options = {}) {
      document.querySelectorAll('.topo-toast').forEach(node => node.remove());
      const toast = document.createElement('div');
      toast.className = `topo-toast${tone === 'warn' ? ' topo-toast--warn' : ''}${tone === 'danger' ? ' topo-toast--danger' : ''}`;
      const body = document.createElement('div');
      body.className = 'topo-toast-body';
      body.innerHTML = message;
      toast.appendChild(body);
      if (Array.isArray(options.actions) && options.actions.length) {
        const actions = document.createElement('div');
        actions.className = 'topo-toast-actions';
        options.actions.forEach(action => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'topo-toast-btn';
          button.textContent = action.label;
          button.addEventListener('click', () => {
            if (state.toastTimer) clearTimeout(state.toastTimer);
            toast.remove();
            action.onClick();
          });
          actions.appendChild(button);
        });
        toast.appendChild(actions);
      }
      document.body.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('show'));
      if (state.toastTimer) clearTimeout(state.toastTimer);
      if (!options.sticky) {
        state.toastTimer = setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 240);
        }, options.timeout || 2600);
      }
      return toast;
    }

    function showCallout(nodeId, html, tone = 'info', timeout = 2800) {
      refs.overlayLayer.querySelectorAll('.topo-callout').forEach(node => node.remove());
      const node = getNodeById(nodeId);
      if (!node) return;
      const center = getNodeCenter(node.id);
      const callout = document.createElement('div');
      callout.className = `topo-callout${tone === 'warn' ? ' topo-callout--warn' : ''}${tone === 'danger' ? ' topo-callout--danger' : ''}`;
      callout.innerHTML = html;
      callout.style.left = `${clamp(center.x + 40, 16, CANVAS_WIDTH - 280)}px`;
      callout.style.top = `${clamp(center.y - 20, 16, CANVAS_HEIGHT - 150)}px`;
      refs.overlayLayer.appendChild(callout);
      setTimeout(() => callout.remove(), timeout);
    }

    function flashCell(col, row) {
      refs.dropFeedback.style.left = `${gridToLeft(col)}px`;
      refs.dropFeedback.style.top = `${gridToTop(row)}px`;
      refs.dropFeedback.classList.remove('active');
      void refs.dropFeedback.offsetWidth;
      refs.dropFeedback.classList.add('active');
      setTimeout(() => refs.dropFeedback.classList.remove('active'), 220);
    }

    function maybeEdgeWarning(a, b) {
      const first = getNodeById(a);
      const second = getNodeById(b);
      if (!first || !second) return '';
      if (first.type === 'router' && second.type === 'router') {
        return 'Ligação direta entre roteadores é incomum em laboratórios básicos; normalmente há um meio L2 entre eles.';
      }
      return '';
    }

    function updateStageCopy() {
      if (state.mode === 'connect') {
        refs.stageCopy.textContent = state.connectFrom
          ? '2º clique: dispositivo de destino.'
          : '1º clique: dispositivo de origem | 2º clique: dispositivo de destino';
      } else if (state.mode === 'free-path') {
        refs.stageCopy.textContent = state.freePathSelection.length
          ? 'Agora clique no destino para animar o menor caminho.'
          : 'Topologia livre: clique na origem e depois no destino.';
      } else if (state.placingType) {
        refs.stageCopy.textContent = `Clique no canvas para posicionar o ${DEVICES[state.placingType].label}.`;
      } else {
        refs.stageCopy.textContent = 'Clique em um dispositivo na barra acima para começar ou arraste para o canvas.';
      }
      refs.canvas.classList.toggle('topo-canvas--placing', !!state.placingType);
    }

    function renderTooltip() {
      refs.overlayLayer.querySelectorAll('.topo-tooltip').forEach(node => node.remove());
      if (!state.tooltipNodeId) return;
      const node = getNodeById(state.tooltipNodeId);
      if (!node) return;
      const tooltip = document.createElement('div');
      tooltip.className = 'topo-tooltip';
      tooltip.innerHTML = `<strong>${escapeHtml(node.label)}</strong><span>${escapeHtml(node.ip)}</span>`;
      const center = getNodeCenter(node.id);
      tooltip.style.left = `${center.x}px`;
      tooltip.style.top = `${center.y - 56}px`;
      refs.overlayLayer.appendChild(tooltip);
    }

    function renderNodeEditor() {
      refs.overlayLayer.querySelectorAll('.topo-node-editor').forEach(node => node.remove());
      if (!state.editingNodeId) return;
      const node = getNodeById(state.editingNodeId);
      if (!node) return;
      const center = getNodeCenter(node.id);
      const input = document.createElement('input');
      input.className = 'topo-node-editor';
      input.value = node.label || '';
      input.style.left = `${center.x}px`;
      input.style.top = `${center.y + 2}px`;
      refs.overlayLayer.appendChild(input);
      input.focus();
      input.select();
      const save = () => {
        node.label = input.value.trim().slice(0, 28) || DEVICES[node.type].label;
        state.editingNodeId = null;
        persist(false);
        render();
      };
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') save();
        if (event.key === 'Escape') {
          state.editingNodeId = null;
          render();
        }
      });
      input.addEventListener('blur', save, { once: true });
    }

    function renderEdgeEditor() {
      refs.overlayLayer.querySelectorAll('.topo-edge-editor').forEach(node => node.remove());
      if (!state.editingEdgeId) return;
      const edge = state.edges.find(item => item.id === state.editingEdgeId);
      if (!edge) return;
      const a = getNodeCenter(edge.from);
      const b = getNodeCenter(edge.to);
      const input = document.createElement('input');
      input.className = 'topo-edge-editor';
      input.value = edge.label || '';
      input.style.left = `${(a.x + b.x) / 2}px`;
      input.style.top = `${(a.y + b.y) / 2}px`;
      refs.overlayLayer.appendChild(input);
      input.focus();
      input.select();
      const save = () => {
        edge.label = input.value.trim().slice(0, 24);
        state.editingEdgeId = null;
        persist(false);
        render();
      };
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') save();
        if (event.key === 'Escape') {
          state.editingEdgeId = null;
          render();
        }
      });
      input.addEventListener('blur', save, { once: true });
    }

    function renderEdges() {
      refs.svg.innerHTML = '';
      refs.edgeHtml.innerHTML = '';
      const defs = document.createElementNS(SVG_NS, 'defs');
      const marker = document.createElementNS(SVG_NS, 'marker');
      marker.setAttribute('id', 'topoArrowHeadV3');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '10');
      marker.setAttribute('refX', '8');
      marker.setAttribute('refY', '5');
      marker.setAttribute('orient', 'auto');
      const markerPath = document.createElementNS(SVG_NS, 'path');
      markerPath.setAttribute('d', 'M0,0 L10,5 L0,10 z');
      markerPath.setAttribute('fill', '#4f8ef7');
      marker.appendChild(markerPath);
      defs.appendChild(marker);
      refs.svg.appendChild(defs);

      state.edges.forEach(edge => {
        const a = getNodeCenter(edge.from);
        const b = getNodeCenter(edge.to);
        const group = document.createElementNS(SVG_NS, 'g');
        group.setAttribute('class', 'topo-edge-group');
        group.dataset.edgeId = String(edge.id);

        const hit = document.createElementNS(SVG_NS, 'line');
        hit.setAttribute('class', 'topo-edge-hit');
        hit.setAttribute('x1', a.x);
        hit.setAttribute('y1', a.y);
        hit.setAttribute('x2', b.x);
        hit.setAttribute('y2', b.y);
        group.appendChild(hit);

        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('class', `topo-edge${edge.warning ? ' topo-edge--warn' : ''}${state.hoveredEdgeId === edge.id ? ' topo-edge--hovered' : ''}${state.simEdgeIds.has(edge.id) ? ' topo-edge--active' : ''}`);
        line.setAttribute('x1', a.x);
        line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x);
        line.setAttribute('y2', b.y);
        line.setAttribute('marker-end', 'url(#topoArrowHeadV3)');
        group.appendChild(line);
        group.addEventListener('mouseenter', () => {
          state.hoveredEdgeId = edge.id;
          render();
        });
        group.addEventListener('mouseleave', () => {
          state.hoveredEdgeId = null;
          render();
        });
        refs.svg.appendChild(group);

        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        const label = document.createElement('button');
        label.type = 'button';
        label.className = 'topo-edge-label';
        label.style.left = `${midX}px`;
        label.style.top = `${midY}px`;
        label.textContent = edge.label || (edge.warning ? 'incomum' : 'enlace');
        label.addEventListener('dblclick', event => {
          event.preventDefault();
          event.stopPropagation();
          state.editingEdgeId = edge.id;
          renderEdgeEditor();
        });
        refs.edgeHtml.appendChild(label);

        const token = document.createElement('div');
        token.className = 'topo-edge-token';
        token.style.left = `${a.x}px`;
        token.style.top = `${a.y}px`;
        token.style.setProperty('--dx', `${b.x - a.x}px`);
        token.style.setProperty('--dy', `${b.y - a.y}px`);
        refs.edgeHtml.appendChild(token);

        if (state.hoveredEdgeId === edge.id) {
          const remove = document.createElement('button');
          remove.type = 'button';
          remove.className = 'topo-edge-delete';
          remove.textContent = '✕';
          remove.style.left = `${midX + 42}px`;
          remove.style.top = `${midY}px`;
          remove.addEventListener('click', event => {
            event.stopPropagation();
            pushHistory();
            state.edges = state.edges.filter(item => item.id !== edge.id);
            state.hoveredEdgeId = null;
            persist(false);
            render();
          });
          refs.edgeHtml.appendChild(remove);
        }
      });

      if (state.edgeDrag) {
        const draft = document.createElementNS(SVG_NS, 'line');
        draft.setAttribute('class', 'topo-edge topo-edge--draft');
        draft.setAttribute('x1', state.edgeDrag.start.x);
        draft.setAttribute('y1', state.edgeDrag.start.y);
        draft.setAttribute('x2', state.edgeDrag.end.x);
        draft.setAttribute('y2', state.edgeDrag.end.y);
        refs.svg.appendChild(draft);
      }
    }

    function renderNodes() {
      refs.nodesLayer.innerHTML = state.nodes.map(node => {
        const cell = getRenderCell(node.id);
        const classes = ['topo-node'];
        if (node.id === state.selectedNodeId) classes.push('topo-node--selected');
        if (node.id === state.connectFrom) classes.push('topo-node--origin');
        if (state.drag && state.drag.nodeId === node.id) classes.push('topo-node--dragging');
        if (state.hoverNodeId === node.id || node.id === state.selectedNodeId || node.id === state.connectFrom) classes.push('topo-node--handles');
        return `
          <div class="${classes.join(' ')}" data-node-id="${node.id}" style="left:${gridToLeft(cell.col)}px;top:${gridToTop(cell.row)}px;">
            <div class="topo-node-icon">${DEVICES[node.type].icon}</div>
            <div class="topo-node-label">${escapeHtml(node.label)}</div>
            <div class="topo-node-ip">${escapeHtml(node.ip)}</div>
            <span class="topo-node-badge">origem</span>
            <button class="topo-connector topo-connector--n" data-side="n" type="button"></button>
            <button class="topo-connector topo-connector--e" data-side="e" type="button"></button>
            <button class="topo-connector topo-connector--s" data-side="s" type="button"></button>
            <button class="topo-connector topo-connector--w" data-side="w" type="button"></button>
          </div>`;
      }).join('');
      attachNodeEvents();
    }

    function updateInspector() {
      const node = getNodeById(state.selectedNodeId);
      refs.inspector.classList.toggle('open', !!node);
      if (!node) {
        refs.inspectorBody.innerHTML = '<div class="topo-inspector-empty">Clique em um dispositivo do canvas para editar nome, IP, revisar conexões e navegar para o conteúdo relacionado.</div>';
        return;
      }
      const adjacency = buildAdjacency().get(node.id) || [];
      refs.inspectorBody.innerHTML = `
        <label class="topo-inspector-field">Nome
          <input class="topo-inspector-input" id="topoInspectorName" value="${escapeHtml(node.label)}">
        </label>
        <label class="topo-inspector-field">IP fictício
          <input class="topo-inspector-input" id="topoInspectorIp" value="${escapeHtml(node.ip)}">
        </label>
        <div class="topo-inspector-field">Função
          <div class="topo-inspector-copy">${escapeHtml(DEVICES[node.type].label)}: ${escapeHtml(DEVICES[node.type].description)}</div>
        </div>
        <div class="topo-inspector-field">Conectado a
          <ul class="topo-conn-list">
            ${(adjacency.map(id => getNodeById(id)).filter(Boolean).map(other => `<li>${escapeHtml(other.label)}</li>`).join('') || '<li>Sem conexões.</li>')}
          </ul>
        </div>
        <div class="topo-sidepanel-actions">
          <button class="btn-lab btn-lab--ghost btn-lab--sm" type="button" id="topoInspectorDelete">🗑️ Remover dispositivo</button>
          <button class="btn-lab btn-lab--ghost btn-lab--sm" type="button" id="topoInspectorConnect">🔗 Conectar a outro...</button>
        </div>
        <a class="topo-info-link" href="${getRelativePath(`pages/${DEVICES[node.type].moduleUrl}`)}">Ver no conteúdo</a>`;

      refs.inspectorBody.querySelector('#topoInspectorName').addEventListener('input', event => {
        node.label = event.target.value.trim().slice(0, 28) || DEVICES[node.type].label;
        persist(false);
        render();
      });
      refs.inspectorBody.querySelector('#topoInspectorIp').addEventListener('input', event => {
        node.ip = event.target.value.trim().slice(0, 24);
        persist(false);
        renderNodes();
      });
      refs.inspectorBody.querySelector('#topoInspectorDelete').addEventListener('click', () => confirmDeleteNode(node.id));
      refs.inspectorBody.querySelector('#topoInspectorConnect').addEventListener('click', () => enterConnectMode(node.id));
    }

    function render() {
      updateStageCopy();
      refs.emptyState.classList.toggle('hidden', state.nodes.length > 0);
      refs.deviceTools.querySelectorAll('[data-device]').forEach(button => {
        button.classList.toggle('active', button.dataset.device === state.placingType);
      });
      refs.connectBtn.classList.toggle('active', state.mode === 'connect');
      updateUndoButtons();
      renderEdges();
      renderNodes();
      updateInspector();
      renderTooltip();
      renderNodeEditor();
      renderEdgeEditor();
    }

    function createConnection(from, to) {
      if (from === to) {
        showToast('Escolha dois dispositivos diferentes.', 'warn');
        return false;
      }
      if (getEdgeBetween(from, to)) {
        showToast('Esses dispositivos já estão conectados.', 'warn');
        return false;
      }
      pushHistory();
      const warning = maybeEdgeWarning(from, to);
      state.edges.push(createEdge(from, to, { warning, label: warning ? 'incomum' : '' }));
      state.connectFrom = null;
      state.mode = 'idle';
      persist(false);
      render();
      if (warning) showToast('Conexão incomum: permitida, mas com alerta didático.', 'warn', { timeout: 3400 });
      return true;
    }

    function placeNode(type, target) {
      const free = findNearestFreeCell(target.col, target.row);
      if (!free) {
        showToast('Não há espaço livre no canvas.', 'danger');
        return;
      }
      pushHistory();
      if (free.moved) flashCell(target.col, target.row);
      const node = createNode(type, free.col, free.row);
      state.nodes.push(node);
      state.selectedNodeId = node.id;
      state.placingType = null;
      state.mode = 'idle';
      persist(false);
      render();
    }

    function removeNode(nodeId) {
      pushHistory();
      state.edges = state.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId);
      state.nodes = state.nodes.filter(node => node.id !== nodeId);
      if (state.selectedNodeId === nodeId) state.selectedNodeId = null;
      if (state.connectFrom === nodeId) state.connectFrom = null;
      persist(false);
      render();
    }

    function confirmDeleteNode(nodeId) {
      const node = getNodeById(nodeId);
      if (!node) return;
      showToast(`Remover ${escapeHtml(node.label)}?`, 'danger', {
        sticky: true,
        actions: [
          { label: 'Sim', onClick: () => removeNode(nodeId) },
          { label: 'Não', onClick: () => {} }
        ]
      });
    }

    function clearTopology() {
      pushHistory();
      state.nodes = [];
      state.edges = [];
      state.selectedNodeId = null;
      state.nextNodeId = 1;
      state.nextEdgeId = 1;
      state.connectFrom = null;
      state.placingType = null;
      state.mode = 'idle';
      persist(false);
      render();
      setSimulationPanel('Canvas limpo', 'Adicione dispositivos, conecte e simule novamente.', [
        { title: 'Próximo passo', body: 'Escolha um dispositivo na barra e clique no canvas.' }
      ]);
    }

    function organizeNodes() {
      if (!state.nodes.length) return;
      pushHistory();
      const adjacency = buildAdjacency();
      const groups = {
        left: ['pc', 'laptop', 'attacker'],
        center: ['switch', 'router', 'firewall'],
        right: ['server', 'internet']
      };
      const columns = {
        left: [1, 2, 3],
        center: [6, 7, 8],
        right: [11, 12, 13]
      };
      const buckets = { left: [], center: [], right: [] };

      state.nodes.forEach(node => {
        const degree = (adjacency.get(node.id) || []).length;
        const bucket = groups.left.includes(node.type)
          ? 'left'
          : groups.right.includes(node.type)
            ? 'right'
            : 'center';
        buckets[bucket].push({ node, degree });
      });

      Object.entries(buckets).forEach(([bucket, items]) => {
        items
          .sort((a, b) => b.degree - a.degree || a.node.label.localeCompare(b.node.label, 'pt-BR'))
          .forEach((item, index) => {
            const colPool = columns[bucket];
            item.node.col = colPool[index % colPool.length];
            item.node.row = 1 + Math.floor(index / colPool.length) * 2;
          });
      });
      persist(false);
      render();
    }

    function applyTemplate(templateKey) {
      const template = TEMPLATES[templateKey];
      if (!template) return;
      pushHistory();
      state.nodes = [];
      state.edges = [];
      state.nextNodeId = 1;
      state.nextEdgeId = 1;
      const lookup = new Map();
      template.nodes.forEach(item => {
        const node = createNode(item.type, item.col, item.row, { label: item.label, ip: item.ip });
        state.nodes.push(node);
        lookup.set(item.label, node.id);
      });
      template.edges.forEach(item => {
        const from = lookup.get(item.from);
        const to = lookup.get(item.to);
        if (from && to) state.edges.push(createEdge(from, to, { label: item.label }));
      });
      state.selectedNodeId = state.nodes[0]?.id || null;
      state.mode = 'idle';
      state.placingType = null;
      persist(false);
      render();
      setSimulationPanel(template.label, template.hint, [{ title: 'Template carregado', body: template.hint }]);
      showToast(template.hint);
    }

    function confirmTemplate(templateKey) {
      if (!templateKey) return;
      if (!state.nodes.length) {
        applyTemplate(templateKey);
        refs.templateSelect.value = '';
        return;
      }
      showToast('Canvas tem dispositivos. Substituir?', 'warn', {
        sticky: true,
        actions: [
          { label: 'Sim', onClick: () => applyTemplate(templateKey) },
          { label: 'Cancelar', onClick: () => {} }
        ]
      });
      refs.templateSelect.value = '';
    }

    function saveTopology() {
      persist(true);
    }

    function loadTopology() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        showToast('Nenhuma topologia salva encontrada.', 'warn');
        return;
      }
      try {
        pushHistory();
        const parsed = JSON.parse(raw);
        state.nodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
        state.edges = Array.isArray(parsed.edges) ? parsed.edges : [];
        state.nextNodeId = Number(parsed.nextNodeId) || 1;
        state.nextEdgeId = Number(parsed.nextEdgeId) || 1;
        state.selectedNodeId = state.nodes[0]?.id || null;
        state.connectFrom = null;
        state.placingType = null;
        state.mode = 'idle';
        render();
      } catch {
        showToast('Falha ao carregar a topologia salva.', 'danger');
      }
    }

    function roundedRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    function exportPng() {
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#0f1117';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#2a2d3a';
      for (let x = 0; x <= CANVAS_WIDTH; x += 45) {
        for (let y = 0; y <= CANVAS_HEIGHT; y += 45) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      state.edges.forEach(edge => {
        const a = getNodeCenter(edge.from);
        const b = getNodeCenter(edge.to);
        ctx.strokeStyle = '#4f8ef7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        if (edge.label) {
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          ctx.font = '12px sans-serif';
          const textWidth = Math.max(60, ctx.measureText(edge.label).width + 16);
          ctx.fillStyle = 'rgba(15,17,23,0.92)';
          roundedRect(ctx, midX - textWidth / 2, midY - 14, textWidth, 24, 12);
          ctx.fill();
          ctx.fillStyle = '#e5e7eb';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(edge.label, midX, midY - 1);
        }
      });
      state.nodes.forEach(node => {
        const left = gridToLeft(node.col) + 7;
        const top = gridToTop(node.row) + 7;
        roundedRect(ctx, left, top, GRID - 14, GRID - 14, 18);
        ctx.fillStyle = '#1a1d27';
        ctx.fill();
        ctx.strokeStyle = '#2a3345';
        ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = '28px sans-serif';
        ctx.fillText(DEVICES[node.type].icon, left + (GRID - 14) / 2, top + 28);
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '11px sans-serif';
        ctx.fillText(node.label.slice(0, 14), left + (GRID - 14) / 2, top + 52);
        ctx.fillStyle = '#98a1b5';
        ctx.font = '9px monospace';
        ctx.fillText(node.ip.slice(0, 16), left + (GRID - 14) / 2, top + 68);
      });
      const done = blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'topologia-wikinet.png';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      if (canvas.toBlob) canvas.toBlob(done);
      else {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'topologia-wikinet.png';
        link.click();
      }
    }

    function setSimulationPanel(title, subtitle, steps) {
      refs.simTitle.textContent = title;
      refs.simSubtitle.textContent = subtitle;
      refs.simLog.innerHTML = steps.map(step => `<div class="topo-sim-step"><strong>${escapeHtml(step.title)}</strong><span>${escapeHtml(step.body)}</span></div>`).join('');
    }

    function showStatusBadge(nodeId, symbol) {
      const center = getNodeCenter(nodeId);
      const badge = document.createElement('div');
      badge.className = 'topo-status-badge';
      badge.textContent = symbol;
      badge.style.left = `${center.x}px`;
      badge.style.top = `${center.y - 40}px`;
      refs.overlayLayer.appendChild(badge);
      setTimeout(() => badge.remove(), 1200);
    }

    function setEdgeActive(edgeId, active) {
      if (active) state.simEdgeIds.add(edgeId);
      else state.simEdgeIds.delete(edgeId);
      renderEdges();
    }

    function animateSegment(fromId, toId, options = {}) {
      const a = getNodeCenter(fromId);
      const b = getNodeCenter(toId);
      const edge = getEdgeBetween(fromId, toId);
      const packet = document.createElement('div');
      packet.className = `topo-packet${options.danger ? ' topo-packet--danger' : ''}`;
      packet.style.left = `${a.x}px`;
      packet.style.top = `${a.y}px`;
      refs.trafficLayer.appendChild(packet);
      if (edge) setEdgeActive(edge.id, true);
      return new Promise(resolve => {
        const start = performance.now();
        const duration = options.duration || 780;
        function step(now) {
          const progress = Math.min(1, (now - start) / duration);
          packet.style.left = `${a.x + (b.x - a.x) * progress}px`;
          packet.style.top = `${a.y + (b.y - a.y) * progress}px`;
          if (progress < 1) {
            requestAnimationFrame(step);
            return;
          }
          packet.remove();
          if (edge) setEdgeActive(edge.id, false);
          resolve();
        }
        requestAnimationFrame(step);
      });
    }

    async function animatePath(path, options = {}) {
      for (let index = 0; index < path.length - 1; index += 1) {
        await animateSegment(path[index], path[index + 1], options);
      }
    }

    async function animateBroadcast(fromId, targets) {
      await Promise.all(targets.map(target => animateSegment(fromId, target, { duration: 720 })));
    }

    async function simulateFirewallBasic(path) {
      const port = refs.portSelect.value;
      await animateSegment(path[0], path[1]);
      showCallout(path[1], '<strong>Firewall</strong><br>Porta 80: ALLOW<br>Porta 22: BLOCK<br>Porta 443: ALLOW', port === '22' ? 'danger' : 'info', 3200);
      if (port === '22') {
        showStatusBadge(path[1], '✖');
        showToast('Bloqueado pelo Firewall.', 'danger');
        return;
      }
      await animateSegment(path[1], path[2]);
      showStatusBadge(path[2], '✓');
    }

    async function simulateSwitchBroadcast(scenario) {
      await animateSegment(scenario.path[0], scenario.path[1]);
      showCallout(scenario.path[1], '<strong>Switch opera na camada 2</strong><br>Envia para todas as portas até aprender o MAC de destino.', 'warn', 3200);
      await animateBroadcast(scenario.path[1], scenario.targets || []);
    }

    async function simulateNat(path) {
      const client = getNodeById(path[0]);
      await animateSegment(path[0], path[1]);
      showCallout(path[1], `<strong>NAT</strong><br>Trocando IP ${escapeHtml(client?.ip || '192.168.1.5')} → 201.34.56.78`, 'info', 3200);
      await animateSegment(path[1], path[2]);
      showStatusBadge(path[2], '✓');
    }

    async function simulateFirewallBlocked(path) {
      await animateSegment(path[0], path[1], { danger: true });
      showCallout(path[1], '<strong>Sem rota para o destino</strong><br>O firewall não tem para onde encaminhar o pacote.', 'danger', 3000);
      showStatusBadge(path[1], '✖');
    }

    async function simulateCorporate(path) {
      const port = refs.portSelect.value;
      const client = getNodeById(path[0]);
      const server = getNodeById(path[4]);
      showCallout(path[0], `<strong>Pacote montado</strong><br>IP origem: ${escapeHtml(client?.ip || '')}<br>IP destino: ${escapeHtml(server?.ip || '')}`, 'info', 2200);
      await animateSegment(path[0], path[1]);
      showCallout(path[1], '<strong>Switch</strong><br>Encaminhando por MAC.', 'info', 2200);
      await animateSegment(path[1], path[2]);
      showCallout(path[2], '<strong>Roteador</strong><br>Roteando e trocando MAC.', 'info', 2200);
      await animateSegment(path[2], path[3]);
      showCallout(path[3], '<strong>Firewall</strong><br>80 ALLOW | 22 BLOCK | 443 ALLOW', port === '22' ? 'danger' : 'info', 2600);
      if (port === '22') {
        showStatusBadge(path[3], '✖');
        return;
      }
      await animateSegment(path[3], path[4]);
      showCallout(path[4], '<strong>Servidor</strong><br>HTTP 200 OK', 'info', 2200);
      showStatusBadge(path[4], '✓');
    }

    async function simulateMitm(path, blocked) {
      const attackerIndex = path.findIndex(id => getNodeById(id)?.type === 'attacker');
      for (let index = 0; index < attackerIndex; index += 1) {
        await animateSegment(path[index], path[index + 1], { danger: true });
      }
      showCallout(path[attackerIndex], '<strong>Interceptei</strong><br>GET /login HTTP/1.1<br>senha=abc123', 'danger', 3600);
      if (blocked) {
        const firewallId = path.find(id => getNodeById(id)?.type === 'firewall');
        const firewallIndex = path.indexOf(firewallId);
        for (let index = attackerIndex; index < firewallIndex; index += 1) {
          await animateSegment(path[index], path[index + 1], { danger: true });
        }
        showCallout(firewallId, '<strong>Firewall</strong><br>Fluxo suspeito bloqueado antes do servidor.', 'danger', 2800);
        showStatusBadge(firewallId, '✖');
        return;
      }
      for (let index = attackerIndex; index < path.length - 1; index += 1) {
        await animateSegment(path[index], path[index + 1], { danger: true });
      }
      showToast('MITM ativo — adicione um Firewall ou use HTTPS.', 'danger', { timeout: 3600 });
    }

    async function simulateFreePath(path) {
      const labels = path.map(id => getNodeById(id)?.label || '?').join(' → ');
      setSimulationPanel('Topologia livre', 'O caminho foi calculado com BFS no grafo de conexões.', [
        { title: 'Menor caminho encontrado', body: labels }
      ]);
      await animatePath(path);
    }

    async function runSimulation() {
      if (!state.nodes.length) {
        showToast('Monte a topologia primeiro.', 'warn');
        return;
      }
      const scenario = detectScenario(state.nodes, state.edges);
      if (scenario.kind === 'free') {
        state.mode = 'free-path';
        state.freePathSelection = [];
        render();
        setSimulationPanel('Topologia livre', 'Clique em dois dispositivos conectados para ver o caminho do pacote.', [
          { title: 'Aguardando seleção', body: 'Primeiro clique: origem. Segundo clique: destino.' }
        ]);
        return;
      }
      state.mode = 'simulating';
      render();
      if (scenario.kind === 'firewall-basic') await simulateFirewallBasic(scenario.path);
      else if (scenario.kind === 'switch-broadcast') await simulateSwitchBroadcast(scenario);
      else if (scenario.kind === 'nat') await simulateNat(scenario.path);
      else if (scenario.kind === 'firewall-blocked') await simulateFirewallBlocked(scenario.path);
      else if (scenario.kind === 'corporate') await simulateCorporate(scenario.path);
      else if (scenario.kind === 'mitm') await simulateMitm(scenario.path, false);
      else if (scenario.kind === 'mitm-blocked') await simulateMitm(scenario.path, true);
      state.mode = 'idle';
      render();
    }

    function enterConnectMode(originId) {
      state.mode = 'connect';
      state.connectFrom = originId || null;
      render();
    }

    function handleFreePathSelect(nodeId) {
      if (!state.freePathSelection.length) {
        state.freePathSelection = [nodeId];
        state.selectedNodeId = nodeId;
        render();
        return;
      }
      const path = shortestPath(state.freePathSelection[0], nodeId);
      state.freePathSelection = [];
      state.mode = 'idle';
      render();
      if (!path) {
        showToast('Esses dois dispositivos não estão conectados.', 'danger');
        return;
      }
      simulateFreePath(path);
    }

    function handleNodeClick(nodeId) {
      if (state.mode === 'free-path') {
        handleFreePathSelect(nodeId);
        return;
      }
      if (state.mode === 'connect') {
        if (!state.connectFrom) {
          state.connectFrom = nodeId;
          state.selectedNodeId = nodeId;
          render();
          return;
        }
        createConnection(state.connectFrom, nodeId);
        state.selectedNodeId = nodeId;
        render();
        return;
      }
      state.selectedNodeId = nodeId;
      render();
    }

    function connectorPoint(nodeId, side) {
      const center = getNodeCenter(nodeId);
      const offset = GRID / 2 - 10;
      if (side === 'n') return { x: center.x, y: center.y - offset };
      if (side === 's') return { x: center.x, y: center.y + offset };
      if (side === 'e') return { x: center.x + offset, y: center.y };
      return { x: center.x - offset, y: center.y };
    }

    function nodeIdFromClientPoint(clientX, clientY) {
      const target = document.elementFromPoint(clientX, clientY);
      return target?.closest?.('.topo-node') ? Number(target.closest('.topo-node').dataset.nodeId) : null;
    }

    function beginNodeDrag(event, nodeId) {
      if (state.mode === 'simulating') return;
      const node = getNodeById(nodeId);
      if (!node) return;
      const point = getCanvasPoint(event);
      const ghost = document.createElement('div');
      ghost.className = 'topo-drag-ghost';
      ghost.innerHTML = `${DEVICES[node.type].icon}<span>${escapeHtml(node.label)}</span>`;
      ghost.style.left = `${gridToLeft(node.col)}px`;
      ghost.style.top = `${gridToTop(node.row)}px`;
      refs.overlayLayer.appendChild(ghost);
      state.drag = {
        nodeId,
        origin: { x: point.x, y: point.y },
        offsetX: point.x - gridToLeft(node.col),
        offsetY: point.y - gridToTop(node.row),
        startCell: { col: node.col, row: node.row },
        previewCell: { col: node.col, row: node.row },
        ghost,
        moved: false
      };
      state.selectedNodeId = nodeId;
      render();
    }

    function moveNodeDrag(event) {
      if (!state.drag) return;
      event.preventDefault();
      const point = getCanvasPoint(event);
      state.drag.moved = state.drag.moved || Math.abs(point.x - state.drag.origin.x) > 6 || Math.abs(point.y - state.drag.origin.y) > 6;
      const target = snapPoint(point.x - state.drag.offsetX + GRID / 2, point.y - state.drag.offsetY + GRID / 2);
      const free = findNearestFreeCell(target.col, target.row, state.drag.nodeId) || target;
      if (getOccupant(target.col, target.row, state.drag.nodeId)) flashCell(target.col, target.row);
      state.drag.previewCell = { col: free.col, row: free.row };
      state.drag.ghost.style.left = `${gridToLeft(free.col)}px`;
      state.drag.ghost.style.top = `${gridToTop(free.row)}px`;
      refs.gridHighlight.style.left = `${gridToLeft(free.col)}px`;
      refs.gridHighlight.style.top = `${gridToTop(free.row)}px`;
      refs.gridHighlight.classList.add('visible');
      renderEdges();
      renderNodes();
    }

    function endNodeDrag() {
      if (!state.drag) return;
      const drag = state.drag;
      state.drag = null;
      refs.gridHighlight.classList.remove('visible');
      drag.ghost.remove();
      if (!drag.moved) {
        state.selectedNodeId = drag.nodeId;
        render();
        return;
      }
      const node = getNodeById(drag.nodeId);
      if (!node || !drag.previewCell) {
        render();
        return;
      }
      pushHistory();
      node.col = drag.previewCell.col;
      node.row = drag.previewCell.row;
      persist(false);
      render();
    }

    function beginEdgeDrag(event, nodeId, side) {
      event.preventDefault();
      event.stopPropagation();
      state.edgeDrag = {
        from: nodeId,
        start: connectorPoint(nodeId, side),
        end: connectorPoint(nodeId, side)
      };
      renderEdges();
    }

    function moveEdgeDrag(event) {
      if (!state.edgeDrag) return;
      event.preventDefault();
      state.edgeDrag.end = getCanvasPoint(event);
      renderEdges();
    }

    function endEdgeDrag(event) {
      if (!state.edgeDrag) return;
      const source = event.changedTouches?.[0] || event;
      const targetNodeId = nodeIdFromClientPoint(source.clientX, source.clientY);
      const from = state.edgeDrag.from;
      state.edgeDrag = null;
      renderEdges();
      if (targetNodeId && targetNodeId !== from) createConnection(from, targetNodeId);
    }

    function attachNodeEvents() {
      refs.nodesLayer.querySelectorAll('.topo-node').forEach(nodeEl => {
        const nodeId = Number(nodeEl.dataset.nodeId);
        nodeEl.addEventListener('mouseenter', () => {
          state.hoverNodeId = nodeId;
          clearTimeout(state.hoverTimer);
          state.hoverTimer = setTimeout(() => {
            state.tooltipNodeId = nodeId;
            renderTooltip();
          }, 500);
          renderNodes();
        });
        nodeEl.addEventListener('mouseleave', () => {
          clearTimeout(state.hoverTimer);
          state.hoverNodeId = null;
          state.tooltipNodeId = null;
          render();
        });
        nodeEl.addEventListener('click', event => {
          if (event.target.closest('.topo-connector')) return;
          event.stopPropagation();
          handleNodeClick(nodeId);
        });
        nodeEl.addEventListener('dblclick', event => {
          if (event.target.closest('.topo-connector')) return;
          event.preventDefault();
          event.stopPropagation();
          state.editingNodeId = nodeId;
          render();
        });
        nodeEl.addEventListener('mousedown', event => {
          if (event.button !== 0 || event.target.closest('.topo-connector')) return;
          event.preventDefault();
          beginNodeDrag(event, nodeId);
        });
        nodeEl.addEventListener('touchstart', event => {
          if (event.target.closest('.topo-connector')) return;
          beginNodeDrag(event, nodeId);
        }, { passive: false });
        nodeEl.querySelectorAll('.topo-connector').forEach(connector => {
          const side = connector.dataset.side;
          connector.addEventListener('mousedown', event => beginEdgeDrag(event, nodeId, side));
          connector.addEventListener('touchstart', event => beginEdgeDrag(event, nodeId, side), { passive: false });
        });
      });
    }

    function handleCanvasClick(event) {
      if (event.target.closest('.topo-node') || event.target.closest('.topo-edge-label') || event.target.closest('.topo-edge-delete')) return;
      if (state.placingType) {
        const point = getCanvasPoint(event);
        placeNode(state.placingType, snapPoint(point.x, point.y));
        return;
      }
      state.selectedNodeId = null;
      state.connectFrom = null;
      if (state.mode === 'connect') state.mode = 'idle';
      render();
    }

    refs.deviceTools.querySelectorAll('[data-device]').forEach(button => {
      button.addEventListener('click', () => {
        state.placingType = state.placingType === button.dataset.device ? null : button.dataset.device;
        state.mode = state.placingType ? 'placing' : 'idle';
        if (state.placingType) showToast(`Clique no canvas para posicionar o ${DEVICES[state.placingType].label}.`);
        render();
      });
      button.addEventListener('dragstart', event => {
        const ghost = document.createElement('div');
        ghost.className = 'topo-drag-proxy';
        ghost.textContent = `${DEVICES[button.dataset.device].icon} ${DEVICES[button.dataset.device].label}`;
        document.body.appendChild(ghost);
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', button.dataset.device);
        event.dataTransfer.setDragImage(ghost, 22, 16);
        state.placingType = button.dataset.device;
        state.mode = 'placing';
        updateStageCopy();
        setTimeout(() => ghost.remove(), 0);
      });
    });

    refs.viewport.addEventListener('dragover', event => {
      event.preventDefault();
      const point = getCanvasPoint(event);
      const cell = snapPoint(point.x, point.y);
      refs.gridHighlight.style.left = `${gridToLeft(cell.col)}px`;
      refs.gridHighlight.style.top = `${gridToTop(cell.row)}px`;
      refs.gridHighlight.classList.add('visible');
    });
    refs.viewport.addEventListener('dragleave', () => refs.gridHighlight.classList.remove('visible'));
    refs.viewport.addEventListener('drop', event => {
      event.preventDefault();
      refs.gridHighlight.classList.remove('visible');
      const type = event.dataTransfer.getData('text/plain');
      if (!DEVICES[type]) return;
      const point = getCanvasPoint(event);
      placeNode(type, snapPoint(point.x, point.y));
    });

    document.addEventListener('mousemove', event => {
      if (state.drag) moveNodeDrag(event);
      if (state.edgeDrag) moveEdgeDrag(event);
    });
    document.addEventListener('mouseup', event => {
      if (state.drag) endNodeDrag(event);
      if (state.edgeDrag) endEdgeDrag(event);
    });
    document.addEventListener('touchmove', event => {
      if (state.drag) moveNodeDrag(event);
      if (state.edgeDrag) moveEdgeDrag(event);
    }, { passive: false });
    document.addEventListener('touchend', event => {
      if (state.drag) endNodeDrag(event);
      if (state.edgeDrag) endEdgeDrag(event);
    }, { passive: false });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        state.connectFrom = null;
        if (state.mode === 'connect') state.mode = 'idle';
        state.edgeDrag = null;
        state.editingNodeId = null;
        state.editingEdgeId = null;
        render();
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && state.selectedNodeId && !event.target.matches('input, textarea')) {
        event.preventDefault();
        confirmDeleteNode(state.selectedNodeId);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undoLastAction();
      }
    });
    refs.canvas.addEventListener('click', handleCanvasClick);

    refs.connectBtn.addEventListener('click', () => {
      if (state.mode === 'connect') {
        state.mode = 'idle';
        state.connectFrom = null;
      } else {
        enterConnectMode(null);
      }
      render();
    });
    refs.undoBtn.addEventListener('click', undoLastAction);
    refs.undoFloat.addEventListener('click', undoLastAction);
    refs.deleteBtn.addEventListener('click', () => {
      if (!state.selectedNodeId) {
        showToast('Selecione um dispositivo para remover.', 'warn');
        return;
      }
      confirmDeleteNode(state.selectedNodeId);
    });
    refs.clearBtn.addEventListener('click', () => {
      if (!state.nodes.length) return;
      showToast('Limpar o canvas inteiro?', 'warn', {
        sticky: true,
        actions: [
          { label: 'Sim', onClick: clearTopology },
          { label: 'Cancelar', onClick: () => {} }
        ]
      });
    });
    refs.organizeBtn.addEventListener('click', organizeNodes);
    refs.simBtn.addEventListener('click', runSimulation);
    refs.saveBtn.addEventListener('click', saveTopology);
    refs.loadBtn.addEventListener('click', loadTopology);
    refs.exportBtn.addEventListener('click', exportPng);
    refs.templateSelect.addEventListener('change', () => confirmTemplate(refs.templateSelect.value));
    refs.zoomOut.addEventListener('click', () => {
      state.zoom = clamp(Number((state.zoom - ZOOM_STEP).toFixed(2)), ZOOM_MIN, ZOOM_MAX);
      updateZoom();
    });
    refs.zoomIn.addEventListener('click', () => {
      state.zoom = clamp(Number((state.zoom + ZOOM_STEP).toFixed(2)), ZOOM_MIN, ZOOM_MAX);
      updateZoom();
    });

    updateZoom();
    updateUndoButtons();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        state.nodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
        state.edges = Array.isArray(parsed.edges) ? parsed.edges : [];
        state.nextNodeId = Number(parsed.nextNodeId) || 1;
        state.nextEdgeId = Number(parsed.nextEdgeId) || 1;
        state.selectedNodeId = state.nodes[0]?.id || null;
      } catch {
        state.nodes = [];
        state.edges = [];
      }
    }
    render();
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
    initTopology();
  }

  return { init };
})();

window.Lab = Lab;
