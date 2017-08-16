var express = require('express');
var router = express.Router();

var apiCache = require('./../server/ApiCache');

/* GET api listing. */
router.get('/getForecastWeather/:city', (req, res, next) => {
	apiCache.getInstance().getCachedForecastWeather(req.params, req.app.get('apiAccessor'), (error, result) => {
		res.send(result);
	});
});

router.get('/getCurrentWeather/:city', (req, res, next) => {
	apiCache.getInstance().getCachedCurrentWeather(req.params, req.app.get('apiAccessor'), (error, result) => {
		if (error) res.send(error);
		else res.send(result);
	});
});

module.exports = router;
