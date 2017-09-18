var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var router = express.Router();
var fs = require('fs');
var chokidar = require('chokidar');
var jsonFolder = 'models/partners/';
var partnersObj = {};


function createJsonObj(){
    fs.readdir(jsonFolder, (err, files) => {
        if (err) throw err;
        files.forEach(file => {
            fs.readFile(jsonFolder + file, 'utf8', function (err, data) {
                if (err) throw err;
                var obj = JSON.parse(data);
                partnersObj[obj.id] = obj;
            });
        });
    });
}

createJsonObj();

chokidar.watch(jsonFolder, {ignored: /(^|[\/\\])\../, ignoreInitial:true, persistent: true}).on('all', (event, path) => {
    console.log(event, path);
    createJsonObj();
});

//var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router.get('/:id', function(req, res, next) {
    var id = req.params.id;
    if(id in partnersObj){
        var obj = partnersObj[id];
        res.render('index', { title: 'VapourApps Product Configurator', partner_name: obj.name, discount: obj.discount, logo: obj.logo, services: JSON.stringify(obj.services) });
    }else{
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    }
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
