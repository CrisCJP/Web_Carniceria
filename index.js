//library import
const express = require('express');

//MSSQL server
const sql = require('mssql');

const path = require('path'); // Asegúrate de importar el módulo path
const fs = require('fs'); // Asegúrate de importar el módulo fs
const { exec } = require('child_process'); // Importa exec desde child_process
const cron = require('node-cron');

//Objects for calling functions
const app = express();
const multer = require('multer');
const upload = multer();
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');

app.use(session({
    secret: 'keyboard cat', // Cambia esto a tu secreto
    resave: false,
    saveUninitialized: false,
}));

app.use(cors());

/*const config = {
    server: 'DESKTOP-DEUHLCS',
*/
const config = {
    server: 'localhost',
    database: 'CarniceriaLupita',
    user: 'user_db',
    password: '12345',
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
const { loginUser } = require('./controller/login_controllers/loginuser_controller');

// Call the controller "pushArrayTempDetailsforSale_controller"
const { getArrayforSale } = require('./controller/venta_controllers/pushArrayTempDetailsforSale_controller');

// Call the controller "sendDetailsforSale_controller"
const { sendArrayDeytails } = require('./controller/venta_controllers/sendDetailsforSale_controller');

// Call the controller "updateamountforarray_controller"
const { getAmount, getDiscount } = require('./controller/venta_controllers/updateamountforarray_controller');

// Call the controller "sendsumfornewsale_controller"
const { getSumforNewSale } = require('./controller/venta_controllers/sendsumfornewsale_controller');

// Call the controller "setcostoandtotal_controller"
const { setCostoandTotal } = require('./controller/venta_controllers/setcostoandtotal_controller');

//Call the controller "send_historyinvoice_controller"
const { setHistoryInvoiceforDate, setHistoryInvoiceforNoVenta } = require('./controller/historialventas_controllers/send_historyinvoice_controller');

//Call the controller "send_detailsofhistoryofthesale_controller"
const { set_salesHistorywithAll } = require('./controller/historialventas_controllers/send_detailsofhistoryofthesale_controller');

//Call the controller "send_reportfordate"
const { setReport } = require('./controller/reporteventas_controllers/send_reportofordate_controller');

//Call the controller "no_cache_controller"
const { noCache } = require('./controller/no_cache_controller');

const { set_user_data_forTable, executeProcedure_makeChanges_forUser, executeProcedure_insertNewUser } = require('./controller/usuarios_controllers/send_user_datas_controller');

// const { set_detailsarqueo, set_ArqueoData, send_reportArqueo, getter_Money, setter_dolarChange } = require('./controller/send_detailsarqueo_controller');

const { send_cashgrowth, set_datachash } = require('./controller/arqueo_controllers/send_boxesinformation_controller');



//CALL THE MODELS::::::::::::::::::::::::::::
// "loginuser_model"
const { getUserById, getInvoicesByUserId } = require('./model/login_models/loginuser_model');
// "mostselledproducts_model"
const { getSelledProducts } = require('./model/dashboard_models/mostselledproducts_model');
// "detailsdashboard_model"
const { getDetailsDashboard, getCountProductCategories, getCountCategories } = require('./model/dashboard_models/detailsdashboard_model');
// 'adddetailinvoices_model'

// "finalizeinvoices_model"
const { finalizeInvoice } = require('./model/ventas_models/finalizeinvoice_model');

const { findProductforSales } = require('./model/ventas_models/finderofproductsforsale_model');


/////////////////////////////////////////////////////////////////////////////////////
const InvoiceService = require('./model/historialventas_models/gethistoryinvoice_model');
// Instanciamos la clase para poder acceder a sus métodos
const invoiceService = new InvoiceService();
/////////////////////////////////////////////////////////////////////////////////////

const { backupDatabase } = require('./model/backrest_model');
const { uptime } = require('process');

//Analyze data
app.use(express.urlencoded({ extended: false }));//Decode data
app.use(bodyParser.json());

// Servidor archivos estáticos desde la carpeta "manual"
app.use('/manual', express.static(path.join(__dirname, 'manual'), {
    setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
        }
    }
}));

