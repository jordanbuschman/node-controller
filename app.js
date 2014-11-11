var express     = require('express');
var app         = express();
var logger      = require('morgan');
var bodyParser  = require('body-parser');
var path        = require('path');

var index       = require('./routes/index');
var play        = require('./routes/play');
var songs       = require('./routes/songs');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,  'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/', index);
app.use('/play', play);
app.use('/song', songs);

module.exports = app;
