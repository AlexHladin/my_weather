var where = require('node-where');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	where.is(req.connection.remoteAddress, (err, result) => {
		console.log(result);
		res.render('index', { title: 'My weather', city:  result.get('city') || result.get('country') });
	});
});

module.exports = router;
