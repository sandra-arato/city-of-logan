const fs = require('fs');
const req = require('request');
const alerts = require('google-alerts-api');
const Parser = require('rss-parser');
const Entities = require('html-entities').XmlEntities;
const Sentiment = require('sentiment');
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
    console.log('socket on');
    const suburbs = JSON.parse(data).suburb;
    const counter = suburbs.length;
    socket.emit('search', { suburbs: suburbs });
    trends.then((res) => {
      // console.log('data', res);
      socket.emit('search', { suburbs: res });
    });
    news.then((results) => {
      const news = processNews(results);
      console.log('news processed');
      socket.emit('news', { suburbs: news });
    });
    traffic.then((resTraffic) => {
      console.log('traffic data');
      console.log(resTraffic);
      socket.emit('traffic', { traffic: resTraffic });
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

const processNews = (resNews) => {
  console.log('news data ready');
  const entities = new Entities();
  const sentiment = new Sentiment();
  const news = {};
  for (let i = 0; i < resNews.length; i++) {
    const suburb = resNews[i].name;
    const title = entities.decode(resNews[i].item.title);
    const date = resNews[i].item.pubDate;
    const content = entities.decode(resNews[i].item.content);
    const result = sentiment.analyze(title + ' ' + content);
    if (!news[suburb]) {
      news[suburb] = [{ suburb, title, result, date }];
    } else {
      news[suburb].push({ suburb, title, result, date });
    }
  }
  return news;
}


// // get trends for local businesses
// app.get('/trends', trends);
// // get traffic data
// app.get('/traffic', traffic);
// // get news
// app.get('/news', news);
//
