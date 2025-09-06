import { http, HttpResponse, passthrough } from 'msw';

export const handlers = [
  // /api/health — базовый мок
  http.get('/api/health', () =>
    HttpResponse.json({
      ok: true,
      service: 'frontend',
      version: 'test',
      timestamp: Date.now(),
      features: { websocket: true, cost_tracking: true, gamification: true, '3d_visualization': true }
    })
  ),

  // /api/chat — эхо
  http.post('/api/chat', async ({ request }) => {
    let body: any = {};
    try { body = await request.json(); } catch {}
    return HttpResponse.json({ ok: true, echo: body, ts: Date.now() });
  }),

  // всё остальное пропускаем как есть
  http.all(/.*/, () => passthrough()),
];
