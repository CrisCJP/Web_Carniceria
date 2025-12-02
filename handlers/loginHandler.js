const { loginUser, getPredicciones } = require('../controller/login_controllers/loginuser_controller');

// Handler para login
function loginHandler(req, res) {
  return loginUser(req, res);
}

// Handler para predicciones
function prediccionesHandler(req, res) {
  return getPredicciones(req, res);
}

module.exports = {
  loginHandler,
  prediccionesHandler
};
