var async = require('async');
var dbUtils = require('./../db');
var where = require('node-where');
var fs = require('fs');
/* singleton */
var apiCache = (function() {

	var instance;

	function init() {
		// private variables and methods
		var namesCache = {};
		var cache = {};

		return {
			// public variables and methods
			getCache: function() {
				return cache;
			},
			getCachedForecastWeather: function(place, apiAccessor, next) {
				var cityId = namesCache[place.city];

				if (cityId && cache[cityId].forecastWeatherUpdateTime - new Date().getTime() < 3600) {
					next(null, cache[cityId].forecastWeather);
				} else {
					async.waterfall([
						(cb) => {
							if (place.city && place.city.length) {
								where.is(place.city, cb);
							}
						},
						(whereRes, cb) => {
							try {
								var city = whereRes.get('city') || whereRes.get('region');

								apiAccessor.getForecastWeather({ city: city }, (error, result) => {
									if (error) {
										next(error);
										return;
									}
									
									// store input and id of real city
									namesCache[place.city] = result.city.id;
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
				var cityId = namesCache[place.city];

				if (cityId && cache[cityId].currentWeatherUpdateTime - new Date().getTime() < 3600) {
					next(null, cache[cityId].currentWeather);
				}
				else {
					async.waterfall([
						(cb) => {
							if (place.city && place.city.length) {
								where.is(place.city, cb);
							}
						},
						(whereRes, cb) => {
							var city = whereRes.get('city') || whereRes.get('region');

							try {	
								apiAccessor.getCurrentWeather({ city: city }, (error, result) => {
									if (error) {
										cb(error);
										return;
									}

									// store input and id of real city
									namesCache[place.city] = result.id; 
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
