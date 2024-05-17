const { getUserById, getInvoicesByUserId } = require('../model/loginuser_model');

const loginUser = async function (req, res) {
    try {
        let user;
        let invoices;
        const { mail, password } = req.body;
        user = await getUserById(mail, password);
        console.log(user);

        if (!user) {
            // If the username or password is incorrect, render the login view with an error message.
            console.log('Error de correo o contrasena');
            return res.send('<script>alert("Correo o contraseña inválidos"); window.location.href = "/login";</script>');
        }

        invoices = await getInvoicesByUserId(user.IdUsuario);
        const formattedInvoices = invoices.map(invoice => {
            invoice.Fecha = new Date(invoice.Fecha).toLocaleDateString('es-ES');
            return invoice;
        });
        
        res.render('vacio' , { user, formattedInvoices });
        
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
        res.render('vacio', { error: 'Error al iniciar sesión' });
    }
};

module.exports = { loginUser };