//Files statics
app.set("view engine", "ejs");
// Specify the directory containing EJS templates
app.set('views', './views');

//Initialize
app.get("/", function (req, res) {
    res.render("login");
});

app.get("/productos", function(req, res) {
    if(user_temp)
        res.render('productos', {user:user_temp});
    else
        res.status(404).render('Inicia seción o hubo un problema de conexión');
});

app.get("/categorias", function(req, res) {
    res.render('categorias', {user:user_temp});
});

app.get("/notificaciones", function(req, res){
    res.render('notificaciones', {user:user_temp});
});


app.get("/compras", function (req, res) {
    res.render('compras', {user:user_temp});
});

app.get("/reporte_compra", function (req, res) {
    res.render('reporte_compra', {user:user_temp});
});

app.get("/historial_compras", function (req, res){
    res.render('historial_compras', {user:user_temp});
});

//Path to render 'login.ejs'
app.get("/login", noCache, (req, res) => {
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
    array_sale = [];
});

//Path to render 'nueva_venta.ejs'
app.get("/nueva_venta", function (req, res) {
    res.render('nueva_venta', { user: user_temp });
    array_sale = [];
});

//Path to send 'find product'
app.get ('/search_productsale', async (req, res) => {
    const searchTerm = req.query.term.toLowerCase();
    const findproduct_temp = await findProductforSales();
    const productArray = Object.values(findproduct_temp);

    const filteredProducts = productArray.filter(product =>
        product.NombreProducto.toLowerCase().includes(searchTerm)
    );
    res.json({ filteredProducts: filteredProducts, price: findproduct_temp.PrecioVenta, UnidadDeMedida: findproduct_temp.UnidadDeMedida });
});

// //Path to render 'historial_venta.ejs'
// app.get('/historial_venta', async (req, res) => {
//     const historyinvoicepreview_temp = await InvoiceService(user_temp.IdUsuario);
//     res.render('historial_venta', { user: user_temp, historyinvoicepreview: historyinvoicepreview_temp });
//     array_sale = [];
// });

// Path para renderizar 'historial_venta.ejs'
app.get('/historial_venta', async (req, res) => {
    try {
        const historyInvoicePreview = await invoiceService.getHistoryInvoicePreview(user_temp.IdUsuario);
        res.render('historial_venta', { user: user_temp, historyinvoicepreview: historyInvoicePreview });
        array_sale = [];
    } catch (error) {
        console.error("Error al obtener el historial de ventas:", error);
        res.status(500).send("Error interno del servidor");
    }
});

//
app.get('/back_rest', async (req, res) => {
    await backupDatabase(req, res);
});

app.get('/reporte_venta', async (req, res) => {
    res.render('reporte_venta', { user: user_temp });
});

app.get('/reporte_vencidos', function (req, res) {
    res.render('reporte_vencidos', { user: user_temp });
})

app.get('/usuarios', async (req, res) => {
    res.render('usuarios', { user: user_temp });
});

app.get('/proveedores', function (req, res)  {
    res.render('proveedores', { user: user_temp });
});

app.get('/arqueo', async (req, res) => {
    res.render('generar_arqueo', { user: user_temp });
});

app.get('/reporte_arqueo', async (req, res) => {
    res.render('reporte_arqueo', { user: user_temp });
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
    const arraysale_temp = await getArrayforSale(req, res, user_temp.IdUsuario, array_sale);
    //console.log(arraysale_temp);
    if (arraysale_temp.success == false) {
        if ('onerror' in arraysale_temp) {
            //console.log("Esto no es valido index");
            res.status(200).json({ message: false, onerror: 'Not valid' });
        }
        else {
            res.status(200).json({ message: false });
        }
    }
    else if (arraysale_temp.success == true) {
        res.status(200).json({ list: arraysale_temp.data });
    }
    else {
        array_sale.push(...arraysale_temp.data);
        await sendArrayDeytails(req, res, array_sale);
    }
});

// Update the quantity of the product for sale
app.post('/updateAmount', upload.none(), async (req, res) => {
    const updateAmount = await getAmount(req, res, array_sale);
    array_sale = updateAmount;
    await sendArrayDeytails(req, res, array_sale);
});

