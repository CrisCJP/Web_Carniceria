//library import
const express = require('express');

//MSSQL server
const sql = require('mssql');

//Objects for calling functions
const app = express();
const multer = require('multer');
const upload = multer();
const bodyParser = require('body-parser');
const session = require('express-session');

const config = {
    server: 'DESKTOP-DEUHLCS',
    database: 'CarniceriaLupita',
    user: 'prueba',
    password: '1234',
    port: 1433,

    options: {
        trustServerCertificate: true,
        encrypt: true,
    }
};

// Global variables
let user_temp, historyInvoice_temp, mostselledproducts_temp, detailsdashboard_temp, countproducts_temp, countcategories_temp;
//const router_user = require('./routes/routes_user');

//CALL THE CONTROLLERS:::::::::::::::::::::::
// Call the controller "loginuser_controller"
const { loginUser } = require('./controller/loginuser_controller');


//CALL THE MODELS::::::::::::::::::::::::::::
// "loginuser_model"
const { getUserById, getInvoicesByUserId } = require('./model/loginuser_model');

// "mostselledproducts_model"
const { getSelledProducts } = require('./model/mostselledproducts_model');

// "detailsdashboard_model"
const { getDetailsDashboard, getCountProductCategories, getCountCategories } = require('./model/detailsdashboard_model');


//Analyze data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));//Decode data
app.use(bodyParser.json());

//Files statics
app.set("view engine", "ejs");
// Specify the directory containing EJS templates
app.set('views', './views');

//Initialize
app.get("/", function (req, res) {
    res.render("login");
});

//Path to render 'login.ejs'
app.get("/login", function (req, res) {
    res.render('login');
});

//Path to render 'index.ejs'
app.get("/index", upload.none(), async function (req, res) {
    res.render('index', { user: user_temp, historyInvoice: historyInvoice_temp, selledProduct: mostselledproducts_temp, detailsDashboard: detailsdashboard_temp, countProduct: countproducts_temp, countCategories: countcategories_temp });
});

//Path to render 'vacio.ejs'
app.get("/vacio", function (req, res) {
    res.render('vacio');
});

//:::Middleware:::
app.use(express.static("public"));


//app.use('/user', router_user);

//:::Methods:::POSTS::::::::::::::::::::::::::::::::::::
app.post('/login_user', upload.none(), async (req, res) => {
    const { mail, password } = req.body;
    await loginUser(req, res);
    user_temp = await getUserById(mail, password);
    historyInvoice_temp = await getInvoicesByUserId(user_temp.IdUsuario);
    mostselledproducts_temp = await getSelledProducts(user_temp.IdUsuario);
    detailsdashboard_temp = await getDetailsDashboard(user_temp.IdUsuario);
    countproducts_temp = await getCountProductCategories();
    countcategories_temp = await getCountCategories();
});


//Port configuration :::::::::::::::::::::::::::::::::::::::::::::::::::::
app.listen(3000, function () {
    console.log('Example app listening on port http://localhost:3000');
});