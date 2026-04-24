/* ── RedesWiki — Banco de questões para simulado ─────── */
'use strict';

const CERT_QUESTIONS = [
  /* ── Fundamentos ─────────────────────────────────── */
  {
    tema: 'Fundamentos',
    q: 'Qual o número máximo de hosts utilizáveis em uma rede /24?',
    opts: ['256', '254', '255', '252'],
    correct: 1,
    exp: '256 endereços totais - 1 (rede) - 1 (broadcast) = 254 hosts utilizáveis.'
  },
  {
    tema: 'Fundamentos',
    q: 'Qual a função do número de sequência (SEQ) em um pacote TCP?',
    opts: ['Identificar o protocolo', 'Definir a prioridade do pacote', 'Permitir remontagem ordenada dos segmentos', 'Calcular o checksum'],
    correct: 2,
    exp: 'O número de sequência permite que o destinatário reordene os segmentos TCP que chegam fora de ordem.'
  },
  {
    tema: 'Fundamentos',
    q: 'Você tem 100Mbps de banda e 200ms de latência. Qual é o impacto para uma videochamada?',
    opts: ['Nenhum — banda alta resolve tudo', 'A videochamada terá atraso perceptível de 400ms no RTT', 'O vídeo será de baixa qualidade', 'A criptografia será desativada'],
    correct: 1,
    exp: 'Banda e latência são independentes. 200ms de latência = 400ms RTT, perceptível em VoIP. Banda alta não reduz latência.'
  },
  {
    tema: 'Fundamentos',
    q: 'O que diferencia um IP público de um IP privado?',
    opts: ['IPs públicos são mais rápidos', 'IPs privados são roteados na internet; públicos, não', 'IPs públicos são roteáveis na internet; privados, não', 'Não há diferença prática'],
    correct: 2,
    exp: 'IPs privados (RFC 1918: 10.x, 172.16–31.x, 192.168.x) não são roteados na internet. Precisam de NAT para acessar a web.'
  },

  /* ── Modelos ──────────────────────────────────────── */
  {
    tema: 'Modelos',
    q: 'Em qual camada OSI o endereço MAC é relevante?',
    opts: ['Camada 1 — Física', 'Camada 2 — Enlace de Dados', 'Camada 3 — Rede', 'Camada 4 — Transporte'],
    correct: 1,
    exp: 'Endereços MAC (físicos) operam na Camada 2 (Enlace de Dados). Switches usam tabelas MAC para encaminhar quadros.'
  },
  {
    tema: 'Modelos',
    q: 'Uma requisição HTTP com cabeçalhos e corpo é um exemplo de PDU de qual camada OSI?',
    opts: ['Segmento (Transporte)', 'Pacote (Rede)', 'Mensagem (Aplicação)', 'Quadro (Enlace)'],
    correct: 2,
    exp: 'HTTP opera na Camada 7 (Aplicação). A unidade de dados é a mensagem (ou simplesmente "dado"). Abaixo, o TCP encapsula em segmentos, o IP em pacotes, e o Ethernet em quadros.'
  },
  {
    tema: 'Modelos',
    q: 'Qual modelo de referência a internet realmente usa?',
    opts: ['OSI', 'TCP/IP', 'IEEE 802.11', 'ANSI X3'],
    correct: 1,
    exp: 'O TCP/IP é o modelo que a internet usa na prática. O OSI é um modelo teórico de referência usado para ensino e descrição.'
  },

  /* ── Endereçamento ────────────────────────────────── */
  {
    tema: 'Endereçamento',
    q: 'Quantos endereços IP totais existem em uma rede 10.0.0.0/8?',
    opts: ['254', '65.536', '16.777.216', '4.294.967.296'],
    correct: 2,
    exp: '/8 usa 8 bits para rede, deixa 24 bits para hosts: 2^24 = 16.777.216 endereços totais (16.777.214 utilizáveis).'
  },
  {
    tema: 'Endereçamento',
    q: 'Qual é o endereço de broadcast de 192.168.10.0/24?',
    opts: ['192.168.10.0', '192.168.10.1', '192.168.10.254', '192.168.10.255'],
    correct: 3,
    exp: 'O broadcast é o último endereço da rede — todos os bits de host em 1. Em /24: 192.168.10.255.'
  },
  {
    tema: 'Endereçamento',
    q: 'Dois hosts com IPs 172.16.5.10/20 e 172.16.8.20/20 estão na mesma rede?',
    opts: ['Sim, ambos são /20', 'Não, estão em sub-redes diferentes', 'Depende do gateway', 'Sim, pois são privados'],
    correct: 1,
    exp: '/20 usa 20 bits de rede. 172.16.5.10 → rede 172.16.0.0. 172.16.8.20 → rede 172.16.8.0. São sub-redes diferentes dentro do bloco /12.'
  },
  {
    tema: 'Endereçamento',
    q: 'O que representa o endereço 127.0.0.1?',
    opts: ['Gateway padrão', 'Servidor DNS local', 'Endereço de loopback — o próprio host', 'Endereço de broadcast'],
    correct: 2,
    exp: '127.0.0.1 é o loopback — pacotes enviados para ele nunca saem da máquina. Usado para testar o stack TCP/IP local.'
  },

  /* ── Protocolos ───────────────────────────────────── */
  {
    tema: 'Protocolos',
    q: 'Qual dos seguintes protocolos usa TANTO UDP quanto TCP na porta 53?',
    opts: ['HTTP', 'DNS', 'DHCP', 'SSH'],
    correct: 1,
    exp: 'DNS usa UDP/53 para consultas normais (resposta em único pacote) e TCP/53 para transferências de zona e respostas grandes (DNSSEC).'
  },
  {
    tema: 'Protocolos',
    q: 'Um servidor DHCP responde com lease time de 86400. O que isso significa?',
    opts: ['O IP expira após 86400 ms', 'O IP é válido por 86400 segundos (24 horas)', 'O servidor tem 86400 IPs disponíveis', 'A rede tem /8 de sub-rede'],
    correct: 1,
    exp: 'Lease time é em segundos. 86400s = 24 horas. Após esse tempo, o cliente deve renovar o IP junto ao servidor DHCP.'
  },
  {
    tema: 'Protocolos',
    q: 'O que o registro CNAME do DNS faz?',
    opts: ['Mapeia IP para nome (DNS reverso)', 'Cria um alias (apelido) de um nome para outro nome', 'Define o servidor de e-mail do domínio', 'Mapeia nome para IPv6'],
    correct: 1,
    exp: 'CNAME (Canonical Name) cria um apelido: www.exemplo.com → exemplo.com. O cliente então resolve o nome canônico.'
  },
  {
    tema: 'Protocolos',
    q: 'Qual a principal diferença entre IMAP e POP3?',
    opts: ['IMAP usa criptografia; POP3 não', 'IMAP mantém e-mails no servidor; POP3 baixa e remove', 'POP3 é mais seguro', 'IMAP é para envio; POP3 para recebimento'],
    correct: 1,
    exp: 'IMAP sincroniza e mantém e-mails no servidor (ideal para múltiplos dispositivos). POP3 baixa e tipicamente remove do servidor.'
  },

  /* ── Acesso a Site ────────────────────────────────── */
  {
    tema: 'Acesso a Site',
    q: 'Após o three-way handshake TCP, qual é o próximo passo para acessar um site HTTPS?',
    opts: ['Enviar o HTTP GET imediatamente', 'Iniciar o handshake TLS', 'Resolver o DNS novamente', 'Verificar o certificado ARP'],
    correct: 1,
    exp: 'TCP estabelece a conexão de transporte. O TLS negocia criptografia em seguida. Só depois o HTTP envia a requisição dentro do túnel TLS.'
  },
  {
    tema: 'Acesso a Site',
    q: 'Você acessa example.com e o servidor responde com código 301. O que acontece?',
    opts: ['A página é exibida normalmente', 'O navegador é redirecionado permanentemente para outra URL', 'Há um erro de autenticação', 'O recurso não foi encontrado'],
    correct: 1,
    exp: '301 Moved Permanently — o recurso foi movido definitivamente. O navegador segue o header Location automaticamente e atualiza os bookmarks.'
  },
  {
    tema: 'Acesso a Site',
    q: 'O que é HSTS (HTTP Strict Transport Security)?',
    opts: ['Um tipo de certificado digital', 'Header que força o navegador a usar apenas HTTPS naquele domínio', 'Protocolo alternativo ao TLS', 'Mecanismo de autenticação de dois fatores'],
    correct: 1,
    exp: 'HSTS é um header HTTP que instrui o navegador a nunca acessar o site por HTTP puro — sempre HTTPS. Previne ataques de downgrade.'
  },

  /* ── Equipamentos ─────────────────────────────────── */
  {
    tema: 'Equipamentos',
    q: 'Um switch recebe um quadro com MAC de destino desconhecido. O que ele faz?',
    opts: ['Descarta o quadro', 'Envia apenas para a porta do gateway', 'Faz flood — envia para todas as portas exceto a de origem', 'Solicita o MAC via ARP'],
    correct: 2,
    exp: 'Quando o MAC de destino não está na tabela CAM, o switch faz flooding: envia o quadro para todas as portas menos a de origem.'
  },
  {
    tema: 'Equipamentos',
    q: 'Um proxy reverso com terminação SSL significa que:',
    opts: ['O tráfego é criptografado até o servidor de origem', 'O proxy descriptografa o TLS e pode reencriptar ou encaminhar em HTTP para os servidores internos', 'Os servidores internos gerenciam seus próprios certificados', 'O proxy bloqueia todo tráfego HTTPS'],
    correct: 1,
    exp: 'Na terminação SSL no proxy reverso, o TLS é decriptografado no proxy. Isso centraliza a gestão de certificados e permite inspeção de conteúdo antes de encaminhar.'
  },
  {
    tema: 'Equipamentos',
    q: 'Qual equipamento opera na Camada 2 e aprende endereços MAC dinamicamente?',
    opts: ['Roteador', 'Switch', 'Firewall de borda', 'Servidor DNS'],
    correct: 1,
    exp: 'O switch opera na Camada 2 e constrói dinamicamente sua tabela CAM (Content Addressable Memory) observando o MAC de origem dos quadros que chegam.'
  },

  /* ── Segurança ────────────────────────────────────── */
  {
    tema: 'Segurança',
    q: 'Qual técnica protege especificamente contra ARP Spoofing em switches corporativos?',
    opts: ['Port security', 'Dynamic ARP Inspection (DAI)', 'VLAN tagging', 'Spanning Tree Protocol'],
    correct: 1,
    exp: 'O Dynamic ARP Inspection (DAI) verifica respostas ARP contra uma tabela DHCP snooping binding, descartando respostas ARP falsas.'
  },
  {
    tema: 'Segurança',
    q: 'Um ataque SYN flood envia milhares de SYNs sem completar o handshake. Qual é o efeito?',
    opts: ['Esgota o espaço em disco do servidor', 'Lota a tabela de conexões TCP em estado SYN_RECEIVED, negando novas conexões legítimas', 'Criptografa os dados do servidor', 'Desvia o tráfego DNS'],
    correct: 1,
    exp: 'SYN flood é um ataque DDoS de protocolo que esgota a tabela de half-open connections do servidor. Mitigado com SYN cookies.'
  },
  {
    tema: 'Segurança',
    q: 'Qual protocolo de e-mail e configuração previne que outros domínios enviem e-mails se passando pelo seu?',
    opts: ['IMAP com TLS', 'SPF + DKIM + DMARC configurados no DNS', 'SMTP na porta 587', 'POP3 com SSL'],
    correct: 1,
    exp: 'SPF define quais servidores podem enviar e-mail pelo domínio, DKIM assina digitalmente, DMARC define políticas de rejeição. Juntos previnem spoofing de e-mail.'
  },

  /* ── Troubleshooting ──────────────────────────────── */
  {
    tema: 'Troubleshooting',
    q: 'ping 8.8.8.8 funciona, mas curl https://api.empresa.com falha com "connection refused". Causa provável:',
    opts: ['Problema de DNS', 'Conectividade IP ok, mas o serviço na porta destino não está escutando ou está bloqueado por firewall', 'Problema na placa de rede', 'O TTL expirou'],
    correct: 1,
    exp: '"Connection refused" significa que a conexão TCP chegou ao host mas nada está escutando na porta, ou um firewall ativo enviou RST.'
  },
  {
    tema: 'Troubleshooting',
    q: 'netstat mostra várias conexões em estado TIME_WAIT. Isso indica:',
    opts: ['Problema grave — serviço travado', 'Ataque DDoS em andamento', 'Conexões TCP encerradas recentemente aguardando timeout de 2 minutos (normal)', 'Firewall bloqueando conexões'],
    correct: 2,
    exp: 'TIME_WAIT é um estado normal pós-encerramento TCP. O sistema aguarda 2×MSL (geralmente 60–120s) para descartar pacotes atrasados. Muitos TIME_WAIT é sinal de alta rotatividade de conexões, não necessariamente problema.'
  },
  {
    tema: 'Troubleshooting',
    q: 'traceroute mostra latência de 2ms nos primeiros 5 hops e depois salta para 180ms no hop 6. O que isso sugere?',
    opts: ['O TTL chegou a zero', 'Cruzamento de link internacional (oceânico) no hop 6, adicionando latência de propagação', 'O firewall está bloqueando ICMP', 'Problema no DNS reverso'],
    correct: 1,
    exp: 'Salto abrupto de latência geralmente indica travessia de cabo submarino ou link de longa distância. É fisicamente impossível reduzir latência abaixo do limite da velocidade da luz na fibra (~5ms/1000km).'
  },

  /* ── Portas ───────────────────────────────────────── */
  {
    tema: 'Portas',
    q: 'Qual porta é usada para SMTP submission (cliente → servidor com autenticação)?',
    opts: ['25', '465', '587', '993'],
    correct: 2,
    exp: 'Porta 587 (SMTP Submission com STARTTLS) é o padrão para clientes de e-mail enviarem mensagens autenticadas. A 25 é inter-servidor; 465 usa TLS implícito.'
  },
  {
    tema: 'Portas',
    q: 'Um script tenta conectar em 22/tcp e recebe "Permission denied (publickey)". Isso significa:',
    opts: ['A porta 22 está fechada no firewall', 'SSH está rodando na porta 22 mas autenticação por senha está desabilitada', 'O serviço SSH está offline', 'O TTL do pacote expirou'],
    correct: 1,
    exp: '"Permission denied (publickey)" é resposta do SSH server — a porta está aberta, o daemon está rodando, mas o servidor exige chave SSH e não aceita senha.'
  },
  {
    tema: 'Portas',
    q: 'Por que ISPs geralmente bloqueiam a porta 25 de saída para clientes residenciais?',
    opts: ['Para economizar banda', 'Para forçar o uso do HTTPS', 'Para prevenir envio direto de spam — clientes devem usar porta 587 com autenticação', 'Porta 25 é reservada para roteadores'],
    correct: 2,
    exp: 'Hosts comprometidos em redes residenciais eram usados para enviar spam diretamente via porta 25. ISPs bloqueiam para forçar o uso de servidores de relay autenticados (porta 587).'
  }
];
