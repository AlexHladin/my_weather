const express = require('express');
const router = express.Router();

const apiCache = require('./../server/ApiCache');

/* GET api listing. */
router.get('/getForecastWeather/:city', (req, res, next) => {
	apiCache.getInstance().getCachedForecastWeather(req.params, req.app.get('apiAccessor'), (error, result) => {
		if (error) next(error);
		else res.send(result);
	});
});

router.get('/getCurrentWeather/:city', (req, res, next) => {
	apiCache.getInstance().getCachedCurrentWeather(req.params, req.app.get('apiAccessor'), (error, result) => {
		if (error) next(error);
		else res.send(result);
	});
});

router.get('/search/:input', (req, res, next) => {
	var filteredCities = Object.keys(apiCache.getInstance().getNamesCache()).filter((e) => {
			return e.indexOf(req.params.input) >= 0;
		});

	res.send(filteredCities);
});

module.exports = router;
