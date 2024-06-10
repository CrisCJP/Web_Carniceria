const noCache = (req, res, next) => {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '-1');
    next();
};

module.exports = { noCache };