# RedesWiki

> Interactive computer networking wiki: 100% frontend, no backend, no server-side dependencies. (Site content is in Brazilian Portuguese.)

**Live demo:** [nathaliagf.github.io/wikinet](https://nathaliagf.github.io/wikinet/)

---

## About

RedesWiki is a complete study site on computer networking, built to be a clear and practical reference, from absolute zero up to applied troubleshooting and cybersecurity concepts. The content is organised for people who learn by reading, practising and reviewing: each module combines explanation, analogies, diagrams, flashcards, a quiz and exercises.

All user progress is stored locally in the browser (localStorage). There is no login, no server, and no data is sent anywhere.

---

## Access

The project runs directly on GitHub Pages: just open the URL above. Nothing to install.

It is also a **Progressive Web App (PWA)**: it can be installed on a phone or desktop home screen and works offline like a native app.

---

## Content

### 9 study modules

| # | Module | Topics |
|---|--------|--------|
| 1 | **Networking Fundamentals** | What a network is, client/server, packets, IP, port, latency, bandwidth, jitter |
| 2 | **Layer Models** | OSI (7 layers), TCP/IP (4 layers), encapsulation, layer-by-layer diagnosis |
| 3 | **Addressing** | IPv4, IPv6, CIDR, subnet mask, NAT, ARP, gateway, subnet calculator |
| 4 | **Core Protocols** | TCP, UDP, DNS, DHCP, HTTP, HTTPS, TLS, SSH, FTP, SMTP, SIP/VoIP |
| 5 | **What Happens When You Visit a Website** | DNS resolution → TCP handshake → TLS → HTTP → rendering |
| 6 | **Network Equipment** | Router, switch, firewall, forward and reverse proxy |
| 7 | **Basic Security** | Stateful/stateless firewalls, MITM, DDoS, spoofing, phishing, VPN |
| 8 | **Troubleshooting** | Diagnostic methodology, ping, traceroute, nslookup, netstat |
| 9 | **Well-Known Ports** | Full table of the main TCP/UDP ports and their services |

### Study tools

| Tool | Description |
|------|-------------|
| **Flashcards** | Per-module decks with the SM-2 spaced-repetition algorithm; keyboard (Space/Arrows/1-4) and swipe support |
| **Quiz** | 3 questions per module with instant feedback and an explanation of the right answer |
| **Mock exam** | Mixed questions from all modules to find knowledge gaps |
| **Hands-on exercises** | Guided troubleshooting scenarios with progressive hints |
| **Review hub** | Consolidated review queue, weak modules and performance history |
| **Glossary** | 113 networking terms with definitions, search and lookup history |
| **Subnet calculator** | Computes network, broadcast, usable hosts and CIDR notation |
| **Pomodoro** | Built-in 25/5/15 min timer for study sessions, with notifications |

---

## Features

### Learning
- Per-section progress with three states: **Read**, **Understood**, **Review**
- Module completion detection with a confetti animation and a link to the next module
- **SM-2** spaced-repetition algorithm in the flashcards
- Learning panel on the home page with the recommended next module, review queue and weakest topics
- Study tracks by goal (beginner, troubleshooting, cybersecurity, certification)
- Progress export for personal reference

### Interface
- **Light/dark** theme with saved preference
- Collapsible sidebar with per-module navigation and global search
- **Floating table of contents (TOC)** with scroll spy on module pages
- **Next/Previous** links in each module footer for sequential navigation
- Search with term highlighting that works across pages via URLSearchParams
- Per-section share links (Web Share API with clipboard fallback)
- Locally saved favourites
- Progress animations (respect `prefers-reduced-motion`)

### PWA and offline
- Service Worker with cache-first strategy: all content works offline after the first visit
- PWA manifest with 192×192 and 512×512 PNG icons
- Online/offline indicator with a discreet toast
- "Add to home screen" install banner (shown once, can be dismissed)

### Accessibility and SEO
- Skip navigation link
- ARIA labels, `aria-pressed` and `aria-expanded` on interactive components
- `<noscript>` fallback on every page
- Unique meta description per page
- Open Graph and Twitter Card for social previews
- `<link rel="canonical">` and `sitemap.xml`
- Print stylesheet (`@media print`) that strips page chrome and formats for paper

### Visual diagrams (inline SVG)
- OSI vs TCP/IP: side-by-side comparison with layer mapping
- Encapsulation: visual flow of headers added per layer
- TCP three-way handshake: sequence diagram with SYN/SYN-ACK/ACK arrows
- DNS resolution: full flow, client → recursive → root → authoritative → response

---

## File structure

```
WikiCodex/
├── index.html              # Home with modules, tracks and learning panel
├── 404.html                # Custom error page
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline cache (cache-first, v3)
├── sitemap.xml             # Sitemap for indexing
├── .nojekyll               # Disables Jekyll on GitHub Pages
│
├── pages/                  # Modules and tools
│   ├── fundamentos.html
│   ├── modelos.html
│   ├── enderecamento.html
│   ├── protocolos.html
│   ├── acesso-site.html
│   ├── equipamentos.html
│   ├── seguranca.html
│   ├── troubleshooting.html
│   ├── portas.html
│   ├── revisao.html        # Review hub
│   ├── simulado.html       # Certification mock exam
│   └── exercicios.html     # Hands-on exercises
│
├── css/
│   ├── style.css           # Global styles, variables, themes, layout
│   └── components.css      # Reusable components (teaching cards, etc.)
│
├── js/
│   ├── app.js              # Init, sidebar, TOC, nav, PWA, online/offline
│   ├── progress.js         # Progress, analytics, SM-2 wrapper, module completion
│   ├── navigation.js       # Navigation between modules and anchors
│   ├── interactive.js      # Flashcards (keyboard + swipe), quiz, search, glossary UI
│   ├── glossary.js         # Glossary logic with search and lookup history
│   ├── review.js           # Review hub (per-module content fetch)
│   ├── simulado.js         # Mock exam engine with history and stats
│   ├── exercicios.js       # Hands-on exercises with progressive hints
│   ├── spaced-repetition.js# SM-2 algorithm for flashcards
│   ├── subnet-calc.js      # IPv4 subnet calculator
│   └── pomodoro.js         # 25/5/15 min Pomodoro timer with notifications
│
├── data/
│   ├── content.js          # MODULES, FLASHCARDS, QUIZZES, PORTS, STUDY_GOALS
│   ├── glossary-terms.js   # 113 networking terms with definitions
│   └── certification-quiz.js # Certification mock exam questions
│
└── icons/
    ├── icon-192.png        # PWA icon 192×192
    ├── icon-512.png        # PWA icon 512×512
    └── og-cover.png        # Open Graph image 1200×630
```

---

## Tech

- **HTML5 / CSS3 / JavaScript**: vanilla, no frameworks
- **Service Worker API**: offline cache
- **localStorage / sessionStorage**: local progress persistence
- **Web Share API**: native sharing with clipboard fallback
- **Notification API**: Pomodoro alerts
- **IntersectionObserver**: scroll spy in the TOC
- **Canvas API**: confetti animation on module completion
- **Google Fonts**: Lora (headings) + DM Sans (body)

---

## Running locally

Any static HTTP server works. The simplest:

```bash
# Python (already installed on most systems)
python3 -m http.server 8080

# Node.js (with npx, nothing to install)
npx serve .

# VS Code: Live Server extension → "Go Live"
```

Open `http://localhost:8080` in your browser.

> **Note:** opening `index.html` straight from the filesystem (`file://`) does not work properly: the Service Worker and some features need an HTTP server.

---

## GitHub Pages

The project is set up to deploy straight from the `main` branch. To publish:

1. Go to **Settings → Pages** in the repository
2. Select **Source: Deploy from a branch**
3. Choose `main` / `/ (root)`
4. Save. The site will be available at the URL above in a few minutes

The `.nojekyll` file at the root disables Jekyll processing on GitHub Pages, so all files are served correctly.

---

## License

MIT, see [LICENSE](LICENSE).
