var async = require('async');
var dbUtils = require('./../db');
var where = require('node-where');

module.exports = {
	checkInputCity: (city, db, next) => {
		async.race([
			(cb) => {
				where.is(city, (err, res) => {
					if (err) {
						cb(err);
						return;
					}
					
					cb(err, { city: res.get('city') || res.get('region') });
				});
			},
			(cb) => {
				dbUtils.getIdByCityName(db, city, (err, res) => {
					if (err) {
						cb(err);
						return;
					}

					if (res && res.length)
						cb(err, { city: city });
				});
			}
		], next);
	}
}