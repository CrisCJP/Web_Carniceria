const { getReport } = require('../model/reportview_model');

const setReport = async (req, res, user) => {
    try {
        const { start_date, end_date } = req.body;
        const report_list = await getReport(user, start_date, end_date);

        if (report_list.length === 0) 
            return res.status(404).json({ message: 'No se encontraron resultados' });

        
        res.status(200).json({ reportList: report_list });
    
    } catch (err) {
        res.json({ message: err.message });
    };
};

module.exports = { setReport };