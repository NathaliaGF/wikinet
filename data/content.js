/* ── RedesWiki — All content data ────────────────────── */
'use strict';

const MODULES = [
  {
    id: 'fundamentos',
    num: 1,
    title: 'Fundamentos de Redes',
    description: 'O que é uma rede, IP, portas, pacotes, latência e banda.',
    icon: '🌐',
    url: 'pages/fundamentos.html',
    sections: ['oque-e-rede','cliente-servidor','endereço-ip','portas','pacotes','latencia-banda-jitter']
  },
  {
    id: 'modelos',
    num: 2,
    title: 'Modelos de Camadas',
    description: 'OSI (7 camadas) e TCP/IP (4 camadas) com comparação detalhada.',
    icon: '🏛️',
    url: 'pages/modelos.html',
    sections: ['por-que-camadas','modelo-osi','modelo-tcpip','comparacao-osi-tcpip','mnemonico']
  },
  {
    id: 'enderecamento',
    num: 3,
    title: 'Endereçamento',
    description: 'IPv4, IPv6, sub-redes, CIDR, NAT, ARP e gateway.',
    icon: '📍',
    url: 'pages/endere%C3%A7amento.html',
    sections: ['ipv4','mascara-subrede','cidr','ipv6','gateway','nat','arp']
  },
  {
    id: 'protocolos',
    num: 4,
    title: 'Protocolos Principais',
    description: 'TCP, UDP, DNS, DHCP, HTTP/S, TLS, FTP, SSH, SMTP, SIP.',
    icon: '🔌',
    url: 'pages/protocolos.html',
    sections: ['tcp-vs-udp','dns','dhcp','http-https','tls','outros-protocolos','sip']
  },
  {
    id: 'acesso-site',
    num: 5,
    title: 'O que Acontece ao Acessar um Site',
    description: 'Timeline completa: DNS → TCP → TLS → HTTP → renderização.',
    icon: '🌍',
    url: 'pages/acesso-site.html',
    sections: ['visao-geral','dns-resolucao','tcp-handshake','tls-handshake','http-request','resposta-render']
  },
  {
    id: 'equipamentos',
    num: 6,
    title: 'Equipamentos de Rede',
    description: 'Roteadores, switches, firewalls e proxies — diferenças reais.',
    icon: '🖥️',
    url: 'pages/equipamentos.html',
    sections: ['roteador','switch','firewall','proxy']
  },
  {
    id: 'seguranca',
    num: 7,
    title: 'Segurança Básica',
    description: 'Firewalls, MITM, DDoS, spoofing, phishing e VPN.',
    icon: '🔒',
    url: 'pages/seguran%C3%A7a.html',
    sections: ['firewall-tipos','ataques','vpn']
  },
  {
    id: 'troubleshooting',
    num: 8,
    title: 'Troubleshooting',
    description: 'Como diagnosticar problemas de rede com ping, traceroute, nslookup.',
    icon: '🔧',
    url: 'pages/troubleshooting.html',
    sections: ['metodologia','ping','traceroute','nslookup','netstat','fluxo-diagnostico']
  },
  {
    id: 'portas',
    num: 9,
    title: 'Portas Conhecidas',
    description: 'Tabela completa das portas mais importantes e seus serviços.',
    icon: '🚪',
    url: 'pages/portas.html',
    sections: ['o-que-sao-portas','tabela-portas','dicas']
  }
];

const STUDY_PATH = [
  { step: 1, title: 'Comece pelo Módulo 1 — Fundamentos', desc: 'Entenda o que é IP, porta e pacote antes de qualquer coisa.' },
  { step: 2, title: 'Siga para Modelos de Camadas (Módulo 2)', desc: 'O modelo OSI é a linguagem universal de redes. Memorize as 7 camadas.' },
  { step: 3, title: 'Estude Endereçamento (Módulo 3)', desc: 'IPv4, máscara de sub-rede e NAT são conceitos que aparecem em TODO lugar.' },
  { step: 4, title: 'Aprenda os Protocolos (Módulo 4)', desc: 'DNS, TCP/UDP e HTTP/HTTPS são usados diariamente. Entenda como funcionam.' },
  { step: 5, title: 'Acesso a um site (Módulo 5)', desc: 'Esse módulo consolida tudo: é a prática dos módulos anteriores.' },
  { step: 6, title: 'Equipamentos e Segurança (Módulos 6 e 7)', desc: 'Contextualize o hardware e as ameaças do mundo real.' },
  { step: 7, title: 'Troubleshooting + Portas (Módulos 8 e 9)', desc: 'Referência prática para o dia a dia.' }
];

