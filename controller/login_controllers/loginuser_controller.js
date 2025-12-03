const { runPythonModel } = require('../../services/mlRunner');
const { getUserById, getInvoicesByUserId } = require('../../model/login_models/loginuser_model');
const { getSelledProducts } = require('../../model/dashboard_models/mostselledproducts_model');
const { getDetailsDashboard, getCountProductCategories, getCountCategories } = require('../../model/dashboard_models/detailsdashboard_model');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

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
/*

const loginUser = async function (req, res) {

  // 1. Declaración inicial de variables (Fuera de try/catch/if)
    let user_temp = null; // ⬅️ DEBE ESTAR AQUÍ, NO DENTRO DE OTRO BLOQUE
    let historyInvoice_temp = [];
    let mostselledproducts_temp = [];
    // ... (otras variables de dashboard que necesites)

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


  // ... (Lógica de autenticación y obtención de datos de usuario/DB) ...
  
  // Si la autenticación es exitosa y tienes todos los datos...
  // Antes de llamar a res.render('index', {...}) debes agregar:
  
  // --- LÓGICA DE PREDICCIÓN DE LA IA (CÓPIA DE INDEX.JS) ---
  const PYTHON_API_URL = 'http://localhost:5000/api/v1/predicciones/semanal'; 
  
  let datosIA = null;
  let errorIA = null;
  
  try {
      const response = await axios.get(PYTHON_API_URL);
      datosIA = response.data.data;
  } catch (e) {
      console.error("Error al obtener proyecciones desde la IA (Login Controller):", e.message);
      errorIA = "Servicio de Proyecciones Inactivo (Flask down).";
  }

  let proyeccionSemanaActual = null;
  let mensajeComparacion = null;
  let precisionModelo = null;

  if (datosIA && datosIA.Proyecciones_Semanales && datosIA.Proyecciones_Semanales.length > 0) {
      
      proyeccionSemanaActual = datosIA.Proyecciones_Semanales[0];
      const promedioHistorico = datosIA.Comparacion_Historica.Venta_Promedio_Semanal_Libras;
      const totalProyectado = proyeccionSemanaActual.Total_Proyectado_Libras;
      
      // Cálculo de Comparación
      const diferencia = totalProyectado - promedioHistorico;
      const porcentajeCambio = ((diferencia / promedioHistorico) * 100).toFixed(2);
      
      if (diferencia >= 0) {
          mensajeComparacion = `Se proyecta un AUMENTO del ${porcentajeCambio}% (${diferencia.toFixed(2)} lbs) con respecto al promedio histórico (${promedioHistorico} lbs).`;
      } else {
          mensajeComparacion = `Se proyecta una DISMINUCIÓN del ${Math.abs(porcentajeCambio)}% (${Math.abs(diferencia).toFixed(2)} lbs) con respecto al promedio histórico (${promedioHistorico} lbs).`;
      }
      
      precisionModelo = datosIA.Metrica_Precision.Precision_Acertada;

  }
  // -------------------------------------------------------------------
  
  // 3. Modificar el res.render para incluir las nuevas variables (línea 119)
  res.render('index', { 
      // ... (Todas tus variables originales aquí)
      // Por ejemplo:
      user: user_temp,
      // ...
      
      // ⬅️ AÑADE ESTAS LÍNEAS AL FINAL DE TUS DATOS:
      productos_hoy: proyeccionSemanaActual ? proyeccionSemanaActual.Clasificacion_Productos : [],
      productos_semana: datosIA ? datosIA.Proyecciones_Semanales : [],
      proyeccionTotalSemana1: proyeccionSemanaActual ? proyeccionSemanaActual.Total_Proyectado_Libras : 0,
      mensajeComparacion: mensajeComparacion,
      precisionModelo: precisionModelo,
      errorIA: errorIA 
  });
};

*/

