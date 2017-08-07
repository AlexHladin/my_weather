module.exports = {
	getUniqCityId: (db, next) => {
		if (db)
			db.query('SELECT DISTINCT cityId as id FROM City;', next);
		else
			next('Invalid arguments');
	},
	getLastCurrentWeatherRecord: (db, city, next) => {
		if (db && city) {
			db.query('SELECT CurrentWeather.*, UNIX_TIMESTAMP(CurrentWeather.UpdateTime) as u_time, City.CityName, City.Country FROM CurrentWeather INNER JOIN City ON CurrentWeather.cityId = City.cityId WHERE City.CityName = "' + city + '" ORDER BY UpdateTime DESC LIMIT 1;', next);
		} else
			next('Invalid arguments');
	},
	getForecastWeatherRecordsCount: (db, city, next) => {
		if (db && city)
			db.query('SELECT COUNT(*) AS recordsCount FROM ForecastWeather INNER JOIN City ON ForecastWeather.cityId = City.cityId WHERE City.CityName = "' + city + '" AND UpdateTime > CURRENT_TIMESTAMP();', next);
		else
			next('Invalid arguments');
	},
	getForecastWeather: (db, city, next) => {
		if (db && city)
			db.query('SELECT UNIX_TIMESTAMP(UpdateTime) as UpdateTime, Additional FROM ForecastWeather INNER JOIN City ON City.cityId = ForecastWeather.cityId WHERE City.CityName = "' + city + '" AND UpdateTime > CURRENT_TIMESTAMP();', next);
		else
			next('Invalid arguments');
	},
	saveWeatherToDB: (db, data, next) => {
		if (db && data) {
			db.query('INSERT IGNORE INTO CurrentWeather(cityId, UpdateTime, Additional) VALUES(' + data.id +', FROM_UNIXTIME(' + data.dt + '), \'' + JSON.stringify(data) + '\')', next);
		} else
			next('Invalid arguments');
	},
	saveCityName: (db, cityId, city, country, next) => {
		if (city && city.length)
			db.query('INSERT INTO City SELECT * FROM ( SELECT ' + cityId + ', "' + country + '", "' + city + '") as tmp WHERE NOT EXISTS ( SELECT cityId FROM City WHERE cityId = ' + cityId + ' AND CityName = "' + city + '" )', next);
		else
			next('Invalid arguments');
	},
	saveForecastWeather: (db, cityId, elements, next) => {
		if (db && cityId && elements && elements.length)
			for (el in elements) {
				db.query('INSERT IGNORE INTO ForecastWeather(cityId, UpdateTime, Additional) VALUES(' + cityId + ', FROM_UNIXTIME(' + elements[el].dt + '), \'' + JSON.stringify(elements[el].main) + '\');', next);
			}
		else
			next('Invalud arguments');
	}
}