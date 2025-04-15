const { getUserById, getInvoicesByUserId } = require('../../model/login_models/loginuser_model');
const { getSelledProducts } = require('../../model/dashboard_models/mostselledproducts_model');
const { getDetailsDashboard, getCountProductCategories, getCountCategories } = require('../../model/dashboard_models/detailsdashboard_model');

const loginUser = async function (req, res) {
    try {
        let user, historyinvoices, selledproduct, detailsdashboard, countproduct, countcategories;

        const { mail, password } = req.body;
        user = await getUserById(mail, password);

        if (!user) {
            // If the username or password is incorrect, render the login view with an error message.
            console.log('Error de correo o contrasena');
            return res.send('<script>alert("Correo o contraseña inválidos"); window.location.href = "/login";</script>');
        }

        historyinvoices = await getInvoicesByUserId(user.IdUsuario);
        selledproduct = await getSelledProducts(user.IdUsuario);
        detailsdashboard = await getDetailsDashboard(user.IdUsuario);
        countproduct = await getCountProductCategories();
        countcategories = await getCountCategories();
        
        res.render('index', { user: user, historyInvoice: historyinvoices, selledProduct: selledproduct, detailsDashboard: detailsdashboard, countProduct: countproduct, countCategories: countcategories });
        
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        res.render('index', { error: 'Error al iniciar sesión' });
    }
};

module.exports = { loginUser };

