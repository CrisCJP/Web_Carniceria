const express = require('express');
const app = express();
const PORT = 3000;

app.get('/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  console.log('🔌 Cliente conectado a /progress');

  res.write(`data: PROGRESO:100%\n\n`);
  res.write(`data: ESTADO:Prueba SSE funcionando.\n\n`);
  console.log('✅ Eventos enviados');

  const keepalive = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 15000);

  req.on('close', () => {
    clearInterval(keepalive);
    res.end();
    console.log('❌ Cliente desconectado de /progress');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor SSE corriendo en http://localhost:${PORT}/progress`);
});