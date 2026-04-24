/* ── RedesWiki — Calculadora de Sub-redes ────────────── */
'use strict';

const SubnetCalc = (() => {

  function init() {
    const form = document.getElementById('subnetForm');
    if (!form) return;
    form.addEventListener('submit', e => { e.preventDefault(); calculate(); });
    form.addEventListener('input', debounce(calculate, 300));
  }

  function calculate() {
    const input = document.getElementById('subnetInput');
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) { clearResults(); return; }

    const parsed = parse(raw);
    if (!parsed) {
      showError('Formato inválido. Use: 192.168.1.0/24 ou 192.168.1.50 255.255.255.0');
      return;
    }

    const { ipInt, prefix } = parsed;
    const mask        = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    const network     = (ipInt & mask) >>> 0;
    const broadcast   = (network | (~mask >>> 0)) >>> 0;
    const wildcard    = (~mask) >>> 0;
    const totalIPs    = Math.pow(2, 32 - prefix);
    const usable      = totalIPs > 2 ? totalIPs - 2 : 0;
    const firstHost   = totalIPs > 2 ? network + 1 : network;
    const lastHost    = totalIPs > 2 ? broadcast - 1 : broadcast;

    renderResults({
      ip:        intToIP(ipInt),
      ipBin:     intToBin(ipInt),
      prefix,
      network:   intToIP(network),
      broadcast: intToIP(broadcast),
      mask:      intToIP(mask),
      maskBin:   intToBin(mask),
      wildcard:  intToIP(wildcard),
      firstHost: intToIP(firstHost),
      lastHost:  intToIP(lastHost),
      totalIPs,
      usable,
      ipClass:   getClass(network),
      isPrivate: isPrivate(network, prefix)
    });
  }

  function parse(raw) {
    // Format: a.b.c.d/prefix OR a.b.c.d mask
    const cidrRe  = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/;
    const maskRe  = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;

    let ipStr, prefix;
    const m1 = raw.match(cidrRe);
    const m2 = raw.match(maskRe);

    if (m1) {
      ipStr  = m1[1];
      prefix = parseInt(m1[2]);
    } else if (m2) {
      ipStr  = m2[1];
      prefix = maskToPrefix(m2[2]);
      if (prefix === null) return null;
    } else {
      // Just an IP — assume /24
      const ipOnly = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(raw);
      if (ipOnly) { ipStr = raw; prefix = 24; }
      else return null;
    }

    if (prefix < 0 || prefix > 32) return null;
    const ipInt = ipToInt(ipStr);
    if (ipInt === null) return null;
    return { ipInt, prefix };
  }

  function ipToInt(ip) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  }

  function intToIP(n) {
    return [n >>> 24, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff].join('.');
  }

  function intToBin(n) {
    const bin = (n >>> 0).toString(2).padStart(32, '0');
    return bin.match(/.{8}/g).join('.');
  }

  function maskToPrefix(maskStr) {
    const n = ipToInt(maskStr);
    if (n === null) return null;
    const bin = (n >>> 0).toString(2);
    if (!/^1*0*$/.test(bin)) return null;
    return bin.split('').filter(b => b === '1').length;
  }

  function getClass(networkInt) {
    const first = networkInt >>> 24;
    if (first < 128)       return 'A';
    if (first < 192)       return 'B';
    if (first < 224)       return 'C';
    if (first < 240)       return 'D (Multicast)';
    return 'E (Experimental)';
  }

  function isPrivate(networkInt, prefix) {
    const ip = intToIP(networkInt);
    const f  = networkInt >>> 24;
    if (f === 10) return true;
    if (f === 172 && ((networkInt >>> 16) & 0xff) >= 16 && ((networkInt >>> 16) & 0xff) <= 31) return true;
    if (f === 192 && ((networkInt >>> 16) & 0xff) === 168) return true;
    if (f === 127) return true;
    return false;
  }

  function renderResults(r) {
    const out = document.getElementById('subnetOutput');
    if (!out) return;

    const binHighlight = (bin, prefix) => {
      const pure = bin.replace(/\./g, '');
      const net  = pure.slice(0, prefix);
      const host = pure.slice(prefix);
      const fmtN = net.match(/.{1,8}/g) || [];
      const fmtH = host.match(/.{1,8}/g) || [];
      const netDots  = fmtN.join('.');
      const hostDots = fmtH.length ? (netDots ? '.' : '') + fmtH.join('.') : '';
      return `<span class="bin-net">${netDots}</span><span class="bin-host">${hostDots}</span>`;
    };

    out.innerHTML = `
      <div class="sc-result-grid">
        <div class="sc-row">
          <span class="sc-label">IP informado</span>
          <span class="sc-val mono">${r.ip}/${r.prefix}</span>
        </div>
        <div class="sc-row">
          <span class="sc-label">IP em binário</span>
          <span class="sc-val mono small">${binHighlight(r.ipBin, r.prefix)}</span>
        </div>
        <div class="sc-row sc-highlight">
          <span class="sc-label">Endereço de rede</span>
          <span class="sc-val mono">${r.network}/${r.prefix}</span>
        </div>
        <div class="sc-row">
          <span class="sc-label">Endereço de broadcast</span>
          <span class="sc-val mono">${r.broadcast}</span>
        </div>
        <div class="sc-row">
          <span class="sc-label">Máscara (decimal)</span>
          <span class="sc-val mono">${r.mask}</span>
        </div>
        <div class="sc-row">
          <span class="sc-label">Máscara (binário)</span>
          <span class="sc-val mono small">${r.maskBin}</span>
        </div>
        <div class="sc-row">
          <span class="sc-label">Wildcard</span>
          <span class="sc-val mono">${r.wildcard}</span>
        </div>
        <div class="sc-row sc-highlight">
          <span class="sc-label">Primeiro host utilizável</span>
          <span class="sc-val mono">${r.firstHost}</span>
        </div>
        <div class="sc-row sc-highlight">
          <span class="sc-label">Último host utilizável</span>
          <span class="sc-val mono">${r.lastHost}</span>
        </div>
        <div class="sc-row">
          <span class="sc-label">Total de IPs</span>
          <span class="sc-val">${r.totalIPs.toLocaleString('pt-BR')}</span>
        </div>
        <div class="sc-row">
          <span class="sc-label">Hosts utilizáveis</span>
          <span class="sc-val">${r.usable > 0 ? r.usable.toLocaleString('pt-BR') : '—'}</span>
        </div>
        <div class="sc-row">
          <span class="sc-label">Classe</span>
          <span class="sc-val">${r.ipClass}</span>
        </div>
        <div class="sc-row">
          <span class="sc-label">Faixa IP privada?</span>
          <span class="sc-val">${r.isPrivate ? '✅ Sim (RFC 1918)' : '🌐 Não (público)'}</span>
        </div>
      </div>
      <div class="sc-legend">
        <span class="bin-net">█ bits de rede</span> &nbsp;
        <span class="bin-host">█ bits de host</span>
      </div>
    `;
    out.classList.add('visible');
  }

  function showError(msg) {
    const out = document.getElementById('subnetOutput');
    if (!out) return;
    out.innerHTML = `<div class="sc-error">${msg}</div>`;
    out.classList.add('visible');
  }

  function clearResults() {
    const out = document.getElementById('subnetOutput');
    if (out) { out.innerHTML = ''; out.classList.remove('visible'); }
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  return { init };
})();
