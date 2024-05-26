const sendArrayDeytails = async (req, res, array) => {
    try {
        res.json({ list: array });
    } catch (err) {
        console.error('SQL error', err);
    }
};

module.exports = { sendArrayDeytails };