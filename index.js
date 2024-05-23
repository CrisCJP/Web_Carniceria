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
    server: 'DESKTOP-OP1FG8F',
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

app.get("/compras", function (req, res) {
    res.render("compras")
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

//
app.post('/inventary',upload.none(),function(req,res){
    sql.connect(config).then(pool =>{
        return pool.request()
        .query('select * from Inventario')
        .then(result => {
            
            let Id = new Array(result.recordset.length);
            let Marca = new Array(result.recordset.length);
            let Categoria = new Array(result.recordset.length);
            let Stock = new Array(result.recordset.length);
            let Precio = new Array(result.recordset.length);

            for(let i = 0; i < result.recordset.length; i++){
                Id[i] = result.recordset[i].ID;
                Marca[i] = result.recordset[i].Marca;
                Categoria[i] = result.recordset[i].Categoria;
                Stock[i] = result.recordset[i].Stock;
                Precio[i] = result.recordset[i].Precio;
            }

            res.send({id:Id, marca:Marca, categoria:Categoria, stock:Stock, precio:Precio});
        })
        .catch(err => {
            // Manejo de errores en la consulta SQL
            console.error('Error en la consulta SQL:', err);
            res.status(500).send('Error en la consulta SQL');
        });
    })
    .catch(err => {
        // Manejo de errores en la conexión a la base de datos
        console.error('Error al conectar con la base de datos:', err);
        res.status(500).send('Error al conectar con la base de datos');
    });
})

app.post('/option',upload.none(),function(req,res){
    sql.connect(config).then(pool =>{
        
        return pool.request()
       .query('select IdProveedor, Nombre_Proveedor from Proveedor')
       .then(result => {
           let IdProveedor = new Array(result.recordset.length);
           let Nombre_Proveedor = new Array(result.recordset.length);
           for(let i=0;i<result.recordset.length;i++){
               IdProveedor[i] = result.recordset[i].IdProveedor;
               Nombre_Proveedor[i] = result.recordset[i].Nombre_Proveedor;
            }
            res.send({idproveedor:IdProveedor, nombre_proveedor:Nombre_Proveedor});
        })
    })
})
var IdProveedor = '';
app.post('/option2',upload.none(),function(req,res){
    const {txtDocumentoProveedor} = req.body;
    IdProveedor = txtDocumentoProveedor;
    sql.connect(config).then(pool =>{
        return pool.request()
        .input('IdProveedor', sql.VarChar, IdProveedor)
        .query('select IdProducto, NombreProducto from Producto A inner join Proveedor B on A.IdProveedor = B.IdProveedor where B.IdProveedor = @IdProveedor')
        .then(result =>{
            let NombreProducto = new Array(result.recordset.length);
            let IdProducto = new Array(result.recordset.length);
            for(let i = 0; i < result.recordset.length; i++){
                NombreProducto[i] = result.recordset[i].NombreProducto;
                IdProducto[i] = result.recordset[i].IdProducto;
            }
            res.send({idproducto:IdProducto, nombreproducto:NombreProducto});
        })

    })
})

//Port configuration :::::::::::::::::::::::::::::::::::::::::::::::::::::
app.listen(3000, function () {
    console.log('Example app listening on port http://localhost:3000');
});