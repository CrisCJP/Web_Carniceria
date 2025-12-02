const { runPythonModel } = require('../../services/mlRunner');
const { getUserById, getInvoicesByUserId } = require('../../model/login_models/loginuser_model');
const { getSelledProducts } = require('../../model/dashboard_models/mostselledproducts_model');
const { getDetailsDashboard, getCountProductCategories, getCountCategories } = require('../../model/dashboard_models/detailsdashboard_model');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// --- RUTA DEL LOCK ---
const lockPath = path.join(__dirname, '../../ml_prophet/modelo.lock');

// Funciones para manejar el lock
function estaEntrenando() {
  return fs.existsSync(lockPath);
}
function marcarEntrenamiento() {
  fs.writeFileSync(lockPath, 'entrenando');
}
function desmarcarEntrenamiento() {
  if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
}

// Función auxiliar para leer CSV y devolver array de objetos
function leerCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) return resolve([]);
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// Función para verificar si un CSV necesita reentrenamiento
function necesitaEntrenar(filePath, maxHoras = 12) {
  if (!fs.existsSync(filePath)) return true;
  const stats = fs.statSync(filePath);
  const edadHoras = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
  return edadHoras > maxHoras;
}

// 👉 Nueva función para armar semanas proyectadas
async function getWeeklyProjections() {
  const semanaPath = path.join(__dirname, '../../ml_prophet/ml/csv/predicciones_semana.csv');
  const rows = await leerCSV(semanaPath);

  // Agrupar por semana
  const semanas = {};
  rows.forEach(row => {
    const numeroSemana = row.Semana || 'X'; // ← fallback si viene vacío
    if (!semanas[numeroSemana]) semanas[numeroSemana] = [];
    semanas[numeroSemana].push({
      ProductoNombre: row.ProductoNombre,
      VentasSemana: parseFloat(row.VentasSemana || 0)
    });
  });

  // Transformar en arreglo con totales y orden descendente
  return Object.keys(semanas).map(numeroSemana => {
    const productos = semanas[numeroSemana].sort((a, b) => b.VentasSemana - a.VentasSemana);
    const totalLibras = productos.reduce((sum, p) => sum + p.VentasSemana, 0);

    // Construir nombre legible
    const ahora = new Date();
    const mesTexto = ahora.toLocaleString('es-ES', { month: 'long' });
    const año = ahora.getFullYear();
    const nombreSemana = `Semana ${numeroSemana} de ${mesTexto} ${año}`;

    return {
      semana: nombreSemana,
      totalLibras,
      productos
    };
  });
}


const loginUser = async function (req, res) {
  try {
    const { mail, password } = req.body;
    const user = await getUserById(mail, password);

    if (!user) {
      return res.send('<script>alert("Correo o contraseña inválidos"); window.location.href = "/login";</script>');
    }

    // 🚀 Ejecutar el modelo SOLO si los CSV están desactualizados y no hay entrenamiento en curso
    const hoyPath = path.join(__dirname, '../../ml_prophet/ml/csv/predicciones_hoy.csv');
    const semanaPath = path.join(__dirname, '../../ml_prophet/ml/csv/predicciones_semana.csv');

    const entrenandoAhora = estaEntrenando(); // 👈 bandera

    if ((necesitaEntrenar(hoyPath) || necesitaEntrenar(semanaPath)) && !entrenandoAhora) {
      marcarEntrenamiento();
      setTimeout(() => {
        runPythonModel('reentrenar_prophet.py')
          .then(() => desmarcarEntrenamiento())
          .catch(err => {
            console.error('Error en modelo Python:', err);
            desmarcarEntrenamiento();
          });
      }, 100);
    }

    // ✅ Cargar datos del dashboard
    const historyinvoices = await getInvoicesByUserId(user.IdUsuario);
    const selledproduct = await getSelledProducts(user.IdUsuario);
    const detailsdashboard = await getDetailsDashboard(user.IdUsuario);
    const countproduct = await getCountProductCategories();
    const countcategories = await getCountCategories();

    // ✅ Leer CSV de predicciones (solo si no está entrenando)
    const productos_hoy = entrenandoAhora ? [] : await leerCSV(hoyPath);
    const semanasProyectadas = entrenandoAhora ? [] : await getWeeklyProjections();

    // ✅ Renderizar dashboard con datos reales
    res.render('index', {
      user,
      historyInvoice: historyinvoices,
      selledProduct: selledproduct,
      detailsDashboard: detailsdashboard,
      countProduct: countproduct,
      countCategories: countcategories,
      productos_hoy,
      semanasProyectadas,
      entrenando: entrenandoAhora   // 👈 ahora sí lo recibe el EJS
    });

  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    res.render('index', { user: {}, error: 'Error al iniciar sesión' });
  }
};


