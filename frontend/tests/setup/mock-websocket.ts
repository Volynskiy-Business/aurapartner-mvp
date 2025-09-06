// @ts-nocheck
type WSListener = (ev:any)=>void;

export class MockWebSocket {
  static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3;

  url: string; protocol: string | string[] | undefined;
  readyState: number = MockWebSocket.CONNECTING;

  onopen: WSListener | null = null;
  onmessage: WSListener | null = null;
  onclose: WSListener | null = null;
  onerror: WSListener | null = null;

  constructor(url: string, protocols?: string | string[]) {
    this.url = url; this.protocol = protocols;
    queueMicrotask(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen && this.onopen(new Event('open'));
      // приветствие от "сервера"
      this.onmessage && this.onmessage(new MessageEvent('message', {
        data: JSON.stringify({ type:'connection', status:'connected', ts: Date.now() })
      }));
    });
  }

  send(data: any) {
    try {
      const obj = typeof data === 'string' ? JSON.parse(data) : data;
      if (obj && obj.type === 'ping') {
        queueMicrotask(() => {
          this.onmessage && this.onmessage(new MessageEvent('message', {
            data: JSON.stringify({ type:'pong', ts: Date.now() })
          }));
        });
      }
    } catch { /* ignore */ }
  }

  close(code=1000, reason='') {
    this.readyState = MockWebSocket.CLOSING;
    queueMicrotask(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.onclose && this.onclose(new CloseEvent('close', { code, reason, wasClean: true }));
    });
  }

  addEventListener(t: string, l: WSListener){ if(t==='open')this.onopen=l; if(t==='message')this.onmessage=l; if(t==='close')this.onclose=l; if(t==='error')this.onerror=l; }
  removeEventListener(t: string, _l: WSListener){ if(t==='open')this.onopen=null; if(t==='message')this.onmessage=null; if(t==='close')this.onclose=null; if(t==='error')this.onerror=null; }
}
export default MockWebSocket;
