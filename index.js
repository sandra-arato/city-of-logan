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

const fetchPerMinute = 5;
let fetched = false;
const fetchData = () => setInterval(() => {
  trends.then((res) => {
    console.log('search data fetched');
    io.sockets.emit('search', { suburbs: res });
    fetched = true;
    return fetched;
  });
  news.then((results) => {
    const news = processNews(results);
    console.log('news processed');
    io.sockets.emit('news', { suburbs: news });
    fetched = true;
    return fetched;
  });
  traffic.then((resTraffic) => {
    console.log('traffic data fetched');
    io.sockets.emit('traffic', { traffic: resTraffic });
    fetched = true;
    return fetched;
  });
}, 1000* 60 * 1 / fetchPerMinute);

io.on('connection', function (socket) {
  getSuburbs(data => {
    console.log('socket on');

    const suburbs = JSON.parse(data).suburb;
    const counter = suburbs.length;
    socket.emit('search', { suburbs: suburbs });

    if (!fetched) {
      fetchData();
    }

    socket.on('disconnect', () => {
       clearInterval(fetchData);
    });

    // socket.on('connect', fetchData);



    // var fetch = setInterval(fetchData, 1000* 60 * 1 / fetchPerMinute);
    // socket.on('disconnect', function () {
    //  clearInterval(fetch);
    // });

    // fetchData();
    // setInterval(fetchData, 1000* 60 * 1 / fetchPerMinute);
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
