const { sql, config } = require('./connection_model');

const get_user_datas = async (character, user) => {
    let pool;
    try {
        pool = await sql.connect(config, user);
        const result = await pool.request()
            .input('character', sql.VarChar, character + '%') // Agrega el carácter '%' para la búsqueda con LIKE
            .input('ID', sql.Int, user.IdUsuario)
            .query('SELECT * FROM view_user_data WHERE Nombre LIKE @character AND ID != @ID') // Utiliza la consulta con el parámetro
        return result.recordset;
    } catch (err) {
        console.error(err);
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

// Función para ejecutar el procedimiento almacenado
const make_changes_for_user = async (id, rol, estado) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const request = pool.request();
        request.input('id', sql.Int, id);
        request.input('rol', sql.Int, rol);
        request.input('estado', sql.VarChar, estado);
        request.output('outputMessage', sql.VarChar(255)); // Define el parámetro de salida

        const result = await request.execute('make_changes_for_user');
        
        // Recupera el mensaje de salida del procedimiento almacenado
        const outputMessage = result.output.outputMessage;
        console.log(outputMessage); // Muestra el mensaje en la consola

        return outputMessage; // Retorna el mensaje de salida
    } catch (err) {
        console.error(err);
        return err.message; // Retorna el mensaje de error si ocurre alguno
    } finally {
        if (pool) {
            pool.close();
        }
    }
};


const insert_new_user = async (nombre, apellido, correo, cedula, contrasenia, rol, estado) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const request = pool.request();
        request.input('nombre', sql.VarChar(30), nombre);
        request.input('apellido', sql.VarChar(30), apellido);
        request.input('correo', sql.VarChar(30), correo);
        request.input('cedula', sql.VarChar(17), cedula);
        request.input('contrasenia', sql.VarChar(30), contrasenia);
        request.input('rol', sql.Int, rol);
        request.input('estado', sql.VarChar(15), estado);
        request.output('outputMessage', sql.VarChar(255)); // Define el parámetro de salida

        const result = await request.execute('insert_new_user');
        
        // Recupera el mensaje de salida del procedimiento almacenado
        const outputMessage = result.output.outputMessage;
        //console.log(outputMessage); // Muestra el mensaje en la consola

        return outputMessage; // Retorna el mensaje de salida
    } catch (err) {
        console.error(err);
        return err.message; // Retorna el mensaje de error si ocurre alguno
    } finally {
        if (pool) {
            pool.close();
        }
    }
};


const getUserByNameAndSurname = async (nombre, apellido) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const request = pool.request();
        request.input('nombre', sql.VarChar, nombre);
        request.input('apellido', sql.VarChar, apellido);

        const result = await request.query("SELECT * FROM Usuario WHERE Nombre = @nombre AND Apellido = @apellido");
        
        //console.log(result.recordset); // Muestra los resultados en la consola

        return result.recordset.length > 0; // Retorna true si hay resultados, false si no
    } catch (err) {
        console.error(err);
        return false; // Retorna false si ocurre un error
    } finally {
        if (pool) {
            pool.close();
        }
    }
};


const getUserByEmail = async (correo) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const request = pool.request();
        request.input('correo', sql.VarChar, correo);

        const result = await request.query("SELECT * FROM Usuario WHERE Correo = @correo");
        
        //console.log(result.recordset); // Muestra los resultados en la consola

        return result.recordset.length > 0; // Retorna true si hay resultados, false si no
    } catch (err) {
        console.error(err);
        return false; // Retorna false si ocurre un error
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

const getUserByCedula = async (cedula) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const request = pool.request();
        request.input('cedula', sql.VarChar, cedula);

        const result = await request.query("SELECT * FROM Usuario WHERE Cedula = @cedula");
        
        //console.log(result.recordset); // Muestra los resultados en la consola

        return result.recordset.length > 0; // Retorna true si hay resultados, false si no
    } catch (err) {
        console.error(err);
        return false; // Retorna false si ocurre un error
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

const valueFunctionsAsync = async (nombre, apellido, correo, cedula, contrasenia, rol, estado) => {
    try {
        // Espera a que las funciones asíncronas se resuelvan
        const nameAndSurnameExists = await getUserByNameAndSurname(nombre, apellido);
        const emailExists = await getUserByEmail(correo);
        const cedulaExists = await getUserByCedula(cedula);

        // Verifica si alguno de los valores ya existe
        if (nameAndSurnameExists || emailExists || cedulaExists) {
            return false; // Retorna false si alguno de los valores ya existe
        }
        else {
            return true;
        }

    } catch (err) {
        console.error(err);
        throw new Error('Error al ejecutar las funciones asíncronas');
    }
};

module.exports = { get_user_datas, make_changes_for_user, insert_new_user, valueFunctionsAsync };