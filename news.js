const alerts = require('google-alerts-api');
const Parser = require('rss-parser');
const { gmail } = require('./keys');

alerts.configure(gmail);

const news = (request, response) => {
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
};

exports.news = news;
