var where = require('node-where');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	var ip = req.headers['x-forwarded-for'] || 
		req.connection.remoteAddress || 
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
    
	where.is(ip, (err, result) => {
		res.render('index', { title: 'My weather', city:  result.get('city') || result.get('country') });
	});
});

module.exports = router;
