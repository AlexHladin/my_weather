var async = require('async');
var where = require('node-where');

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

				if (cityId && cache[cityId].forecastWeatherUpdateTime - new Date().getTime() < 3600) {
					next(null, cache[cityId].forecastWeather);
				} else {
					async.waterfall([
						(cb) => {
							if (cityId) {
								cb(null, { id: cityId });
							} else if (place.city && place.city.length) {
								where.is(place.city, (error, whereRes) => {
									cb(null, { city: whereRes.get('city') || whereRes.get('region') || whereRes.get('country') });
								});
							} else cb('City id not found');
						},
						(whereRes, cb) => {
							try {
								apiAccessor.getForecastWeather(whereRes, (error, result) => {
									if (error) {
										next(error);
										return;
									}
									
									// store input and id of real city
									namesCache[place.city.toLowerCase()] = result.city.id;
									cache[result.city.id] = {
										forecastWeather: result,
										forecastWeatherUpdateTime: new Date().getTime()
									};

									next(null, result);
								});
							} catch (ex) {
								cb(ex);
							}
						}
					], next);
				}
			},
			getCachedCurrentWeather: function(place, apiAccessor, next) {
				var cityId = namesCache[place.city.toLowerCase()];

				if (cityId && cache[cityId].currentWeatherUpdateTime - new Date().getTime() < process.env.SCHEDULER_PAUSE) {
					next(null, cache[cityId].currentWeather);
				} else {
					async.waterfall([
						(cb) => {
							if (cityId) {
								cb(null, { id: cityId });
							} else if (place.city && place.city.length) {
								where.is(place.city, (error, whereRes) => {
									cb(null, { city: whereRes.get('city') || whereRes.get('region') || whereRes.get('country') });
								});
							} else {
								cb('City id not found');
							}
						},
						(whereRes, cb) => {
							try {
								apiAccessor.getCurrentWeather(whereRes, (error, result) => {
									if (error) {
										cb(error);
										return;
									}

									// store input and id of real city
									namesCache[place.city.toLowerCase()] = result.id; 
									cache[result.id] = { 
										currentWeather: result,
										currentWeatherUpdateTime: new Date().getTime()
									};

									cb(null, result);
								});
							} catch (ex) {
								next(ex);
							}
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