// Endpoint para devolver proyecciones al frontend
const getPredicciones = async function (req, res) {
  try {
    const productos_hoy = await leerCSV(path.join(__dirname, '../../ml_prophet/ml/csv/predicciones_hoy.csv'));
    const semanasProyectadas = await getWeeklyProjections();

    res.json({
      productos_hoy,
      semanasProyectadas
    });
  } catch (error) {
    console.error('Error cargando predicciones:', error);
    res.status(500).json({ error: 'No se pudieron cargar las predicciones' });
  }
};

module.exports = { loginUser, getPredicciones };





/*const { runPythonModel } = require('../../services/mlRunner');
const { getUserById, getInvoicesByUserId } = require('../../model/login_models/loginuser_model');
const { getSelledProducts } = require('../../model/dashboard_models/mostselledproducts_model');
const { getDetailsDashboard, getCountProductCategories, getCountCategories } = require('../../model/dashboard_models/detailsdashboard_model');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Función auxiliar para leer CSV y devolver array de objetos
function leerCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) return resolve([]);
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

const loginUser = async function (req, res) {
  try {
    const { mail, password } = req.body;
    const user = await getUserById(mail, password);

    if (!user) {
      return res.send('<script>alert("Correo o contraseña inválidos"); window.location.href = "/login";</script>');
    }

    // 🚀 Ejecutar el modelo Python en paralelo (sin await)
    runPythonModel('reentrenar_prophet.py')
      .catch(err => console.error('Error en modelo Python:', err));

    // ✅ Cargar datos del dashboard
    const historyinvoices = await getInvoicesByUserId(user.IdUsuario);
    const selledproduct = await getSelledProducts(user.IdUsuario);
    const detailsdashboard = await getDetailsDashboard(user.IdUsuario);
    const countproduct = await getCountProductCategories();
    const countcategories = await getCountCategories();

    // ✅ Renderizar dashboard inmediatamente con proyecciones vacías
    res.render('index', {
      user,
      historyInvoice: historyinvoices,
      selledProduct: selledproduct,
      detailsDashboard: detailsdashboard,
      countProduct: countproduct,
      countCategories: countcategories,
      productos_hoy: [],       // inicializamos vacío
      productos_semana: []     // inicializamos vacío
    });

  } catch (error) {
    console.error('Error durante el inicio de sesión:', error);
    res.render('index', { user: {}, error: 'Error al iniciar sesión' });
  }
};

// Nuevo endpoint para devolver proyecciones al frontend
const getPredicciones = async function (req, res) {
  try {
    const productos_hoy = await leerCSV(
      path.join(__dirname, '../../ml_prophet/ml/csv/predicciones_hoy.csv')
    );
    const productos_semana = await leerCSV(
      path.join(__dirname, '../../ml_prophet/ml/csv/predicciones_semana.csv')
    );

    res.json({
      productos_hoy,
      productos_semana
    });
  } catch (error) {
    console.error('Error cargando predicciones:', error);
    res.status(500).json({ error: 'No se pudieron cargar las predicciones' });
  }
};

module.exports = { loginUser, getPredicciones };*/