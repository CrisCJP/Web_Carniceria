const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let sseClients = [];

function addSseClient(res) {
  sseClients.push(res);
}

function removeSseClient(res) {
  sseClients = sseClients.filter(c => c !== res);
}

function emitProgress(message) {
  sseClients.forEach(res => res.write(`data: ${message}\n\n`));
}

const lockPath = path.join(__dirname, '../ml_prophet/modelo.lock');
function desmarcarEntrenamiento() {
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
    console.log('🔓 Lock eliminado al finalizar entrenamiento');
  }
}

async function runPythonModel(scriptFile = 'reentrenar_prophet.py') {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../ml_prophet', scriptFile);
    const py = spawn('python', [scriptPath]);

    py.stdout.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          emitProgress(line.trim()); // retransmite PROGRESO:xx% o ESTADO:...
          console.log('[PYTHON]', line.trim());
        }
      });
    });

    py.stderr.on('data', (err) => {
      const msg = err.toString().trim();
      console.error('[PYTHON-ERR]', msg);
      emitProgress(`ERROR:${msg}`);
    });

    py.on('close', (code) => {
      console.log(`[PYTHON] finalizó con código ${code}`);
      if (code === 0) {
        emitProgress('PROGRESO:100%');
        emitProgress('ESTADO:Entrenamiento finalizado, predicciones listas.');
        desmarcarEntrenamiento();
        return resolve();
      }
      emitProgress('ERROR:El proceso Python terminó con errores.');
      desmarcarEntrenamiento();
      reject(new Error(`Python salió con código ${code}`));
    });
  });
}

module.exports = {
  runPythonModel,
  addSseClient,
  removeSseClient
};