// Update the discount
app.post('/updateDiscount', upload.none(), async (req, res) => {
    const updateDiscount = await getDiscount(req, res, array_sale);
    array_sale = updateDiscount;
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
    res.send({ success: array_sale, user: user_temp });
    array_sale = [];
});


// Send invoices for the date range
app.post('/getHistoryInvoiceforDate', upload.none(), async (req, res) => {
    await setHistoryInvoiceforDate(req, res, user_temp.IdUsuario);
});

// Send invoices for the sales number
app.post('/getHistoryInvoiceforSalesNumber', upload.none(), async (req, res) => {
    await setHistoryInvoiceforNoVenta(req, res, user_temp.IdUsuario);
});

// Send the details of the sale
app.post('/getDetails_HistoryoftheSale', upload.none(), async (req,res) => {
    await set_salesHistorywithAll(req, res, user_temp);
});

// Send report view
app.post('/getReportforDate', upload.none(), async (req, res) => {
    await setReport(req, res, user_temp.IdUsuario);
});

app.post('/set_user_data_forTable', upload.none(), async (req, res) => {
    await set_user_data_forTable(req, res, user_temp);
});

app.post('/make_changes_foruser', upload.none(), async (req, res) => {
    await executeProcedure_makeChanges_forUser(req, res);
});

app.post('/set_newUser', upload.none(), async (req, res) => {
    await executeProcedure_insertNewUser(req, res);
});

app.post('/addArqueoDetails', upload.none(), async (req, res) => {
    await set_detailsarqueo(req, res, user_temp);
});

app.post('/get_valuesboxes', upload.none(), async (req, res) => {
    await send_cashgrowth(req, res, user_temp);
});

app.post('/add_datasforcash', upload.none(), async (req, res) => {
    await set_datachash(req, res, user_temp);
});

app.post('/load_arqueo', upload.none(), async (req, res) => {
    await set_ArqueoData(req, res);
});

app.post('/getReportArqueo', upload.none(), async (req, res) => {
    await send_reportArqueo(req, res);
});

app.post('/getTypeMoney', upload.none(), async (req, res) => {
    await getter_Money(req, res);
});

app.post('/setChangedolar', upload.none(), async (req, res) => {
    await setter_dolarChange(req, res);
});

app.post('/reporteproductovencido', upload.none(), function(req, res){
    sql.connect(config).then(pool=>{
        return pool.request()
        .query('select P.NombreProducto, D.FechaVencimiento, D.Cantidad_Peso from DetallesCompra D inner join Producto P on P.IdProducto = D.idproducto where D.FechaVencimiento is not null order by FechaVencimiento')
        .then(result=>{
            let NombreProduct = new Array(result.recordset.length);
            let FechaVencimiento = new Array(result.recordset.length);
            let Cantidad_Peso = new Array(result.recordset.length);

            for(let i = 0; i < result.recordset.length; i++){
                NombreProduct[i] = result.recordset[i].NombreProducto;
                FechaVencimiento[i] = result.recordset[i].FechaVencimiento;
                Cantidad_Peso[i] = result.recordset[i].Cantidad_Peso;
            }
            
            res.send({nombreproduct:NombreProduct, fechavencimiento:FechaVencimiento, cantidad_peso:Cantidad_Peso});
        })
    })
})
// Verificación de la ruta del archivo de respaldo
const backupPath = path.join(__dirname, 'backrest', 'CarniceriaLupita.bak'); // Ajusta la ruta aquí
console.log(backupPath); // Verificar la ruta
if (!fs.existsSync(backupPath)) {
    console.error("El archivo de respaldo no existe en la ruta especificada: " + backupPath);
    process.exit(1); // Termina el proceso si el archivo no existe
}

