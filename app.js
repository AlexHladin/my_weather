var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('config');
var mysql = require('mysql');

var index = require('./routes/index');
var api = require('./routes/api');

var ApiAccessor = require('./server/ApiAccessor');

var app = express();

// config sharing
app.set('config', config);

// api accessor settings
var apiAccessor = ApiAccessor.create({
    apiKey: config.get('weatherService.apiKey')
});
app.set('apiAccessor', apiAccessor);

// database connection setup

var handleDisconnect = (conn) => {
  conn.on('error', function(err) {
    if (!err.fatal) {
      return;
    }

    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }

    console.log('Re-connecting lost connection: ' + err);

    connection = mysql.createConnection(config.get('dbConfig'));
    handleDisconnect(connection);
    connection.connect((err) => {
        if (err) throw 'Database connection error ' + err.stack;
        
        app.set('db', connection);
        console.log('Database connected ', connection.threadId);
    });
  });
}

var connection = mysql.createConnection(config.get('dbConfig'));
handleDisconnect(connection);

connection.connect((err) => {
	if (err) throw 'Database connection error ' + err.stack;
	
	app.set('db', connection);
	console.log('Database connected ', connection.threadId);
});

// db methods
var dbUtils = require('./db');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
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
    dbUtils.getUniqCityId(connection, (err, result) => {
        for (var i = 0; i < result.length; i++) {
            console.log('Update data of ', JSON.stringify(result[i]), ' ', i);
            apiAccessor.getCurrentWeather(result[i], (error, response) => {
                if (error) {
                    console.error(error);
                } else if (response) {
                    dbUtils.saveWeatherToDB(connection, response, (error) => {
                        if (error) console.error(error);
                    });
                } else {
                    console.error('OpenWeatherMap API error');
                }
            });
        };
    });
}, config.get('schedulerPause'));

module.exports = app;
