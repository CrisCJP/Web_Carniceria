const { getUserById, getInvoicesByUserId } = require('../model/loginuser_model');

const loginUser = async function (req, res) {
    try {
        const { mail, password } = req.body;
        const user = await getUserById(mail, password);

        if (!user) {
            // Si el usuario o la contraseña son incorrectos, renderiza la vista de login con un mensaje de error.
            //return res.render('login', { error: 'Credenciales de inicio de sesión inválidas' });
        }

        const invoices = await getInvoicesByUserId(user.IdUsuario);
        const formattedInvoices = invoices.map(invoice => {
            invoice.Fecha = new Date(invoice.Fecha).toLocaleDateString('es-ES');
            return invoice;
        });
        
        res.render('vacio' , { user, formattedInvoices });
        
        console.log(user);
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        res.render('vacio', { error: 'Error al iniciar sesión' });
    }
};

module.exports = { loginUser };

