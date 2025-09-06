# AuraPartnerAI Frontend v6 — Ops Checklist

- ✅ Next.js 14.2.32 build OK
- ✅ PM2 ecosystem + startup (aura-frontend)
- ✅ Nginx TLS proxy + /ws (raw WebSocket)
- ✅ Health: /api/health via TLS = 200
- ✅ Security headers: HSTS + CSP + Permissions-Policy
- ✅ Static caching for /_next/static
- ✅ WS test (OPEN → connection → pong → CLOSE 1000)
- ✅ Systemd timer: aura-frontend-healthcheck (2min)

Next:
- Parse backend WS payloads (`type: "message" | "status" | "cost"`) в UI.
- Лёгкая телеметрия (pageview/latency) + логирование WS reconnects.
