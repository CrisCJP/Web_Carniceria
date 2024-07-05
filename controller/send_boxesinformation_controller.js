const { get_infoBoxes, openCash } = require('../model/get_infoboxes_model');

const send_cashgrowth = async(req, res, user) => {
    try {
        
        if (user.idrol == 1) {
            const infoboxes = await get_infoBoxes(user); 
            res.status(200).json({ infobox: infoboxes });
        }
        else {
            res.status(200).json({ infobox: false });
        }

    } catch (err) {
        res.status(404).json({ message_err: err.message });
    }
};

const set_datachash = async(req, res, user) => {
    try {
        const { efectivo } = req.body;
        const temp_opencash = await openCash(efectivo, user);

        if (temp_opencash == false)
            return res.status(404).json({ message: 'No se pudo abrir la caja' });

        res.status(200).json({ success: 'success open cash' });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

module.exports = { send_cashgrowth, set_datachash };