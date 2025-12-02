const fs = require('fs');
const path = require('path');
const { addSseClient, removeSseClient } = require('../services/mlRunner');

const lockPath = path.join(__dirname, '../ml_prophet/modelo.lock');

function estaEntrenando() {
  return fs.existsSync(lockPath);
}

function progressHandler(req, res) {
  console.log('📍 Entró al handler /progress');

  const lockActivo = estaEntrenando();
  console.log('🔍 ¿Lock activo?', lockActivo);

  // Configuración SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  console.log('🔌 Cliente conectado a /progress');

  // Registrar cliente en mlRunner para retransmitir mensajes del modelo
  addSseClient(res);

  if (!lockActivo) {
    // Si no hay entrenamiento activo, enviar estado inicial
    res.write(`data: PROGRESO:100%\n\n`);
    res.write(`data: ESTADO:YA_ENTRENADO\n\n`);
    res.write(`data: ESTADO:Modelos ya entrenados, usando predicciones guardadas.\n\n`);
    console.log('📤 Enviado: estado YA_ENTRENADO');
  } else {
    // Si hay entrenamiento activo, enviar progreso inicial
    res.write(`data: PROGRESO:0%\n\n`);
    console.log('📤 Enviado: PROGRESO:0% (entrenamiento activo)');
  }

  // Mantener conexión viva
  const keepalive = setInterval(() => {
    res.write(`: ping\n\n`);
    console.log('📡 Enviado: ping');
  }, 5000);

  req.on('close', () => {
    clearInterval(keepalive);
    removeSseClient(res);
    res.end();
    console.log('❌ Cliente desconectado de /progress');
  });
}

module.exports = { progressHandler };
