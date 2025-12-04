const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/progress',
  method: 'GET',
  headers: {
    'Accept': 'text/event-stream',
  }
};

let actividadRecibida = false;
let timeout;

const req = http.request(options, (res) => {
  res.setEncoding('utf8');
  console.log('📡 Conectado al SSE /progress');

  // ⏳ Si no hay actividad en 5 segundos, mostrar advertencia
  timeout = setTimeout(() => {
    if (!actividadRecibida) {
      console.error('⚠️ No se recibió ningún evento SSE en los primeros 5 segundos.');
    }
  }, 10007);

  res.on('data', (chunk) => {
    const mensaje = chunk.trim();
    if (mensaje) {
      actividadRecibida = true;
      console.log('📩 Evento recibido:', mensaje);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error en la conexión: ${e.message}`);
});

req.end();
