var where = require('node-where');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	var ip = req.headers['x-forwarded-for'] || 
		req.connection.remoteAddress || 
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
    
	where.is(/*ip*/'91.197.223.142', (err, result) => {
		res.render('index', { title: 'My weather', place: result.get('city') || result.get('region') || result.get('country') });
	});
});

module.exports = router;
