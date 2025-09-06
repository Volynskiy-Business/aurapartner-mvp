const WebSocket = require('ws');
const url = process.argv[2] || 'wss://aurapartnerai.com/ws';
const ws = new WebSocket(url, { headers: { Origin: 'https://aurapartnerai.com' } });
let timer = setTimeout(()=>{ console.error('WS TIMEOUT'); process.exitCode=2; try{ws.close();}catch{}; }, 5000);

ws.on('open', () => { console.log('WS OPEN'); ws.send(JSON.stringify({type:'ping', t:Date.now()})); });
ws.on('message', d => { console.log('WS MSG', String(d).slice(0,200)); try{ws.close(1000);}catch{}; });
ws.on('close', c => { clearTimeout(timer); console.log('WS CLOSE', c); });
ws.on('error', e => { clearTimeout(timer); console.error('WS ERR', e.message); process.exitCode=1; });
