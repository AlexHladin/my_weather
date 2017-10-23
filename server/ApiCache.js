const async = require('async');
const where = require('node-where');
const Promise = require('bluebird'); 

let whereIs = Promise.promisify(where.is);

/* singleton */
var apiCache = (function() {

	var instance;

	function init() {
		// private variables and methods
		var namesCache = {};
		var cache = {};

		return {
			// public variables and methods
			getNamesCache: function() {
				return namesCache;
			},
			getCache: function() {
				return cache;
			},
			getCachedForecastWeather: function(place, apiAccessor, next) {
				var cityId = namesCache[place.city.toLowerCase()];

				if (cityId && new Date().getTime() - cache[cityId].forecastWeatherUpdateTime > process.env.SCHEDULER_PAUSE) {
					next(null, cache[cityId].forecastWeather);
				} else {
					async.waterfall([
						(cb) => {
							if (cityId) {
								cb(null, { id: cityId });
							} else if (place.city && place.city.length) {
								whereIs(place.city)
									.then((whereRes) => {
										cb(null, { 
											city: whereRes.get('city') || whereRes.get('region') || whereRes.get('country') 
										});
									})
									.catch((err) => cb(err));
							} else cb('City id not found');
						},
						(whereRes, cb) => {
							apiAccessor.getForecastWeather(whereRes)
								.then((result) => {
									// store input and id of real city
									namesCache[place.city.toLowerCase()] = result.city.id;
									cache[result.city.id] = {
										forecastWeather: result,
										forecastWeatherUpdateTime: new Date().getTime()
									};

									cb(null, result);
								})
								.catch((error) => {
									cb(error);
								});							
						}
					], next);
				}
			},
			getCachedCurrentWeather: function(place, apiAccessor, next) {
				var cityId = namesCache[place.city.toLowerCase()];

				if (cityId && new Date().getTime() - cache[cityId].currentWeatherUpdateTime > process.env.SCHEDULER_PAUSE) {
					next(null, cache[cityId].currentWeather);
				} else {
					async.waterfall([
						(cb) => {
							if (cityId) {
								cb(null, { id: cityId });
							} else if (place.city && place.city.length) {
								whereIs(place.city)
									.then((whereRes) => {
										cb(null, { 
											city: whereRes.get('city') || whereRes.get('region') || whereRes.get('country') 
										});
									})
									.catch((err) => cb(err));
							} else {
								cb('City id not found');
							}
						},
						(whereRes, cb) => {
							apiAccessor.getCurrentWeather(whereRes)
								.then((result) => {
									// store input and id of real city
									namesCache[place.city.toLowerCase()] = result.id; 
									cache[result.id] = { 
										currentWeather: result,
										currentWeatherUpdateTime: new Date().getTime()
									};

									cb(null, result);
								})
								.catch((error) => {
									cb(error);
								});
						}
						], next);
				}
			}
		}
	}

	return {
		getInstance: function() {
			if (!instance) instance = init();

			return instance;
		}
	}
})();


module.exports = apiCache;
