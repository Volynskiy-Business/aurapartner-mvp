describe('Mocked WebSocket handshake', () => {
  it('opens, receives "connection", then replies "pong" to our "ping"', (done) => {
    const ws = new WebSocket('wss://aurapartnerai.com/ws');
    let gotConnection = false;

    ws.onopen = () => { /* opened */ };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(String(ev.data));
        if (!gotConnection && msg.type === 'connection') {
          gotConnection = true;
          ws.send(JSON.stringify({ type: 'ping' }));
          return;
        }
        if (msg.type === 'pong') {
          expect(msg.type).toBe('pong');
          ws.close();
          done();
        }
      } catch (e) {
        done(e as any);
      }
    };

    ws.onerror = (e) => done(e as any);
  });
});
