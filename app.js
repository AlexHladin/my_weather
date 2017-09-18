const LOG_PATH = 'logs';
const LOG_FILE = 'server.log';

const express = require('express');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const api = require('./routes/api');

const ApiAccessor = require('./server/ApiAccessor');
const apiCache = require('./server/ApiCache');

// Middleware
const byIPDetector = require('./middleware/ByIPDetector');

// loggin settings
const FULL_LOG_PATH = path.join(LOG_PATH, LOG_FILE);

// check if LOG_PATH exist
if (!fs.existsSync(LOG_PATH)) {
    fs.mkdirSync(LOG_PATH);
    console.log('Log folder created.');
}

// check if LOG_FILE exist
if (!fs.existsSync(FULL_LOG_PATH)) {
    fs.writeFile(FULL_LOG_PATH, '', (err) => {
        if (err) {
            console.error('Log file not created!', err);
        } else console.log('Log file created.');
    });
}

var logFile = path.join(__dirname, FULL_LOG_PATH);
var logFileStream = fs.createWriteStream(logFile, { flags: 'a' });

var app = express();

console.log('Environment', app.get('env'));

if (app.get('env') === 'development') {
  var config = require('./config/default.json');

  process.env.OPENWEATHER_API_KEY = config['weatherService']['apiKey'];
  process.env.SCHEDULER_PAUSE = config['schedulerPause'];
}

// api accessor settings
var apiAccessor = ApiAccessor.create({
    apiKey: process.env.OPENWEATHER_API_KEY
});
app.set('apiAccessor', apiAccessor);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Log general server information to the console.
app.use(morgan('dev'));
// Write more specific log information to the server log file.
app.use(morgan('combined', { stream: logFileStream }));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(byIPDetector);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// schedulars
setInterval(() => {
    var cache = apiCache.getInstance().getCache();
    var currentTime = new Date().getTime();

    for (var obj in cache) {
        // update current weather
        if (cache[obj].currentWeatherUpdateTime && (currentTime - cache[obj].currentWeatherUpdateTime >= process.env.SCHEDULER_PAUSE)) {
            console.log('Update current weather of', obj, 'city');
            apiAccessor.getCurrentWeather({ id: obj }, (err, res) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Current weather of city', obj, 'succesful updated');
                }
            });
        }

        // update forecast weather
        if (cache[obj].forecastWeatherUpdateTime && (currentTime - cache[obj].forecastWeatherUpdateTime >= process.env.SCHEDULER_PAUSE)) {
            console.log('Update forecast weather of', obj, 'city');
            apiAccessor.getForecastWeather({ id: obj }, (err, res) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Forecast weather of city', obj, 'succesful updated');
                }
            });
        }
    }
}, process.env.SCHEDULER_PAUSE);

module.exports = app;