// Post para restaurar la base de datos
app.post('/restaurarrespaldo', function(req, res) {
    const killConnectionsQuery = `
      USE master;
      ALTER DATABASE [CarniceriaLupita] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
      RESTORE DATABASE [CarniceriaLupita]
      FROM DISK = N'${backupPath}'
      WITH REPLACE;
      ALTER DATABASE [CarniceriaLupita] SET MULTI_USER;
    `;

    sql.connect(config).then(pool => {
      return pool.request()
        .query(killConnectionsQuery)
        .then(result => {
          res.send("Base de datos restaurada exitosamente");

          // Espera un momento para asegurarse de que la respuesta se ha enviado
          setTimeout(() => {
            // Reinicia la aplicación
            exec('npm restart', (err, stdout, stderr) => {
              if (err) {
                console.error(`Error al reiniciar la aplicación: ${err.message}`);
                return;
              }
              console.log('Aplicación reiniciada exitosamente');
              console.log(`stdout: ${stdout}`);
              console.log(`stderr: ${stderr}`);
            });
          }, 1000); // Espera 1 segundo antes de reiniciar
        })
        .catch(err => {
          console.error("Error al restaurar la base de datos:", err);
          res.status(500).send("Error al restaurar la base de datos");
        });
    }).catch(err => {
      console.error("Error al conectar a la base de datos:", err);
      res.status(500).send("Error al conectar a la base de datos");
    });
});
  

app.post('/optmarca', upload.none(),function(req,res){
    sql.connect(config).then(pool =>{
        return pool.request()
        .query('select Nombre_Proveedor from Proveedor')
        .then(result =>{
            let Marca = new Array(result.recordset.length);

            for(let i = 0; i < result.recordset.length; i++){
                Marca[i] = result.recordset[i].Nombre_Proveedor;
            }
            
            res.send({consult:Marca});
        })
    })
})

