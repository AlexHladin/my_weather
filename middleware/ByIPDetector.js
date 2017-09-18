const where = require('node-where');

module.exports = (req, res, next) => {
	const ip = req.headers['x-forwarded-for'] || 
		req.connection.remoteAddress || 
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;

	where.is(ip, (err, result) => {
		if (err) {
			next('Location not defined');
			return;
		}

		req.where = result;
		next();
	});
};
