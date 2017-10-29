'use strict'

const async = require('async')
const where = require('node-where')
const Promise = require('bluebird')

let whereIs = Promise.promisify(where.is)

/* singleton */
let apiCache = (function () {
  let instance

  function init () {
		// private variables and methods
    let namesCache = {}
    let cache = {}

    function getCityDataByName (city, param) {
      let cityId = namesCache[city.toLowerCase()]

      if (cityId && new Date().getTime() - cache[cityId][param] < process.env.SCHEDULER_PAUSE) {
        return cache[cityId]
      }

      return null
    }

    return {
			// public variables and methods
      getNamesCache: function () {
        return namesCache
      },
      getCache: function () {
        return cache
      },
      getCachedForecastWeather: async (place, apiAccessor) => {
        let cityData = getCityDataByName(place.city.toLowerCase(), 'forecastWeatherUpdateTime')
        let forecastData

        if (cityData) {
          forecastData = cityData.forecastWeather
        } else if (place.city && place.city.length) {
						let whereRes = await whereIs(place.city)
						whereRes.city = whereRes.get('city') || whereRes.get('region') || whereRes.get('country')

						let response = await apiAccessor.getForecastWeather(whereRes)
						// store input and id of real city
						namesCache[place.city.toLowerCase()] = response.city.id
						cache[response.city.id] = {
							forecastWeather: response,
							forecastWeatherUpdateTime: new Date().getTime()
						}

          	forecastData = response;
				} else throw new Error('City not found')

        return forecastData
      },
      getCachedCurrentWeather: async (place, apiAccessor, next) => {
        let cityData = getCityDataByName(place.city.toLowerCase(), 'currentWeatherUpdateTime')
        let currentWeatherData

        if (cityData) {
          currentWeatherData = cityData.currentWeather
        } else if (place.city && place.city.length) {
					let whereRes = await whereIs(place.city)
					whereRes.city = whereRes.get('city') || whereRes.get('region') || whereRes.get('country')

					let response = await apiAccessor.getCurrentWeather(whereRes)
					// store input and id of real city
					namesCache[place.city.toLowerCase()] = response.id
					cache[response.id] = {
						currentWeather: response,
						currentWeatherUpdateTime: new Date().getTime()
					}

          currentWeatherData = response
        } else throw new Error('City not found')

				return currentWeatherData
      }
    }
  }

  return {
    getInstance: function () {
      if (!instance) instance = init()

      return instance
    }
  }
})()

module.exports = apiCache
