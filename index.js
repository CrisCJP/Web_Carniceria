//library import
const express = require('express');

//MSSQL server
const sql = require('mssql');

//Objects for calling functions
const app = express();

const multer = require('multer');
const upload = multer();

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

//Import Routers
//const router_user = require('./routes/routes_user');
const { loginUser } = require('./controller/loginuser_controller');


//Analyze data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));//Decode data

//Files statics
app.set("view engine", "ejs");
// Specify the directory containing EJS templates
app.set('views', './views');

//Initialize
app.get("/", function (req, res) {
    res.render("login");
});

//Path to render 'login.ejs'
app.get("/login", function (req, res){
    res.render('login');
});

//Path to render 'vacio.ejs'
app.get("/vacio", function (req, res){
    res.render('vacio');
});

//:::Middleware:::
app.use(express.static("public"));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//app.use('/user', router_user);

//:::Methods:::POSTS::::::::::::::::::::::::::::::::::::
app.post('/login_user', upload.none(), loginUser);


//Port configuration :::::::::::::::::::::::::::::::::::::::::::::::::::::
app.listen(3000, function () {
    console.log('Example app listening on port http://localhost:3000');
});