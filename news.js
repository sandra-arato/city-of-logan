const alerts = require('google-alerts-api');
const Parser = require('rss-parser');
const { gmail } = require('./keys');

alerts.configure(gmail);

const news = new Promise((resolve, reject) => {
  setInterval(() => {
    alerts.sync((err) => {
      if(err) return console.log(err);
      const titles = [];
      const alertList = alerts.getAlerts();
      console.log(`${(new Date()).toString()} Fetching news...`);
      let parser = new Parser();
      alertList.forEach(alert => {
        (async () => {
          let feed = await parser.parseURL(alert.rss);
          feed.items.map(item => {
            // sentiment analysis of the item.content comes next
            titles.push({name: alert.name, item: item, id: item.id });
          });
          resolve(titles);
        })();
      });

    });
  }, 6000);

});

exports.news = news;