// Función para convertir fechas de DD-MM-YYYY a YYYY-MM-DD
function convertirFechaSQL(fecha) {
    const partes = fecha.split('-');
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

app.post('/reportesdecompras', upload.none(), function(req, res) {
    const { opt, inicio, fin } = req.body;
    const OPT = parseInt(opt);
    const INICIO = convertirFechaSQL(""+inicio);
    const FIN = convertirFechaSQL(""+fin);

    console.log(INICIO)
    console.log(FIN)

    sql.connect(config).then(pool => {
        let query = '';

        switch (OPT) {
            case 1:
                query = 'SELECT C.idcompra, C.FechaCompra, D.Subtotal FROM Compras C inner join DetallesCompra D on C.IdCompra = D.idcompra WHERE C.FechaCompra BETWEEN @inicio AND @fin';
                break;
            case 2:
                query = 'select TotalCompras from Vista_ComprasTotales';
                break;
            case 3:
                query = 'select Cliente, TotalComprasPorCliente from Vista_ComprasPorCliente';
                break;
            case 4:
                query = 'select NombreProducto, TotalComprasPorProducto from Vista_ComprasPorProducto';
                break;
            case 5:
                query = 'select IdCompra, Nombre_Proveedor, total, FechaCompra from Vista_ComprasPorProveedor';
                break;
            default:
                return res.status(400).json({ message: 'Opción no válida' });
        }

        return pool.request()
            .input('inicio', sql.VarChar, INICIO)
            .input('fin', sql.VarChar, FIN)
            .query(query);
    }).then(result => {
        res.json(result.recordset);
    }).catch(err => {
        console.error('Error:', err);
        res.status(500).json({ message: 'Error en la consulta', error: err });
    });
});

app.post('/formodal', upload.none(), function(req, res){
    const { idcompra } = req.body;
    sql.connect(config).then(pool => {
        // Consulta 1
        return pool.request()
            .input('idcompra', sql.Int, idcompra)
            .query('select C.FechaCompra, C.IdCompra, C.idUsuario, C.idProveedor, R.Nombre_Proveedor from Compras C inner join Proveedor R on R.IdProveedor = C.idProveedor where C.IdCompra = @idcompra group by C.IdCompra, C.idUsuario, C.FechaCompra, C.idProveedor, R.Nombre_Proveedor')
            .then(result1 => {
                console.log('Consulta 1 Result:', result1.recordset);
                if (!result1.recordset.length) {
                    return res.send({error: "No data found"});
                }
                let compraData = result1.recordset[0];

                // Consulta 2
                return pool.request()
                    .input('idcompra', sql.Int, idcompra)
                    .query('select sum(subtotal) as total from Compras C inner join DetallesCompra D on D.idcompra = C.IdCompra where C.idcompra = @idcompra')
                    .then(result2 => {
                        console.log('Consulta 2 Result:', result2.recordset);

                        // Consulta 3
                        return pool.request()
                            .input('idcompra', sql.Int, idcompra)
                            .query('select P.NombreProducto, V.Cantidad_Peso, V.Subtotal / NULLIF(V.Cantidad_Peso, 0) AS PrecioCompra, V.Subtotal from DetallesCompra V inner join Producto P on P.IdProducto = V.idproducto where V.idcompra = @idcompra')
                            .then(result3 => {
                                console.log('Consulta 3 Result:', result3.recordset);

                                let NombreProducto = result3.recordset.map(row => row.NombreProducto);
                                let Cantidad = result3.recordset.map(row => row.Cantidad_Peso);
                                let PrecioCompra = result3.recordset.map(row => row.PrecioCompra);
                                let Subtotal = result3.recordset.map(row => row.Subtotal);

                                res.send({
                                    fechacompra: compraData.FechaCompra,
                                    idcompra: compraData.IdCompra,
                                    idusuario: compraData.idUsuario,
                                    idproveedor: compraData.idProveedor,
                                    nombreproveedor: compraData.Nombre_Proveedor,
                                    total: result2.recordset[0].total,
                                    nombreproducto: NombreProducto,
                                    cantidad: Cantidad,
                                    preciocompra: PrecioCompra,
                                    subtotal: Subtotal
                                });
                            });
                    });
            });
    }).catch(err => {
        console.error(err);
        res.status(500).send("Error connecting to the database");
    });
});


app.post('/nuevoproducto', upload.none(), function(req,res){
    const{nombreProducto, PrecioVenta, UnidadMedida, Existencia, NombreCategoria, NombreProveedor}= req.body
    sql.connect(config).then(pool => {
        return pool.request()
        .input('NombreProducto', sql.VarChar, nombreProducto)
        .input('PrecioVenta', sql.Money, PrecioVenta)
        .input('NombreUnidadMedida', sql.VarChar, UnidadMedida)
        .input('Existencia', sql.Decimal, Existencia)
        .input('NombreCategoria', sql.VarChar, NombreCategoria)
        .input('NombreProveedor', sql.VarChar, NombreProveedor)
        .execute('InsertarNuevoProducto')
    })
})


app.post('/historialcompra', upload.none(), function(req, res){
    
    sql.connect(config).then(pool =>{
        return pool.request()
        .query('select C.FechaCompra, C.idcompra, P.Nombre_Proveedor, C.idUsuario, sum(Subtotal) as total from DetallesCompra D inner join Compras C on D.idcompra = C.IdCompra inner join Proveedor P on P.IdProveedor = C.idProveedor group by C.IdCompra, C.idUsuario, C.FechaCompra, P.Nombre_Proveedor')
        .then(result => {
            
            let FechaCompra = new Array(result.recordset.length);
            let IdCompra = new Array(result.recordset.length);
            let NombreProveedor = new Array(result.recordset.length);
            let IdUsuario = new Array(result.recordset.length);
            let Total = new Array(result.recordset.length);

            for(let i = 0; i < result.recordset.length; i++){
                FechaCompra[i] = result.recordset[i].FechaCompra;
                IdCompra[i] = result.recordset[i].idcompra;
                NombreProveedor[i] = result.recordset[i].Nombre_Proveedor;
                IdUsuario[i] = result.recordset[i].idUsuario;
                Total[i] = result.recordset[i].total;
            }

            res.send({fechacompra:FechaCompra, idcompra:IdCompra, nombreproveedor:NombreProveedor, idusuario:IdUsuario, total:Total });
        
        })
    })
})

app.post('/proveedorestable', upload.none(), function(req, res){
    sql.connect(config).then(pool =>{
        return pool.request()
        .query('select IdProveedor, Nombre_Proveedor, NombreCategoria from Proveedor P inner join CategoriaProducto C on P.idCategoria = C.IdCategoria')
        .then(result =>{
            let IdProveedor = new Array(result.recordset.length);
            let Nombre_Proveedor = new Array(result.recordset.length);
            let NombreCategoria = new Array(result.recordset.length);

            for(let i = 0; i < result.recordset.length; i++){
                IdProveedor[i] = result.recordset[i].IdProveedor;
                Nombre_Proveedor[i] = result.recordset[i].Nombre_Proveedor;
                NombreCategoria[i] = result.recordset[i].NombreCategoria;
            }

            res.send({idproveedor:IdProveedor, nombre_proveedor:Nombre_Proveedor, nombrecategoria:NombreCategoria});
        })
    })
})

app.post('/addproveedor', upload.none(), function(req, res){
    const {nombreprov, categ} = req.body;
    sql.connect(config).then(pool =>{
        // Consulta para obtener el último IdProveedor insertado
        return pool.request()
        .query('select top 1 IdProveedor from Proveedor order by IdProveedor desc')
        .then(result =>{
            // Consulta para obtener el IdCategoria basado en el nombre de la categoría recibido
            return pool.request()
            .input('Category', sql.VarChar, categ)
            .query('select IdCategoria from CategoriaProducto where NombreCategoria = @Category')
            .then(result2 =>{
                let newIdProveedor;

                // Verificar si se obtuvo correctamente el IdCategoria
                if (result2.recordset.length > 0) {
                    // Obtén la parte numérica del último IdProveedor
                    const currentId = result.recordset[0].IdProveedor.replace('R', '');

                    // Verifica si la parte restante es numérica
                    if (!isNaN(currentId)) {
                        // Si es numérica, conviértela a entero
                        const numericPart = parseInt(currentId, 10);

                        // Incrementa el número
                        const newNumericPart = numericPart + 1;

                        // Formatea el número con ceros a la izquierda según la longitud original
                        const newNumericPartStr = newNumericPart.toString().padStart(currentId.length, '0');

                        // Crea el nuevo ID con el prefijo 'R'
                        newIdProveedor = 'R' + newNumericPartStr;

                        console.log('Nuevo ID Proveedor:', newIdProveedor);
                    } else {
                        console.error('El valor de IdProveedor no es numérico después de eliminar el prefijo "R".');
                        throw new Error('Error al generar el nuevo ID del proveedor');
                    }

                    // Insertar el nuevo proveedor en la base de datos
                    return pool.request()
                    .input('IdProveedor', sql.VarChar, newIdProveedor)
                    .input('NombreProv', sql.VarChar, nombreprov)
                    .input('IdCateg', sql.Int, result2.recordset[0].IdCategoria)
                    .query('INSERT INTO Proveedor (IdProveedor, Nombre_Proveedor, idCategoria) VALUES (@IdProveedor, @NombreProv, @IdCateg)')
                    .then(() => {
                        res.status(200).send('Proveedor agregado exitosamente');
                    })
                    .catch(err => {
                        console.error('Error al insertar proveedor:', err);
                        throw new Error('Error al insertar proveedor en la base de datos');
                    });
                } else {
                    console.error('No se encontró el IdCategoria para la categoría especificada:', categ);
                    throw new Error('Error al obtener IdCategoria');
                }
            })
        })
        .catch(err => {
            console.error('Error en la consulta SQL:', err);
            res.status(500).send('Error interno del servidor');
        });
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err);
        res.status(500).send('Error interno del servidor');
    });
});


