# RedesWiki

> Wiki interativa de redes de computadores — 100% frontend, sem backend, sem dependências de servidor.

**Acesse em:** `<!-- URL do GitHub Pages será inserida aqui -->`

---

## Sobre o projeto

O RedesWiki é um site de estudo completo sobre redes de computadores, criado para ser uma referência clara e prática — do absoluto zero até conceitos aplicados em troubleshooting e cibersegurança. O conteúdo foi organizado para quem aprende lendo, praticando e revisando: cada módulo combina explicação, analogias, diagramas, flashcards, quiz e exercícios.

Todo o progresso do usuário é salvo localmente no navegador (localStorage). Não há login, não há servidor, não há dados enviados a lugar nenhum.

---

## Acesso

O projeto roda diretamente no GitHub Pages — basta acessar a URL acima. Não é necessário instalar nada.

É também um **Progressive Web App (PWA)**: pode ser instalado na tela inicial do celular ou desktop para funcionar offline, como um aplicativo nativo.

---

## Conteúdo

### 9 Módulos de estudo

| # | Módulo | Tópicos |
|---|--------|---------|
| 1 | **Fundamentos de Redes** | O que é uma rede, cliente/servidor, pacotes, IP, porta, latência, banda, jitter |
| 2 | **Modelos de Camadas** | OSI (7 camadas), TCP/IP (4 camadas), encapsulamento, diagnóstico por camada |
| 3 | **Endereçamento** | IPv4, IPv6, CIDR, máscara de sub-rede, NAT, ARP, gateway, calculadora de sub-redes |
| 4 | **Protocolos Principais** | TCP, UDP, DNS, DHCP, HTTP, HTTPS, TLS, SSH, FTP, SMTP, SIP/VoIP |
| 5 | **O que Acontece ao Acessar um Site** | Resolução DNS → handshake TCP → TLS → HTTP → renderização |
| 6 | **Equipamentos de Rede** | Roteador, switch, firewall, proxy forward e reverso |
| 7 | **Segurança Básica** | Firewalls stateful/stateless, MITM, DDoS, spoofing, phishing, VPN |
| 8 | **Troubleshooting** | Metodologia de diagnóstico, ping, traceroute, nslookup, netstat |
| 9 | **Portas Conhecidas** | Tabela completa das principais portas TCP/UDP e seus serviços |

### Ferramentas de estudo

| Ferramenta | Descrição |
|-----------|-----------|
| **Flashcards** | Baralhos por módulo com algoritmo SM-2 de repetição espaçada; suporte a teclado (Espaço/Setas/1-4) e swipe |
| **Quiz** | 3 questões por módulo com feedback imediato e explicação da resposta correta |
| **Simulado** | Questões mistas de todos os módulos para diagnóstico de lacunas |
| **Exercícios práticos** | Cenários guiados de troubleshooting com pistas progressivas |
| **Central de Revisão** | Fila consolidada de revisão, módulos fracos e histórico de performance |
| **Glossário** | 113 termos de redes com definições em português, busca e registro de consultas |
| **Calculadora de sub-redes** | Calcula rede, broadcast, hosts disponíveis e notação CIDR |
| **Pomodoro** | Timer 25/5/15 min integrado para sessões de estudo com notificações |

---

## Funcionalidades

### Aprendizado
- Progresso por seção com três estados: **Lido**, **Entendi**, **Revisar**
- Detecção de conclusão de módulo com animação de confetti e link para o próximo
- Algoritmo **SM-2** de repetição espaçada nos flashcards
- Painel de aprendizagem na home com próximo módulo recomendado, fila de revisão e temas mais fracos
- Trilhas de estudo por objetivo (iniciante, troubleshooting, cibersegurança, certificação)
- Exportação de progresso para referência pessoal

### Interface
- Tema **claro/escuro** com preferência salva
- Sidebar colapsável com navegação por módulo e busca global
- **Sumário flutuante (TOC)** com scroll spy nas páginas de módulo
- **Next/Previous** no rodapé de cada módulo para navegação sequencial
- Busca com destaque de termos — funciona entre páginas via URLSearchParams
- Links de compartilhamento por seção (Web Share API com fallback para clipboard)
- Favoritos salvos localmente
- Animações de progresso (respeitam `prefers-reduced-motion`)

### PWA e offline
- Service Worker com cache-first — todo o conteúdo funciona sem internet após o primeiro acesso
- Manifesto PWA com ícones PNG 192×192 e 512×512
- Indicador online/offline com toast discreto
- Banner de instalação "Adicionar à tela inicial" (aparece uma vez, pode ser dispensado)

