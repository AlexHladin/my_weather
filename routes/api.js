var express = require('express');
var router = express.Router();

var dbUtils = require('./../db');

var checkWeatherCache = (req, next) => {
	dbUtils.getLastCurrentWeatherRecord(req.app.get('db'), req.params.city, (err, resp) => {
		if (resp && resp.length && (new Date().getTime() / 1000 - resp[0].u_time) / 3600 <= 1) { // cache time equal to 1 hours
			next(null, JSON.parse(resp[0].Additional));
		} else {
			req.app.get('apiAccessor').getCurrentWeather({ city: req.params.city }, (error, result) => {
				if (error) next(error);

				dbUtils.saveCityName(req.app.get('db'), result.id, req.params.city, result.sys.country, (err1, res1) => {
					if (err1) console.error(err1);

					dbUtils.saveWeatherToDB(req.app.get('db'), result);
				});

				next(error, result);
			});
		}
	});
}

var updateWeather = (apiKey, options, next) => {
	api.getCurrentWeather(apiKey, options)
		.then((res) => next(null, res))
		.catch(next);
}

/* GET api listing. */
router.get('/getForecastWeather/:city', (req, res, next) => {
    api.getForecastWeather(req.app.get('config').get('weatherService.apiKey'), req.params.city)
        .then((data) => res.send(data))
        .catch((err) => res.send(err));
});

router.get('/getCurrentWeather/:city', (req, res, next) => {
	// check cached current weather	
	checkWeatherCache(req, (error, result) => {
		if (error) next(error);
		else
			res.send(result);
	});
});

module.exports = router;
