/* ── RedesWiki — Exercícios práticos guiados ────────── */
'use strict';

(() => {
  const EXERCISE_GUIDES = [
    {
      id: 'dns-ip-ok-domain-fail',
      hypothesis: 'A máquina tem conectividade IP, mas a resolução de nomes está falhando.',
      evidence: 'Ping para IP externo funciona; ping por nome falha; nslookup ou configuração DNS apontam inconsistência.',
      commonMistake: 'Trocar tudo de uma vez sem provar primeiro se o problema é DNS ou conectividade.',
      cyber: 'DNS é alvo frequente em spoofing, sinkhole e bloqueio de resolução. Saber isolar isso ajuda em defesa e investigação.'
    },
    {
      id: 'single-site-down',
      hypothesis: 'O defeito é específico do serviço, do domínio ou de um bloqueio seletivo.',
      evidence: 'Outros sites carregam; só um destino falha; curl, traceroute ou nslookup mostram sintoma localizado.',
      commonMistake: 'Concluir que “a internet caiu” quando a evidência aponta para um único serviço.',
      cyber: 'Falha seletiva pode sinalizar WAF, bloqueio geográfico, cert incorreto ou indisponibilidade parcial.'
    },
    {
      id: 'gateway-ok-internet-down',
      hypothesis: 'A LAN está íntegra, mas a saída da rede está quebrada em rota padrão, NAT ou link WAN.',
      evidence: 'Gateway responde; IP externo não; tabela de rotas ou borda não entregam saída válida.',
      commonMistake: 'Culpar o cliente final sem verificar o ponto onde a rede deixa de responder.',
      cyber: 'Segmentação e borda são pontos críticos para firewall e NAT; entender isso ajuda a diferenciar falha de política.'
    },
    {
      id: 'service-port-closed',
      hypothesis: 'O host existe, mas o serviço não está ouvindo ou está bloqueado por firewall/ACL.',
      evidence: 'Connection refused sugere porta fechada ou serviço parado; timeout sugere filtro ou rota quebrada.',
      commonMistake: 'Interpretar qualquer erro como “sem rede” em vez de separar host, porta e aplicação.',
      cyber: 'Enumeração de portas, hardening e exposição indevida de serviço dependem dessa leitura.'
    },
    {
      id: 'latency-after-hops',
      hypothesis: 'A degradação começa fora da LAN, em trânsito intermediário ou link remoto.',
      evidence: 'Primeiros hops saudáveis; latência sobe mais adiante; usuários locais ficam tentados a culpar Wi-Fi sem base.',
      commonMistake: 'Parar no primeiro hop lento sem verificar se ele só deixa de responder ICMP e não o tráfego real.',
      cyber: 'Ataques DDoS e congestionamento em borda podem ter assinatura parecida; o caminho importa.'
    },
    {
      id: 'dns-interno-divergente',
      hypothesis: 'A cadeia de resolução interna está inconsistente por cache, split-horizon ou registro desatualizado.',
      evidence: 'Máquinas diferentes resolvem IPs diferentes; flush de cache ou consulta a outro DNS muda o resultado.',
      commonMistake: 'Assumir que o navegador está errado quando o desvio está na resolução anterior.',
      cyber: 'DNS interno inconsistente impacta acesso, detecção e até contenção de incidentes.'
    }
  ];

  function init() {
    const cards = document.querySelectorAll('.exercise-card');
    if (!cards.length) return;

    cards.forEach((card, index) => {
      const guide = EXERCISE_GUIDES[index];
      if (!guide) return;
      hydrateExerciseCard(card, guide);
    });
  }

  function hydrateExerciseCard(card, guide) {
    const header = card.querySelector('.ex-header');
    const body = card.querySelector('.ex-body');
    const toggle = card.querySelector('.ex-show-btn');
    const solution = card.querySelector('.ex-solution');

    card.dataset.exerciseId = guide.id;
    if (!card.querySelector('.exercise-reasoning')) {
      body?.insertAdjacentHTML('afterbegin', `
        <div class="exercise-reasoning">
          <div class="exercise-reasoning-block">
            <strong>Hipótese inicial</strong>
            <p>${guide.hypothesis}</p>
          </div>
          <div class="exercise-reasoning-block">
            <strong>Evidência que confirma ou derruba</strong>
            <p>${guide.evidence}</p>
          </div>
          <div class="exercise-reasoning-block">
            <strong>Erro comum</strong>
            <p>${guide.commonMistake}</p>
          </div>
          <div class="exercise-reasoning-block">
            <strong>Conexão com cyber</strong>
            <p>${guide.cyber}</p>
          </div>
          <div class="exercise-response-grid">
            <label class="exercise-response-field">
              <span>Minha hipótese</span>
              <textarea data-response-field="hypothesis" rows="3" placeholder="Qual é a sua hipótese antes de abrir a solução?"></textarea>
            </label>
            <label class="exercise-response-field">
              <span>Que evidência eu buscaria</span>
              <textarea data-response-field="evidence" rows="3" placeholder="Que sinal confirmaria ou derrubaria sua hipótese?"></textarea>
            </label>
            <label class="exercise-response-field">
              <span>Qual comando eu rodaria primeiro</span>
              <textarea data-response-field="command" rows="3" placeholder="Qual comando te dá a melhor evidência inicial?"></textarea>
            </label>
          </div>
          <div class="exercise-actions-row">
            <button class="exercise-save-btn" type="button">Salvar raciocínio</button>
            <button class="exercise-status-btn" type="button">Marcar como resolvido</button>
          </div>
        </div>
      `);
    }

    restoreExerciseState(card, guide);

    header?.addEventListener('click', () => {
      body?.classList.toggle('open');
      if (typeof Progress !== 'undefined') Progress.recordExerciseAttempt(guide.id, { status: 'opened' });
    });

    toggle?.addEventListener('click', event => {
      event.stopPropagation();
      solution?.classList.toggle('show');
      toggle.textContent = solution?.classList.contains('show') ? 'Ocultar solução' : 'Mostrar solução comentada';
      if (typeof Progress !== 'undefined') {
        Progress.recordExerciseAttempt(guide.id, { status: solution?.classList.contains('show') ? 'reviewed-solution' : 'opened' });
      }
    });

    card.querySelector('.exercise-status-btn')?.addEventListener('click', event => {
      event.stopPropagation();
      const btn = event.currentTarget;
      const done = btn.classList.toggle('done');
      btn.textContent = done ? '✓ Resolvido' : 'Marcar como resolvido';
      persistExercise(card, guide, { status: done ? 'completed' : 'opened' });
    });

    card.querySelector('.exercise-save-btn')?.addEventListener('click', event => {
      event.stopPropagation();
      persistExercise(card, guide, { status: 'answered' });
      event.currentTarget.textContent = 'Raciocínio salvo';
      setTimeout(() => { event.currentTarget.textContent = 'Salvar raciocínio'; }, 1400);
    });
  }

  function restoreExerciseState(card, guide) {
    const history = typeof Progress !== 'undefined' && typeof Progress.loadExerciseHistory === 'function'
      ? Progress.loadExerciseHistory()
      : {};
    const saved = history[guide.id] || {};
    card.querySelectorAll('[data-response-field]').forEach(field => {
      field.value = saved.responses?.[field.dataset.responseField] || '';
    });
    const statusBtn = card.querySelector('.exercise-status-btn');
    if (saved.status === 'completed' && statusBtn) {
      statusBtn.classList.add('done');
      statusBtn.textContent = '✓ Resolvido';
    }
  }

  function collectResponses(card) {
    const responses = {};
    card.querySelectorAll('[data-response-field]').forEach(field => {
      responses[field.dataset.responseField] = field.value.trim();
    });
    return responses;
  }

  function persistExercise(card, guide, payload) {
    const responses = collectResponses(card);
    if (typeof Progress !== 'undefined') {
      Progress.recordExerciseAttempt(guide.id, {
        ...payload,
        responses
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
