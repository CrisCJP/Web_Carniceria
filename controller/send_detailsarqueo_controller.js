const { getDenomination, get_totalInvoices, get_infocash, createArqueo, get_dolarChange, get_arqueoReport } = require('../model/setter_arqueo_model');

const set_detailsarqueo = async(req, res, user) => {
    try {
        const { denomination, amount } = req.body;
        const temp_getDenomination = await getDenomination(denomination);
        const temp_getTotalInvoices = await get_totalInvoices(user);
        const temp_getInfocash = await get_infocash(user);
        const temp_getDolar = await get_dolarChange();

        if (!temp_getDenomination)
            return res.status(404).json({ message: 'No se encontró la denominación' });
        
        let total = temp_getDenomination[0].Denominacion * amount;
        res.status(200).json({ total: total, money: temp_getDenomination[0].Denominacion, ingreso: temp_getTotalInvoices, monto_cash: temp_getInfocash, dolar: temp_getDolar });

    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const set_ArqueoData = async(req, res) => {
    try {
        const { list, total_ingreso, observacion } = req.body;
        const temp_list = JSON.parse(list);
        console.log(temp_list);
        const temp_createArqueo = await createArqueo(temp_list, total_ingreso, observacion);
        

        if (temp_createArqueo == false)
            return res.status(404).json({ message: 'No se pudo realizar el arqueo' });

        res.status(200).json({ success: 'Arqueo realizado exitosamente' });
        
    } catch(err) {
        res.status(404).json({ message: 'No se pudo realizar el arqueo' });
    }
};

const send_reportArqueo = async(req, res) => {
    try {
        const { start_date, end_date } = req.body;
        const temp_reportArqueo = await get_arqueoReport(start_date, end_date);

        console.log(temp_reportArqueo);
        if (!temp_reportArqueo || temp_reportArqueo === undefined || temp_reportArqueo === '')
            return res.status(404).json({ message: 'No se encontraron resultados' });
        
        res.status(200).json({ reportArqueo: temp_reportArqueo });

    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const getter_Money = async(req, res) => {
    try {
        const temp_getMoneyDolar = await get_dolarChange();

        if (!temp_getMoneyDolar) {
            return res.status(404).json({ message: 'No se encontró el cambio de moneda' });
        }

        res.status(200).json({ money: temp_getMoneyDolar });

    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};


module.exports = { set_detailsarqueo, set_ArqueoData, send_reportArqueo, getter_Money };