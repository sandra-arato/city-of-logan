const express = require('express');
const fs = require('fs');
const req = require('request');
const app = express();
const HttpsProxyAgent = require('https-proxy-agent');
let proxyAgent =  new HttpsProxyAgent('http://proxy-host:8888/');
const googleTrends = require('google-trends-api');
const alerts = require('google-alerts-api');
const Parser = require('rss-parser');
const { gmail, gmaps } = require('./keys');

const { HOW_OFTEN, DELIVER_TO, HOW_MANY, MAIL } = alerts;

alerts.configure(gmail);


app.use(express.static("public"));
app.listen(3000, function () {
  console.log('Server is listening on port 3000. Ready to accept requests!');
});

app.get('/trends', function(request, response) {
  let proxyAgent =  new HttpsProxyAgent('http://proxy-host:8888/');
  let query = {
    keyword: 'windaroo',
    startTime: new Date('2017-08-27'),
    granularTimeResolution: true,
    geo: 'AU',
  };
  googleTrends.relatedQueries(query)
  .then((res) => {
    response.send(res);
  })
  .catch((err) => {
    console.log(err);
    response.send(err);
  });
});

app.get('/boundaries', function(request, response) {
  req('https://data.police.qld.gov.au/api/boundary?name=jimboomba', (err, data) => {
    if (err) { return console.log(err); }
    console.log(data);
    response.send(data.body);
  });
});

app.get('/alerts', function(request, response) {

  alerts.sync((err) => {
      if(err) return console.log(err);
      const alertList = alerts.getAlerts();
      // response.send(alertList);
      let parser = new Parser();
      alertList.forEach(alert => {

        (async () => {

          let feed = await parser.parseURL(alert.rss);
          feed.items.forEach(item => {
            // sentiment analysis of the item.content comes next
            console.log(item.title);

          });

        })();
      });
  });

});

app.get('/traffic', function(request, response) {
  req('https://api.qldtraffic.qld.gov.au/v1/events?apikey=3e83add325cbb69ac4d8e5bf433d770b', (err, data) => {
    if (err) { return console.log(err); }
    console.log(data);
    response.send(data.body);
  });
});

app.get('/get-posts', function(request, response){
  fs.readFile(__dirname+'/data/trends.json', function(error, data){
    if(error){
      console.log('Error reading posts.json: '+error);
      response.status(500);
      response.send(error);
    } else {
      response.send(data.toString());
    }
  });
});
