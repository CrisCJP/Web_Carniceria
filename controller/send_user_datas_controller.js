const { get_user_datas, make_changes_for_user, insert_new_user } = require('../model/get_user_datas_model');

const set_user_data_forTable = async (req, res, user) => {
    try {
        const { character } = req.body;
        const userdata_temp = await get_user_datas(character, user);

        if(!userdata_temp)
            return res.status(404).json({ message_notfind: 'No se encontraron resultados' });

        res.status(200).json({ userdata: userdata_temp });
    } catch (err) {
        res.json({ message: err.message });
    }
};

const executeProcedure_makeChanges_forUser = async (req, res) => {
    try {
        const { id, rol, estado } = req.body;
        const procedure = await make_changes_for_user(id, rol, estado);

        if (!procedure)
            res.status(404).json({ message_notfind: 'No se encontraron resultados result' });

        res.status(200).json({ message: procedure });

    } catch (err) {
        res.json({ message_err: err.message });
    }
};


const executeProcedure_insertNewUser = async (req, res) => {
    try {
        const { nombre, apellido, cedula, correo, contrasenia, rol, estado } = req.body;
        const procedure = await insert_new_user(nombre, apellido, correo, cedula, contrasenia, rol, estado);

        if (!procedure)
            res.status(404).json({ message_notfind: 'No se encontraron resultados result' });

        res.status(200).json({ message: procedure });

    } catch (err) {
        res.json({ message_err: err.message });
    }
};

module.exports = { set_user_data_forTable, executeProcedure_makeChanges_forUser, executeProcedure_insertNewUser };