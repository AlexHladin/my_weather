var where = require('node-where');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	console.log(Object.keys(req));  
	var response = { country: req.where.get('country') };
	if (req.where.get('city') || req.where.get('region')) 
		response.city = req.where.get('city') || req.where.get('region');

	res.render('index', response);
});

module.exports = router;
