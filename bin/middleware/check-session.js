const debug = require('debug')('bin:middleware:check-session');

module.exports = (req, res, next) => {
    res.locals.user = req.session.user;
    next();
};