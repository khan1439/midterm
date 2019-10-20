var express = require('express'),
    http = require('http'),
    Redis = require('ioredis'),
    path = require('path');

var redis_flag = 0;

var app = express();
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/vendor', express.static(path.join(__dirname, 'public/vendor')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));

// using environment variables created by Docker

var redis = new Redis({
  port: 6379,
  host: process.env.REDIS_HOST,
  enableOfflineQueue: false,
  retryStrategy: function (times) {
    var delay = Math.min(times * 50, 3000);
    return delay;
  }
});

redis.on('connect', function() {
    console.log('Connected to redis!');
    redis_flag = 1;
});


redis.on('close', function() {
  console.log('Connection to redis closed.');
  redis_flag = 0;
});

redis.on('end', function() {
    console.log('Connection to redis cannot be established.');
    redis_flag = 0;
});

redis.on('reconnecting', function() {
  console.log('Reconnecting to redis...');
  redis_flag = 0;
});

// test redis connection every 5 seconds and disconnect if successful
setInterval(function () {
  var redistest = new Redis({
    port: 6379,
    host: process.env.REDIS_HOST,
    enableOfflineQueue: false
  });
  redistest.on('error', function() {
    console.log('Unsuccessful redis connection test.');
    redis_flag = 0;
  });
  redistest.on('connect', function() {
    console.log('Successful redis connection test.');
    redis_flag = 1;
    redistest.disconnect();
  });

}, 5000);

app.get('/', function(req, res, next) {

  if(redis_flag) {
    redis.incr('counter', function(err, counter) {
      if(err) {
        return next(err);
      }
      res.status(200);
      res.render('index',{counter: counter, server: process.env.SERVER_NAME || 'webserver'});
    });
  } else {
    res.render('error', {server: process.env.SERVER_NAME || 'webserver'});
  }
});


app.get('/health', function(req, res, next) {
  res.status(200);
  res.send('webserver health ok');
});

http.createServer(app).listen(process.env.PORT || 8080, function() {
  console.log('Listening on port ' + (process.env.PORT || 8080));
});
