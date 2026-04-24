/* ── RedesWiki — Laboratório Interativo ─────────────── */
'use strict';

const Lab = (() => {

  /* ── Tabs ────────────────────────────────────────────── */
  function initTabs() {
    const tabs   = document.querySelectorAll('.lab-tab');
    const panels = document.querySelectorAll('.lab-panel');
    if (!tabs.length) return;

    function activate(id) {
      tabs.forEach(t   => t.classList.toggle('active', t.dataset.tab === id));
      panels.forEach(p => p.classList.toggle('active', p.id === id));
    }

    tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tab)));
    activate(tabs[0].dataset.tab);
  }

  /* ══════════════════════════════════════════════════════
     1. PACKET JOURNEY
  ══════════════════════════════════════════════════════ */
  function initPacketJourney() {
    const container = document.getElementById('labPacket');
    if (!container) return;

    const STEPS = [
      {
        node: 0,
        title: 'Seu PC (origem)',
        icon: '🖥️',
        color: '#4f8ef7',
        fields: [
          { k: 'IP Origem',    v: '192.168.1.10' },
          { k: 'IP Destino',   v: '142.250.65.14' },
          { k: 'Porta Origem', v: '54321 (efêmera)' },
          { k: 'Porta Destino',v: '443 (HTTPS)' },
          { k: 'TTL',          v: '64' },
          { k: 'Protocolo',    v: 'TCP' },
        ],
        note: 'O sistema operacional escolhe uma porta efêmera aleatória e inicia a conexão TCP.'
      },
      {
        node: 1,
        title: 'Switch (L2)',
        icon: '🔀',
        color: '#8b5cf6',
        fields: [
          { k: 'MAC Origem',  v: 'AA:BB:CC:11:22:33' },
          { k: 'MAC Destino', v: 'FF:GG:HH:44:55:66 (roteador)' },
          { k: 'VLAN',        v: '1 (default)' },
          { k: 'TTL',         v: '64 (não alterado — L2)' },
        ],
        note: 'O switch opera na camada 2. Ele consulta a tabela MAC e encaminha o quadro apenas para a porta do roteador, sem alterar o TTL.'
      },
      {
        node: 2,
        title: 'Roteador (NAT)',
        icon: '🌐',
        color: '#22c55e',
        fields: [
          { k: 'IP Origem',    v: '201.22.35.100 (após NAT)' },
          { k: 'IP Destino',   v: '142.250.65.14' },
          { k: 'Porta Origem', v: '54321 → 60412 (NAT table)' },
          { k: 'TTL',          v: '63 (decrementado)' },
          { k: 'Rota',         v: 'via 10.0.0.1 (ISP gateway)' },
        ],
        note: 'O roteador faz NAT: troca o IP privado (192.168.1.10) pelo IP público. O TTL diminui 1 a cada salto — quando chegar a 0, o pacote é descartado.'
      },
      {
        node: 3,
        title: 'Internet (ISP / Backbone)',
        icon: '☁️',
        color: '#f59e0b',
        fields: [
          { k: 'IP Origem',  v: '201.22.35.100' },
          { k: 'IP Destino', v: '142.250.65.14' },
          { k: 'TTL',        v: '62 → 59 (múltiplos saltos BGP)' },
          { k: 'Rota',       v: 'AS12345 → AS15169 (Google)' },
          { k: 'Latência',   v: '~18 ms (transatlântico não)' },
        ],
        note: 'O backbone internet usa BGP para rotear entre ASNs. Cada roteador consulta sua tabela e forwarda. O pacote pode cruzar dezenas de roteadores.'
      },
      {
        node: 4,
        title: 'Servidor (destino)',
        icon: '🗄️',
        color: '#ef4444',
        fields: [
          { k: 'IP Destino',   v: '142.250.65.14 ✓' },
          { k: 'Porta',        v: '443 (HTTPS/TLS)' },
          { k: 'TTL chegou',   v: '59 (sobreviveu!)' },
          { k: 'Resposta',     v: 'SYN-ACK → dados TLS' },
        ],
        note: 'O servidor recebe o pacote, verifica IP e porta, completa o handshake TCP (SYN-ACK) e inicia o TLS. Sua resposta refaz o caminho inverso.'
      }
    ];

    const NODE_LABELS = ['Seu PC', 'Switch', 'Roteador', 'Internet', 'Servidor'];
    const NODE_ICONS  = ['🖥️',     '🔀',      '🌐',       '☁️',       '🗄️'];

    let step = -1;

    container.innerHTML = `
      <div class="pkt-stage">
        <div class="pkt-nodes" id="pktNodes"></div>
        <div class="pkt-packet" id="pktPacket" aria-hidden="true">📦</div>
      </div>
      <div class="pkt-controls">
        <button class="btn-lab" id="pktStart">▶ Iniciar</button>
        <button class="btn-lab" id="pktNext"  disabled>Próximo salto →</button>
        <button class="btn-lab btn-lab--ghost" id="pktReset">↺ Reiniciar</button>
      </div>
      <div class="pkt-info" id="pktInfo" hidden></div>`;

    const nodesEl  = container.querySelector('#pktNodes');
    const packetEl = container.querySelector('#pktPacket');
    const infoEl   = container.querySelector('#pktInfo');
    const btnStart = container.querySelector('#pktStart');
    const btnNext  = container.querySelector('#pktNext');
    const btnReset = container.querySelector('#pktReset');

    // Build nodes
    NODE_LABELS.forEach((lbl, i) => {
      const d = document.createElement('div');
      d.className = 'pkt-node';
      d.id = `pktNode${i}`;
      d.innerHTML = `<span class="pkt-node-icon">${NODE_ICONS[i]}</span><span class="pkt-node-label">${lbl}</span>`;
      nodesEl.appendChild(d);
    });

    function moveTo(nodeIndex) {
      const targetNode = document.getElementById(`pktNode${nodeIndex}`);
      if (!targetNode) return;
      const stageRect  = container.querySelector('.pkt-stage').getBoundingClientRect();
      const nodeRect   = targetNode.getBoundingClientRect();
      const x = nodeRect.left - stageRect.left + nodeRect.width / 2 - 14;
      packetEl.style.left = x + 'px';
    }

    function showStep(s) {
      step = s;
      document.querySelectorAll('.pkt-node').forEach((n, i) => {
        n.classList.toggle('active', i === s);
        n.classList.toggle('visited', i < s);
      });
      moveTo(s);

      const data = STEPS[s];
      infoEl.hidden = false;
      infoEl.innerHTML = `
        <div class="pkt-info-head" style="color:${data.color}">
          ${data.icon} <strong>${data.title}</strong>
        </div>
        <table class="pkt-info-table">
          ${data.fields.map(f => `<tr><td class="pkt-field-key">${f.k}</td><td class="pkt-field-val">${f.v}</td></tr>`).join('')}
        </table>
        <p class="pkt-info-note">${data.note}</p>`;

      btnNext.disabled = s >= STEPS.length - 1;
      if (s >= STEPS.length - 1) btnNext.textContent = '✓ Destino alcançado';
    }

    btnStart.addEventListener('click', () => {
      btnStart.hidden = true;
      btnNext.disabled = false;
      packetEl.style.display = 'block';
      showStep(0);
    });
    btnNext.addEventListener('click', () => { if (step < STEPS.length - 1) showStep(step + 1); });
    btnReset.addEventListener('click', () => {
      step = -1;
      btnStart.hidden = false;
      btnNext.disabled = true;
      btnNext.textContent = 'Próximo salto →';
      packetEl.style.display = 'none';
      infoEl.hidden = true;
      document.querySelectorAll('.pkt-node').forEach(n => n.classList.remove('active','visited'));
    });
  }

  /* ══════════════════════════════════════════════════════
     2. DNS RECURSIVE SIMULATOR
  ══════════════════════════════════════════════════════ */
  function initDNSSim() {
    const container = document.getElementById('labDNS');
    if (!container) return;

    const DNS_STEPS = [
      { from: 0, to: 1, label: 'Quem é google.com?',             resp: null,                                  desc: 'Seu computador pergunta ao resolver local (normalmente 8.8.8.8 ou o do roteador).' },
      { from: 1, to: 2, label: 'Quem é google.com?',             resp: null,                                  desc: 'O resolver não sabe. Pergunta ao Root Server (.) — há 13 clusters de root servers no mundo.' },
      { from: 2, to: 1, label: '→ Pergunte ao .com TLD',         resp: 'Pergunte ao .com TLD',                desc: 'O Root Server não resolve google.com, mas sabe quem cuida de .com: os servidores TLD da Verisign.' },
      { from: 1, to: 3, label: 'Quem é google.com?',             resp: null,                                  desc: 'O resolver pergunta ao TLD server de .com.' },
      { from: 3, to: 1, label: '→ Pergunte a ns1.google.com',    resp: 'Pergunte a ns1.google.com',           desc: 'O TLD sabe qual é o servidor autoritativo do Google (ns1.google.com), mas não o IP.' },
      { from: 1, to: 4, label: 'Qual o IP de google.com?',       resp: null,                                  desc: 'O resolver pergunta diretamente ao servidor autoritativo do Google.' },
      { from: 4, to: 1, label: '→ 142.250.65.14 (TTL: 300s)',    resp: '142.250.65.14',                       desc: 'O servidor autoritativo responde com o IP e TTL. O resolver guarda em cache por 300s.' },
      { from: 1, to: 0, label: '→ 142.250.65.14',                resp: '142.250.65.14',                       desc: 'O resolver entrega o IP ao seu computador. Todo o processo levou ~100ms. Agora TCP pode começar.' },
    ];

    const NODES = [
      { label: 'Seu PC',         icon: '🖥️' },
      { label: 'Resolver Local', icon: '🔁' },
      { label: 'Root NS (.)',    icon: '🌍' },
      { label: 'TLD NS (.com)',  icon: '📋' },
      { label: 'Autoritativo',  icon: '✅' },
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
      </div>`;

    const domainInput = container.querySelector('#dnsDomain');
    const stage       = container.querySelector('#dnsStage');
    const desc        = container.querySelector('#dnsDesc');
    const stepLbl     = container.querySelector('#dnsStepLbl');
    const btnStart    = container.querySelector('#dnsStart');
    const btnPrev     = container.querySelector('#dnsPrev');
    const btnNext     = container.querySelector('#dnsNext');
    const btnReset    = container.querySelector('#dnsReset');

    let currentStep = -1;
    let arrows = [];

    function buildStage() {
      stage.innerHTML = '';
      arrows = [];

      // Node positions (%) in a zigzag layout
      const positions = [
        { x: 5,  y: 40 },
        { x: 30, y: 40 },
        { x: 55, y: 10 },
        { x: 55, y: 40 },
        { x: 55, y: 70 },
      ];

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
      svg.style.position = 'absolute'; svg.style.inset = '0';
      svg.innerHTML = `<defs>
        <marker id="dns-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="var(--accent)"/>
        </marker>
        <marker id="dns-arrow-dim" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="var(--border)"/>
        </marker>
      </defs>`;
      stage.appendChild(svg);

      // Pre-draw arrows (dim)
      DNS_STEPS.forEach((s, i) => {
        const from = positions[s.from];
        const to   = positions[s.to];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', `${from.x + 5}%`);
        line.setAttribute('y1', `${from.y}%`);
        line.setAttribute('x2', `${to.x + 5}%`);
        line.setAttribute('y2', `${to.y}%`);
        line.setAttribute('stroke', 'var(--border)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#dns-arrow-dim)');
        line.id = `dnsArrow${i}`;
        svg.appendChild(line);
        arrows.push(line);
      });

      // Draw nodes
      NODES.forEach((n, i) => {
        const pos = positions[i];
        const div = document.createElement('div');
        div.className = 'dns-node';
        div.id = `dnsNode${i}`;
        div.style.left = pos.x + '%';
        div.style.top  = pos.y + '%';
        div.innerHTML = `<span class="dns-node-icon">${n.icon}</span><span class="dns-node-label">${n.label}</span>`;
        stage.appendChild(div);
      });
    }

    function showStep(s) {
      currentStep = s;
      const domain = domainInput.value.trim() || 'google.com';
      const data = DNS_STEPS[s];

      // Reset all arrows
      arrows.forEach((a, i) => {
        if (i <= s) {
          a.setAttribute('stroke', 'var(--accent)');
          a.setAttribute('marker-end', 'url(#dns-arrow)');
        } else {
          a.setAttribute('stroke', 'var(--border)');
          a.setAttribute('marker-end', 'url(#dns-arrow-dim)');
        }
      });

      document.querySelectorAll('.dns-node').forEach((n, i) => {
        n.classList.toggle('dns-active', i === data.from || i === data.to);
      });

      const arrowLabel = data.label.replace('google.com', domain);
      desc.innerHTML = `<div class="dns-step-info">
        <span class="dns-arrow-label">${arrowLabel}</span>
        ${data.resp ? `<span class="dns-resp">Resposta: <strong>${data.resp.replace('google.com', domain)}</strong></span>` : ''}
        <p class="dns-step-desc">${data.desc}</p>
      </div>`;

      stepLbl.textContent = `Passo ${s + 1} de ${DNS_STEPS.length}`;
      btnPrev.disabled = s <= 0;
      btnNext.disabled = s >= DNS_STEPS.length - 1;
    }

    function reset() {
      currentStep = -1;
      stage.innerHTML = '';
      arrows = [];
      desc.innerHTML = '';
      stepLbl.textContent = '–';
      btnPrev.disabled = true;
      btnNext.disabled = true;
    }

    btnStart.addEventListener('click', () => { buildStage(); showStep(0); });
    btnNext.addEventListener('click',  () => { if (currentStep < DNS_STEPS.length - 1) showStep(currentStep + 1); });
    btnPrev.addEventListener('click',  () => { if (currentStep > 0) showStep(currentStep - 1); });
    btnReset.addEventListener('click', reset);
    domainInput.addEventListener('keydown', e => { if (e.key === 'Enter') { buildStage(); showStep(0); } });
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

    const stage   = container.querySelector('#mitmStage');
    const explain = container.querySelector('#mitmExplain');
    const btnAnim = container.querySelector('#mitmAnimate');
    let mode = 'http';
    let animating = false;

    const MODES = {
      http: {
        data:     'GET /conta HTTP/1.1\nSenha: minhasenha123',
        attacker: '👁️ Interceptado!\nSENHA: minhasenha123',
        explain:  'Em HTTP puro, o atacante vê TUDO em texto claro: senhas, tokens, cookies. Basta estar na mesma rede (café, aeroporto, hotel).'
      },
      https: {
        data:     'TLS 1.3 Handshake\n[dados cifrados: ☒☒☒☒☒☒]',
        attacker: '❓ Dados ilegíveis\n☒☒☒☒☒☒☒☒☒☒',
        explain:  'Com TLS, o atacante vê apenas dados cifrados. Sem a chave privada do servidor, é indecifrável. O handshake TLS autentica o servidor via certificado X.509.'
      }
    };

    function buildStage() {
      const m = MODES[mode];
      stage.innerHTML = `
        <div class="mitm-actor" id="mitm-alice">
          <div class="mitm-actor-icon">👩</div>
          <div class="mitm-actor-name">Alice</div>
        </div>
        <div class="mitm-channel" id="mitm-ch1">
          <div class="mitm-data-flow" id="mitm-data1">${mode === 'http' ? m.data.split('\n')[0] : '🔒 cifrado'}</div>
          <svg class="mitm-arrow" viewBox="0 0 60 20"><path d="M0,10 L50,10" stroke="currentColor" stroke-width="2" marker-end="url(#arr)"/><defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor"/></marker></defs></svg>
        </div>
        <div class="mitm-actor mitm-attacker" id="mitm-attacker">
          <div class="mitm-actor-icon">😈</div>
          <div class="mitm-actor-name">Atacante</div>
          <div class="mitm-attacker-sees" id="mitm-sees">${m.attacker}</div>
        </div>
        <div class="mitm-channel" id="mitm-ch2">
          <div class="mitm-data-flow" id="mitm-data2">${mode === 'http' ? m.data.split('\n')[0] : '🔒 cifrado'}</div>
          <svg class="mitm-arrow" viewBox="0 0 60 20"><path d="M0,10 L50,10" stroke="currentColor" stroke-width="2" marker-end="url(#arr2)"/><defs><marker id="arr2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor"/></marker></defs></svg>
        </div>
        <div class="mitm-actor" id="mitm-bob">
          <div class="mitm-actor-icon">🖥️</div>
          <div class="mitm-actor-name">Servidor</div>
        </div>`;

      explain.textContent = m.explain;
    }

    async function animate() {
      if (animating) return;
      animating = true;
      btnAnim.disabled = true;

      const data1 = container.querySelector('#mitm-data1');
      const data2 = container.querySelector('#mitm-data2');
      const sees  = container.querySelector('#mitm-sees');
      const attEl = container.querySelector('.mitm-attacker');
      const m = MODES[mode];

      data1.classList.remove('mitm-flow-active');
      data2.classList.remove('mitm-flow-active');

      await delay(300);
      data1.classList.add('mitm-flow-active');
      await delay(900);
      if (mode === 'http') attEl.classList.add('mitm-caught');
      else attEl.classList.remove('mitm-caught');
      data1.classList.remove('mitm-flow-active');
      data2.classList.add('mitm-flow-active');
      await delay(900);
      data2.classList.remove('mitm-flow-active');

      animating = false;
      btnAnim.disabled = false;
    }

    container.querySelectorAll('.mitm-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        mode = btn.dataset.mode;
        container.querySelectorAll('.mitm-mode-btn').forEach(b => b.classList.toggle('active', b === btn));
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
      {
        num: 7, name: 'Aplicação',   color: '#4f8ef7',
        label: 'DATA',
        fields: 'HTTP Request: GET / HTTP/1.1\nHost: google.com\nAccept: */*'
      },
      {
        num: 4, name: 'Transporte',  color: '#8b5cf6',
        label: 'TCP Hdr',
        fields: 'Src Port: 54321 | Dst Port: 443\nSeq: 1001 | Ack: 0\nFlags: SYN | Window: 65535'
      },
      {
        num: 3, name: 'Rede',        color: '#22c55e',
        label: 'IP Hdr',
        fields: 'Versão: 4 | TTL: 64\nSrc IP: 192.168.1.10\nDst IP: 142.250.65.14\nProtocolo: 6 (TCP)'
      },
      {
        num: 2, name: 'Enlace',      color: '#f59e0b',
        label: 'ETH Hdr',
        fields: 'Src MAC: AA:BB:CC:11:22:33\nDst MAC: FF:GG:HH:44:55:66\nEtherType: 0x0800 (IPv4)'
      },
      {
        num: 1, name: 'Física',      color: '#ef4444',
        label: 'BITS',
        fields: '01001000 01100101 00101110 01101100...\n(frame convertido em sinais elétricos/luz)'
      },
    ];

    let encapStep = 0;

    container.innerHTML = `
      <div class="osi-encap-stage" id="osiStage">
        <div class="osi-data-block" id="osiDataBlock">
          <div class="osi-segment osi-data" id="osiDataCore">DATA</div>
        </div>
      </div>
      <div class="osi-controls">
        <button class="btn-lab" id="osiEncap">+ Encapsular próxima camada</button>
        <button class="btn-lab btn-lab--ghost" id="osiReset">↺ Reiniciar</button>
      </div>
      <div class="osi-details" id="osiDetails"></div>`;

    const blockEl   = container.querySelector('#osiDataBlock');
    const detailsEl = container.querySelector('#osiDetails');
    const btnEncap  = container.querySelector('#osiEncap');
    const btnReset  = container.querySelector('#osiReset');

    function addLayer(layer) {
      const hdr = document.createElement('div');
      hdr.className = 'osi-segment osi-hdr';
      hdr.style.setProperty('--layer-color', layer.color);
      hdr.dataset.layerId = layer.num;
      hdr.innerHTML = `<span class="osi-hdr-tag">L${layer.num} ${layer.name}</span><span class="osi-hdr-label">${layer.label}</span>`;
      hdr.addEventListener('click', () => showDetail(layer));
      blockEl.insertBefore(hdr, blockEl.firstChild);
    }

    function showDetail(layer) {
      detailsEl.innerHTML = `<div class="osi-detail-card" style="border-color:${layer.color}">
        <strong style="color:${layer.color}">Camada ${layer.num} — ${layer.name}</strong>
        <pre class="osi-detail-pre">${layer.fields}</pre>
      </div>`;
    }

    btnEncap.addEventListener('click', () => {
      if (encapStep >= LAYERS.length) return;
      const layer = LAYERS[encapStep];
      addLayer(layer);
      showDetail(layer);
      encapStep++;
      if (encapStep >= LAYERS.length) {
        btnEncap.textContent = '✓ Encapsulamento completo!';
        btnEncap.disabled = true;
      }
    });

    btnReset.addEventListener('click', () => {
      encapStep = 0;
      blockEl.innerHTML = `<div class="osi-segment osi-data" id="osiDataCore">DATA</div>`;
      detailsEl.innerHTML = '';
      btnEncap.textContent = '+ Encapsular próxima camada';
      btnEncap.disabled = false;
    });

    blockEl.querySelector('#osiDataCore').addEventListener('click', () => {
      detailsEl.innerHTML = `<div class="osi-detail-card">
        <strong>Dados da aplicação (Payload)</strong>
        <pre class="osi-detail-pre">O payload é a mensagem real — o que a aplicação quer enviar.\nCada camada adiciona seu próprio cabeçalho (e às vezes trailer)\npara controle, endereçamento e detecção de erros.</pre>
      </div>`;
    });
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
          <button class="btn-lab btn-lab--sm btn-lab--ghost" id="httpCopy" title="Copiar">📋 Copiar</button>
        </div>
      </div>`;

    const methodEl  = container.querySelector('#httpMethod');
    const urlEl     = container.querySelector('#httpUrl');
    const versionEl = container.querySelector('#httpVersion');
    const headersEl = container.querySelector('#httpHeaders');
    const bodyLabel = container.querySelector('#httpBodyLabel');
    const bodyEl    = container.querySelector('#httpBody');
    const rawEl     = container.querySelector('#httpRaw');
    const addHdrBtn = container.querySelector('#httpAddHeader');
    const copyBtn   = container.querySelector('#httpCopy');

    const defaultHeaders = [
      { k: 'Host',          v: 'api.exemplo.com' },
      { k: 'Accept',        v: 'application/json' },
      { k: 'Authorization', v: 'Bearer eyJhbGci...' },
    ];

    function addHeaderRow(k = '', v = '') {
      const row = document.createElement('div');
      row.className = 'http-header-row';
      row.innerHTML = `
        <input type="text" class="lab-input http-hkey" placeholder="Header" value="${k}" spellcheck="false">
        <span>:</span>
        <input type="text" class="lab-input http-hval" placeholder="Valor" value="${v}" spellcheck="false">
        <button class="btn-lab btn-lab--icon" aria-label="Remover">✕</button>`;
      row.querySelector('button').addEventListener('click', () => { row.remove(); update(); });
      row.querySelectorAll('input').forEach(i => i.addEventListener('input', update));
      headersEl.appendChild(row);
    }

    function getHeaders() {
      return [...headersEl.querySelectorAll('.http-header-row')].map(r => ({
        k: r.querySelector('.http-hkey').value.trim(),
        v: r.querySelector('.http-hval').value.trim(),
      })).filter(h => h.k);
    }

    function update() {
      const method  = methodEl.value;
      const rawUrl  = urlEl.value.trim() || '/';
      const version = versionEl.value;
      const hasbody = ['POST','PUT','PATCH'].includes(method);

      bodyLabel.style.opacity = hasbody ? '1' : '0.4';
      bodyEl.disabled = !hasbody;

      let path, host;
      try { const u = new URL(rawUrl); path = u.pathname + u.search; host = u.host; }
      catch { path = rawUrl; host = 'api.exemplo.com'; }

      let raw = `${method} ${path} HTTP/${version}\r\n`;
      const hdrs = getHeaders();
      if (!hdrs.find(h => h.k.toLowerCase() === 'host')) hdrs.unshift({ k: 'Host', v: host });
      hdrs.forEach(h => { raw += `${h.k}: ${h.v}\r\n`; });

      const body = hasbody ? bodyEl.value.trim() : '';
      if (body) {
        if (!hdrs.find(h => h.k.toLowerCase() === 'content-type')) raw += `Content-Type: application/json\r\n`;
        raw += `Content-Length: ${new TextEncoder().encode(body).length}\r\n`;
      }
      raw += `\r\n`;
      if (body) raw += body;

      rawEl.textContent = raw;
    }

    defaultHeaders.forEach(h => addHeaderRow(h.k, h.v));
    addHdrBtn.addEventListener('click', () => { addHeaderRow(); update(); });
    [methodEl, urlEl, versionEl, bodyEl].forEach(el => el.addEventListener('input', update));
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(rawEl.textContent).then(() => { copyBtn.textContent = '✓ Copiado!'; setTimeout(() => copyBtn.textContent = '📋 Copiar', 2000); });
    });
    update();
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
            <label>IP Origem    <input type="text" id="tcpSrcIP" class="lab-input" value="192.168.1.10" spellcheck="false"></label>
            <label>IP Destino   <input type="text" id="tcpDstIP" class="lab-input" value="142.250.65.14" spellcheck="false"></label>
          </fieldset>
          <fieldset class="tcp-fieldset" id="tcpTcpSection">
            <legend>Cabeçalho TCP</legend>
            <label>Porta Origem  <input type="number" id="tcpSrcPort" class="lab-input tcp-num" min="0" max="65535" value="54321"></label>
            <label>Porta Destino <input type="number" id="tcpDstPort" class="lab-input tcp-num" min="0" max="65535" value="443"></label>
            <label>Seq Number    <input type="number" id="tcpSeq" class="lab-input tcp-num" value="1001"></label>
            <label>Ack Number    <input type="number" id="tcpAck" class="lab-input tcp-num" value="0"></label>
            <label>Flags
              <div class="tcp-flags" id="tcpFlags">
                ${['SYN','ACK','FIN','RST','PSH','URG'].map(f =>
                  `<label class="tcp-flag"><input type="checkbox" value="${f}" ${f === 'SYN' ? 'checked' : ''}> ${f}</label>`
                ).join('')}
              </div>
            </label>
            <label>Window Size   <input type="number" id="tcpWindow" class="lab-input tcp-num" value="65535"></label>
          </fieldset>
        </div>
        <div class="tcp-visual" id="tcpVisual"></div>
      </div>`;

    function getFlags() {
      return [...container.querySelectorAll('#tcpFlags input:checked')].map(i => i.value);
    }

    function validateIP(ip) {
      return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && ip.split('.').every(n => +n <= 255);
    }

    function render() {
      const ver     = container.querySelector('#tcpIpVer').value;
      const ttl     = container.querySelector('#tcpTTL').value;
      const proto   = container.querySelector('#tcpProto');
      const protoV  = proto.value;
      const srcIP   = container.querySelector('#tcpSrcIP').value.trim();
      const dstIP   = container.querySelector('#tcpDstIP').value.trim();
      const srcPort = container.querySelector('#tcpSrcPort').value;
      const dstPort = container.querySelector('#tcpDstPort').value;
      const seq     = container.querySelector('#tcpSeq').value;
      const ack     = container.querySelector('#tcpAck').value;
      const flags   = getFlags();
      const window_ = container.querySelector('#tcpWindow').value;

      const isTCP = protoV === '6';
      container.querySelector('#tcpTcpSection').style.display = isTCP ? '' : 'none';

      const srcValid = validateIP(srcIP);
      const dstValid = validateIP(dstIP);
      container.querySelector('#tcpSrcIP').classList.toggle('lab-input--error', !srcValid);
      container.querySelector('#tcpDstIP').classList.toggle('lab-input--error', !dstValid);

      const visual = container.querySelector('#tcpVisual');
      visual.innerHTML = `
        <div class="tcp-diagram-label">Diagrama do Pacote</div>
        <div class="tcp-diagram">
          <div class="tcp-layer tcp-layer--ip">
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:0.5" title="Versão IP">Ver: ${ver}</div>
              <div class="tcp-field" style="flex:0.5" title="IHL">IHL: ${ver === '4' ? '5' : 'N/A'}</div>
              <div class="tcp-field" style="flex:1" title="Differentiated Services">DSCP: 0x00</div>
              <div class="tcp-field" style="flex:1" title="Total Length">Length: auto</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:1.5" title="Identification">ID: 0x${Math.floor(Math.random()*65535).toString(16).padStart(4,'0')}</div>
              <div class="tcp-field" style="flex:0.5" title="Flags">Flags: DF</div>
              <div class="tcp-field" style="flex:1" title="Fragment Offset">Frag Off: 0</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:0.5" title="TTL">TTL: ${ttl}</div>
              <div class="tcp-field" style="flex:0.5" title="Protocolo">Proto: ${protoV}</div>
              <div class="tcp-field" style="flex:1" title="Checksum">Checksum: 0x????</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field ${srcValid ? '' : 'tcp-field--error'}" style="flex:2" title="IP Origem">Src: ${srcIP}</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field ${dstValid ? '' : 'tcp-field--error'}" style="flex:2" title="IP Destino">Dst: ${dstIP}</div>
            </div>
            <div class="tcp-layer-label">IPv${ver} Header (20 bytes)</div>
          </div>
          ${isTCP ? `<div class="tcp-layer tcp-layer--tcp">
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:1" title="Porta Origem">Src Port: ${srcPort}</div>
              <div class="tcp-field" style="flex:1" title="Porta Destino">Dst Port: ${dstPort}</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:2" title="Sequence Number">Seq: ${seq}</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:2" title="Acknowledgment Number">Ack: ${ack}</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:0.5" title="Data Offset">Off: 5</div>
              <div class="tcp-field ${flags.length ? 'tcp-field--active' : ''}" style="flex:1.5" title="Flags">${flags.length ? flags.join(' | ') : '(nenhum)'}</div>
              <div class="tcp-field" style="flex:1" title="Window Size">Win: ${window_}</div>
            </div>
            <div class="tcp-field-row">
              <div class="tcp-field" style="flex:1" title="Checksum">Checksum: 0x????</div>
              <div class="tcp-field" style="flex:1" title="Urgent Pointer">Urgent: 0</div>
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
     7. NETWORK TOPOLOGY BUILDER
  ══════════════════════════════════════════════════════ */
  function initTopology() {
    const container = document.getElementById('labTopo');
    if (!container) return;

    const DEVICES = {
      pc:       { icon: '🖥️',  label: 'PC' },
      laptop:   { icon: '💻',  label: 'Laptop' },
      router:   { icon: '🌐',  label: 'Roteador' },
      switch:   { icon: '🔀',  label: 'Switch' },
      server:   { icon: '🗄️',  label: 'Servidor' },
      firewall: { icon: '🔒',  label: 'Firewall' },
      cloud:    { icon: '☁️',  label: 'Internet' },
    };

    let nodes = [], edges = [], nodeCounter = 0;
    let mode = 'place', activeDevice = 'pc';
    let drag = null, connectStart = null;
    let selectedNode = null;
    let svgEl, nodesContainer;

    container.innerHTML = `
      <div class="topo-toolbar">
        ${Object.entries(DEVICES).map(([k, v]) =>
          `<button class="topo-tool ${k === 'pc' ? 'active' : ''}" data-device="${k}" title="${v.label}">${v.icon}<span>${v.label}</span></button>`
        ).join('')}
        <div class="topo-divider"></div>
        <button class="topo-tool ${activeDevice === '__connect__' ? 'active' : ''}" id="topoConnectBtn" title="Conectar dois nós">🔗<span>Conectar</span></button>
        <button class="topo-tool" id="topoDeleteBtn" title="Deletar selecionado">🗑️<span>Deletar</span></button>
        <button class="topo-tool" id="topoClearBtn" title="Limpar tudo">🧹<span>Limpar</span></button>
      </div>
      <div class="topo-canvas-wrap">
        <svg id="topoSVG" class="topo-svg"></svg>
        <div id="topoNodes" class="topo-nodes"></div>
        <div class="topo-hint" id="topoHint">Clique no canvas para adicionar dispositivos</div>
      </div>`;

    svgEl = container.querySelector('#topoSVG');
    nodesContainer = container.querySelector('#topoNodes');
    const hint = container.querySelector('#topoHint');

    function updateHint() {
      if (nodes.length === 0) hint.textContent = 'Clique no canvas para adicionar dispositivos';
      else if (mode === 'connect') hint.textContent = `Clique em ${connectStart ? 'outro nó para conectar' : 'um nó para iniciar a conexão'}`;
      else if (selectedNode !== null) hint.textContent = 'Arraste para mover • Ctrl+click para conectar • Delete para remover';
      else hint.textContent = `Modo: adicionar ${DEVICES[activeDevice]?.label || ''}`;
    }

    function renderEdges() {
      svgEl.innerHTML = '';
      edges.forEach(e => {
        const a = nodes.find(n => n.id === e.from);
        const b = nodes.find(n => n.id === e.to);
        if (!a || !b) return;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
        line.setAttribute('stroke', 'var(--border)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '0');
        svgEl.appendChild(line);
      });
    }

    function createNodeEl(node) {
      const div = document.createElement('div');
      div.className = 'topo-node';
      div.id = `topoN${node.id}`;
      div.style.left = (node.x - 28) + 'px';
      div.style.top  = (node.y - 36) + 'px';
      div.innerHTML = `<div class="topo-node-icon">${DEVICES[node.type].icon}</div><div class="topo-node-label" contenteditable="true" spellcheck="false">${node.label}</div>`;
      div.addEventListener('mousedown', e => onNodeMouseDown(e, node));
      nodesContainer.appendChild(div);
      return div;
    }

    function addNode(x, y) {
      const node = { id: ++nodeCounter, type: activeDevice, x, y, label: DEVICES[activeDevice].label };
      nodes.push(node);
      createNodeEl(node);
      hint.style.display = 'none';
      updateHint();
    }

    function onNodeMouseDown(e, node) {
      if (e.target.getAttribute('contenteditable')) return;
      e.stopPropagation();

      if (mode === 'connect') {
        if (!connectStart) {
          connectStart = node.id;
          document.getElementById(`topoN${node.id}`).classList.add('topo-node--connect');
          updateHint();
        } else if (connectStart !== node.id) {
          const exists = edges.find(ed => (ed.from === connectStart && ed.to === node.id) || (ed.from === node.id && ed.to === connectStart));
          if (!exists) edges.push({ from: connectStart, to: node.id });
          document.getElementById(`topoN${connectStart}`)?.classList.remove('topo-node--connect');
          connectStart = null;
          renderEdges();
          updateHint();
        }
        return;
      }

      selectedNode = node.id;
      document.querySelectorAll('.topo-node').forEach(n => n.classList.remove('topo-node--selected'));
      document.getElementById(`topoN${node.id}`).classList.add('topo-node--selected');

      const canvasRect = container.querySelector('.topo-canvas-wrap').getBoundingClientRect();
      const startX = e.clientX, startY = e.clientY;
      const origX = node.x, origY = node.y;

      drag = { node, startX, startY, origX, origY, canvasRect };
    }

    document.addEventListener('mousemove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const newX = Math.max(28, Math.min(drag.canvasRect.width - 28, drag.origX + dx));
      const newY = Math.max(36, Math.min(drag.canvasRect.height - 36, drag.origY + dy));
      drag.node.x = newX; drag.node.y = newY;
      const div = document.getElementById(`topoN${drag.node.id}`);
      if (div) { div.style.left = (newX - 28) + 'px'; div.style.top = (newY - 36) + 'px'; }
      renderEdges();
    });

    document.addEventListener('mouseup', () => { drag = null; });

    container.querySelector('.topo-canvas-wrap').addEventListener('click', e => {
      if (e.target.closest('.topo-node') || mode === 'connect') return;
      const rect = e.currentTarget.getBoundingClientRect();
      addNode(e.clientX - rect.left, e.clientY - rect.top);
      renderEdges();
    });

    container.querySelectorAll('.topo-tool[data-device]').forEach(btn => {
      btn.addEventListener('click', () => {
        mode = 'place';
        activeDevice = btn.dataset.device;
        container.querySelectorAll('.topo-tool').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        connectStart = null;
        updateHint();
      });
    });

    container.querySelector('#topoConnectBtn').addEventListener('click', () => {
      mode = mode === 'connect' ? 'place' : 'connect';
      container.querySelectorAll('.topo-tool').forEach(b => b.classList.remove('active'));
      if (mode === 'connect') container.querySelector('#topoConnectBtn').classList.add('active');
      else container.querySelector(`[data-device="${activeDevice}"]`)?.classList.add('active');
      connectStart = null;
      document.querySelectorAll('.topo-node--connect').forEach(n => n.classList.remove('topo-node--connect'));
      updateHint();
    });

    container.querySelector('#topoDeleteBtn').addEventListener('click', () => {
      if (selectedNode === null) return;
      nodes = nodes.filter(n => n.id !== selectedNode);
      edges = edges.filter(e => e.from !== selectedNode && e.to !== selectedNode);
      document.getElementById(`topoN${selectedNode}`)?.remove();
      selectedNode = null;
      renderEdges();
      updateHint();
    });

    container.querySelector('#topoClearBtn').addEventListener('click', () => {
      nodes = []; edges = []; selectedNode = null; connectStart = null; nodeCounter = 0;
      nodesContainer.innerHTML = ''; svgEl.innerHTML = '';
      hint.style.display = '';
      updateHint();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Delete' && selectedNode !== null && !document.activeElement?.getAttribute('contenteditable')) {
        container.querySelector('#topoDeleteBtn').click();
      }
      if (e.key === 'Escape') {
        mode = 'place';
        connectStart = null;
        document.querySelectorAll('.topo-node--connect').forEach(n => n.classList.remove('topo-node--connect'));
        container.querySelectorAll('.topo-tool').forEach(b => b.classList.remove('active'));
        container.querySelector(`[data-device="${activeDevice}"]`)?.classList.add('active');
        updateHint();
      }
    });

    // Start with a sample topology
    setTimeout(() => {
      const w = container.querySelector('.topo-canvas-wrap').clientWidth;
      const h = container.querySelector('.topo-canvas-wrap').clientHeight;
      activeDevice = 'cloud';   addNode(w * 0.5, h * 0.1);
      activeDevice = 'router';  addNode(w * 0.5, h * 0.35);
      activeDevice = 'switch';  addNode(w * 0.3, h * 0.62);
      activeDevice = 'switch';  addNode(w * 0.7, h * 0.62);
      activeDevice = 'pc';      addNode(w * 0.15, h * 0.85);
      activeDevice = 'pc';      addNode(w * 0.45, h * 0.85);
      activeDevice = 'server';  addNode(w * 0.7, h * 0.85);
      activeDevice = 'firewall';addNode(w * 0.85, h * 0.85);
      edges = [
        { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 2, to: 4 },
        { from: 3, to: 5 }, { from: 3, to: 6 }, { from: 4, to: 7 }, { from: 4, to: 8 }
      ];
      activeDevice = 'pc';
      container.querySelector(`[data-device="pc"]`).classList.add('active');
      renderEdges();
      hint.style.display = 'none';
      updateHint();
    }, 100);
  }

  /* ── Utility ─────────────────────────────────────────── */
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

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
