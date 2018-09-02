const fs = require('fs');
const req = require('request');
const alerts = require('google-alerts-api');
const Parser = require('rss-parser');
const { gmail, gmaps } = require('./keys');
const { trends } = require('./trend');
const { traffic } = require('./traffic');
const { news } = require('./news');

const { HOW_OFTEN, DELIVER_TO, HOW_MANY, MAIL } = alerts;
const http = require('http');
const express = require('express'),
    app = module.exports.app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);  //pass a http.Server instance

server.listen(3000);  //listen on port 3000
app.use(express.static('public'));


io.on('connection', function (socket) {
  getSuburbs(data => {
    const suburbs = JSON.parse(data).suburb;
    const counter = suburbs.length;
    socket.emit('news', { suburbs: suburbs });
    trends.then((res) => {
      console.log('data', res);
      socket.emit('news', { suburbs: res });
    });
    // console.log(JSON.parse(trend));
  // socket.on('my other event', function (data) {
  //   console.log(data);
  });
});

const getSuburbs = cb => fs.readFile(__dirname+'/data/suburbs.json', function(error, data) {
  console.log('trend request');
  if(error){
    console.log(error);
    cb(error);
  } else {
    cb(data.toString());
  }
});


// // get trends for local businesses
// app.get('/trends', trends);
// // get traffic data
// app.get('/traffic', traffic);
// // get news
// app.get('/news', news);
//
