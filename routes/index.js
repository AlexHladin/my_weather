var where = require('node-where');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	var response = Object.assign({
		city: '',
		country: ''
	}, 
	{ 
		city: req.where.get('city') || req.where.get('region'),
		country: req.where.get('country') 
	});
	
	res.render('index', response);
});

module.exports = router;
