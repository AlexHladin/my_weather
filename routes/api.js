const express = require('express')
const router = express.Router()

const apiCache = require('./../server/ApiCache')

/* GET api listing. */
router.get('/getForecastWeather/:city', async (req, res, next) => {
  try {
    let response = await apiCache.getInstance().getCachedForecastWeather(req.params, req.app.get('apiAccessor'))
    res.send(response)
  } catch (e) {
    next(e)
  }
})

router.get('/getCurrentWeather/:city', async (req, res, next) => {
  try {
    let response = await apiCache.getInstance().getCachedCurrentWeather(req.params, req.app.get('apiAccessor'))
    res.send(response)
  } catch (e) {
    next(e)
  }
})

router.get('/search/:input', (req, res, next) => {
  let cityNames = Object.keys(apiCache.getInstance().getNamesCache())
  let filteredCities = cityNames.filter((e) => {
    return e.indexOf(req.params.input) >= 0
  })

  res.send(filteredCities)
})

module.exports = router
