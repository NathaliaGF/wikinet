/* ── RedesWiki — Glossário de termos ─────────────────── */
'use strict';

const GLOSSARY = {
  'IP': 'Internet Protocol — número que identifica cada dispositivo na rede. Ex: 192.168.1.10',
  'IPv4': 'Versão 4 do IP — endereços de 32 bits (4 octetos). Suporta ~4,3 bilhões de endereços.',
  'IPv6': 'Versão 6 do IP — endereços de 128 bits. Criado para suprir o esgotamento do IPv4.',
  'MAC': 'Media Access Control — endereço físico único da placa de rede. Usado na Camada 2 (Enlace).',
  'NAT': 'Network Address Translation — traduz IPs privados para um IP público no roteador.',
  'ARP': 'Address Resolution Protocol — descobre o MAC address a partir de um IP na rede local.',
  'DNS': 'Domain Name System — converte nomes (google.com) em endereços IP (142.250.78.14).',
  'DHCP': 'Dynamic Host Configuration Protocol — atribui IPs automaticamente para novos dispositivos.',
  'TCP': 'Transmission Control Protocol — entrega confiável de dados com confirmação de recebimento (ACK).',
  'UDP': 'User Datagram Protocol — entrega rápida sem confirmação. Usado em streaming e jogos.',
  'HTTP': 'Hypertext Transfer Protocol — protocolo da web. Porta 80. Dados em texto puro.',
  'HTTPS': 'HTTP Secure — HTTP com criptografia TLS. Porta 443. Padrão moderno da web.',
  'TLS': 'Transport Layer Security — protocolo de criptografia usado no HTTPS. Garante confidencialidade, autenticação e integridade.',
  'SSL': 'Secure Sockets Layer — predecessor do TLS, descontinuado. Ainda mencionado em "certificados SSL".',
  'SSH': 'Secure Shell — protocolo para acesso remoto criptografado a servidores. Porta 22.',
  'FTP': 'File Transfer Protocol — transferência de arquivos. Portas 20/21. Sem criptografia.',
  'SMTP': 'Simple Mail Transfer Protocol — envio de e-mail. Portas 25, 465, 587.',
  'IMAP': 'Internet Message Access Protocol — leitura de e-mail sincronizada. Portas 143/993.',
  'POP3': 'Post Office Protocol v3 — baixa e-mails do servidor. Portas 110/995.',
  'SIP': 'Session Initiation Protocol — sinalização para chamadas VoIP. Portas 5060/5061.',
  'VoIP': 'Voice over IP — tecnologia de chamadas de voz pela internet (Skype, WhatsApp, Teams).',
  'OSI': 'Open Systems Interconnection — modelo de referência de 7 camadas para redes.',
  'TTL': 'Time To Live — campo que limita a vida de um pacote (hops) ou resposta DNS (segundos).',
  'RTT': 'Round-Trip Time — tempo de ida e volta de um pacote. Medido em ms pelo ping.',
  'CIDR': 'Classless Inter-Domain Routing — notação de sub-rede compacta. Ex: 192.168.1.0/24',
  'VPN': 'Virtual Private Network — túnel criptografado entre seu dispositivo e um servidor remoto.',
  'MTU': 'Maximum Transmission Unit — tamanho máximo de um pacote na rede. Ethernet padrão: 1500 bytes.',
  'ACK': 'Acknowledgment — confirmação de recebimento usada pelo TCP para garantir entrega.',
  'SYN': 'Synchronize — primeiro pacote do three-way handshake TCP para iniciar uma conexão.',
  'gateway': 'Roteador padrão da rede — todo pacote com destino externo é enviado para ele.',
  'latência': 'Tempo que um pacote leva para ir e voltar entre dois pontos. Medida em ms.',
  'jitter': 'Variação na latência entre pacotes consecutivos. Alto jitter prejudica VoIP e streaming.',
  'bandwidth': 'Largura de banda — capacidade máxima de transferência de um link (Mbps/Gbps).',
  'firewall': 'Sistema que inspeciona e filtra tráfego com base em regras de IP, porta e estado.',
  'proxy': 'Servidor intermediário entre clientes e servidores. Pode ser forward (saída) ou reverso (entrada).',
  'broadcast': 'Pacote enviado para todos os dispositivos de uma rede. Ex: endereço 192.168.1.255',
  'switch': 'Equipamento de Camada 2 que conecta dispositivos na mesma rede usando endereços MAC.',
  'roteador': 'Equipamento de Camada 3 que conecta redes diferentes e decide caminhos usando IP.',
  'MITM': 'Man-in-the-Middle — ataque onde o invasor intercepta comunicação entre duas partes.',
  'DDoS': 'Distributed Denial of Service — sobrecarga de um serviço usando múltiplas fontes simultâneas.',
  'handshake': 'Processo de estabelecimento de conexão com troca de informações entre duas partes.',
  'encapsulamento': 'Adição de cabeçalhos em cada camada da pilha de rede ao descer para transmissão.',
  'sub-rede': 'Divisão lógica de uma rede IP maior em segmentos menores usando máscaras.',
  'máscara': 'Máscara de sub-rede — define quais bits do IP pertencem à rede e quais ao host.',
  'CDN': 'Content Delivery Network — rede de servidores distribuídos para entrega rápida de conteúdo.',
  'BGP': 'Border Gateway Protocol — protocolo de roteamento entre provedores na internet.',
  'OSPF': 'Open Shortest Path First — protocolo de roteamento dinâmico dentro de uma organização.',
  'ICMP': 'Internet Control Message Protocol — protocolo de diagnóstico. Usado pelo ping e traceroute.',
  'API': 'Application Programming Interface — interface para comunicação entre sistemas via HTTP/S.',
  'websocket': 'Protocolo para comunicação bidirecional em tempo real sobre HTTP. Usado em chats e dashboards.',
  'cache': 'Armazenamento temporário de dados para evitar consultas repetidas. Usado por DNS, HTTP e CPU.',

  /* ── Camada 2 / Switching ─────────────────────────────── */
  'VLAN': 'Virtual LAN — segmento lógico dentro de um switch que isola tráfego sem precisar de hardware separado.',
  'STP': 'Spanning Tree Protocol — evita loops em redes com switches redundantes bloqueando caminhos duplicados.',
  'RSTP': 'Rapid Spanning Tree Protocol — versão mais rápida do STP. Converge em segundos em vez de minutos.',
  'trunking': 'Técnica de transmitir múltiplas VLANs sobre um único link físico entre switches (padrão 802.1Q).',
  'ARP spoofing': 'Ataque que envia respostas ARP falsas para redirecionar tráfego para um dispositivo malicioso.',

  /* ── Roteamento ───────────────────────────────────────── */
  'RIP': 'Routing Information Protocol — protocolo de roteamento baseado em contagem de saltos. Máx. 15 hops.',
  'EIGRP': 'Enhanced Interior Gateway Routing Protocol — protocolo Cisco que combina métricas de banda e atraso.',
  'tabela de roteamento': 'Banco de dados do roteador que associa destinos IP a interfaces e next-hops de saída.',
  'next-hop': 'Próximo roteador no caminho até o destino. Campo essencial na tabela de roteamento.',
  'rota estática': 'Rota configurada manualmente pelo administrador, sem protocolo de roteamento dinâmico.',
  'rota padrão': 'Rota 0.0.0.0/0 — usada quando nenhuma rota mais específica corresponde ao destino.',

  /* ── Endereçamento avançado ───────────────────────────── */
  'VLSM': 'Variable Length Subnet Masking — permite usar máscaras de tamanhos diferentes na mesma rede.',
  'subnetting': 'Processo de dividir uma rede IP em sub-redes menores para organizar e economizar endereços.',
  'unicast': 'Comunicação ponto a ponto — um pacote enviado de um host para exatamente outro host.',
  'multicast': 'Pacote enviado de um host para um grupo de destinatários inscritos. Ex: streaming de vídeo.',
  'anycast': 'Pacote roteado para o nó mais próximo de um grupo com o mesmo endereço IP. Usado no DNS root.',
  'endereço privado': 'Faixas de IP reservadas para uso interno: 10.x, 172.16–31.x, 192.168.x (RFC 1918).',
  'endereço loopback': 'IP 127.0.0.1 — aponta para o próprio dispositivo, usado para testes locais.',
  'DNAT': 'Destination NAT — traduz o IP de destino de pacotes, usado para redirecionar portas (port forwarding).',
  'SNAT': 'Source NAT — traduz o IP de origem, permitindo que hosts privados saiam com IP público.',
  'port forwarding': 'Regra NAT que encaminha tráfego externo de uma porta pública para um host interno.',

  /* ── Qualidade de serviço ─────────────────────────────── */
  'QoS': 'Quality of Service — mecanismos que priorizam certos tipos de tráfego (VoIP, vídeo) em links congestionados.',
  'DSCP': 'Differentiated Services Code Point — campo no cabeçalho IP que marca a prioridade do pacote.',
  'traffic shaping': 'Técnica de controlar a taxa de envio de pacotes para evitar rajadas que causam congestionamento.',
  'perda de pacotes': 'Percentual de pacotes que não chegam ao destino. Acima de 1% é crítico para VoIP e vídeo.',
  'throughput': 'Taxa efetiva de transferência de dados num link, descontando overhead e retransmissões.',
  'SLA': 'Service Level Agreement — contrato de nível de serviço que define métricas mínimas de disponibilidade e latência.',

  /* ── Segurança de rede ───────────────────────────────── */
  'ACL': 'Access Control List — lista de regras que permite ou nega tráfego por IP, porta ou protocolo.',
  'DMZ': 'Demilitarized Zone — segmento de rede semi-público que expõe serviços externos sem acesso à rede interna.',
  'IDS': 'Intrusion Detection System — monitora tráfego e gera alertas ao detectar padrões suspeitos.',
  'IPS': 'Intrusion Prevention System — como o IDS, mas bloqueia ativamente o tráfego malicioso em tempo real.',
  'RADIUS': 'Remote Authentication Dial-In User Service — servidor centralizado de autenticação para redes corporativas.',
  'zero-trust': 'Modelo de segurança que não confia em nenhum usuário ou dispositivo por padrão, mesmo na rede interna.',
  'certificado': 'Arquivo digital que associa uma chave pública a uma identidade, emitido por uma Autoridade Certificadora.',
  'WPA2': 'Wi-Fi Protected Access 2 — padrão de segurança Wi-Fi com criptografia AES-CCMP.',
  'WPA3': 'Wi-Fi Protected Access 3 — versão atual com SAE (Dragonfly), mais resistente a ataques de dicionário.',

  /* ── Redes sem fio ───────────────────────────────────── */
  'SSID': 'Service Set Identifier — nome da rede Wi-Fi divulgado pelo access point.',
  'IEEE 802.11': 'Família de padrões Wi-Fi (802.11a/b/g/n/ac/ax). Define frequências, taxas e modulação.',
  'access point': 'Dispositivo que cria uma rede Wi-Fi e conecta dispositivos sem fio à rede cabeada.',

  /* ── Protocolos de gerência ──────────────────────────── */
  'SNMP': 'Simple Network Management Protocol — protocolo para monitorar e gerenciar dispositivos de rede. Porta 161.',
  'NTP': 'Network Time Protocol — sincroniza o relógio dos dispositivos com servidores de tempo. Porta 123.',
  'Syslog': 'Padrão para envio de mensagens de log de dispositivos para um servidor central. Porta 514.',

  /* ── TCP internals ───────────────────────────────────── */
  'MSS': 'Maximum Segment Size — tamanho máximo do payload TCP, sem cabeçalhos. Tipicamente 1460 bytes em Ethernet.',
  'janela TCP': 'Quantidade de dados que o receptor pode receber antes de exigir confirmação (ACK).',
  'controle de congestionamento': 'Mecanismo TCP (slow start, AIMD) que ajusta a taxa de envio conforme a capacidade da rede.',
  'fragmentação': 'Divisão de pacotes IP maiores que o MTU em fragmentos menores para transmissão.',
  'three-way handshake': 'Sequência SYN → SYN-ACK → ACK que estabelece uma conexão TCP.',

  /* ── Protocolos modernos ──────────────────────────────── */
  'HTTP/2': 'Segunda versão do HTTP — multiplexação de requisições, compressão de cabeçalhos, server push.',
  'HTTP/3': 'Terceira versão do HTTP — roda sobre QUIC (UDP), eliminando o bloqueio head-of-line do TCP.',
  'QUIC': 'Protocolo de transporte da Google sobre UDP com handshake embutido. Base do HTTP/3.',
  'WebRTC': 'Web Real-Time Communication — API de comunicação P2P de áudio, vídeo e dados diretamente no browser.',

  /* ── Diagnóstico e ferramentas ───────────────────────── */
  'traceroute': 'Ferramenta que exibe cada roteador no caminho até o destino, medindo latência por salto.',
  'nslookup': 'Ferramenta de linha de comando para consultar registros DNS de um domínio.',
  'netstat': 'Exibe conexões de rede ativas, tabelas de roteamento e estatísticas de interface do sistema.',
  'tcpdump': 'Capturador de pacotes em linha de comando para análise de tráfego em tempo real.',
  'Wireshark': 'Analisador de protocolos gráfico que captura e inspeciona pacotes em detalhes.',

  /* ── Padrões e organismos ────────────────────────────── */
  'RFC': 'Request for Comments — documentos que definem os padrões e protocolos da internet (ex: RFC 791 = IP).',
  'IEEE': 'Institute of Electrical and Electronics Engineers — define padrões como Ethernet (802.3) e Wi-Fi (802.11).',
  'IANA': 'Internet Assigned Numbers Authority — gerencia alocação de IPs, portas e nomes de domínio de topo.',

  /* ── Infraestrutura ───────────────────────────────────── */
  'load balancer': 'Distribui requisições entre múltiplos servidores para melhorar disponibilidade e desempenho.',
  'reverse proxy': 'Servidor intermediário na entrada — recebe requisições externas e encaminha para servidores internos.',
  'túnel': 'Encapsulamento de um protocolo dentro de outro. Ex: PPPoE sobre Ethernet, IP sobre IP em VPNs.'
};
