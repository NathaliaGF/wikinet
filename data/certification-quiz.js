/* ── RedesWiki: Banco de questões para simulado ─────── */
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
    opts: ['Nenhum: banda alta resolve tudo', 'A videochamada terá atraso perceptível de 400ms no RTT', 'O vídeo será de baixa qualidade', 'A criptografia será desativada'],
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
    opts: ['Camada 1: Física', 'Camada 2: Enlace de Dados', 'Camada 3: Rede', 'Camada 4: Transporte'],
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
    exp: 'O broadcast é o último endereço da rede: todos os bits de host em 1. Em /24: 192.168.10.255.'
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
    opts: ['Gateway padrão', 'Servidor DNS local', 'Endereço de loopback: o próprio host', 'Endereço de broadcast'],
    correct: 2,
    exp: '127.0.0.1 é o loopback: pacotes enviados para ele nunca saem da máquina. Usado para testar o stack TCP/IP local.'
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
    exp: '301 Moved Permanently: o recurso foi movido definitivamente. O navegador segue o header Location automaticamente e atualiza os bookmarks.'
  },
  {
    tema: 'Acesso a Site',
    q: 'O que é HSTS (HTTP Strict Transport Security)?',
    opts: ['Um tipo de certificado digital', 'Header que força o navegador a usar apenas HTTPS naquele domínio', 'Protocolo alternativo ao TLS', 'Mecanismo de autenticação de dois fatores'],
    correct: 1,
    exp: 'HSTS é um header HTTP que instrui o navegador a nunca acessar o site por HTTP puro: sempre HTTPS. Previne ataques de downgrade.'
  },

  /* ── Equipamentos ─────────────────────────────────── */
  {
    tema: 'Equipamentos',
    q: 'Um switch recebe um quadro com MAC de destino desconhecido. O que ele faz?',
    opts: ['Descarta o quadro', 'Envia apenas para a porta do gateway', 'Faz flood: envia para todas as portas exceto a de origem', 'Solicita o MAC via ARP'],
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
    opts: ['Problema grave: serviço travado', 'Ataque DDoS em andamento', 'Conexões TCP encerradas recentemente aguardando timeout de 2 minutos (normal)', 'Firewall bloqueando conexões'],
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
    exp: '"Permission denied (publickey)" é resposta do SSH server: a porta está aberta, o daemon está rodando, mas o servidor exige chave SSH e não aceita senha.'
  },
  {
    tema: 'Portas',
    q: 'Por que ISPs geralmente bloqueiam a porta 25 de saída para clientes residenciais?',
    opts: ['Para economizar banda', 'Para forçar o uso do HTTPS', 'Para prevenir envio direto de spam: clientes devem usar porta 587 com autenticação', 'Porta 25 é reservada para roteadores'],
    correct: 2,
    exp: 'Hosts comprometidos em redes residenciais eram usados para enviar spam diretamente via porta 25. ISPs bloqueiam para forçar o uso de servidores de relay autenticados (porta 587).'
  },

  /* ── Fundamentos (novas) ──────────────────────────── */
  {
    tema: 'Fundamentos',
    q: 'Qual é a diferença fundamental entre TCP e UDP?',
    opts: ['TCP é mais rápido que UDP em todos os cenários', 'TCP oferece entrega confiável com controle de fluxo; UDP é não orientado à conexão, sem garantias de entrega', 'UDP usa endereços IP; TCP usa endereços MAC', 'TCP opera na Camada 2; UDP na Camada 3'],
    correct: 1,
    exp: 'TCP (RFC 793) garante entrega, ordem e controle de fluxo via handshake e ACKs. UDP (RFC 768) é mais simples e rápido, ideal para streaming e DNS onde a perda ocasional é tolerável.'
  },
  {
    tema: 'Fundamentos',
    q: 'Um host envia um pacote IP com TTL=1. O que acontece quando ele chega ao primeiro roteador?',
    opts: ['O roteador encaminha normalmente e decrementa para 0', 'O roteador descarta o pacote e envia ICMP Time Exceeded de volta à origem', 'O roteador incrementa o TTL e encaminha', 'O pacote é entregue ao destino sem passar por mais roteadores'],
    correct: 1,
    exp: 'Cada roteador decrementa o TTL em 1. Se chegar a 0, o roteador descarta o pacote e envia ICMP Type 11 (Time Exceeded) à origem. Isso é a base do funcionamento do traceroute.'
  },
  {
    tema: 'Fundamentos',
    q: 'O que é jitter em redes de computadores?',
    opts: ['Perda de pacotes acima de 10%', 'Variação no atraso de entrega entre pacotes consecutivos de um mesmo fluxo', 'Número de saltos entre origem e destino', 'Diferença de velocidade entre upload e download'],
    correct: 1,
    exp: 'Jitter é a variação do delay entre pacotes. Alto jitter prejudica VoIP e videoconferência pois os pacotes chegam em intervalos irregulares, causando artefatos de áudio/vídeo. Mitigado com buffer de jitter.'
  },
  {
    tema: 'Fundamentos',
    q: 'Qual é o propósito do campo Window Size no cabeçalho TCP?',
    opts: ['Definir o tamanho máximo do pacote IP', 'Indicar quantos bytes o receptor pode aceitar sem enviar ACK (controle de fluxo)', 'Especificar o tempo de expiração da conexão', 'Identificar o número da versão TCP'],
    correct: 1,
    exp: 'O Window Size permite controle de fluxo: o receptor anuncia quantos bytes pode bufferizar. O emissor não pode enviar mais do que esse valor sem receber ACK, evitando sobrecarga do receptor.'
  },
  {
    tema: 'Fundamentos',
    q: 'Sua empresa tem um link de 1 Gbps mas usuários reclamam de lentidão ao acessar servidores no exterior. O traceroute mostra 230ms de RTT. Qual é a causa mais provável?',
    opts: ['O link de 1 Gbps está saturado', 'Latência de propagação: a velocidade da luz impõe delay mínimo independente da banda', 'O firewall está inspecionando pacotes demais', 'O DNS está lento'],
    correct: 1,
    exp: 'Banda alta não elimina latência de propagação. A luz em fibra óptica viaja ~200.000 km/s. Uma ida ao exterior pode ter 100ms+ só de propagação física. Latência e banda são dimensões independentes.'
  },
  {
    tema: 'Fundamentos',
    q: 'O que acontece durante o processo de fragmentação IP?',
    opts: ['O TCP divide os dados em segmentos menores antes de enviar', 'Um roteador divide um pacote IP em partes menores quando ele excede o MTU do próximo link', 'O switch reordena quadros Ethernet fora de sequência', 'O DNS divide respostas grandes em múltiplas mensagens UDP'],
    correct: 1,
    exp: 'Quando um pacote IP excede o MTU do enlace seguinte, o roteador (ou host de origem) fragmenta o pacote. Os fragmentos são remontados apenas no destino final. IPv6 não permite fragmentação em roteadores intermediários.'
  },

  /* ── Modelos de Camadas (novas) ───────────────────── */
  {
    tema: 'Modelos',
    q: 'Na pilha TCP/IP, quais camadas do modelo OSI correspondem à camada de "Acesso à Rede" (Network Access)?',
    opts: ['Apenas Camada 1 (Física)', 'Apenas Camada 2 (Enlace)', 'Camadas 1 e 2 do OSI (Física + Enlace de Dados)', 'Camadas 1, 2 e 3 do OSI'],
    correct: 2,
    exp: 'O modelo TCP/IP condensa as camadas 1 (Física) e 2 (Enlace de Dados) do OSI em uma única camada chamada "Acesso à Rede" ou "Link". Ethernet, Wi-Fi e PPP operam nessa camada.'
  },
  {
    tema: 'Modelos',
    q: 'Um técnico captura tráfego e vê um quadro Ethernet contendo um pacote IP, que contém um segmento TCP, que contém dados HTTP. Esse processo de adicionar cabeçalhos em cada camada é chamado de:',
    opts: ['Multiplexação', 'Encapsulamento', 'Tunelamento', 'Segmentação'],
    correct: 1,
    exp: 'Encapsulamento é o processo pelo qual cada camada adiciona seu próprio cabeçalho (e às vezes trailer) aos dados recebidos da camada superior, criando a PDU da camada atual.'
  },
  {
    tema: 'Modelos',
    q: 'Qual camada OSI é responsável pela criptografia de dados e compressão?',
    opts: ['Camada 4: Transporte', 'Camada 5: Sessão', 'Camada 6: Apresentação', 'Camada 7: Aplicação'],
    correct: 2,
    exp: 'A Camada 6 (Apresentação) trata da representação dos dados: criptografia/descriptografia, compressão e conversão de formatos (ASCII/EBCDIC). SSL/TLS é frequentemente associado a essa camada.'
  },
  {
    tema: 'Modelos',
    q: 'Um protocolo de roteamento como OSPF opera em qual camada OSI?',
    opts: ['Camada 2: Enlace', 'Camada 3: Rede', 'Camada 4: Transporte', 'Camada 5: Sessão'],
    correct: 1,
    exp: 'OSPF (Open Shortest Path First) opera na Camada 3 (Rede). Ele troca informações sobre rotas entre roteadores usando pacotes IP diretamente (protocolo IP 89), sem TCP ou UDP.'
  },
  {
    tema: 'Modelos',
    q: 'Qual a principal crítica ao modelo OSI em comparação com o TCP/IP na prática?',
    opts: ['OSI não suporta redes sem fio', 'OSI é muito simplificado, com apenas 4 camadas', 'OSI é um modelo teórico que nunca foi amplamente implementado; TCP/IP domina a internet real', 'OSI não define protocolos de roteamento'],
    correct: 2,
    exp: 'O modelo OSI é excelente como referência conceitual e para resolução de problemas, mas o conjunto de protocolos que a internet usa é o TCP/IP. A maioria dos protocolos OSI propostos (como X.25) não venceu a batalha comercial.'
  },

  /* ── Endereçamento (novas) ────────────────────────── */
  {
    tema: 'Endereçamento',
    q: 'Você precisa criar 6 sub-redes de uma rede 192.168.1.0/24. Qual é o prefixo mínimo necessário?',
    opts: ['/25', '/26', '/27', '/28'],
    correct: 2,
    exp: '/27 empresta 3 bits da parte de host: 2^3 = 8 sub-redes possíveis (≥6). Cada sub-rede tem 30 hosts utilizáveis. /26 forneceria apenas 4 sub-redes, insuficiente.'
  },
  {
    tema: 'Endereçamento',
    q: 'Qual é o intervalo completo de endereços IPv4 privados classe B definido pela RFC 1918?',
    opts: ['172.0.0.0 – 172.255.255.255', '172.16.0.0 – 172.31.255.255', '172.16.0.0 – 172.16.255.255', '172.0.0.0 – 172.31.255.255'],
    correct: 1,
    exp: 'RFC 1918 define três blocos privados: 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0–172.31.255.255) e 192.168.0.0/16. O bloco /12 cobre os 16 blocos /16 de 172.16 a 172.31.'
  },
  {
    tema: 'Endereçamento',
    q: 'Um host com IP 10.10.5.100/22 tenta comunicar com 10.10.7.50/22. Eles estão na mesma sub-rede?',
    opts: ['Sim, ambos são /22', 'Não: 10.10.5.100 está na rede 10.10.4.0/22; 10.10.7.50 está na rede 10.10.4.0/22 também', 'Não: 10.10.5.100 está em 10.10.4.0/22; 10.10.7.50 está em 10.10.4.0/22 — são iguais, logo sim', 'Sim, pois ambos estão no range 10.10.4.0–10.10.7.255'],
    correct: 3,
    exp: '/22 usa 22 bits de rede. 10.10.5.100: os 22 bits de rede = 10.10.4.0 (zerando os últimos 2 bits do terceiro octeto: 00000101 → 00000100 = 4). 10.10.7.50: terceiro octeto 7 = 00000111 → 00000100 = 4. Ambos são 10.10.4.0/22. Mesma sub-rede.'
  },
  {
    tema: 'Endereçamento',
    q: 'O que é um endereço IPv6 link-local e qual é seu prefixo?',
    opts: ['Endereço público IPv6, prefixo 2000::/3', 'Endereço válido apenas no segmento local, prefixo FE80::/10', 'Endereço de loopback IPv6, prefixo ::1/128', 'Endereço multicast IPv6, prefixo FF00::/8'],
    correct: 1,
    exp: 'Endereços link-local (FE80::/10) são configurados automaticamente em toda interface IPv6 e são válidos apenas no segmento de rede local. Não são roteáveis. Usados para descoberta de vizinhos (NDP) e roteamento local.'
  },
  {
    tema: 'Endereçamento',
    q: 'Qual é a notação CIDR equivalente à máscara 255.255.252.0?',
    opts: ['/21', '/22', '/23', '/24'],
    correct: 1,
    exp: '255.255.252.0 = 11111111.11111111.11111100.00000000. Contando os bits 1: 8+8+6+0 = 22 bits. Portanto /22. Cada octeto: 255=8 bits, 252=11111100=6 bits.'
  },
  {
    tema: 'Endereçamento',
    q: 'O que é VLSM (Variable Length Subnet Masking) e por que é usado?',
    opts: ['Técnica para usar IPv6 em redes IPv4', 'Permite usar máscaras de tamanhos diferentes na mesma rede maior, otimizando o uso do espaço de endereçamento', 'Protocolo para atribuição dinâmica de IPs', 'Método para criar endereços IP sem classes'],
    correct: 1,
    exp: 'VLSM permite alocar sub-redes de tamanhos diferentes conforme a necessidade real de cada segmento. Ex: um link ponto-a-ponto pode usar /30 (2 hosts) enquanto um segmento de usuários usa /24. Evita desperdício de IPs.'
  },

  /* ── Protocolos (novas) ───────────────────────────── */
  {
    tema: 'Protocolos',
    q: 'Qual é a sequência correta do processo DORA no DHCP?',
    opts: ['Discover → Offer → Request → Acknowledge', 'Request → Offer → Discover → Acknowledge', 'Discover → Request → Offer → Acknowledge', 'Offer → Discover → Acknowledge → Request'],
    correct: 0,
    exp: 'DORA: o cliente envia Discover (broadcast), o servidor responde com Offer, o cliente envia Request confirmando, o servidor finaliza com Acknowledge. O IP só é válido após o ACK.'
  },
  {
    tema: 'Protocolos',
    q: 'O protocolo NTP usa qual porta e protocolo de transporte?',
    opts: ['TCP/123', 'UDP/123', 'TCP/161', 'UDP/69'],
    correct: 1,
    exp: 'NTP (Network Time Protocol) usa UDP/123. UDP é adequado pois as mensagens são pequenas e frequentes. O próprio NTP lida com perdas de pacotes nas suas estimativas de offset e delay.'
  },
  {
    tema: 'Protocolos',
    q: 'Qual é a diferença entre SNMPv2c e SNMPv3?',
    opts: ['SNMPv3 usa TCP; SNMPv2c usa UDP', 'SNMPv3 adiciona autenticação e criptografia; SNMPv2c usa community strings sem criptografia', 'SNMPv2c suporta IPv6; SNMPv3 não', 'Não há diferença funcional entre eles'],
    correct: 1,
    exp: 'SNMPv2c transmite community strings (senhas) em texto puro — uma falha de segurança grave. SNMPv3 introduz autenticação (MD5/SHA) e privacidade (DES/AES), tornando-o o padrão recomendado em ambientes corporativos.'
  },
  {
    tema: 'Protocolos',
    q: 'Um servidor responde a uma requisição DNS com TTL=300 para o registro A de api.exemplo.com. O que o resolvedor deve fazer com essa informação?',
    opts: ['Ignorar o TTL e resolver sempre em tempo real', 'Cachear o resultado por 300 segundos antes de consultar novamente', 'Consultar o servidor a cada 300 milissegundos', 'Usar o registro por exatamente 300 consultas'],
    correct: 1,
    exp: 'TTL (Time To Live) em DNS especifica em segundos por quanto tempo o registro pode ser cacheado. TTL=300 significa 5 minutos. Após expirar, o resolvedor deve consultar o servidor autoritativo novamente.'
  },
  {
    tema: 'Protocolos',
    q: 'O que é OSPF e como ele determina o melhor caminho?',
    opts: ['Protocolo de vetor de distância que usa contagem de saltos', 'Protocolo de estado de enlace que usa custo baseado na largura de banda para calcular o menor caminho via algoritmo Dijkstra', 'Protocolo de roteamento externo baseado em políticas', 'Protocolo de roteamento estático para redes pequenas'],
    correct: 1,
    exp: 'OSPF é um protocolo IGP de estado de enlace. Cada roteador mapeia a topologia completa e calcula o melhor caminho usando o algoritmo SPF de Dijkstra. O custo padrão é 10^8 / largura de banda em bps.'
  },
  {
    tema: 'Protocolos',
    q: 'Qual protocolo permite que um servidor web receba múltiplos domínios no mesmo IP e porta 443?',
    opts: ['HTTP/2', 'SNI (Server Name Indication) no TLS', 'HSTS', 'DNS round-robin'],
    correct: 1,
    exp: 'SNI é uma extensão do TLS onde o cliente informa o hostname desejado no ClientHello, antes de a criptografia ser estabelecida. Isso permite que o servidor selecione o certificado correto para múltiplos domínios no mesmo IP.'
  },

  /* ── Acesso a Site (novas) ────────────────────────── */
  {
    tema: 'Acesso a Site',
    q: 'Ao digitar "http://exemplo.com" no navegador, qual é a ordem correta das etapas iniciais?',
    opts: ['TCP handshake → DNS lookup → HTTP GET', 'DNS lookup → TCP handshake → HTTP GET', 'HTTP GET → DNS lookup → TCP handshake', 'DNS lookup → HTTP GET → TCP handshake'],
    correct: 1,
    exp: 'O navegador precisa do IP do domínio antes de conectar. Ordem: 1) DNS lookup para obter o IP; 2) TCP three-way handshake para estabelecer conexão; 3) HTTP GET para requisitar o recurso.'
  },
  {
    tema: 'Acesso a Site',
    q: 'O que significa um servidor retornar o código HTTP 503?',
    opts: ['Recurso não encontrado', 'Redirecionamento permanente', 'Serviço temporariamente indisponível (servidor sobrecarregado ou em manutenção)', 'Autenticação necessária'],
    correct: 2,
    exp: '503 Service Unavailable indica que o servidor está temporariamente incapaz de processar a requisição, geralmente por sobrecarga ou manutenção. Diferente do 500 (erro interno) e do 404 (não encontrado).'
  },
  {
    tema: 'Acesso a Site',
    q: 'Durante o handshake TLS 1.3, o cliente envia um ClientHello. Quais informações ele inclui?',
    opts: ['Apenas o certificado do cliente', 'Versões TLS suportadas, cipher suites suportados, extensão SNI e parâmetros de troca de chaves', 'Apenas o nome do servidor (SNI)', 'Login e senha do usuário para autenticação'],
    correct: 1,
    exp: 'No ClientHello (TLS 1.3), o cliente anuncia: versões TLS suportadas, lista de cipher suites, extensão SNI com o hostname, e key shares para Diffie-Hellman. O TLS 1.3 reduziu o handshake para 1-RTT.'
  },
  {
    tema: 'Acesso a Site',
    q: 'Um usuário relata que ao acessar o site da empresa de fora do escritório recebe erro de certificado SSL inválido, mas dentro funciona. O que pode estar causando isso?',
    opts: ['O servidor DNS externo está errado', 'O firewall interno faz inspeção SSL e apresenta seu próprio certificado; fora da rede, o certificado real é diferente', 'O site usa HTTP/2 apenas internamente', 'O gateway padrão externo está incorreto'],
    correct: 1,
    exp: 'Firewalls com Deep Packet Inspection (DPI/SSL Inspection) interceptam conexões TLS e apresentam um certificado próprio. Internamente, o certificado da CA corporativa é confiável nos dispositivos da empresa. Externamente, esse certificado não é confiável.'
  },
  {
    tema: 'Acesso a Site',
    q: 'O que é uma CDN (Content Delivery Network) e qual problema de rede ela resolve?',
    opts: ['Uma rede privada virtual que criptografa todo tráfego', 'Uma rede de servidores distribuídos geograficamente que entrega conteúdo do ponto mais próximo do usuário, reduzindo latência', 'Um protocolo de aceleração do TCP', 'Um sistema de cache DNS distribuído'],
    correct: 1,
    exp: 'CDNs distribuem cópias do conteúdo em servidores (PoPs) ao redor do mundo. O usuário é direcionado ao servidor mais próximo (via anycast ou DNS), reduzindo drasticamente a latência de propagação.'
  },

  /* ── Equipamentos (novas) ─────────────────────────── */
  {
    tema: 'Equipamentos',
    q: 'Qual é a diferença entre um hub e um switch?',
    opts: ['Hub opera na Camada 3; switch na Camada 2', 'Hub repete o sinal para todas as portas (domínio de colisão compartilhado); switch encaminha quadros apenas para a porta de destino', 'Switch é mais barato que hub', 'Hub suporta VLANs; switch não'],
    correct: 1,
    exp: 'Hubs são repetidores Layer 1: enviam tudo para todos, criando um único domínio de colisão. Switches operam na Camada 2, aprendem MACs e encaminham seletivamente, criando domínios de colisão individuais por porta.'
  },
  {
    tema: 'Equipamentos',
    q: 'O que é uma VLAN e qual problema ela resolve?',
    opts: ['Uma rede virtual que substitui o roteamento IP', 'Uma segmentação lógica da Camada 2 que divide um switch físico em múltiplos domínios de broadcast isolados', 'Um protocolo de redundância para switches', 'Um método de compressão de quadros Ethernet'],
    correct: 1,
    exp: 'VLANs (IEEE 802.1Q) segmentam logicamente a rede na Camada 2, isolando domínios de broadcast sem precisar de hardware separado. Aumentam segurança (RH isolado de TI) e reduzem broadcast desnecessário.'
  },
  {
    tema: 'Equipamentos',
    q: 'Um roteador recebe um pacote para 192.168.5.0/24 mas sua tabela de roteamento tem apenas uma rota default (0.0.0.0/0). O que ele faz?',
    opts: ['Descarta o pacote e envia ICMP Network Unreachable', 'Encaminha o pacote pela rota default (longest prefix match: 0.0.0.0/0 é válida)', 'Solicita ARP para descobrir o próximo salto', 'Fragmenta o pacote e tenta múltiplas rotas'],
    correct: 1,
    exp: 'A rota default (0.0.0.0/0) corresponde a qualquer destino e é usada quando não há rota mais específica. É o "gateway de último recurso". O roteador encaminha o pacote pelo next-hop da rota default.'
  },
  {
    tema: 'Equipamentos',
    q: 'O que é STP (Spanning Tree Protocol) e por que é necessário em redes com switches redundantes?',
    opts: ['Protocolo para balanceamento de carga entre enlaces redundantes', 'Protocolo que previne loops de Camada 2 bloqueando enlaces redundantes, criando uma topologia em árvore sem loops', 'Protocolo de descoberta de vizinhos em switches', 'Protocolo para agregação de links (LACP)'],
    correct: 1,
    exp: 'Sem STP, switches redundantes criam loops de broadcast: um quadro circula infinitamente, consumindo toda a banda (broadcast storm). STP elege uma Root Bridge e bloqueia portas redundantes, desbloqueando-as se o caminho primário falhar.'
  },
  {
    tema: 'Equipamentos',
    q: 'Qual é a função do protocolo ARP em uma rede local?',
    opts: ['Resolver nomes de domínio para endereços IP', 'Resolver endereços IP para endereços MAC dentro do mesmo segmento de rede', 'Atribuir endereços IP automaticamente', 'Verificar conectividade com hosts remotos'],
    correct: 1,
    exp: 'ARP (Address Resolution Protocol) permite que um host descubra o MAC de outro host dado seu IP. Envia um broadcast "quem tem IP X?" e o proprietário responde com seu MAC. Essencial para comunicação Ethernet local.'
  },
  {
    tema: 'Equipamentos',
    q: 'Sua empresa conecta dois escritórios via um link dedicado ponto-a-ponto. Qual equipamento é tipicamente usado nas extremidades desse link WAN?',
    opts: ['Switches gerenciáveis', 'Roteadores com interfaces WAN (seriais ou de fibra)', 'Access points Wi-Fi', 'Balanceadores de carga'],
    correct: 1,
    exp: 'Links WAN ponto-a-ponto (MPLS, Frame Relay, enlaces dedicados) são terminados em roteadores. O roteador tem interfaces WAN específicas e é responsável pelo encaminhamento entre a LAN local e a WAN.'
  },

  /* ── Segurança (novas) ────────────────────────────── */
  {
    tema: 'Segurança',
    q: 'O que é um ataque de Man-in-the-Middle (MitM) e qual protocolo de rede é frequentemente explorado para realizá-lo em LANs?',
    opts: ['Ataque de força bruta em senhas; protocolo SSH', 'Interceptação de comunicação entre dois hosts; protocolo ARP (via ARP poisoning)', 'Negação de serviço; protocolo ICMP', 'Injeção de SQL; protocolo HTTP'],
    correct: 1,
    exp: 'Em um MitM via ARP poisoning, o atacante envia respostas ARP falsas, associando seu MAC ao IP do gateway ou de outro host. O tráfego passa pelo atacante antes de chegar ao destino, permitindo interceptação.'
  },
  {
    tema: 'Segurança',
    q: 'Qual é a diferença entre um firewall stateful e um stateless?',
    opts: ['Firewall stateful opera na Camada 7; stateless na Camada 3', 'Firewall stateful rastreia o estado das conexões e permite respostas a conexões estabelecidas; stateless analisa cada pacote isoladamente', 'Firewall stateless é mais seguro que o stateful', 'Não há diferença: ambos usam as mesmas regras ACL'],
    correct: 1,
    exp: 'Um firewall stateless verifica cada pacote contra regras ACL (src/dst IP, porta, protocolo) sem considerar contexto. Um stateful mantém tabela de conexões e automaticamente permite pacotes que pertencem a conexões legítimas estabelecidas.'
  },
  {
    tema: 'Segurança',
    q: 'Um usuário relata que ao acessar o site do banco, o certificado mostra o nome correto mas o cadeado indica "não seguro". O certificado foi emitido por uma CA desconhecida. O que provavelmente está ocorrendo?',
    opts: ['O certificado expirou', 'Possível ataque MitM com certificado de CA não confiável, ou proxy corporativo com inspeção SSL', 'O navegador está desatualizado', 'O site usa HTTP/1.1 em vez de HTTP/2'],
    correct: 1,
    exp: 'Uma CA desconhecida emitindo certificado para um banco é sinal de alerta sério. Pode ser: proxy corporativo de SSL inspection usando CA interna, ou um ataque MitM com CA falsa instalada no sistema. Ambos requerem investigação imediata.'
  },
  {
    tema: 'Segurança',
    q: 'O que é port security em switches gerenciáveis e quando deve ser usado?',
    opts: ['Bloqueio de portas físicas não utilizadas com tampa plástica', 'Recurso que limita quais MACs podem se comunicar por uma porta, prevenindo conexão de dispositivos não autorizados', 'Criptografia do tráfego em portas específicas do switch', 'Redundância de portas usando LACP'],
    correct: 1,
    exp: 'Port security permite configurar quais MACs são permitidos por porta (estático ou aprendido dinamicamente). Se um MAC não autorizado for detectado, a porta pode ser desativada. Previne conexão de dispositivos não autorizados à rede.'
  },
  {
    tema: 'Segurança',
    q: 'Uma VPN IPsec usa dois modos de operação principais. Qual a diferença entre modo Tunnel e modo Transport?',
    opts: ['Modo Tunnel usa UDP; modo Transport usa TCP', 'Modo Tunnel encapsula o pacote IP inteiro (incluindo cabeçalho original) em novo pacote; modo Transport encripta apenas o payload, mantendo o cabeçalho IP original', 'Modo Transport é mais seguro que Tunnel', 'Não há diferença prática entre os dois modos'],
    correct: 1,
    exp: 'No modo Tunnel (usado em VPNs site-to-site), o pacote IP original é completamente encapsulado em um novo pacote IP. No modo Transport (VPN host-to-host), apenas o payload é protegido, o cabeçalho IP original é mantido.'
  },
  {
    tema: 'Segurança',
    q: 'O que é DHCP Snooping e contra qual ataque ele protege?',
    opts: ['Recurso que monitora o desempenho do DHCP', 'Recurso de switch que protege contra servidores DHCP falsos (rogue DHCP), definindo portas confiáveis e não-confiáveis', 'Protocolo de backup para servidores DHCP', 'Método para criptografar respostas DHCP'],
    correct: 1,
    exp: 'DHCP Snooping classifica portas do switch como trusted (uplinks/servidor DHCP real) ou untrusted (portas de clientes). Mensagens DHCP OFFER/ACK vindas de portas untrusted são descartadas, prevenindo rogue DHCP servers que distribuem configurações falsas.'
  },

  /* ── Troubleshooting (novas) ──────────────────────── */
  {
    tema: 'Troubleshooting',
    q: 'Um usuário não consegue acessar nenhum site pelo nome, mas consegue fazer ping para 8.8.8.8. Qual é o diagnóstico mais provável?',
    opts: ['Problema na placa de rede', 'Problema de resolução DNS: o cliente não consegue resolver nomes para IPs', 'O gateway padrão está errado', 'Firewall bloqueando todo tráfego HTTP'],
    correct: 1,
    exp: 'Ping por IP funciona → IP e roteamento OK. Falha apenas em nomes → problema de DNS. Verificar: servidor DNS configurado (ipconfig/ifconfig), se o DNS responde (nslookup 8.8.8.8), se o DNS configurado é alcançável.'
  },
  {
    tema: 'Troubleshooting',
    q: 'Você executa "nslookup api.empresa.com" e recebe "NXDOMAIN". O que isso significa?',
    opts: ['O servidor DNS está offline', 'O domínio api.empresa.com não existe no DNS (Non-Existent Domain)', 'A resposta DNS está em cache expirado', 'O servidor DNS recusou a conexão'],
    correct: 1,
    exp: 'NXDOMAIN (Non-Existent Domain) significa que o servidor DNS autoritativo confirmou que o nome não existe. Diferente de SERVFAIL (erro no servidor) ou REFUSED (consulta rejeitada por política).'
  },
  {
    tema: 'Troubleshooting',
    q: 'Um servidor web retorna erro 502 Bad Gateway. Onde está o problema?',
    opts: ['No navegador do cliente', 'O proxy/load balancer recebeu resposta inválida do servidor de origem upstream', 'O certificado TLS expirou', 'O banco de dados do servidor está offline'],
    correct: 1,
    exp: '502 Bad Gateway indica que um servidor intermediário (proxy reverso, load balancer) recebeu uma resposta inválida ou nenhuma resposta do servidor upstream. O problema está entre o proxy e o servidor de origem, não no cliente.'
  },
  {
    tema: 'Troubleshooting',
    q: 'Após trocar um switch, alguns usuários perdem conectividade por alguns segundos. O mais provável é:',
    opts: ['O novo switch tem menos banda', 'O STP está recalculando a topologia após a mudança, bloqueando temporariamente portas durante a eleição da Root Bridge', 'Os cabos Ethernet são incompatíveis', 'O DNS não foi atualizado'],
    correct: 1,
    exp: 'O STP (802.1D) pode levar até 50 segundos para convergir após mudança topológica (estados Blocking→Listening→Learning→Forwarding). RSTP (802.1w) converge em segundos. A interrupção breve é normal durante a reconvergência do STP.'
  },
  {
    tema: 'Troubleshooting',
    q: 'Um host com IP 169.254.45.10 tenta acessar recursos da rede corporativa mas falha. Por que esse endereço é problemático?',
    opts: ['É um endereço IPv6 inválido', '169.254.0.0/16 é o range APIPA: atribuído automaticamente quando o DHCP falha; indica que o cliente não obteve IP válido', 'É um endereço de multicast reservado', 'O endereço está na faixa bloqueada pelo firewall'],
    correct: 1,
    exp: 'APIPA (Automatic Private IP Addressing) atribui IPs 169.254.0.0/16 quando o cliente DHCP não recebe resposta. Esses IPs permitem comunicação apenas link-local e não têm gateway configurado, impedindo acesso a recursos fora do segmento.'
  },
  {
    tema: 'Troubleshooting',
    q: 'Você usa o comando "iperf3 -c servidor -u -b 100M" e observa 15% de packet loss. O comando anterior com TCP não mostrou perda. O que isso indica?',
    opts: ['O servidor está sobrecarregado com conexões TCP', 'O link tem perda de pacotes que o TCP oculta com retransmissões; o UDP revela a perda real do enlace', 'O firewall bloqueia UDP mas não TCP', 'O MTU está configurado incorretamente'],
    correct: 1,
    exp: 'TCP mascara perda de pacotes com retransmissão automática — você vê throughput reduzido mas zero perda aparente. UDP não retransmite, então iperf3 revela a taxa de perda real do enlace. Pode indicar cabo ruim, interferência Wi-Fi ou buffer overflow em equipamento intermediário.'
  },

  /* ── Portas (novas) ───────────────────────────────── */
  {
    tema: 'Portas',
    q: 'Qual porta e protocolo usa o serviço RDP (Remote Desktop Protocol) da Microsoft?',
    opts: ['TCP/22', 'TCP/3389', 'UDP/3389', 'TCP/5900'],
    correct: 1,
    exp: 'RDP usa TCP/3389 por padrão. É um protocolo proprietário da Microsoft para acesso remoto a desktops Windows. VNC usa TCP/5900; SSH usa TCP/22. Expor RDP diretamente na internet é um risco de segurança significativo.'
  },
  {
    tema: 'Portas',
    q: 'Quais portas são usadas pelo protocolo BGP para estabelecer sessões entre roteadores?',
    opts: ['UDP/179', 'TCP/179', 'TCP/520', 'UDP/161'],
    correct: 1,
    exp: 'BGP (Border Gateway Protocol) usa TCP/179 para estabelecer sessões entre peers (eBGP entre ASes diferentes, iBGP dentro do mesmo AS). TCP garante a entrega confiável de atualizações de roteamento.'
  },
  {
    tema: 'Portas',
    q: 'Um servidor de monitoramento envia queries SNMP para coletar métricas de roteadores. Qual porta ele usa?',
    opts: ['TCP/162', 'UDP/161', 'UDP/162', 'TCP/161'],
    correct: 1,
    exp: 'O gerente SNMP envia queries para o agente na porta UDP/161. A porta UDP/162 é usada pelo agente para enviar traps (alertas não solicitados) ao gerente. Ambas usam UDP por serem mensagens curtas e periódicas.'
  },
  {
    tema: 'Portas',
    q: 'Você precisa transferir arquivos de forma segura de um servidor Linux. Qual porta deve estar aberta no firewall de destino?',
    opts: ['TCP/21 (FTP)', 'TCP/22 (SFTP/SCP via SSH)', 'TCP/69 (TFTP)', 'TCP/445 (SMB)'],
    correct: 1,
    exp: 'SFTP e SCP são protocolos de transferência segura que rodam sobre SSH na porta TCP/22. FTP (21) transmite dados e credenciais em texto puro. TFTP (69) usa UDP e não tem autenticação. SMB (445) é para compartilhamentos Windows.'
  },
  {
    tema: 'Portas',
    q: 'Qual porta usa o protocolo LDAPS (LDAP sobre SSL/TLS)?',
    opts: ['TCP/389', 'TCP/636', 'TCP/3268', 'TCP/88'],
    correct: 1,
    exp: 'LDAP padrão usa TCP/389 (texto puro). LDAPS (LDAP sobre SSL/TLS) usa TCP/636. Kerberos usa TCP/UDP 88. LDAP para Global Catalog usa TCP/3268 e LDAP GC sobre TLS usa TCP/3269.'
  },
  {
    tema: 'Portas',
    q: 'Um desenvolvedor reporta que sua aplicação não consegue conectar ao banco de dados PostgreSQL em servidor remoto. Qual porta TCP deve ser verificada no firewall?',
    opts: ['TCP/1433', 'TCP/3306', 'TCP/5432', 'TCP/27017'],
    correct: 2,
    exp: 'PostgreSQL usa TCP/5432 por padrão. MySQL/MariaDB usa TCP/3306. SQL Server usa TCP/1433. MongoDB usa TCP/27017. Conhecer as portas padrão dos principais bancos de dados é essencial para troubleshooting de conectividade.'
  },

  /* ── Fundamentos — cenários avançados ────────────── */
  {
    tema: 'Fundamentos',
    q: 'Uma aplicação de streaming de vídeo ao vivo prefere UDP em vez de TCP. Por quê?',
    opts: ['UDP tem menor latência: um quadro de vídeo atrasado é inútil; melhor descartá-lo do que retransmiti-lo', 'UDP suporta mais conexões simultâneas que TCP', 'TCP não suporta multimídia', 'UDP tem maior MTU que TCP'],
    correct: 0,
    exp: 'Em streaming ao vivo, retransmitir um pacote atrasado causaria mais problemas do que descartar o quadro. UDP elimina o overhead de confirmação (ACK) e retransmissão, reduzindo latência. Protocolos como RTP/RTSP usam UDP por isso.'
  },
  {
    tema: 'Fundamentos',
    q: 'O que é NAT (Network Address Translation) e qual problema ele resolve?',
    opts: ['Protocolo de roteamento que traduz rotas entre ASes', 'Mecanismo que traduz endereços IP privados para um IP público, permitindo que múltiplos hosts internos compartilhem um único IP público', 'Protocolo de criptografia para redes privadas', 'Método para converter IPv4 para IPv6'],
    correct: 1,
    exp: 'NAT (RFC 3022) permite que redes com IPs privados (RFC 1918) acessem a internet através de um único IP público. O roteador NAT mantém uma tabela de mapeamento porta:IP interno ↔ porta:IP externo (PAT/NAT overload).'
  },

  /* ── Modelos de Camadas — cenários ───────────────── */
  {
    tema: 'Modelos',
    q: 'Um engenheiro diz que "o problema está na Camada 8". O que ele quer dizer com essa expressão informal?',
    opts: ['Problema no protocolo HTTP (Camada de Aplicação)', 'Problema causado pelo usuário humano — a "Camada 8" é uma expressão informal para erro do operador', 'Problema na camada de gerenciamento de rede (SNMP)', 'Problema na camada de virtualização'],
    correct: 1,
    exp: 'A "Camada 8" é uma expressão humorística da área de TI referindo-se ao usuário humano. O modelo OSI tem 7 camadas; quando o problema é causado por erro humano (má configuração, uso incorreto), diz-se que é um problema de "Camada 8".'
  },

  /* ── Endereçamento — cenários ─────────────────────── */
  {
    tema: 'Endereçamento',
    q: 'Qual é o endereço IPv6 de loopback equivalente ao 127.0.0.1 do IPv4?',
    opts: ['FE80::1', '::1', 'FF02::1', '2001:db8::1'],
    correct: 1,
    exp: 'O endereço de loopback IPv6 é ::1/128 (todos os bits zero exceto o último). Equivalente ao 127.0.0.1 IPv4. FE80::1 seria um link-local; FF02::1 é multicast all-nodes; 2001:db8::/32 é reservado para documentação.'
  },
  {
    tema: 'Endereçamento',
    q: 'Uma empresa recebeu o bloco 203.0.113.0/24 do ISP. Precisa criar 4 sub-redes iguais. Qual máscara usar e quantos hosts por sub-rede?',
    opts: ['/25: 126 hosts por sub-rede', '/26: 62 hosts por sub-rede', '/27: 30 hosts por sub-rede', '/28: 14 hosts por sub-rede'],
    correct: 1,
    exp: '/26 divide /24 em 4 sub-redes iguais (2 bits emprestados: 2^2=4). Cada /26 tem 64 endereços − 2 (rede e broadcast) = 62 hosts utilizáveis. As redes seriam: .0/26, .64/26, .128/26, .192/26.'
  },

  /* ── Protocolos — cenários ────────────────────────── */
  {
    tema: 'Protocolos',
    q: 'Qual protocolo é usado para sincronizar a tabela de rotas entre roteadores de diferentes provedores (ASes) na internet?',
    opts: ['OSPF', 'RIP', 'BGP', 'EIGRP'],
    correct: 2,
    exp: 'BGP (Border Gateway Protocol) é o protocolo de roteamento externo (EGP) que conecta diferentes Sistemas Autônomos (ASes) na internet. É o "protocolo que mantém a internet funcionando", tomando decisões baseadas em políticas e atributos de caminho.'
  },
  {
    tema: 'Protocolos',
    q: 'O que acontece quando um cliente HTTP/1.1 envia o header "Connection: keep-alive"?',
    opts: ['A conexão TCP é encerrada após cada requisição', 'A conexão TCP é mantida aberta para múltiplas requisições HTTP, reduzindo o overhead de handshake', 'O servidor envia dados sem que o cliente solicite (server push)', 'A conexão é criptografada com TLS'],
    correct: 1,
    exp: 'Keep-alive (persistent connection) reutiliza a mesma conexão TCP para múltiplas requisições HTTP, evitando o overhead do three-way handshake para cada recurso. HTTP/1.1 usa keep-alive por padrão. HTTP/2 vai além com multiplexing.'
  },

  /* ── Acesso a Site — avançado ─────────────────────── */
  {
    tema: 'Acesso a Site',
    q: 'O que é DNS over HTTPS (DoH) e qual problema ele resolve?',
    opts: ['Um registro DNS especial para sites HTTPS', 'Encapsula consultas DNS dentro de HTTPS (porta 443), impedindo que ISPs e terceiros monitorem ou manipulem as consultas DNS', 'Um protocolo que substitui o HTTPS', 'Um método de cache DNS mais eficiente'],
    correct: 1,
    exp: 'Consultas DNS tradicionais são em texto puro (UDP/53), visíveis a qualquer interceptador. DoH encripta as consultas dentro do HTTPS, tornando-as indistinguíveis do tráfego web normal. Implementado por navegadores modernos e provedores como Cloudflare (1.1.1.1) e Google (8.8.8.8).'
  },

  /* ── Equipamentos — avançado ──────────────────────── */
  {
    tema: 'Equipamentos',
    q: 'O que é um IDS em comparação com um IPS?',
    opts: ['IDS e IPS são a mesma coisa com nomes diferentes', 'IDS detecta e alerta sobre intrusões (passivo); IPS detecta e bloqueia ativamente o tráfego malicioso (inline)', 'IDS opera na Camada 7; IPS na Camada 3', 'IPS é uma versão mais antiga do IDS'],
    correct: 1,
    exp: 'IDS (Intrusion Detection System) monitora tráfego em modo passivo (span/tap) e gera alertas. IPS (Intrusion Prevention System) fica inline no tráfego e pode bloquear pacotes maliciosos em tempo real. IPS adiciona latência mas oferece proteção ativa.'
  },
  {
    tema: 'Equipamentos',
    q: 'Em uma rede empresarial, qual é a função de um servidor proxy de saída (forward proxy)?',
    opts: ['Distribuir requisições entre múltiplos servidores internos', 'Intermediar requisições de clientes internos para a internet, permitindo cache, filtragem de conteúdo e controle de acesso', 'Fornecer endereços IP para clientes da rede', 'Balancear a carga entre múltiplos links de internet'],
    correct: 1,
    exp: 'Um forward proxy fica entre clientes internos e a internet. Benefícios: cache de conteúdo (reduz banda), filtragem de URLs/categorias, anonimização do IP real dos clientes, e log de acessos para compliance. Exemplos: Squid, Zscaler.'
  },

  /* ── Segurança — avançado ─────────────────────────── */
  {
    tema: 'Segurança',
    q: 'O que é um ataque de DNS amplification e como funciona?',
    opts: ['Ataque que corrompe o cache DNS de um servidor (cache poisoning)', 'Ataque DDoS que usa servidores DNS abertos como amplificadores: o atacante envia queries com IP de origem falsificado, e o DNS responde com respostas muito maiores à vítima', 'Ataque que intercepta consultas DNS (MitM)', 'Ataque que derruba servidores DNS com SYN flood'],
    correct: 1,
    exp: 'DNS amplification é um ataque de reflexão/amplificação: uma query DNS de ~60 bytes pode gerar resposta de ~3000 bytes (fator 50x). Com IP fonte falsificado (spoofing), o tráfego amplificado vai para a vítima. Mitigado bloqueando resolvers DNS abertos e implementando BCP38.'
  },
  {
    tema: 'Segurança',
    q: 'O que é Zero Trust Network Access (ZTNA) e como difere do modelo de segurança de perímetro tradicional?',
    opts: ['ZTNA é um firewall de próxima geração com regras mais rigorosas', 'ZTNA não confia em nenhuma conexão por padrão, mesmo internas; verifica identidade e postura do dispositivo a cada acesso, substituindo o modelo "confiar dentro do perímetro"', 'ZTNA é um protocolo de VPN mais seguro que IPsec', 'ZTNA é um IPS com machine learning'],
    correct: 1,
    exp: 'O modelo tradicional assume que tudo dentro do perímetro (firewall) é confiável. Zero Trust assume violação por padrão: cada acesso requer autenticação, autorização e verificação da postura do dispositivo, independente da localização. Segue o princípio do menor privilégio.'
  },

  /* ── Troubleshooting — avançado ───────────────────── */
  {
    tema: 'Troubleshooting',
    q: 'Um servidor Linux tem alta utilização de CPU mas baixa carga de rede. O comando "ss -s" mostra 50.000 conexões em estado CLOSE_WAIT. O que isso indica?',
    opts: ['O servidor está sendo atacado com DDoS', 'A aplicação não está fechando corretamente as conexões TCP do lado do servidor; há um bug de resource leak', 'O firewall está bloqueando FIN packets', 'O servidor precisa de mais memória RAM'],
    correct: 1,
    exp: 'CLOSE_WAIT ocorre quando o lado remoto fechou a conexão (enviou FIN) mas a aplicação local ainda não chamou close(). 50.000 conexões em CLOSE_WAIT indica bug na aplicação: ela recebe FIN mas nunca fecha o socket. Esgota file descriptors e causa falhas.'
  },
  {
    tema: 'Troubleshooting',
    q: 'Você faz ping entre dois hosts na mesma VLAN e funciona. Mas um host não consegue pingar o gateway. O gateway está em outra VLAN. Qual é a causa mais provável?',
    opts: ['Cabo de rede com defeito', 'A porta do switch conectada ao gateway não está configurada como trunk ou não permite a VLAN do host', 'O gateway tem o ARP desabilitado', 'O host tem máscara de sub-rede incorreta'],
    correct: 1,
    exp: 'Para rotear entre VLANs, o switch precisa de uma porta trunk para o roteador (ou um switch Layer 3). Se a VLAN do host não for permitida na trunk ou a subinterface do roteador não estiver configurada para essa VLAN, o tráfego inter-VLAN não flui.'
  },

  // Fundamentos
  {
    tema: 'Fundamentos',
    q: 'Um host envia um pacote com TTL=1 para um destino distante. O que acontece no primeiro roteador?',
    opts: ['O pacote é entregue normalmente', 'O TTL é decrementado para 0 e o roteador descarta o pacote enviando ICMP Time Exceeded', 'O roteador ignora o TTL e encaminha o pacote', 'O TTL é reiniciado para 64'],
    correct: 1,
    exp: 'Cada roteador decrementa o TTL em 1. Quando chega a 0, o pacote é descartado e o roteador envia uma mensagem ICMP Type 11 (Time Exceeded) de volta ao remetente. É assim que o traceroute funciona.'
  },
  {
    tema: 'Fundamentos',
    q: 'Qual é a diferença entre throughput e largura de banda (bandwidth)?',
    opts: ['São termos sinônimos', 'Bandwidth é a capacidade máxima teórica do link; throughput é a transferência real medida em condições reais', 'Throughput mede latência; bandwidth mede velocidade', 'Bandwidth só se aplica a redes sem fio'],
    correct: 1,
    exp: 'Bandwidth é o teto teórico (ex.: link de 100 Mbps). Throughput é o que realmente passa, descontando overhead de protocolo, perdas e retransmissões. O throughput real é sempre menor que o bandwidth.'
  },
  {
    tema: 'Fundamentos',
    q: 'Um técnico observa que dois computadores na mesma rede conseguem se comunicar, mas não alcançam a internet. Qual componente está mais provavelmente mal configurado?',
    opts: ['Endereço IP', 'Máscara de sub-rede', 'Gateway padrão', 'Servidor DNS'],
    correct: 2,
    exp: 'A comunicação local funciona com apenas IP e máscara corretos. Para sair da rede local rumo à internet, o dispositivo precisa de um gateway padrão válido que aponte para o roteador.'
  },
  {
    tema: 'Fundamentos',
    q: 'O que caracteriza uma rede half-duplex em comparação com full-duplex?',
    opts: ['Half-duplex transmite em frequências mais altas', 'Em half-duplex apenas um dispositivo transmite por vez; em full-duplex ambos podem transmitir simultaneamente', 'Half-duplex só existe em redes sem fio', 'Full-duplex requer dois cabos; half-duplex usa um'],
    correct: 1,
    exp: 'Half-duplex (como walkie-talkie) permite transmissão em apenas uma direção por vez. Full-duplex (como telefone) permite transmissão simultânea nos dois sentidos. Switches modernos operam em full-duplex por padrão.'
  },
  // Modelos de Camadas
  {
    tema: 'Modelos de Camadas',
    q: 'Em qual camada OSI o endereço MAC opera?',
    opts: ['Camada 1 (Física)', 'Camada 2 (Enlace de Dados)', 'Camada 3 (Rede)', 'Camada 4 (Transporte)'],
    correct: 1,
    exp: 'O endereço MAC (Media Access Control) opera na Camada 2 (Enlace de Dados). Ele identifica o dispositivo dentro de uma rede local. O roteador usa o MAC para entrega na última milha, mas o endereço IP (Camada 3) para roteamento entre redes.'
  },
  {
    tema: 'Modelos de Camadas',
    q: 'Um firewall que inspeciona o conteúdo da camada de aplicação (payload HTTP, DNS) opera em qual camada OSI?',
    opts: ['Camada 3', 'Camada 4', 'Camada 5', 'Camada 7'],
    correct: 3,
    exp: 'Firewalls de Camada 7 (Next-Generation Firewalls) inspecionam o conteúdo da aplicação — requisições HTTP, queries DNS, payloads — e não apenas IPs e portas. Isso permite regras como "bloquear upload de arquivos pelo Chrome".'
  },
  {
    tema: 'Modelos de Camadas',
    q: 'Qual é a PDU (unidade de dados) da Camada de Transporte no modelo OSI?',
    opts: ['Bit', 'Frame (Quadro)', 'Pacote', 'Segmento'],
    correct: 3,
    exp: 'Cada camada OSI tem seu nome para a unidade de dados: Física=Bit, Enlace=Frame, Rede=Pacote, Transporte=Segmento, e Sessão/Apresentação/Aplicação=Dados/Mensagem.'
  },
  {
    tema: 'Modelos de Camadas',
    q: 'Um switch Camada 2 recebe um frame com MAC de destino desconhecido. O que ele faz?',
    opts: ['Descarta o frame', 'Envia o frame apenas para a porta do gateway', 'Encaminha (flood) o frame para todas as portas, exceto a de origem', 'Devolve o frame ao remetente com erro'],
    correct: 2,
    exp: 'Quando o MAC de destino não está na tabela CAM do switch, ele faz flooding: envia o frame para todas as portas exceto a de origem. O dispositivo correto responde, e o switch aprende o MAC e registra a porta correspondente.'
  },
  // Endereçamento
  {
    tema: 'Endereçamento',
    q: 'Um host com IP 10.0.0.5/29 tenta se comunicar com 10.0.0.12. Esses dois hosts estão na mesma sub-rede?',
    opts: ['Sim, ambos estão na rede 10.0.0.0/29', 'Não, 10.0.0.5 está na rede 10.0.0.0/29 e 10.0.0.12 está na rede 10.0.0.8/29', 'Sim, /29 cobre toda a faixa 10.0.0.0–10.0.0.15', 'Não é possível determinar sem a máscara completa'],
    correct: 1,
    exp: '/29 usa 29 bits de rede, deixando 3 bits para hosts: blocos de 8 endereços. Rede 10.0.0.0/29 cobre .0–.7; rede 10.0.0.8/29 cobre .8–.15. Logo, .5 e .12 estão em sub-redes diferentes e precisam de roteamento.'
  },
  {
    tema: 'Endereçamento',
    q: 'Qual é o endereço de broadcast da rede 192.168.10.64/26?',
    opts: ['192.168.10.127', '192.168.10.128', '192.168.10.255', '192.168.10.95'],
    correct: 0,
    exp: '/26 tem blocos de 64 endereços. A rede 192.168.10.64/26 vai de .64 (endereço de rede) a .127 (broadcast). O último endereço do bloco é sempre o broadcast.'
  },
  {
    tema: 'Endereçamento',
    q: 'Qual comando exibiria a tabela ARP em um sistema Linux?',
    opts: ['arp -a', 'ip neigh show', 'netstat -r', 'Tanto A quanto B'],
    correct: 3,
    exp: 'Tanto "arp -a" (comando legado) quanto "ip neigh show" (iproute2, comando moderno) exibem a tabela ARP no Linux. A tabela ARP mapeia endereços IP para MACs na rede local.'
  },
  {
    tema: 'Endereçamento',
    q: 'Um host recebe o endereço 169.254.10.5. O que isso indica?',
    opts: ['O host está em uma rede privada classe B', 'O DHCP atribuiu um endereço APIPA — o host não conseguiu um endereço DHCP válido', 'O host está usando IPv6 link-local', 'O IP foi atribuído manualmente pelo administrador'],
    correct: 1,
    exp: '169.254.0.0/16 é o bloco APIPA (Automatic Private IP Addressing). O Windows e outros SOs atribuem um IP dessa faixa automaticamente quando o cliente DHCP não recebe resposta. O host pode se comunicar com outros hosts APIPA na mesma rede, mas não acessa a internet.'
  },
  {
    tema: 'Endereçamento',
    q: 'Você precisa criar 5 sub-redes com no mínimo 25 hosts cada, a partir de 192.168.1.0/24. Qual é o menor prefixo que atende ao requisito?',
    opts: ['/26', '/27', '/28', '/25'],
    correct: 1,
    exp: '/27 tem 32 endereços por bloco, 30 utilizáveis por hosts — suficiente para 25 hosts. /28 teria apenas 14 utilizáveis, insuficiente. Com /27 você tem 8 sub-redes disponíveis em /24, cobrindo as 5 necessárias.'
  },
  // Protocolos
  {
    tema: 'Protocolos',
    q: 'Por que o DNS usa UDP na porta 53 para consultas, mas TCP na mesma porta para transferências de zona?',
    opts: ['UDP é mais seguro para consultas', 'Consultas são pequenas e UDP é mais rápido; transferências de zona são grandes e requerem a confiabilidade do TCP', 'TCP é reservado para servidores autoritativos', 'UDP não suporta respostas maiores que 512 bytes em nenhum caso'],
    correct: 1,
    exp: 'Consultas DNS são curtas (< 512 bytes): UDP elimina o overhead do handshake TCP e é suficiente. Transferências de zona (zona inteira de um servidor para outro) são grandes e críticas: o TCP garante entrega ordenada e sem perda. Desde o EDNS0, consultas UDP podem ter até 4096 bytes.'
  },
  {
    tema: 'Protocolos',
    q: 'O que é um handshake TLS 1.3 comparado ao TLS 1.2?',
    opts: ['TLS 1.3 remove a criptografia em troca de velocidade', 'TLS 1.3 completa o handshake em 1-RTT (ou 0-RTT para reconexões), versus 2-RTT do TLS 1.2', 'TLS 1.3 usa apenas certificados ECC', 'Não há diferença prática de desempenho'],
    correct: 1,
    exp: 'TLS 1.3 reduziu o handshake de 2 round-trips (TLS 1.2) para 1 RTT, removendo cifras legadas e simplificando a negociação. Para reconexões, o 0-RTT permite retomar a sessão sem round-trip adicional. Isso reduz a latência de conexões HTTPS.'
  },
  {
    tema: 'Protocolos',
    q: 'Um aplicativo precisa transmitir dados de vídeo ao vivo com a menor latência possível, aceitando eventual perda de frames. Qual protocolo de transporte é mais adequado?',
    opts: ['TCP', 'UDP', 'ICMP', 'FTP'],
    correct: 1,
    exp: 'UDP não tem handshake, confirmação (ACK) nem retransmissão. Isso minimiza a latência. Para streaming ao vivo, um frame perdido é melhor descartado do que retransmitido (o que atrasaria todos os frames seguintes). Aplicações de vídeo implementam seu próprio controle de qualidade sobre UDP (ex.: QUIC, RTP).'
  },
  {
    tema: 'Protocolos',
    q: 'Qual registro DNS aponta um domínio para outro domínio (alias)?',
    opts: ['Registro A', 'Registro AAAA', 'Registro CNAME', 'Registro MX'],
    correct: 2,
    exp: 'CNAME (Canonical Name) cria um alias de um nome para outro. Ex.: www.empresa.com CNAME empresa.com. O cliente resolve empresa.com separadamente. O CNAME não pode coexistir com outros registros no mesmo nome.'
  },
  {
    tema: 'Protocolos',
    q: 'O que é o campo "window size" no cabeçalho TCP?',
    opts: ['O número máximo de conexões simultâneas', 'A quantidade de dados que o receptor consegue aceitar sem enviar um ACK', 'O tempo máximo de espera por retransmissão', 'O número de sequência do próximo segmento'],
    correct: 1,
    exp: 'O window size (tamanho da janela) implementa o controle de fluxo TCP: informa ao remetente quantos bytes o receptor ainda consegue receber no buffer. Se o buffer encher, o receptor anuncia window size=0, pausando o remetente até que haja espaço.'
  },
  {
    tema: 'Protocolos',
    q: 'Qual é a diferença entre SMTP (porta 25) e SMTP Submission (porta 587)?',
    opts: ['Porta 25 usa TLS; porta 587 não usa criptografia', 'Porta 25 é para relay inter-servidor; porta 587 é para clientes autenticados enviarem e-mail', 'São equivalentes; a escolha depende do cliente', 'Porta 587 é exclusiva para empresas'],
    correct: 1,
    exp: 'Porta 25 é usada entre servidores de e-mail (MTA para MTA). ISPs a bloqueiam para clientes residenciais para prevenir spam. Porta 587 (SMTP Submission) é para clientes de e-mail enviarem mensagens ao seu servidor com autenticação SASL e STARTTLS obrigatório.'
  },
  // Acesso a Site
  {
    tema: 'Acesso a Site',
    q: 'Qual é a ordem correta dos eventos ao digitar https://www.exemplo.com no browser?',
    opts: [
      'TCP handshake → DNS → TLS → HTTP GET → resposta',
      'DNS → TCP handshake → TLS handshake → HTTP GET → resposta',
      'TLS → DNS → TCP → HTTP → resposta',
      'DNS → HTTP GET → TCP → TLS → resposta'
    ],
    correct: 1,
    exp: 'A ordem é: 1) DNS resolve o nome para IP. 2) TCP three-way handshake estabelece a conexão. 3) TLS handshake negocia criptografia. 4) HTTP GET é enviado pelo túnel TLS. 5) Servidor responde com o HTML. Cada etapa depende da anterior.'
  },
  {
    tema: 'Acesso a Site',
    q: 'O que é o registro DNS SOA?',
    opts: ['Aponta um domínio para um servidor de e-mail', 'Define o servidor autoritativo principal de uma zona e parâmetros como TTL negativo e serial', 'É o alias de um domínio para outro', 'Autentica a cadeia de certificados HTTPS'],
    correct: 1,
    exp: 'SOA (Start of Authority) é o primeiro registro de uma zona DNS. Define: servidor primário, e-mail do administrador, número serial (versionamento), e intervalos de refresh, retry e expire usados pelos servidores secundários para sincronizar a zona.'
  },
  {
    tema: 'Acesso a Site',
    q: 'Um usuário reporta que o site abre pelo IP mas não pelo nome de domínio. Qual é a causa provável?',
    opts: ['O servidor web está offline', 'Há um problema na resolução DNS', 'O firewall está bloqueando HTTPS', 'O certificado TLS está expirado'],
    correct: 1,
    exp: 'Se o IP funciona mas o nome não, o problema está na camada DNS: o nome não resolve ou resolve para um IP errado. O servidor web está operacional (IP funciona). O próximo passo é usar nslookup ou dig para verificar a resolução do nome.'
  },
  {
    tema: 'Acesso a Site',
    q: 'O que o HTTP/2 melhorou em relação ao HTTP/1.1?',
    opts: ['Adicionou criptografia obrigatória', 'Introduziu multiplexação de streams: múltiplos pedidos simultâneos sobre uma única conexão TCP', 'Substituiu o TCP pelo UDP', 'Adicionou suporte a cookies'],
    correct: 1,
    exp: 'HTTP/1.1 abre uma conexão TCP por requisição (ou usa pipelining com limitações). HTTP/2 multiplexa: várias requisições e respostas trafegam em paralelo sobre uma única conexão TCP, usando frames binários. Isso elimina o head-of-line blocking e reduz latência.'
  },
  // Equipamentos
  {
    tema: 'Equipamentos',
    q: 'Qual é a vantagem de um switch gerenciável sobre um switch não gerenciável?',
    opts: ['O switch gerenciável é mais rápido', 'Permite configurar VLANs, QoS, espelhamento de portas, STP e monitoramento SNMP', 'O switch gerenciável não precisa de energia elétrica', 'Apenas switches gerenciáveis operam em full-duplex'],
    correct: 1,
    exp: 'Switches gerenciáveis (managed) permitem configuração via CLI, web ou SNMP: VLANs para segmentação de rede, QoS para priorizar tráfego, port mirroring para captura de pacotes, STP para evitar loops e SNMP para monitoramento. Switches não gerenciáveis funcionam plug-and-play sem controle.'
  },
  {
    tema: 'Equipamentos',
    q: 'O que é uma DMZ em arquitetura de redes?',
    opts: ['Uma rede sem fio pública', 'Um segmento de rede isolado entre a internet e a rede interna, onde ficam servidores publicamente acessíveis', 'Um protocolo de roteamento dinâmico', 'Uma técnica de compressão de dados'],
    correct: 1,
    exp: 'DMZ (Demilitarized Zone) é um segmento de rede posicionado entre dois firewalls: um voltado para a internet e outro para a rede interna. Servidores web, de e-mail e DNS ficam na DMZ — expostos externamente, mas separados da rede corporativa para limitar o blast radius de uma invasão.'
  },
  {
    tema: 'Equipamentos',
    q: 'Qual é a função do STP (Spanning Tree Protocol)?',
    opts: ['Balancear carga entre links redundantes', 'Prevenir loops de rede em topologias com switches redundantes bloqueando portas selecionadas', 'Criar VLANs automaticamente', 'Autenticar dispositivos na rede'],
    correct: 1,
    exp: 'Redes com switches redundantes criam loops: frames em broadcast ficam circulando infinitamente (broadcast storm). O STP resolve isso elegendo uma root bridge e bloqueando portas redundantes, mantendo apenas um caminho ativo. Se o caminho ativo falhar, STP reativa a porta bloqueada.'
  },
  {
    tema: 'Equipamentos',
    q: 'Qual é a diferença entre um roteador e um switch de camada 3?',
    opts: ['São equipamentos idênticos', 'Switch L3 roteia entre VLANs em hardware (ASIC) com latência menor; roteadores tradicionais processam em software e suportam mais protocolos WAN', 'Switch L3 não suporta roteamento inter-VLAN', 'Roteadores operam na camada 2'],
    correct: 1,
    exp: 'Ambos fazem roteamento IP, mas switches L3 usam hardware dedicado (ASIC) para encaminhamento, resultando em latência muito menor e maior throughput. Roteadores tradicionais processam pacotes em CPU de software, têm suporte a mais protocolos WAN (BGP, MPLS) e são usados em bordas de rede.'
  },
  // Segurança
  {
    tema: 'Segurança',
    q: 'O que é ARP Spoofing e como o TLS mitiga o risco?',
    opts: [
      'ARP Spoofing falsifica respostas ARP para redirecionar tráfego local; TLS criptografa os dados interceptados, tornando-os inúteis sem a chave privada',
      'ARP Spoofing é um ataque de força bruta; TLS aumenta o tamanho das chaves',
      'ARP Spoofing só funciona em redes WAN; TLS protege apenas conexões locais',
      'TLS impede completamente o ARP Spoofing'
    ],
    correct: 0,
    exp: 'No ARP Spoofing, o atacante envia respostas ARP falsas associando seu MAC ao IP do gateway, redirecionando o tráfego da vítima. O TLS não impede o redirecionamento, mas o atacante vê apenas dados cifrados — sem a chave privada do servidor, a interceptação é inútil.'
  },
  {
    tema: 'Segurança',
    q: 'O que é um ataque de força bruta e qual controle o mitiga de forma mais eficaz?',
    opts: ['Exploração de zero-day; patch imediato', 'Tentativas exaustivas de adivinhar credenciais; autenticação multifator (MFA)', 'Intercepção de tráfego; VPN', 'Engenharia social; treinamento de usuários'],
    correct: 1,
    exp: 'Força bruta testa sistematicamente combinações de senha até acertar. Mesmo com rate limiting e bloqueio de conta, é possível contorná-los com botnets distribuídas. O MFA adiciona um segundo fator (OTP, chave física) que torna as credenciais vazadas inúteis para o atacante.'
  },
  {
    tema: 'Segurança',
    q: 'Qual protocolo substitui o Telnet para acesso remoto seguro e por quê?',
    opts: ['FTP, porque usa dois canais', 'SSH, porque criptografa toda a sessão incluindo credenciais', 'HTTPS, porque usa certificados', 'RDP, porque é mais rápido'],
    correct: 1,
    exp: 'O Telnet transmite todos os dados, incluindo usuário e senha, em texto puro — qualquer sniffing na rede captura as credenciais. O SSH (porta 22) criptografa toda a sessão com criptografia assimétrica para troca de chaves e simétrica para o canal de dados.'
  },
  {
    tema: 'Segurança',
    q: 'O que diferencia um IDS de um IPS?',
    opts: ['IDS bloqueia ataques; IPS apenas registra', 'IDS detecta e alerta sobre atividade suspeita sem bloquear; IPS detecta e bloqueia automaticamente o tráfego malicioso', 'IPS é um hardware físico; IDS é um software', 'IDS analisa tráfego criptografado; IPS não consegue'],
    correct: 1,
    exp: 'IDS (Intrusion Detection System) fica no modo passivo: monitora o tráfego, detecta anomalias e gera alertas, mas não interfere no fluxo. IPS (Intrusion Prevention System) fica inline na rede: além de detectar, bloqueia o tráfego malicioso em tempo real.'
  },
  {
    tema: 'Segurança',
    q: 'O que é um ataque de ransomware em contexto de rede?',
    opts: ['Sobrecarga de um servidor com requisições legítimas', 'Malware que cifra arquivos da vítima e exige resgate, geralmente se propagando via phishing ou exploração de vulnerabilidades de rede', 'Interceptação de tráfego em rede pública', 'Falsificação de identidade em e-mail'],
    correct: 1,
    exp: 'Ransomware cifra arquivos locais e de rede (compartilhamentos) e exige pagamento pela chave de descriptografia. Entra geralmente via phishing, RDP exposto ou vulnerabilidades não corrigidas. A mitigação inclui backups offsite, segmentação de rede e princípio do menor privilégio.'
  },
  // Troubleshooting
  {
    tema: 'Troubleshooting',
    q: 'Um usuário consegue fazer ping para o gateway (192.168.1.1) mas não para 8.8.8.8. Qual é a causa mais provável?',
    opts: ['Problema no cabo de rede', 'O gateway não está roteando para a internet ou há um problema no ISP após o gateway', 'Problema de DNS', 'O firewall local está bloqueando ICMP'],
    correct: 1,
    exp: 'Ping para o gateway confirma que a rede local está funcional. Falha para 8.8.8.8 (IP direto, sem DNS) indica que o problema está no roteamento além do gateway: o roteador pode não ter rota para internet, ou há falha na conexão com o ISP.'
  },
  {
    tema: 'Troubleshooting',
    q: 'O comando "netstat -tulnp" no Linux exibe quais informações?',
    opts: ['Tabela de roteamento', 'Portas TCP e UDP em estado LISTEN com o processo responsável', 'Estatísticas de erros de interface', 'Resolução de nomes DNS'],
    correct: 1,
    exp: 'As flags significam: -t (TCP), -u (UDP), -l (apenas LISTEN), -n (IPs numéricos, sem resolução), -p (mostra o PID/processo). Esse comando é essencial para verificar quais serviços estão escutando em quais portas, útil para hardening e diagnóstico de conflito de portas.'
  },
  {
    tema: 'Troubleshooting',
    q: 'O traceroute mostra asteriscos (* * *) em todos os hops após o hop 5. O que isso indica?',
    opts: ['A rota está funcionando normalmente; asteriscos são esperados', 'O tráfego chega ao hop 5, mas os roteadores seguintes estão bloqueando ou não respondendo ao ICMP/UDP de diagnóstico', 'O TTL foi zerado no hop 5', 'Há um loop de roteamento'],
    correct: 1,
    exp: 'Asteriscos em traceroute significam que o roteador naquele hop não respondeu dentro do timeout — geralmente porque seu firewall bloqueia mensagens ICMP Time Exceeded de saída. O tráfego real pode estar passando normalmente. Confirme com ping para o destino final.'
  },
  {
    tema: 'Troubleshooting',
    q: 'Qual ferramenta do Linux permite capturar pacotes de rede diretamente na interface, similar ao Wireshark via terminal?',
    opts: ['netstat', 'tcpdump', 'nmap', 'ifconfig'],
    correct: 1,
    exp: 'tcpdump é um analisador de pacotes em linha de comando. Permite filtrar por protocolo, porta, IP de origem/destino e salvar capturas em formato .pcap legível pelo Wireshark. Ex.: tcpdump -i eth0 port 443 -w captura.pcap'
  },
  {
    tema: 'Troubleshooting',
    q: 'Um servidor web responde ao ping mas o site retorna "Connection refused" na porta 80. O que o técnico deve verificar primeiro?',
    opts: ['Configuração do DNS', 'Se o serviço web (Apache/Nginx) está rodando e escutando na porta 80', 'Rota de volta ao cliente', 'Certificado TLS'],
    correct: 1,
    exp: '"Connection refused" significa que o host respondeu mas nada está escutando na porta 80. O serviço web pode ter parado ou estar escutando em outra porta. Use "netstat -tlnp | grep :80" ou "ss -tlnp | grep :80" para confirmar se há processo escutando.'
  },
  {
    tema: 'Troubleshooting',
    q: 'Qual comando no Windows equivale ao "traceroute" do Linux?',
    opts: ['trace', 'pathping apenas', 'tracert', 'route print'],
    correct: 2,
    exp: 'No Windows, o equivalente é "tracert" (trace route). Usa ICMP Echo Requests com TTL crescente, ao contrário do traceroute Linux que por padrão usa UDP. O "pathping" também existe no Windows e combina ping e tracert, mas com estatísticas por hop.'
  },
  // Portas
  {
    tema: 'Portas',
    q: 'Um servidor retorna "Connection refused" na porta 443. Qual é a causa mais provável?',
    opts: ['O cliente não tem HTTPS habilitado', 'O serviço HTTPS não está rodando ou está escutando em outra porta', 'O certificado TLS está expirado', 'O DNS está mal configurado'],
    correct: 1,
    exp: '"Connection refused" vem do sistema operacional do servidor, não do serviço. Significa que a porta está fechada (nenhum processo escutando). O serviço HTTPS pode ter parado, estar em outra porta (ex.: 8443) ou o firewall local pode estar rejeitando conexões.'
  },
  {
    tema: 'Portas',
    q: 'Qual é o range de portas efêmeras (dinâmicas) no Linux por padrão?',
    opts: ['0–1023', '1024–49151', '32768–60999', '49152–65535'],
    correct: 2,
    exp: 'No Linux, o range de portas efêmeras padrão é 32768–60999 (configurável em /proc/sys/net/ipv4/ip_local_port_range). São usadas pelo SO para a porta de origem de conexões TCP/UDP de saída. A RFC 6335 define o range dinâmico como 49152–65535, mas o Linux usa um range diferente por padrão.'
  },
  {
    tema: 'Portas',
    q: 'Qual porta usa o protocolo LDAP para comunicação não criptografada?',
    opts: ['389', '636', '445', '88'],
    correct: 0,
    exp: 'LDAP (Lightweight Directory Access Protocol) usa a porta 389 para comunicação não criptografada. A porta 636 é usada para LDAPS (LDAP sobre TLS). LDAP é usado em Active Directory, OpenLDAP e outros serviços de diretório.'
  },
  {
    tema: 'Portas',
    q: 'Um administrador vê tráfego inesperado na porta 4444 TCP em um servidor. O que isso pode indicar?',
    opts: ['Tráfego de atualização automática', 'Possível backdoor ou shell reverso (Metasploit usa 4444 como padrão)', 'Serviço de banco de dados', 'Serviço de impressão de rede'],
    correct: 1,
    exp: 'A porta 4444 TCP é a porta padrão do Metasploit para shells reversos e é associada a diversas ferramentas de ataque. Tráfego nessa porta deve ser investigado imediatamente — pode indicar comprometimento do servidor com um backdoor ativo.'
  },
  {
    tema: 'Portas',
    q: 'Qual porta usa o protocolo SNMP para monitoramento de rede?',
    opts: ['Porta 162 TCP', 'Porta 161 UDP para polling; porta 162 UDP para traps', 'Porta 514 UDP', 'Porta 1433 TCP'],
    correct: 1,
    exp: 'SNMP (Simple Network Management Protocol) usa porta 161 UDP para o gerente consultar (poll) agentes nos dispositivos monitorados. A porta 162 UDP é usada para SNMP Traps: o dispositivo envia alertas proativamente ao gerente quando algo anormal ocorre.'
  },
  {
    tema: 'Portas',
    q: 'Quais portas usa o protocolo FTP e para que cada uma serve?',
    opts: ['Porta 20 e 21: ambas para transferência de dados', 'Porta 21 para controle (comandos); porta 20 para transferência de dados (modo ativo)', 'Porta 22 para autenticação; porta 21 para dados', 'Porta 21 apenas — a porta 20 é opcional'],
    correct: 1,
    exp: 'FTP usa duas conexões: porta 21 TCP para o canal de controle (autenticação, comandos como LIST, RETR) e porta 20 TCP para o canal de dados em modo ativo. No modo passivo, o servidor abre uma porta aleatória acima de 1024 para dados, o que facilita atravessar firewalls.'
  },
  // Mais questões de todos os temas para atingir 60 total
  {
    tema: 'Fundamentos',
    q: 'O que é QoS (Quality of Service) em redes?',
    opts: ['Uma métrica de velocidade de conexão', 'Mecanismo que prioriza certos tipos de tráfego (voz, vídeo) sobre outros (downloads) para garantir qualidade para aplicações sensíveis à latência', 'Protocolo de autenticação de rede', 'Sistema de compressão de pacotes'],
    correct: 1,
    exp: 'QoS classifica e prioriza o tráfego de rede. Voz (VoIP) e vídeo em tempo real são sensíveis a latência e jitter e recebem alta prioridade. Downloads em massa recebem menor prioridade. Sem QoS, um download grande pode degradar uma chamada de voz.'
  },
  {
    tema: 'Modelos de Camadas',
    q: 'Por que o modelo TCP/IP é mais amplamente utilizado que o modelo OSI na prática?',
    opts: ['O TCP/IP tem mais camadas e é mais completo', 'O TCP/IP foi desenvolvido antes do OSI e é o protocolo real da internet; o OSI é um modelo de referência teórico', 'O OSI foi abandonado pela IETF', 'O TCP/IP é mais seguro'],
    correct: 1,
    exp: 'O modelo OSI foi criado pela ISO como modelo de referência educacional. O TCP/IP surgiu da ARPANET e se tornou o protocolo real da internet antes do OSI ser finalizado. Na prática, o TCP/IP é implementado; o OSI é usado para entender e diagnosticar redes por camadas.'
  },
  {
    tema: 'Endereçamento',
    q: 'O que é o protocolo DHCP Snooping e para que serve?',
    opts: ['Um protocolo de descoberta de roteadores DHCP', 'Uma funcionalidade de switches que filtra mensagens DHCP inválidas, prevenindo servidores DHCP não autorizados (rogue DHCP)', 'Um método de criptografia para tráfego DHCP', 'Um protocolo para redundância de servidores DHCP'],
    correct: 1,
    exp: 'DHCP Snooping é configurado em switches gerenciáveis. Ele define portas "confiáveis" (uplinks para o servidor DHCP legítimo) e "não confiáveis" (portas de acesso). Mensagens DHCP Offer e Ack vindas de portas não confiáveis são descartadas, impedindo que um atacante distribua IPs falsos.'
  },
  {
    tema: 'Protocolos',
    q: 'O que são os flags SYN, ACK e FIN no TCP e para que servem?',
    opts: ['São tipos de erro TCP', 'SYN inicia conexão; ACK confirma recebimento; FIN encerra a conexão ordeiramente', 'SYN criptografa; ACK autentica; FIN comprime', 'São apenas headers opcionais'],
    correct: 1,
    exp: 'SYN (synchronize) abre conexão no three-way handshake. ACK (acknowledgment) confirma o recebimento de dados ou de outros flags. FIN (finish) inicia o encerramento gracioso de uma conexão TCP (four-way termination: FIN, ACK, FIN, ACK). RST encerra abruptamente.'
  },
  {
    tema: 'Acesso a Site',
    q: 'O que é um ataque de DNS Spoofing e como o DNSSEC mitiga?',
    opts: ['DNS Spoofing filtra consultas DNS; DNSSEC aumenta a velocidade', 'DNS Spoofing injeta respostas DNS falsas redirecionando usuários para sites maliciosos; DNSSEC assina digitalmente os registros DNS para verificar autenticidade', 'DNSSEC criptografa o conteúdo DNS; DNS Spoofing quebra a criptografia', 'DNSSEC é obrigatório em todos os domínios .com'],
    correct: 1,
    exp: 'No DNS Spoofing, o atacante envia uma resposta DNS falsa antes do servidor legítimo, envenenando o cache. DNSSEC adiciona assinaturas digitais aos registros DNS (RRSIG). O resolver valida a assinatura com a chave pública do domínio — registros falsificados não passam na verificação.'
  },
  {
    tema: 'Equipamentos',
    q: 'O que é PoE (Power over Ethernet) e onde é utilizado?',
    opts: ['Um protocolo de balanceamento de carga', 'Tecnologia que transmite energia elétrica junto com dados pelo cabo Ethernet, eliminando fontes separadas em dispositivos como APs, câmeras IP e telefones VoIP', 'Um padrão de cabeamento para 10 Gbps', 'Sistema de failover para switches'],
    correct: 1,
    exp: 'PoE (IEEE 802.3af/at/bt) permite que um switch PoE alimente dispositivos via cabo Cat5e/Cat6. Elimina a necessidade de tomadas próximas a cada AP, câmera IP ou telefone VoIP. O switch detecta se o dispositivo suporta PoE antes de enviar energia.'
  },
  {
    tema: 'Segurança',
    q: 'O que é o princípio de menor privilégio (Principle of Least Privilege) em segurança de redes?',
    opts: ['Usar as senhas mais curtas possíveis', 'Conceder a cada usuário, processo ou sistema apenas as permissões mínimas necessárias para sua função, reduzindo o impacto de comprometimentos', 'Permitir acesso total apenas ao administrador', 'Desabilitar todos os serviços não essenciais'],
    correct: 1,
    exp: 'PoLP limita o blast radius: se uma conta ou processo for comprometido, o atacante só tem acesso ao mínimo necessário. Em redes, isso se aplica a ACLs (um servidor web não precisa rotear para redes internas), contas de serviço (sem admin) e segmentação de VLANs.'
  },
  {
    tema: 'Troubleshooting',
    q: 'Um script bash tenta conectar na porta 443 de um servidor e recebe "Connection timed out" em vez de "Connection refused". Qual é a diferença?',
    opts: ['São equivalentes', 'Connection refused: porta fechada, host respondeu; Connection timed out: host não respondeu — pode estar offline, firewall descartando silenciosamente (DROP) ou rota inexistente', 'Timed out ocorre apenas em UDP', 'Refused indica problema de SSL'],
    correct: 1,
    exp: '"Connection refused" (RST) significa que o host está ativo mas nada escuta na porta — resposta imediata. "Connection timed out" significa que nenhuma resposta chegou no tempo limite: o host pode estar offline, um firewall com regra DROP (silencioso) está bloqueando, ou não há rota de volta.'
  },
  {
    tema: 'Portas',
    q: 'Qual porta usa o protocolo NTP (Network Time Protocol) e por que a sincronização de tempo é crítica em redes?',
    opts: ['Porta 123 UDP; a sincronização de tempo é importante para logs, autenticação Kerberos e certificados digitais terem timestamps corretos', 'Porta 80 TCP; para sincronizar relógios de servidores web', 'Porta 443 TCP; para sincronização segura', 'Porta 53 UDP; NTP usa a infraestrutura DNS'],
    correct: 0,
    exp: 'NTP usa porta 123 UDP. Tempo correto é crítico: Kerberos (autenticação Active Directory) rejeita tickets com mais de 5 minutos de diferença. Logs com timestamps errados dificultam forensics. Certificados X.509 têm validade baseada em tempo — um relógio errado pode invalidar HTTPS.'
  },
  {
    tema: 'Fundamentos',
    q: 'O que é CSMA/CD e em qual tecnologia ele é usado?',
    opts: ['Protocolo de roteamento; usado em redes sem fio', 'Carrier Sense Multiple Access with Collision Detection; usado em Ethernet half-duplex para gerenciar colisões de quadros', 'Protocolo de criptografia; usado em VPNs', 'Algoritmo de compressão; usado em cabos de fibra óptica'],
    correct: 1,
    exp: 'CSMA/CD é o mecanismo de acesso ao meio do Ethernet half-duplex: "ouça antes de transmitir" (Carrier Sense), "detecte colisões" (CD) e transmita novamente após espera aleatória. Com switches full-duplex modernos, cada porta é um domínio de colisão separado e o CSMA/CD é obsoleto.'
  },
  {
    tema: 'Modelos de Camadas',
    q: 'O que é o conceito de "camada N depende da camada N-1" no modelo OSI?',
    opts: ['Cada camada fornece serviços apenas para a camada imediatamente superior', 'Camadas superiores só funcionam se as camadas inferiores estiverem operacionais — a Camada de Aplicação falha se a Física não transmite bits', 'Camadas podem se comunicar diretamente saltando camadas intermediárias', 'Apenas as camadas pares se comunicam entre hosts'],
    correct: 1,
    exp: 'No modelo OSI, cada camada usa os serviços da camada abaixo para oferecer serviços à camada acima. Por isso, no troubleshooting, começamos pela Camada 1 (cabo/física) antes de verificar a Camada 7 (aplicação): não adianta verificar DNS se o cabo está desconectado.'
  },
  {
    tema: 'Endereçamento',
    q: 'O que é um endereço IP anycast e como ele difere de unicast e multicast?',
    opts: [
      'Anycast é um IP atribuído a um único host; unicast a grupos; multicast a todos',
      'Unicast: um para um; Multicast: um para muitos assinantes; Anycast: um endereço atribuído a múltiplos nós — o pacote é entregue ao mais próximo topologicamente',
      'Anycast só existe no IPv6',
      'Anycast e broadcast são sinônimos'
    ],
    correct: 1,
    exp: 'Anycast atribui o mesmo IP a múltiplos servidores geograficamente distribuídos. O roteamento BGP direciona o pacote ao servidor "mais próximo". O DNS raiz usa anycast: os 13 nomes de servidores raiz são servidos por centenas de instâncias distribuídas pelo mundo.'
  },
  {
    tema: 'Segurança',
    q: 'O que é um ataque de "credential stuffing"?',
    opts: ['Ataque de força bruta em senhas aleatórias', 'Uso automatizado de pares usuário/senha vazados de outros serviços para tentar login em outros sistemas', 'Falsificação de certificados digitais', 'Sobrecarga de servidores de autenticação'],
    correct: 1,
    exp: 'Credential stuffing usa listas de credenciais de vazamentos anteriores (have i been pwned) e as testa automaticamente em outros serviços. É eficaz porque usuários reutilizam senhas. A defesa inclui MFA, detecção de logins de IPs incomuns e senhas únicas por serviço.'
  },
  {
    tema: 'Troubleshooting',
    q: 'Qual é a diferença entre "ss" e "netstat" para verificar conexões de rede no Linux?',
    opts: ['São idênticos em funcionalidade', 'ss é mais rápido e moderno (usa kernel diretamente via netlink); netstat é legado e mais lento em sistemas com muitas conexões', 'netstat exibe mais informações que ss', 'ss só funciona no Ubuntu'],
    correct: 1,
    exp: '"ss" (socket statistics) faz parte do pacote iproute2, consulta o kernel diretamente via netlink socket e é muito mais eficiente com grande número de conexões. "netstat" lê /proc/net/* e é mais lento. Para novos sistemas, prefira: ss -tulnp (equivale a netstat -tulnp).'
  },
  {
    tema: 'Acesso a Site',
    q: 'O que é o header HTTP "Content-Security-Policy" e para que serve?',
    opts: ['Define o tipo de conteúdo da resposta', 'Instrui o browser a restringir de quais origens scripts, estilos e recursos podem ser carregados, mitigando XSS', 'Força o uso de HTTPS', 'Controla o cache do browser'],
    correct: 1,
    exp: 'CSP é um header de segurança que diz ao browser: "só aceite scripts de domínios X, estilos de Y, imagens de Z". Isso mitiga ataques XSS (Cross-Site Scripting) pois mesmo que o atacante injete um <script>, o browser bloqueará a execução se a origem não estiver na whitelist da CSP.'
  },
  {
    tema: 'Equipamentos',
    q: 'O que é uma VLAN e qual problema ela resolve?',
    opts: ['Uma rede virtual que aumenta a velocidade das portas', 'Segmentação lógica de uma rede física em múltiplos domínios de broadcast independentes, isolando o tráfego sem precisar de hardware separado', 'Um protocolo para balancear tráfego entre switches', 'Uma técnica de criptografia para redes locais'],
    correct: 1,
    exp: 'VLANs (IEEE 802.1Q) permitem que um mesmo switch físico opere como múltiplos switches lógicos isolados. Cada VLAN é um domínio de broadcast separado. Uso típico: VLAN 10 para usuários, VLAN 20 para servidores, VLAN 30 para câmeras — isolados logicamente sem precisar de switches físicos separados.'
  }
];