/* ── Flashcards ──────────────────────────────────────── */
const FLASHCARDS = {
  fundamentos: [
    { q: 'O que é uma rede de computadores?', a: 'Conjunto de dois ou mais dispositivos interconectados que conseguem trocar dados e compartilhar recursos como impressoras, internet e arquivos.' },
    { q: 'Qual a diferença entre cliente e servidor?', a: 'O cliente inicia uma requisição (pede algo). O servidor processa essa requisição e envia uma resposta. Um mesmo computador pode ser os dois ao mesmo tempo.' },
    { q: 'O que é um endereço IP?', a: 'Um número único que identifica cada dispositivo em uma rede. É como o endereço de uma casa: sem ele, ninguém sabe para onde enviar os dados.' },
    { q: 'O que é uma porta de rede?', a: 'Um número (0–65535) que identifica qual serviço/aplicação dentro de um computador deve receber os dados. IP = endereço da casa, porta = número do apartamento.' },
    { q: 'O que é um pacote de dados?', a: 'Um pedaço pequeno de informação, com cabeçalho (remetente, destinatário, sequência) e dados. Uma mensagem grande é dividida em vários pacotes.' },
    { q: 'O que é latência e como ela é medida?', a: 'Tempo que um pacote leva para ir do ponto A ao ponto B e voltar (RTT). Medida em milissegundos (ms). Valores abaixo de 50ms são considerados bons.' },
    { q: 'O que é largura de banda (bandwidth)?', a: 'A capacidade máxima de transferência de dados de um link, medida em Mbps ou Gbps. É o tamanho do "cano" — não confunda com velocidade.' },
    { q: 'O que é jitter?', a: 'A variação no tempo de chegada de pacotes consecutivos. Alta jitter = pacotes chegando em intervalos irregulares = problema para chamadas de voz e vídeo.' }
  ],
  modelos: [
    { q: 'Quantas camadas tem o modelo OSI?', a: '7 camadas: Física, Enlace de Dados, Rede, Transporte, Sessão, Apresentação e Aplicação.' },
    { q: 'Qual é a função da camada de Transporte (OSI)?', a: 'Garantir a entrega confiável (TCP) ou rápida (UDP) dos dados entre aplicações. Responsável por portas, segmentação e controle de fluxo.' },
    { q: 'Qual mnemônico para as 7 camadas OSI (de baixo para cima)?', a: '"Físicos Engenheiros Nunca Tomam Shots Antes do Almoço": Física, Enlace, Rede, Transporte, Sessão, Apresentação, Aplicação.' },
    { q: 'Quantas camadas tem o modelo TCP/IP?', a: '4 camadas: Acesso à Rede, Internet, Transporte e Aplicação.' },
    { q: 'Qual camada OSI é responsável pelo roteamento entre redes?', a: 'Camada 3 — Rede. É aqui que o endereço IP opera e os roteadores tomam decisões de caminho.' },
    { q: 'O que é encapsulamento em redes?', a: 'O processo de adicionar um cabeçalho (e às vezes um trailer) em cada camada conforme os dados descem na pilha, antes de serem transmitidos.' },
    { q: 'O que acontece na camada de Apresentação (OSI)?', a: 'Traduz dados entre o formato da aplicação e o formato de rede. Cuida de codificação (UTF-8, ASCII), compressão e criptografia básica.' }
  ],
  enderecamento: [
    { q: 'Quantos bits tem um endereço IPv4?', a: '32 bits, divididos em 4 octetos separados por ponto. Ex.: 192.168.1.10' },
    { q: 'O que significa /24 em CIDR?', a: '24 bits são usados para identificar a rede, restando 8 bits para hosts. Isso dá 254 endereços utilizáveis (256 - rede - broadcast).' },
    { q: 'Quantos bits tem um endereço IPv6?', a: '128 bits, escritos em 8 grupos de 4 dígitos hexadecimais. Ex.: 2001:0db8:85a3::8a2e:0370:7334' },
    { q: 'O que é NAT (Network Address Translation)?', a: 'Técnica que permite que vários dispositivos com IPs privados compartilhem um único IP público. O roteador "traduz" os endereços nas conversas.' },
    { q: 'O que é ARP?', a: 'Address Resolution Protocol. Descobre o endereço MAC (físico) correspondente a um endereço IP na rede local. "Quem tem o IP 192.168.1.5? Me diga seu MAC."' },
    { q: 'O que é o gateway padrão?', a: 'O roteador que conecta sua rede local ao mundo externo. Todo pacote com destino fora da sua rede é enviado para o gateway.' },
    { q: 'Qual é a faixa de IPs reservada para redes privadas?', a: '10.0.0.0/8, 172.16.0.0/12 e 192.168.0.0/16. Esses IPs nunca aparecem diretamente na internet.' }
  ],
  protocolos: [
    { q: 'Qual a diferença fundamental entre TCP e UDP?', a: 'TCP: confiável, garante entrega e ordem, tem confirmação (ACK). UDP: sem confirmação, mais rápido, aceita perda de pacotes. Use TCP para dados críticos, UDP para velocidade.' },
    { q: 'Em qual porta funciona o DNS?', a: 'Porta 53 (UDP para consultas rápidas, TCP para transferências de zona).' },
    { q: 'O que significa DHCP e para que serve?', a: 'Dynamic Host Configuration Protocol. Atribui automaticamente IP, máscara, gateway e DNS para dispositivos que entram na rede.' },
    { q: 'O que o TLS garante?', a: 'Três coisas: Confidencialidade (criptografia dos dados), Autenticação (certificado comprova que é quem diz ser) e Integridade (dados não foram alterados no caminho).' },
    { q: 'Qual porta usa o HTTPS?', a: 'Porta 443.' },
    { q: 'O que é SIP e onde ele aparece?', a: 'Session Initiation Protocol. Protocolo usado para iniciar, manter e encerrar sessões de voz e vídeo sobre IP (VoIP). Portas 5060 (UDP/TCP) e 5061 (TLS).' },
    { q: 'Qual protocolo e porta usa o SSH?', a: 'SSH usa o protocolo TCP na porta 22. Permite acesso remoto seguro a servidores com criptografia.' }
  ],
  'acesso-site': [
    { q: 'Qual é a ordem das etapas ao acessar https://exemplo.com?', a: '1) Resolução DNS 2) Conexão TCP (three-way handshake) 3) Handshake TLS 4) Requisição HTTP GET 5) Resposta do servidor 6) Renderização.' },
    { q: 'O que é o three-way handshake TCP?', a: 'Processo de estabelecer conexão em 3 passos: SYN (cliente pede), SYN-ACK (servidor aceita e confirma), ACK (cliente confirma). Depois disso a conexão está aberta.' },
    { q: 'O que é um servidor DNS recursivo?', a: 'O primeiro servidor consultado pelo seu computador. Ele busca a resposta consultando outros servidores (raiz → TLD → autoritativo) em seu nome.' },
    { q: 'O que é um servidor DNS autoritativo?', a: 'O servidor que tem a resposta definitiva sobre um domínio. É onde o dono do domínio cadastra os registros DNS (A, CNAME, MX, etc.).' },
    { q: 'O que é um registro DNS tipo A?', a: 'Mapeia um nome de domínio para um endereço IPv4. Ex.: google.com → 142.250.78.14' },
    { q: 'O que acontece durante o handshake TLS?', a: 'Cliente e servidor negociam a versão do protocolo, algoritmos de criptografia, trocam certificados e derivam chaves de sessão sem nunca enviá-las pela rede.' }
  ],
  equipamentos: [
    { q: 'Em qual camada OSI atua o roteador?', a: 'Camada 3 (Rede). O roteador lê endereços IP e decide o melhor caminho para enviar pacotes entre redes diferentes.' },
    { q: 'Em qual camada OSI atua o switch?', a: 'Camada 2 (Enlace de Dados). O switch lê endereços MAC e encaminha quadros apenas para a porta do destinatário correto, não para todos.' },
    { q: 'Qual a diferença entre um hub e um switch?', a: 'Hub envia os dados para TODAS as portas (um no máximo transmite por vez). Switch envia SOMENTE para a porta do destinatário correto (colisões são evitadas).' },
    { q: 'O que é um proxy reverso?', a: 'Servidor que fica na frente dos servidores de back-end. Recebe requisições dos clientes e as distribui aos servidores internos. Usado para balanceamento de carga e cache.' },
    { q: 'O que é um forward proxy?', a: 'Servidor intermediário entre clientes e a internet. O cliente envia requisições ao proxy, que as encaminha para a web. Usado para controle de acesso e anonimização.' },
    { q: 'O que faz um firewall de rede?', a: 'Inspeciona pacotes e decide bloquear ou permitir com base em regras (IP de origem/destino, porta, protocolo, estado da conexão).' }
  ],
  seguranca: [
    { q: 'O que é um ataque MITM (Man-in-the-Middle)?', a: 'O atacante se posiciona entre dois comunicadores sem que eles saibam, podendo espionar e alterar os dados trocados. Exemplo: em Wi-Fi público falso.' },
    { q: 'O que é DDoS?', a: 'Distributed Denial of Service. Múltiplos dispositivos comprometidos (botnet) enviam tráfego massivo a um alvo para esgotá-lo e tirá-lo do ar.' },
    { q: 'O que é IP Spoofing?', a: 'Falsificação do endereço IP de origem de um pacote para se fazer passar por outro host ou ocultar a identidade real do atacante.' },
    { q: 'O que é um firewall stateful vs stateless?', a: 'Stateless analisa cada pacote isoladamente. Stateful rastreia o estado das conexões — sabe se um pacote pertence a uma conexão legítima já estabelecida.' },
    { q: 'O que uma VPN protege?', a: 'Cria um túnel criptografado entre seu dispositivo e o servidor VPN. Protege o tráfego contra interceptação na rede intermediária (ISP, Wi-Fi público).' },
    { q: 'O que é phishing?', a: 'Técnica de engenharia social onde o atacante se faz passar por entidade confiável (banco, empresa) para enganar o usuário a revelar senhas ou dados.' }
  ],
  troubleshooting: [
    { q: 'O que o comando ping testa?', a: 'Envia pacotes ICMP Echo Request e mede o tempo de resposta (RTT). Testa conectividade básica e latência até um host.' },
    { q: 'O que significa TTL no ping?', a: 'Time To Live: número de "saltos" (hops) que o pacote ainda pode fazer antes de ser descartado. Diminui 1 a cada roteador. Valores típicos: 64 (Linux), 128 (Windows), 255 (routers).' },
    { q: 'O que o traceroute mostra?', a: 'Cada roteador (hop) no caminho até o destino, com o tempo de latência de cada salto. Ajuda a identificar onde está ocorrendo lentidão ou perda de pacotes.' },
    { q: 'Para que serve o nslookup?', a: 'Consultar servidores DNS manualmente. Verifica se um nome resolve para o IP correto, qual servidor DNS está respondendo e quais registros existem para um domínio.' },
    { q: 'O que o netstat mostra?', a: 'Conexões TCP ativas, portas em escuta (LISTEN), tabela de roteamento e estatísticas de interfaces. Útil para ver quais processos estão usando a rede.' },
    { q: 'Se ping para 8.8.8.8 funciona mas para google.com não, qual é o problema?', a: 'Problema de DNS. Você tem conectividade IP, mas o servidor DNS não está resolvendo nomes. Verifique as configurações de DNS ou tente mudar para 8.8.8.8.' }
  ],
  portas: [
    { q: 'Qual porta usa o SSH?', a: 'Porta 22 (TCP) — Secure Shell: acesso remoto criptografado a servidores.' },
    { q: 'Qual porta usa o HTTP?', a: 'Porta 80 (TCP) — Hypertext Transfer Protocol: web sem criptografia.' },
    { q: 'Qual porta usa o HTTPS?', a: 'Porta 443 (TCP) — HTTP sobre TLS: web com criptografia.' },
    { q: 'Qual porta usa o SMTP?', a: 'Porta 25 (TCP) — Simple Mail Transfer Protocol: envio de e-mail entre servidores.' },
    { q: 'Qual porta usa o DNS?', a: 'Porta 53 (UDP e TCP) — Domain Name System: resolução de nomes.' },
    { q: 'Qual porta usa o RDP?', a: 'Porta 3389 (TCP) — Remote Desktop Protocol: acesso remoto gráfico ao Windows.' },
    { q: 'Qual porta usa o MySQL?', a: 'Porta 3306 (TCP) — banco de dados MySQL/MariaDB.' }
  ]
};

