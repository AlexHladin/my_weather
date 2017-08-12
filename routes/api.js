var where = require('node-where');
var async = require('async');
var express = require('express');
var router = express.Router();

var dbUtils = require('./../db');
var apiCache = require('./../server/ApiCache');

var checkForecastWeatherCache = (req, where, next) => {
	var db = req.app.get('db'),
		apiAccessor = req.app.get('apiAccessor');

	dbUtils.getForecastWeatherRecordsCount(db, where.city, (dbErr, dbRes) => {
		if (dbErr) {
			next(dbErr);
			return;
		}
		
		if (dbRes[0] && dbRes[0].recordsCount && dbRes[0].recordsCount > 35) {
			dbUtils.getForecastWeather(db, where.city, (dbErr, dbRes) => {
				if (dbErr || !dbRes || dbRes.length < 1) {
					next(dbErr);
					return;
				}

				var list = [];
				for (el in dbRes) {
					list.push({ dt: dbRes[el].UpdateTime, main: JSON.parse(dbRes[el].Additional) });
				}

				next(dbErr, list);
			});
		} else {
			apiAccessor.getForecastWeather(where, (error, result) => {
				if (error) {
					next(error);
					return;
				}
				
				dbUtils.saveCityName(db, result.city.id, req.params.city, result.city.country, (dbSaveErr, dbSaveRes) => {
					if (dbSaveErr) {
						console.error(dbSaveErr);
						return;
					}

					dbUtils.saveForecastWeather(db, result.city.id, result.list, (dbWeatherErr) => {
						if (dbWeatherErr) console.error(dbWeatherErr);
					});
				});

				next(error, result.list);
			});
		}
	});
}

var checkWeatherCache = (req, where, next) => {
	var db = req.app.get('db'),
		apiAccessor = req.app.get('apiAccessor'),
		config = req.app.get('config');

	dbUtils.getLastCurrentWeatherRecord(db, where.city, (err, resp) => {
		if (resp && resp.length && (new Date().getTime() - resp[0].u_time * 1000) <= config.get('cacheTimeout')) { // cache time check
			next(null, JSON.parse(resp[0].Additional));
		} else {
			apiAccessor.getCurrentWeather(where, (error, result) => {
				if (error) {
					next(error);
					return;
				}
				
				// save result in database
				dbUtils.saveCityName(db, result.id, req.params.city, result.sys.country, (err1, res1) => {
					if (err1)  {
						console.error(err1);
						return;
					}

					dbUtils.saveWeatherToDB(db, result, (dbWeatherErr, resp) => {
						if (dbWeatherErr) console.error(dbWeatherErr);
					});
				});

				// return result
				next(error, result);
			});
		}
	});
}

/* GET api listing. */
router.get('/getForecastWeather/:city', (req, res, next) => {
    apiCache.checkInputCity(req.params.city, req.app.get('db'), (error, result) => {
    	if (error) {
			next(error);
			return;
		}

		checkForecastWeatherCache(req, result, (cacheErr, cacheRes) => {
			if (cacheErr) next(cacheErr);
			else res.send(cacheRes);
		})
    });
});

router.get('/getCurrentWeather/:city', (req, res, next) => {
	apiCache.checkInputCity(req.params.city, req.app.get('db'), (error, result) => {
		if (error) {
			next(error);
			return;
		}

		checkWeatherCache(req, result, (cacheErr, cacheRes) => {
			if (cacheErr) next(cacheErr);
			else res.send(cacheRes);
		});
	});
});

module.exports = router;