app.post('/updateprov', upload.none(), function(req, res){
    const {NombreProveedor, IdProveedor} = req.body;
    console.log('Datos recibidos para actualizar:', {IdProveedor, NombreProveedor});

    sql.connect(config).then(pool =>{
        return pool.request()
        .input('IdProveedor', sql.VarChar, IdProveedor)
        .input('NombreProv', sql.VarChar, NombreProveedor)
        .query('update Proveedor set Nombre_Proveedor = @NombreProv where IdProveedor = @IdProveedor')
        .then(() => {
            console.log('Proveedor actualizado exitosamente');
            res.status(200).send('Proveedor actualizado exitosamente');
        })
        .catch(err => {
            console.error('Error al actualizar proveedor:', err);
            res.status(500).send('Error interno del servidor al actualizar proveedor');
        });
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err);
        res.status(500).send('Error interno del servidor al conectar con la base de datos');
    });
});



app.post('/categoriasinventario', upload.none(), function(req, res){
    sql.connect(config).then(pool =>{
        return pool.request()
        .query('select IdCategoria, NombreCategoria from CategoriaProducto')
        .then(result =>{
            let Idcategoria = new Array(result.recordset.length);
            let Categoria = new Array(result.recordset.length);

            for(let i = 0; i < result.recordset.length; i++){
                Idcategoria[i] = result.recordset[i].IdCategoria;
                Categoria[i] = result.recordset[i].NombreCategoria;
            }

            res.send({idcategoria:Idcategoria,categoria:Categoria});
        })
    })
})