/* ── Quizzes ──────────────────────────────────────────── */
const QUIZZES = {
  fundamentos: [
    {
      q: 'Usando a analogia postal, o que seria o endereço IP de um computador?',
      opts: ['O nome do morador', 'O número do apartamento', 'O endereço completo da casa', 'O código postal da cidade'],
      correct: 2,
      explanation: 'O endereço IP identifica o dispositivo na rede, assim como o endereço de uma casa identifica onde ela fica. A porta seria o número do apartamento — ela identifica qual serviço dentro do dispositivo.'
    },
    {
      q: 'Você está assistindo a uma live no YouTube e o vídeo trava de tempos em tempos, mesmo com boa velocidade de download. Qual problema de rede é o mais provável?',
      opts: ['Latência alta', 'Jitter elevado', 'Pouca largura de banda', 'Endereço IP inválido'],
      correct: 1,
      explanation: 'Jitter é a variação irregular no tempo de chegada dos pacotes. Em streaming ao vivo, os pacotes precisam chegar em intervalos regulares. Alto jitter causa engasgos e travamentos, mesmo com boa banda.'
    },
    {
      q: 'Um pacote de dados tem: endereço de origem, endereço de destino, número de sequência e os dados em si. O número de sequência serve para:',
      opts: ['Identificar o protocolo usado', 'Calcular a velocidade de transmissão', 'Remontar os fragmentos na ordem correta', 'Criptografar o conteúdo'],
      correct: 2,
      explanation: 'Como uma mensagem grande é quebrada em vários pacotes e eles podem chegar fora de ordem, o número de sequência permite que o destinatário os reordene corretamente antes de apresentar os dados.'
    }
  ],
  modelos: [
    {
      q: 'Quantas camadas tem o modelo OSI?',
      opts: ['4 camadas', '5 camadas', '6 camadas', '7 camadas'],
      correct: 3,
      explanation: 'O modelo OSI tem 7 camadas: Física (1), Enlace de Dados (2), Rede (3), Transporte (4), Sessão (5), Apresentação (6) e Aplicação (7).'
    },
    {
      q: 'Você envia um e-mail. O protocolo SMTP opera em qual camada OSI?',
      opts: ['Camada 3 — Rede', 'Camada 4 — Transporte', 'Camada 7 — Aplicação', 'Camada 2 — Enlace'],
      correct: 2,
      explanation: 'Protocolos de aplicação como SMTP, HTTP, FTP e DNS operam na Camada 7 (Aplicação). Ela é a interface entre o software e a rede.'
    },
    {
      q: 'No modelo TCP/IP, a camada de "Acesso à Rede" engloba quais camadas do modelo OSI?',
      opts: ['Apenas a camada Física', 'Física e Enlace de Dados', 'Física, Enlace e Rede', 'Enlace, Rede e Transporte'],
      correct: 1,
      explanation: 'O TCP/IP é mais enxuto que o OSI. Sua camada de "Acesso à Rede" (também chamada de Link) abrange as camadas 1 (Física) e 2 (Enlace de Dados) do OSI.'
    }
  ],
  enderecamento: [
    {
      q: 'Qual notação CIDR representa a máscara 255.255.255.0?',
      opts: ['/8', '/16', '/24', '/32'],
      correct: 2,
      explanation: '255.255.255.0 em binário é 11111111.11111111.11111111.00000000. Contando os bits 1 = 24. Por isso a notação é /24.'
    },
    {
      q: 'Sua rede local usa o IP 192.168.1.50. Esse é um IP:',
      opts: ['Público, roteável na internet', 'Privado, só funciona na rede local', 'De loopback, só o próprio computador acessa', 'Broadcast, enviado para todos os dispositivos'],
      correct: 1,
      explanation: 'O range 192.168.0.0/16 é privado (RFC 1918). Dispositivos com esses IPs precisam de NAT para acessar a internet. Eles não são roteados publicamente.'
    },
    {
      q: 'Para que serve o protocolo ARP?',
      opts: ['Atribuir IPs automaticamente', 'Descobrir o MAC address a partir de um IP', 'Traduzir IPs privados em IPs públicos', 'Criptografar tráfego na rede local'],
      correct: 1,
      explanation: 'O ARP (Address Resolution Protocol) resolve um endereço IP para um endereço MAC na rede local. Seu computador precisa do MAC do destino para montar o quadro Ethernet.'
    }
  ],
  protocolos: [
    {
      q: 'Você está construindo um app de chat de vídeo em tempo real. Qual protocolo de transporte é mais adequado?',
      opts: ['TCP — pela confiabilidade na entrega', 'UDP — pela menor latência', 'HTTP — pela simplicidade', 'SMTP — pelo suporte a mídia'],
      correct: 1,
      explanation: 'Em video chamadas, é melhor perder um frame ocasional do que esperar pela retransmissão. O UDP entrega sem esperar confirmação, mantendo o fluxo contínuo de dados em tempo real.'
    },
    {
      q: 'O que garante o "S" do HTTPS?',
      opts: ['Que o site é oficial e confiável', 'Que os dados trafegam criptografados via TLS', 'Que o servidor tem boa performance', 'Que o DNS foi consultado com segurança'],
      correct: 1,
      explanation: 'O S significa Secure. O HTTPS é HTTP com uma camada TLS por baixo. O TLS criptografa os dados em trânsito para que interceptadores não consigam lê-los.'
    },
    {
      q: 'Você recebe o IP 192.168.1.87 automaticamente ao conectar no Wi-Fi. Qual protocolo fez isso?',
      opts: ['DNS', 'ARP', 'DHCP', 'NAT'],
      correct: 2,
      explanation: 'O DHCP (Dynamic Host Configuration Protocol) é responsável por atribuir automaticamente: endereço IP, máscara de sub-rede, gateway e servidores DNS para novos dispositivos na rede.'
    }
  ],
  'acesso-site': [
    {
      q: 'Qual é a ordem correta de etapas ao acessar https://exemplo.com pela primeira vez?',
      opts: ['TCP → DNS → TLS → HTTP', 'DNS → TCP → TLS → HTTP', 'TLS → TCP → DNS → HTTP', 'HTTP → DNS → TLS → TCP'],
      correct: 1,
      explanation: 'Primeiro o DNS resolve o nome para um IP. Depois o TCP estabelece a conexão (handshake). Em seguida o TLS negocia a criptografia. Por fim, o HTTP envia a requisição sobre o túnel seguro.'
    },
    {
      q: 'No three-way handshake TCP, qual é a sequência correta?',
      opts: ['SYN → ACK → SYN-ACK', 'ACK → SYN → SYN-ACK', 'SYN → SYN-ACK → ACK', 'SYN-ACK → ACK → SYN'],
      correct: 2,
      explanation: 'O cliente envia SYN (quero conectar). O servidor responde SYN-ACK (aceito, e confirmo). O cliente finaliza com ACK (confirmado). A conexão está estabelecida.'
    },
    {
      q: 'Seu navegador já visitou google.com antes. Na segunda visita, o DNS pode ser resolvido mais rápido porque:',
      opts: ['O servidor do Google guarda um cookie com o IP', 'O sistema operacional tem um cache DNS local', 'O TCP reutiliza automaticamente a mesma conexão', 'O protocolo TLS armazena o IP no certificado'],
      correct: 1,
      explanation: 'O SO mantém um cache DNS com respostas anteriores pelo tempo de TTL configurado no registro DNS. Assim, não precisa consultar o servidor DNS a cada acesso.'
    }
  ],
  equipamentos: [
    {
      q: 'Qual equipamento opera na Camada 3 do OSI e decide o melhor caminho para um pacote?',
      opts: ['Hub', 'Switch', 'Roteador', 'Access Point'],
      correct: 2,
      explanation: 'O roteador opera na Camada 3 (Rede) e usa tabelas de roteamento para decidir por qual interface um pacote deve ser enviado, com base no endereço IP de destino.'
    },
    {
      q: 'Em uma empresa com 50 computadores na mesma rede local, qual equipamento é responsável por garantir que os dados cheguem apenas para o destinatário correto?',
      opts: ['Roteador', 'Switch', 'Firewall', 'Modem'],
      correct: 1,
      explanation: 'O switch aprende os endereços MAC de cada porta e encaminha quadros Ethernet apenas para o destino correto. Isso evita que todo o tráfego seja "broadcast" para todos os dispositivos.'
    },
    {
      q: 'Um proxy reverso é colocado na frente dos servidores web de uma empresa. Qual benefício ele NÃO oferece?',
      opts: ['Balanceamento de carga entre servidores', 'Cache de conteúdo estático', 'Criptografia de dados no banco de dados interno', 'Terminação SSL/TLS'],
      correct: 2,
      explanation: 'O proxy reverso protege e distribui tráfego de rede. Ele não tem acesso ao banco de dados nem criptografa dados armazenados internamente.'
    }
  ],
  seguranca: [
    {
      q: 'Você está em um café e percebe um Wi-Fi chamado "CafeGratis". Ao conectar, o atacante consegue ver todo seu tráfego HTTP. Que tipo de ataque é esse?',
      opts: ['DDoS', 'Phishing', 'Man-in-the-Middle (MITM)', 'IP Spoofing'],
      correct: 2,
      explanation: 'Criar um ponto de acesso falso para interceptar comunicações é um ataque MITM clássico. Usar HTTPS protege os dados, pois mesmo interceptados, estarão criptografados.'
    },
    {
      q: 'Um servidor recebe 500.000 requisições por segundo de 10.000 IPs diferentes ao mesmo tempo. O servidor fica fora do ar. Que tipo de ataque é esse?',
      opts: ['Phishing', 'DDoS (Distributed Denial of Service)', 'SQL Injection', 'Brute Force'],
      correct: 1,
      explanation: 'DDoS usa múltiplas fontes (geralmente uma botnet de dispositivos comprometidos) para sobrecarregar um alvo. Como vem de muitos IPs, é difícil bloquear apenas um IP específico.'
    },
    {
      q: 'Um firewall stateful tem uma regra que permite tráfego TCP de entrada na porta 80. Um pacote RST (reset) chega sem uma conexão SYN anterior registrada. O que acontece?',
      opts: ['O pacote é aceito, pois a porta 80 está liberada', 'O pacote é bloqueado, pois não pertence a nenhuma conexão legítima', 'O pacote é redirecionado para análise', 'O firewall reinicia a conexão'],
      correct: 1,
      explanation: 'Um firewall stateful rastreia o estado das conexões. Um pacote RST sem SYN anterior não pertence a nenhuma conexão conhecida, então é descartado mesmo com a porta aberta na regra.'
    }
  ],
  troubleshooting: [
    {
      q: 'Você executa: ping google.com — e recebe "Request timed out". Qual é o próximo passo de diagnóstico?',
      opts: ['Reiniciar o computador imediatamente', 'Testar ping para o gateway padrão (ex: 192.168.1.1)', 'Checar o e-mail do suporte', 'Executar traceroute para um IP qualquer'],
      correct: 1,
      explanation: 'A metodologia correta é diagnosticar de dentro para fora: primeiro verifique a rede local (ping ao gateway). Se o gateway responde mas google.com não, o problema está fora da sua rede local.'
    },
    {
      q: 'O traceroute mostra 15 hops até o destino, mas o hop 8 aparece com "* * *". O que isso significa?',
      opts: ['O destino foi alcançado no hop 8', 'O roteador no hop 8 não responde a pacotes ICMP (mas pode estar funcionando)', 'A conexão foi perdida permanentemente no hop 8', 'O TTL chegou a zero no hop 8'],
      correct: 1,
      explanation: '"* * *" não significa que a rota parou. Muitos roteadores bloqueiam respostas ICMP por segurança. O traceroute continua além desse hop — se o destino final responde, a rota está funcional.'
    },
    {
      q: 'O comando nslookup google.com retorna "SERVFAIL". O que isso indica?',
      opts: ['O servidor do Google está fora do ar', 'O servidor DNS configurado não conseguiu resolver a consulta', 'Não há conexão com a internet', 'O firewall bloqueou o acesso ao Google'],
      correct: 1,
      explanation: 'SERVFAIL (Server Failure) indica que o servidor DNS tentou resolver mas falhou — pode ser problema de configuração no DNS, propagação incompleta, ou o servidor DNS em si com problema.'
    }
  ],
  portas: [
    {
      q: 'Qual serviço usa a porta 443?',
      opts: ['HTTP', 'FTP', 'HTTPS', 'SSH'],
      correct: 2,
      explanation: 'HTTPS usa a porta 443 TCP. É o HTTP com criptografia TLS. A porta 80 é para HTTP sem criptografia.'
    },
    {
      q: 'Você precisa acessar remotamente um servidor Linux de forma segura. Qual porta deve estar aberta?',
      opts: ['Porta 23 — Telnet', 'Porta 22 — SSH', 'Porta 3389 — RDP', 'Porta 21 — FTP'],
      correct: 1,
      explanation: 'SSH (porta 22) é a opção segura para acesso remoto a servidores Linux. O Telnet (23) existe mas transmite dados em texto puro, sem criptografia — não use em produção.'
    },
    {
      q: 'Um servidor de e-mail recebe mensagens de outros servidores. Qual porta deve estar aberta para isso?',
      opts: ['Porta 110 (POP3)', 'Porta 143 (IMAP)', 'Porta 25 (SMTP)', 'Porta 587 (Submission)'],
      correct: 2,
      explanation: 'A porta 25 (SMTP) é usada para comunicação entre servidores de e-mail (MTA para MTA). A porta 587 é para envio de e-mail por clientes (MUA para servidor). A 110 e 143 são para leitura.'
    }
  ]
};

