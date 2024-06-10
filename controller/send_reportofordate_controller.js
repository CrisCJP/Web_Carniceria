const { getReport, getReport_most_selled_products } = require('../model/reportview_model');

const setReport = async (req, res, user) => {
    try {
        const { start_date, end_date, option_report } = req.body;
        const date_temp = getDate_separate(start_date);
        let report_list;
        
        if (option_report == 'fecha')
            report_list = await getReport(user, start_date, end_date);

        else if (option_report == 'producto_mas_vendidos')
            report_list = await getReport_most_selled_products();

        else
            console.error('Opcion no encontrada');

        if (report_list.length === 0) 
            return res.status(404).json({ message: 'No se encontraron resultados' });

        
        res.status(200).json({ reportList: report_list });
    
    } catch (err) {
        res.json({ message: err.message });
    };
};


function getDate_separate(date) {
    let quincenal;
    var date_Obj = new Date(date);
    const today = date_Obj.getDate();
    const month = date_Obj.getMonth() + 1;
    const year = date_Obj.getFullYear();
    

    if (today <= 15)
        quincenal = 1;
    else
        quincenal = 2;

    return { quincenal, month, year };
};

module.exports = { setReport };