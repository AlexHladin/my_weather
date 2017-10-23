const rp = require('request-promise');

/**
 * Constructor for an ApiAccessor.
 * @constructor
 * @param {string} apiKey The API key from the OpenWeatherMap API.
 */
function ApiAccessor(apiKey, units, lang) {
	this.apiKey = apiKey;
	this.units = units || 'metric';
	this.lang = lang || 'en';
};

ApiAccessor.FORECAST_WEATHER = 'http://api.openweathermap.org/data/2.5/forecast';
ApiAccessor.CURRENT_WEATHER = 'http://api.openweathermap.org/data/2.5/weather';

/**
 * Factory method for an ApiAccessor.
 * @param {Object} options A JSON object containing the OpenWeatherMap API key.
 * @return {ApiAccessor}
 */
ApiAccessor.create = function(options) {
	if (!options.apiKey) {
	    throw new Error('No OpenWeathermap API key specified.');
	}
	return new ApiAccessor(
		options.apiKey, 
		options.units, 
		options.lang
	);
}

ApiAccessor.prototype.getForecastWeather = async function(requestOptions, next) {
	if (!requestOptions.city && !requestOptions.id) {
		next('No City specified.');
		return;
	}

	var urlOptions = {
		url: ApiAccessor.FORECAST_WEATHER,
        qs: {
            appid: this.apiKey,
            q: requestOptions.city,
            id: requestOptions.id,
            units: this.units,
            lang: this.lang
        },
		json: true
	};

	try {
		return await rp(urlOptions);
	} catch (e) {
		return err;
	}
}

ApiAccessor.prototype.getCurrentWeather = async function(requestOptions, next) {
	if (!requestOptions.city && !requestOptions.id) {
		next('No City specified.');
		return;
	}

	var urlOptions = {
		url: ApiAccessor.CURRENT_WEATHER,
        qs: {
            appid: this.apiKey,
            q: requestOptions.city,
            id: requestOptions.id,
            units: this.units,
            lang: this.lang
        },
		json: true
	};
	
	try {
		return await rp(urlOptions);
	} catch (e) {
		return e;
    };
};

module.exports = ApiAccessor;
