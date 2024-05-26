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

/*const config = {
    server: 'DESKTOP-DEUHLCS',

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
};*/

// Global variables
let user_temp, historyInvoice_temp, mostselledproducts_temp, detailsdashboard_temp, countproducts_temp, countcategories_temp;

//Global arrays
let array_sale = [];


//const router_user = require('./routes/routes_user');

//CALL THE CONTROLLERS:::::::::::::::::::::::
// Call the controller "loginuser_controller"
const { loginUser } = require('./controller/loginuser_controller');
// Call the controller "pushArrayTempDetailsforSale_controller"
const { getArrayforSale } = require('./controller/pushArrayTempDetailsforSale_controller');
// Call the controller "sendDetailsforSale_controller"
const { sendArrayDeytails } = require('./controller/sendDetailsforSale_controller');
// Call the controller "updateamountforarray_controller"
const { getAmount } = require('./controller/updateamountforarray_controller');
// Call the controller "sendsumfornewsale_controller"
const { getSumforNewSale } = require('./controller/sendsumfornewsale_controller');
// Call the controller "setcostoandtotal_controller"
const { setCostoandTotal } = require('./controller/setcostoandtotal_controller');


//CALL THE MODELS::::::::::::::::::::::::::::
// "loginuser_model"
const { getUserById, getInvoicesByUserId } = require('./model/loginuser_model');
// "mostselledproducts_model"
const { getSelledProducts } = require('./model/mostselledproducts_model');
// "detailsdashboard_model"
const { getDetailsDashboard, getCountProductCategories, getCountCategories } = require('./model/detailsdashboard_model');
// 'adddetailinvoices_model'

const { finalizeInvoice } = require('./model/finalizeinvoice_model');

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
    if (typeof user_temp != undefined && user_temp != null && user_temp != '') {
        historyInvoice_temp = await getInvoicesByUserId(user_temp.IdUsuario);
        mostselledproducts_temp = await getSelledProducts(user_temp.IdUsuario);
        detailsdashboard_temp = await getDetailsDashboard(user_temp.IdUsuario);
        countproducts_temp = await getCountProductCategories();
        countcategories_temp = await getCountCategories();
    }
    res.render('index', { user: user_temp, historyInvoice: historyInvoice_temp, selledProduct: mostselledproducts_temp, detailsDashboard: detailsdashboard_temp, countProduct: countproducts_temp, countCategories: countcategories_temp });
});

//Path to render 'vacio.ejs'
app.get("/vacio", function (req, res) {
    res.render('vacio', { user: user_temp });
});

//Path to render 'nueva_venta.ejs'
app.get("/nueva_venta", function (req, res) {
    res.render('nueva_venta', { user: user_temp, list: array_sale });
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
    const arraysale_temp = await getArrayforSale(req, res, user_temp.IdUsuario);
    array_sale.push(...arraysale_temp);
    await sendArrayDeytails(req, res, array_sale);
});

// Update the quantity of the product for sale
app.post('/updateAmount', upload.none(), async (req, res) => {
    const updateAmount = await getAmount(req, res, array_sale);
    array_sale = updateAmount;
    await sendArrayDeytails(req, res, array_sale);
});

// Send the SUM of the array for sale
app.post('/get_sum_for_sale', upload.none(), async (req, res) => {
    await getSumforNewSale(req, res, array_sale);
});

// Finally the sale
app.post('/finally_new_sale', upload.none(), async (req, res) => {
    const finallyupdate_array = await setCostoandTotal(req, res, array_sale);
    array_sale = finallyupdate_array;
    await finalizeInvoice(array_sale);
    res.send({ success: array_sale });
    array_sale = [];
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

//Port configuration :::::::::::::::::::::::::::::::::::::::::::::::::::::
app.listen(3000, function () {
    console.log('Example app listening on port http://localhost:3000');
});