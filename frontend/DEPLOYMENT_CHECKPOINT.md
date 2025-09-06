# AuraPartnerAI Frontend — Checkpoint

- Next.js: 14.2.32 (prod build OK)
- PM2: process "aura-frontend" (PORT=3000, HOST=127.0.0.1)
- Health: /api/health → 200 (через Nginx + TLS)
- Nginx: /etc/nginx/sites-available/aurapartnerai.com (proxy → 127.0.0.1:3000; /ws → 127.0.0.1:5000)
- WS URL: wss://aurapartnerai.com/ws (NEXT_PUBLIC_WS_URL)
- Branch: fix/frontend-minimum-$(git rev-parse --short HEAD)
- Next step: smoke-тест чата по WS и UI-индикатора
