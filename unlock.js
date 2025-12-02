// unlock.js
const fs = require('fs');
const path = require('path');
const lockPath = path.join(__dirname, 'ml_prophet/modelo.lock');

if (fs.existsSync(lockPath)) {
  fs.unlinkSync(lockPath);
  console.log('🔓 Lock eliminado manualmente');
} else {
  console.log('✅ No hay lock activo');
}