### Acessibilidade e SEO
- Skip navigation link (`Ir para o conteúdo`)
- ARIA labels, `aria-pressed`, `aria-expanded` nos componentes interativos
- Fallback `<noscript>` em todas as páginas
- Meta description única por página
- Open Graph e Twitter Card para preview em redes sociais
- `<link rel="canonical">` e `sitemap.xml`
- Stylesheet de impressão (`@media print`) que remove chrome e formata para papel

### Diagramas visuais (SVG inline)
- OSI vs TCP/IP — comparação lado a lado com mapeamento de camadas
- Encapsulamento — fluxo visual de adição de cabeçalhos por camada
- Three-Way Handshake TCP — diagrama de sequência com setas SYN/SYN-ACK/ACK
- Resolução DNS — fluxo completo: cliente → recursivo → raiz → autoritativo → resposta

---

## Estrutura de arquivos

```
WikiCodex/
├── index.html              # Home com módulos, trilhas e painel de aprendizagem
├── 404.html                # Página de erro personalizada
├── manifest.json           # PWA manifest
├── service-worker.js       # Cache offline (cache-first, v3)
├── sitemap.xml             # Sitemap para indexação
├── .nojekyll               # Desativa Jekyll no GitHub Pages
│
├── pages/                  # Módulos e ferramentas
│   ├── fundamentos.html
│   ├── modelos.html
│   ├── enderecamento.html
│   ├── protocolos.html
│   ├── acesso-site.html
│   ├── equipamentos.html
│   ├── seguranca.html
│   ├── troubleshooting.html
│   ├── portas.html
│   ├── revisao.html        # Central de revisão
│   ├── simulado.html       # Simulado de certificação
│   └── exercicios.html     # Exercícios práticos
│
├── css/
│   ├── style.css           # Estilos globais, variáveis, temas, layout
│   └── components.css      # Componentes reutilizáveis (cards pedagógicos, etc.)
│
├── js/
│   ├── app.js              # Inicialização, sidebar, TOC, nav, PWA, online/offline
│   ├── progress.js         # Progresso, analytics, SM-2 wrapper, conclusão de módulo
│   ├── navigation.js       # Navegação entre módulos e âncoras
│   ├── interactive.js      # Flashcards (teclado + swipe), quiz, busca, glossário UI
│   ├── glossary.js         # Lógica do glossário com busca e registro de consultas
│   ├── review.js           # Central de revisão (fetch de conteúdo por módulo)
│   ├── simulado.js         # Motor do simulado com histórico e estatísticas
│   ├── exercicios.js       # Exercícios práticos com pistas progressivas
│   ├── spaced-repetition.js# Algoritmo SM-2 para flashcards
│   ├── subnet-calc.js      # Calculadora de sub-redes IPv4
│   └── pomodoro.js         # Timer Pomodoro 25/5/15 min com notificações
│
├── data/
│   ├── content.js          # MODULES, FLASHCARDS, QUIZZES, PORTS, STUDY_GOALS
│   ├── glossary-terms.js   # 113 termos de redes com definições em português
│   └── certification-quiz.js # Questões do simulado de certificação
│
└── icons/
    ├── icon-192.png        # Ícone PWA 192×192
    ├── icon-512.png        # Ícone PWA 512×512
    └── og-cover.png        # Imagem Open Graph 1200×630
```

---

## Tecnologias

- **HTML5 / CSS3 / JavaScript** — puro, sem frameworks
- **Service Worker API** — cache offline
- **localStorage / sessionStorage** — persistência de progresso local
- **Web Share API** — compartilhamento nativo com fallback para clipboard
- **Notification API** — alertas do Pomodoro
- **IntersectionObserver** — scroll spy no TOC
- **Canvas API** — animação de confetti na conclusão de módulo
- **Google Fonts** — Lora (headings) + DM Sans (corpo)

---

## Como rodar localmente

Qualquer servidor HTTP estático funciona. O mais simples:

```bash
# Python (já vem instalado na maioria dos sistemas)
python3 -m http.server 8080

# Node.js (com npx, sem instalar nada)
npx serve .

# VS Code: extensão Live Server → botão "Go Live"
```

Acesse `http://localhost:8080` no navegador.

> **Atenção:** abrir `index.html` direto pelo sistema de arquivos (`file://`) não funciona corretamente — o Service Worker e alguns recursos precisam de um servidor HTTP.

---

## GitHub Pages

O projeto está configurado para deploy direto na branch `main`. Para publicar:

1. Vá em **Settings → Pages** no repositório
2. Selecione **Source: Deploy from a branch**
3. Escolha `main` / `/ (root)`
4. Salve — em alguns minutos o site estará disponível na URL acima

O arquivo `.nojekyll` na raiz desativa o processamento Jekyll do GitHub Pages, garantindo que todos os arquivos sejam servidos corretamente.

---

## Licença

Este projeto é de uso pessoal e educacional.