app.post('/addcategory', upload.none(), function(req, res){
    const {categoria} = req.body;
    sql.connect(config).then(pool =>{
        return pool.request()
        .input('categoria', sql.VarChar, categoria)
        .query('INSERT INTO CategoriaProducto (NombreCategoria) VALUES (@categoria)')
    })
})

app.post('/updatecate', upload.none(), function(req, res){
    const {categoria, idcategoria} = req.body;
    sql.connect(config).then(pool =>{
        return pool.request()
        .input('idcategoria', sql.Int, idcategoria)
        .input('categoria', sql.VarChar, categoria)
        .query('update CategoriaProducto set NombreCategoria = @categoria where IdCategoria = @idcategoria')
    })
})

app.post('/optcategoria', upload.none(),function(req,res){
    sql.connect(config).then( pool =>{
        return pool.request()
        .query('select NombreCategoria from CategoriaProducto')
        .then(result =>{
            let Categoria = new Array(result.recordset.length);

            for(let i = 0; i < result.recordset.length; i++){
                Categoria[i] = result.recordset[i].NombreCategoria;
            }

            res.send({consult:Categoria});
        })
    })
})

app.post('/optmedidas', upload.none(),function(req,res){
    sql.connect(config).then(pool =>{
        return pool.request()
        .query('select IdUnidadDeMedida,UnidadMedida from UnidadDeMedida')
        .then(result =>{
            let Id = new Array(result.recordset.length);
            let Medida = new Array(result.recordset.length);

            for(let i = 0; i < result.recordset.length; i++){
                Id[i] = result.recordset[i].IdUnidadDeMedida;
                Medida[i] = result.recordset[i].UnidadMedida;
            }

            res.send({id:Id, consult:Medida});
        })
    })
})