/* ── Ports reference table ───────────────────────────── */
const PORTS = [
  { port: 20,   proto: 'TCP', service: 'FTP Data',     desc: 'Transferência de dados do FTP (modo ativo).' },
  { port: 21,   proto: 'TCP', service: 'FTP Control',  desc: 'Canal de controle do FTP: comandos e autenticação.' },
  { port: 22,   proto: 'TCP', service: 'SSH',           desc: 'Secure Shell: acesso remoto criptografado a servidores.' },
  { port: 23,   proto: 'TCP', service: 'Telnet',        desc: 'Acesso remoto sem criptografia. Evite em ambientes modernos.' },
  { port: 25,   proto: 'TCP', service: 'SMTP',          desc: 'Envio de e-mail entre servidores de correio eletrônico.' },
  { port: 53,   proto: 'UDP/TCP', service: 'DNS',       desc: 'Resolução de nomes: converte domínios em endereços IP.' },
  { port: 67,   proto: 'UDP', service: 'DHCP Server',  desc: 'Servidor DHCP recebe requisições de clientes.' },
  { port: 68,   proto: 'UDP', service: 'DHCP Client',  desc: 'Cliente DHCP recebe configuração de rede do servidor.' },
  { port: 80,   proto: 'TCP', service: 'HTTP',          desc: 'Web sem criptografia. Dados trafegam em texto puro.' },
  { port: 110,  proto: 'TCP', service: 'POP3',          desc: 'Leitura de e-mail (baixa e remove do servidor).' },
  { port: 143,  proto: 'TCP', service: 'IMAP',          desc: 'Leitura de e-mail sincronizada (e-mail fica no servidor).' },
  { port: 443,  proto: 'TCP', service: 'HTTPS',         desc: 'Web com criptografia TLS. Padrão moderno da web.' },
  { port: 465,  proto: 'TCP', service: 'SMTPS',         desc: 'SMTP sobre SSL/TLS. Usado por clientes para envio seguro.' },
  { port: 587,  proto: 'TCP', service: 'SMTP Submission', desc: 'Envio de e-mail por clientes de e-mail (autenticação obrigatória).' },
  { port: 993,  proto: 'TCP', service: 'IMAPS',         desc: 'IMAP sobre TLS. Leitura segura de e-mail.' },
  { port: 995,  proto: 'TCP', service: 'POP3S',         desc: 'POP3 sobre TLS. Leitura segura de e-mail.' },
  { port: 3306, proto: 'TCP', service: 'MySQL',         desc: 'Banco de dados MySQL/MariaDB.' },
  { port: 3389, proto: 'TCP', service: 'RDP',           desc: 'Remote Desktop Protocol: acesso remoto gráfico ao Windows.' },
  { port: 5060, proto: 'UDP/TCP', service: 'SIP',       desc: 'Session Initiation Protocol: sinalização VoIP.' },
  { port: 5061, proto: 'TCP', service: 'SIP/TLS',       desc: 'SIP com criptografia TLS.' },
  { port: 8080, proto: 'TCP', service: 'HTTP Alt',      desc: 'Porta HTTP alternativa. Comum em proxies e servidores de desenvolvimento.' },
  { port: 8443, proto: 'TCP', service: 'HTTPS Alt',     desc: 'Porta HTTPS alternativa. Usada quando a 443 está ocupada ou por convenção.' }
];
