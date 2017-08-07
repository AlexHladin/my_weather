var where = require('node-where');
var express = require('express');
var router = express.Router();

var dbUtils = require('./../db');

var checkForecastWeatherCache = (req, where, next) => {
	var db = req.app.get('db'),
		apiAccessor = req.app.get('apiAccessor'),
		city = where.get('city') || where.get('region');

	dbUtils.getForecastWeatherRecordsCount(db, city, (dbErr, dbRes) => {
		if (dbErr) {
			next(dbErr);
			return;
		}
		
		if (dbRes[0] && dbRes[0].recordsCount && dbRes[0].recordsCount > 35) {
			dbUtils.getForecastWeather(db, city, (dbErr, dbRes) => {
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
			console.log('hello');
			return;
		} else {
			apiAccessor.getForecastWeather({ city: city }, (error, result) => {
				if (error) {
					next(error);
					return;
				}

				dbUtils.saveCityName(db, result.city.id, where.get('city') || where.get('region'), result.city.country, (dbSaveErr, dbSaveRes) => {
					if (dbSaveErr) {
						console.log(dbSaveErr);
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
		apiAccessor = req.app.get('apiAccessor');

	dbUtils.getLastCurrentWeatherRecord(db, where.get('city') || where.get('region'), (err, resp) => {
		if (resp && resp.length && (new Date().getTime() / 1000 - resp[0].u_time) / 3600 <= 1) { // cache time equal to 1 hours
			next(null, JSON.parse(resp[0].Additional));
		} else {
			apiAccessor.getCurrentWeather({ city: where.get('city') || where.get('region') }, (error, result) => {
				if (error) {
					next(error);
					return;
				}

				// save result in database
				dbUtils.saveCityName(db, result.id, where.get('city') || where.get('region'), result.sys.country, (err1, res1) => {
					if (err1)  {
						console.error(err1);
						return;
					}

					dbUtils.saveWeatherToDB(db, result, (dbWeatherErr) => {
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
	where.is(req.params.city, (whereErr, whereRes) => {
		if (whereErr) {
			next(whereErr);
		} else {
			checkForecastWeatherCache(req, whereRes, (error, result) => {
				if (error) {
					next(error);
				} else {
					res.send(result);
				}
			});
		}
    });
});

router.get('/getCurrentWeather/:city', (req, res, next) => {
	where.is(req.params.city, (whereErr, whereRes) => {
		if (whereErr) {
			next(whereErr);
		} else {
			// check cached current weather	
			checkWeatherCache(req, whereRes, (error, result) => {
				if (error) 
					next(error);
				else
					res.send(result);
			});
		}
	});
});

module.exports = router;