//
app.post('/inventary',upload.none(),function(req,res){
    sql.connect(config).then( pool =>{
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

            return pool.request()
            .query('select NombreProducto from Producto')
            .then(result => {
                let NombreProduct = new Array(result.recordset.length);

                for(let i = 0; i < result.recordset.length; i++){
                    NombreProduct[i] = result.recordset[i].NombreProducto;
                }

                res.send({id:Id, marca:Marca, categoria:Categoria, stock:Stock, precio:Precio, nombreproduct:NombreProduct});
            })

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

app.post('/updateproduct',upload.none(),function(req,res){
    const {idproducto, stock, precio} = req.body;
    sql.connect(config).then(pool =>{
        return pool.request()
        .input('idproducto', sql.VarChar, idproducto)
        .input('stock', sql.Decimal, stock)
        .input('precio', sql.Decimal, precio)
        .query('update Producto set Existencia = @stock, PrecioVenta = @precio where IdProducto = @idproducto')
    })
})

app.post('/getmedida',upload.none(),function(req,res){
    const{Producto} = req.body;
    var NameProduct = Producto;
    sql.connect(config).then(pool =>{
        return pool.request()
        .input('Producto', sql.VarChar, NameProduct)
        .query('select UnidadDeMedida from Producto where NombreProducto = @Producto')
        .then(result =>{
            let unidMedida = result.recordset[0].UnidadDeMedida;
            console.log(unidMedida);
            res.send({categoria:unidMedida});
        })
    })
})

app.post('/option',upload.none(),function(req,res){
    sql.connect(config).then( pool =>{
        
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
    const { idUsuario, idproducto, cantidad, precio, FechaVencimiento, txtDocumentoId } = req.body;

    const idUsuarios = JSON.parse(idUsuario);
    const idproductos = JSON.parse(idproducto);
    const cantidades = JSON.parse(cantidad);
    const precios = JSON.parse(precio);
    const fechavencimiento = JSON.parse(FechaVencimiento);
    const txtDocumentoIds = JSON.parse(txtDocumentoId);

    const FechaActual = new Date();

    sql.connect(config).then(pool =>{
        var CLidproducto = new sql.Table('CLidproducto');
        var CLcantidad = new sql.Table('CLcantidad');
        var CLprecio = new sql.Table('CLprecio');
        var CLvencimiento = new sql.Table('CLfechavencimiento');

        CLcantidad.columns.add('UniqueId', sql.Int);
        CLcantidad.columns.add('Cantidad', sql.Decimal(10,2));

        CLidproducto.columns.add('UniqueId', sql.Int);
        CLidproducto.columns.add('IdProducto', sql.VarChar(6));

        CLprecio.columns.add('UniqueId', sql.Int);
        CLprecio.columns.add('Precio', sql.Money);

        CLvencimiento.columns.add('UniqueId', sql.Int);
        CLvencimiento.columns.add('fechavencimiento', sql.Date);

        for(let i=0; i<idproductos.length; i++){
            CLcantidad.rows.add(i, parseFloat(cantidades[i]));
            CLidproducto.rows.add(i, idproductos[i]);
            CLprecio.rows.add(i, parseFloat( precios[i]));
            CLvencimiento.rows.add(i, fechavencimiento[i]);
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
                .input('CLfechavencimiento', sql.TVP, CLvencimiento)
                .execute('Comprar')
            })
        })
    })
})







// Ruta donde se guardará el respaldo
const backupPath2 = 'C:/Repositorio git/Clonacion Proyecto/System_invoice/backrest/CarniceriaLupita.bak';

// Tarea cron para ejecutar todos los días a las 18:20
cron.schedule('30 18 * * *', async () => {
    try {
        // Verificar si el archivo de respaldo existe y eliminarlo si es necesario
        if (fs.existsSync(backupPath2)) {
            fs.unlinkSync(backupPath2);
            console.log(`Archivo de respaldo existente eliminado: ${backupPath2}`);
        }

        // Conexión a la base de datos
        await sql.connect(config);

        // Query para realizar el respaldo
        const result = await sql.query(`BACKUP DATABASE [CarniceriaLupita] TO DISK = '${backupPath2}'`);

        // Cerrar la conexión
        await sql.close();

        // Verificar si el archivo de respaldo se creó correctamente
        if (fs.existsSync(backupPath2)) {
            console.log('Respaldo realizado con éxito.');
        } else {
            console.log('Error: No se encontró el archivo de respaldo.');
        }

    } catch (err) {
        console.error('Error al realizar el respaldo:', err.message);
    }
}, {
    scheduled: true,
    timezone: 'America/Managua' // Cambia esto según tu zona horaria
});

/*
// Función para ejecutar el respaldo de la base de datos
function realizarRespaldo() {
    // Comando para generar el respaldo
    const comando = 'sqlcmd -S localhost\\SQLEXPRESS -Q "BACKUP DATABASE CarniceriaLupita TO DISK=\'C:\\Repositorio git\\Clonacion Proyecto\\System_invoice\\backrest\\CarniceriaLupita.bak\'"';

    exec(comando, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al ejecutar el respaldo: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error estándar al ejecutar el respaldo: ${stderr}`);
            return;
        }
        console.log(`Respaldo realizado correctamente: ${stdout}`);
    });
}

// Programar tarea todos los días a las 18:30
cron.schedule('15 18 * * *', () => {
    console.log('Ejecutando tarea programada para respaldo a las 18:30');
    realizarRespaldo();
});
*/




//Port configuration :::::::::::::::::::::::::::::::::::::::::::::::::::::
app.listen(3000, function () {
    console.log('App listening on port http://localhost:3000');
});