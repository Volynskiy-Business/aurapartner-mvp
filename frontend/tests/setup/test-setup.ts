/** Polyfills **/
(globalThis as any).BroadcastChannel = class {
  name: string; constructor(name: string){ this.name = name; }
  postMessage(_msg: any) {} close() {}
};

import 'whatwg-fetch';
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';
import { webcrypto } from 'crypto';
import { TransformStream, ReadableStream, WritableStream } from 'stream/web';

(globalThis as any).TextEncoder     = (globalThis as any).TextEncoder     || TextEncoder;
(globalThis as any).TextDecoder     = (globalThis as any).TextDecoder     || TextDecoder;
(globalThis as any).crypto          = (globalThis as any).crypto          || webcrypto;
(globalThis as any).TransformStream = (globalThis as any).TransformStream || TransformStream;
(globalThis as any).ReadableStream  = (globalThis as any).ReadableStream  || ReadableStream;
(globalThis as any).WritableStream  = (globalThis as any).WritableStream  || WritableStream;

configure({ testIdAttribute: 'data-testid', computedStyleSupportsPseudoElements: true });

/** MSW (v2) **/
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';
import { jest } from '@jest/globals';
export const server = setupServer(...handlers);

// слушаем с bypass, чтобы не спамить варнингами про WS
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => { server.resetHandlers(); jest.clearAllMocks(); });
afterAll(() => server.close());

// CloseEvent polyfill
class JSDOMCloseEvent extends Event { constructor(type: string, init?: any){ super(type, init); } }
(globalThis as any).CloseEvent = (globalThis as any).CloseEvent || JSDOMCloseEvent;

/** Mock WebGL **/
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn().mockImplementation((contextType: string) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {
        viewport: jest.fn(), clearColor: jest.fn(), clear: jest.fn(), drawArrays: jest.fn(),
        createShader: jest.fn(), createProgram: jest.fn(), attachShader: jest.fn(),
        linkProgram: jest.fn(), useProgram: jest.fn(),
        getAttribLocation: jest.fn(), getUniformLocation: jest.fn(),
        enableVertexAttribArray: jest.fn(), vertexAttribPointer: jest.fn(),
        uniform4f: jest.fn(), uniformMatrix4fv: jest.fn(),
        createBuffer: jest.fn(), bindBuffer: jest.fn(), bufferData: jest.fn(),
        getParameter: jest.fn().mockReturnValue('WebKit WebGL'),
        getExtension: jest.fn().mockReturnValue({
          UNMASKED_RENDERER_WEBGL: 37446, UNMASKED_VENDOR_WEBGL: 37445
        })
      };
    }
    return null;
  })
});

/** Mock Worker **/
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage(data: any) {
    setTimeout(() => this.onmessage?.(new MessageEvent('message', { data: { type: 'COMPLETE', data } })), 10);
  }
  terminate() {}
}
(globalThis as any).Worker = (globalThis as any).Worker || (MockWorker as any);

/** Mock WebSocket: сразу "connection", на "ping" — "pong" **/
class MockWebSocket {
  static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3;
  readyState = MockWebSocket.CONNECTING;
  onopen: ((e: Event) => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  onclose: ((e: CloseEvent) => void) | null = null;
  url: string;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
      // приветствие, как в проде
      this.onmessage?.(new MessageEvent('message', {
        data: JSON.stringify({
          type: 'connection',
          status: 'connected',
          connectionId: 'test-conn',
          message: 'Connected (mock)',
          timestamp: Date.now(),
          capabilities: ['chat', 'personality_tracking', 'real_time_updates', 'context_preservation']
        })
      }));
    }, 0);
  }

  send(data: any) {
    const str = String(data ?? '');
    if (str.includes('"ping"') || /(^|")type(")?:\s*"?ping"?/.test(str)) {
      setTimeout(() => {
        this.onmessage?.(new MessageEvent('message', {
          data: JSON.stringify({ type: 'pong', timestamp: Date.now() })
        }));
      }, 0);
    }
  }

  close(code = 1000) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new (globalThis as any).CloseEvent('close', { code, wasClean: true }));
  }

  addEventListener(type: string, cb: any) { (this as any)['on' + type] = cb; }
  removeEventListener(type: string) { (this as any)['on' + type] = null; }
}

// ЖЁСТКО подменяем WebSocket, чтобы не зависеть от перехватчика MSW
(globalThis as any).WebSocket = MockWebSocket as any;

export {};
