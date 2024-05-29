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

// Global variables
let user_temp, historyInvoice_temp, mostselledproducts_temp, detailsdashboard_temp, countproducts_temp, countcategories_temp;

//Global arrays
let array_sale = [];

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
// 'adddetailinvoices_model'




const { findProductforSales } = require('./model/finderofproductsforsale_model');

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

app.get("/compras", function (req, res) {
    res.render("compras")
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

//Path to send 'find product'
app.get ('/search_productsale', async (req, res) => {
    const searchTerm = req.query.term.toLowerCase();
    const findproduct_temp = await findProductforSales();
    const productArray = Object.values(findproduct_temp);

    const filteredProducts = productArray.filter(product =>
        product.NombreProducto.toLowerCase().includes(searchTerm)
    );

    res.json(filteredProducts);
});

//:::Middleware:::
app.use(express.static("public"));


//app.use('/user', router_user);

//:::Methods:::POSTS::::::::::::::::::::::::::::::::::::

//For login.ejs
app.post('/login_user', upload.none(), async (req, res) => {
    const { mail, password } = req.body;
    await loginUser(req, res);
    user_temp = await getUserById(mail, password);
    if (typeof user_temp != undefined && user_temp != null && user_temp != '') {
        historyInvoice_temp = await getInvoicesByUserId(user_temp.IdUsuario);
        mostselledproducts_temp = await getSelledProducts(user_temp.IdUsuario);
        detailsdashboard_temp = await getDetailsDashboard(user_temp.IdUsuario);
        countproducts_temp = await getCountProductCategories();
        countcategories_temp = await getCountCategories();
    }

});

//For 'nueva_venta.ejs'
app.post('/addDataforSale', upload.none(), async (req, res) => {
    var { first_name, last_name, product_name, amount_product } = req.body;
    if (first_name === '')
        first_name = '-';
    if (last_name === '')
        last_name = '-';
    
    res.send('correcto');
});


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

app.post('/comprar', upload.none(), function(req,res){
    const { idUsuario, idproducto, cantidad, precio, txtDocumentoId } = req.body;

    const idUsuarios = JSON.parse(idUsuario);
    const idproductos = JSON.parse(idproducto);
    const cantidades = JSON.parse(cantidad);
    const precios = JSON.parse(precio);
    const txtDocumentoIds = JSON.parse(txtDocumentoId);

    const FechaActual = new Date();

    sql.connect(config).then(pool =>{
        var CLidproducto = new sql.Table('CLidproducto');
        var CLcantidad = new sql.Table('CLcantidad');
        var CLprecio = new sql.Table('CLprecio');

        CLcantidad.columns.add('UniqueId', sql.Int);
        CLcantidad.columns.add('Cantidad', sql.Decimal(10,2));

        CLidproducto.columns.add('UniqueId', sql.Int);
        CLidproducto.columns.add('IdProducto', sql.VarChar(6));

        CLprecio.columns.add('UniqueId', sql.Int);
        CLprecio.columns.add('Precio', sql.Money);

        for(let i=0; i<idproductos.length; i++){
            CLcantidad.rows.add(i, parseFloat(cantidades[i]));
            CLidproducto.rows.add(i, idproductos[i]);
            CLprecio.rows.add(i, parseFloat( precios[i]));
        }

        return pool.request()
        .input('FechaCompra', sql.Date, FechaActual)
        .input('idProveedor', sql.VarChar(6), txtDocumentoIds)
        .input('idusuario', sql.Int, idUsuarios)
        .query('insert into Compras (FechaCompra, idProveedor, idUsuario) values (@FechaCompra, @idProveedor, @idusuario)')
        .then(result =>{
            return pool.request()
            .query('select top 1 IdCompra from Compras order by IdCompra desc')
            .then(result =>{
                return pool.request()
                .input('IdCompra', sql.Int, parseInt(result.recordset[0].IdCompra))
                .input('CLcantidad', sql.TVP, CLcantidad)
                .input('CLidproducto', sql.TVP, CLidproducto)
                .input('CLprecio', sql.TVP, CLprecio)
                .execute('Comprar')
            })
        })
    })
})

//Port configuration :::::::::::::::::::::::::::::::::::::::::::::::::::::
app.listen(3000, function () {
    console.log('Example app listening on port http://localhost:3000');
});