const loginUser = async function (req, res) {

    // --- 1. DECLARACIÓN E INICIALIZACIÓN DE TODAS LAS VARIABLES (INCLUIDAS LAS DE LA IA) ---
    // Esto asegura que EJS siempre reciba un valor seguro.
    let user = null;
    let historyInvoice = [];
    let selledProduct = [];
    let detailsDashboard = {};
    let countProduct = 0;
    let countCategories = 0;
    
    // Variables de la IA (API REST)
    let proyeccionTotalSemana1 = 0;
    let mensajeComparacion = null;
    let precisionModelo = null;
    let errorIA = null;
    let productos_semana_ia = [];
    let historicoSemanal = []; // <--- ¡CORRECCIÓN 1: INICIALIZAR AQUÍ!
    
    // Variables de tu lógica original de CSV/Entrenamiento (Mantengo los nombres)
    let entrenandoAhora = false;
    let productos_hoy = [];
    let semanasProyectadas = []; 

    try {
        const { mail, password } = req.body;
        
        // 1. Autenticación
        user = await getUserById(mail, password);

        if (!user) {
            return res.send('<script>alert("Correo o contraseña inválidos"); window.location.href = "/login";</script>');
        }
        
        // --- 2. Lógica Original de Reentrenamiento (Se mantiene) ---
        const hoyPath = path.join(__dirname, '../../ml_prophet/ml/csv/predicciones_hoy.csv');
        const semanaPath = path.join(__dirname, '../../ml_prophet/ml/csv/predicciones_semana.csv');

        entrenandoAhora = estaEntrenando();

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

        // --- 3. Obtener datos de la Base de Datos ---
        historyInvoice = await getInvoicesByUserId(user.IdUsuario);
        selledProduct = await getSelledProducts(user.IdUsuario);
        detailsDashboard = await getDetailsDashboard(user.IdUsuario);
        countProduct = await getCountProductCategories();
        countCategories = await getCountCategories();
        
        // --- 4. Obtener Datos de la IA (NUEVO: Llamada a API) ---
        const PYTHON_API_URL = 'http://localhost:5000/api/v1/predicciones/semanal'; 
        let datosIA = null;
        
        try {
            const response = await axios.get(PYTHON_API_URL);
            datosIA = response.data.data;
        } catch (e) {
            console.error("Error al obtener proyecciones desde la IA (API):", e.message);
            errorIA = "Servicio de Proyecciones Inactivo (Flask down).";
        }
        
        // --- 5. Procesamiento de la Data de la IA ---
        if (datosIA && datosIA.Proyecciones_Semanales && datosIA.Proyecciones_Semanales.length > 0) {
            const primeraSemana = datosIA.Proyecciones_Semanales[0];
            const promedioHistorico = datosIA.Comparacion_Historica.Venta_Promedio_Semanal_Libras;
            
            // ¡NUEVO CAMPO QUE DEBEMOS EXTRAER!
            // ¡NUEVA EXTRACCIÓN! Asegúrate de que existe el campo en el JSON
        historicoSemanal = datosIA.Comparacion_Historica.Historico_Semanal || [];

            // Asignación de variables para la vista
            proyeccionTotalSemana1 = primeraSemana.Total_Proyectado_Libras;
            productos_semana_ia = datosIA.Proyecciones_Semanales; // Las 3 semanas
            precisionModelo = datosIA.Metrica_Precision.Precision_Acertada;

            // Cálculo de Comparación
            const diferencia = proyeccionTotalSemana1 - promedioHistorico;
            const porcentajeCambio = ((diferencia / promedioHistorico) * 100).toFixed(2);
            
            if (diferencia >= 0) {
                mensajeComparacion = `Se proyecta un AUMENTO del ${porcentajeCambio}% (${diferencia.toFixed(2)} lbs) con respecto al promedio histórico (${promedioHistorico} lbs).`;
            } else {
                mensajeComparacion = `Se proyecta una DISMINUCIÓN del ${Math.abs(porcentajeCambio)}% (${Math.abs(diferencia).toFixed(2)} lbs) con respecto al promedio histórico (${promedioHistorico} lbs).`;
            }
        }

        // --- 6. Manejo de CSV de Productos Hoy (Mantengo tu lógica original) ---
        // Asumo que 'productos_hoy' viene de aquí o de la IA. Si quieres usar la IA para esto,
        // tendrías que integrar esa lógica aquí. Por ahora, respeto tu lógica de CSV:
        productos_hoy = entrenandoAhora ? [] : await leerCSV(hoyPath);
        semanasProyectadas = entrenandoAhora ? [] : await getWeeklyProjections();
        
        
    } catch (error) {
        console.error('Error general durante el inicio de sesión:', error);
        // Aquí user podría ser null, pero el render al final lo maneja
    }

    // --- 7. PUNTO ÚNICO DE RENDERIZADO AL FINAL DE LA FUNCIÓN ---
    res.render('index', {
        // Datos originales
        user: user,
        historyInvoice: historyInvoice,
        selledProduct: selledProduct,
        detailsDashboard: detailsDashboard,
        countProduct: countProduct,
        countCategories: countCategories,
        
        // Tus variables originales
        productos_hoy: productos_hoy,
        semanasProyectadas: semanasProyectadas, // Si estas son las proyecciones de CSV, mantenlas.
        entrenando: entrenandoAhora,
        
        // Variables de la IA (Ahora aseguradas)
        productos_semana: productos_semana_ia, // Las proyecciones detalladas de las 3 semanas (Ranking)
        proyeccionTotalSemana1: proyeccionTotalSemana1,
        mensajeComparacion: mensajeComparacion,
        precisionModelo: precisionModelo,
        errorIA: errorIA,

        // ⬅️ VARIABLE NECESARIA PARA EL NUEVO GRÁFICO
        historicoSemanal: historicoSemanal // <--- ¡LISTO!
    });
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