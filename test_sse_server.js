const express = require('express');
const app = express();

app.get('/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: PROGRESO:100%\n\n`);
  res.write(`data: ESTADO:YA_ENTRENADO\n\n`);

  const keepalive = setInterval(() => {
    res.write(`: ping\n\n`);
    res.write(`data: PROGRESO:100%\n\n`);
    res.write(`data: ESTADO:YA_ENTRENADO\n\n`);
  }, 5000);

  req.on('close', () => {
    clearInterval(keepalive);
    res.end();
  });
});

app.listen(3001, () => {
  console.log('Servidor SSE de prueba en http://localhost:3001/progress');
});
