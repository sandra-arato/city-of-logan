const alerts = require('google-alerts-api');
const Parser = require('rss-parser');
const { gmail } = require('./keys');

alerts.configure(gmail);
const news = new Promise((resolve, reject) => {
  alerts.sync((err) => {
    console.log('getting news ready');
    if(err) return console.log(err);
    const titles = [];
    const alertList = alerts.getAlerts();
    console.log('alert list');
    // response.send(alertList);
    let parser = new Parser();
    alertList.forEach(alert => {
      (async () => {
        let feed = await parser.parseURL(alert.rss);
        feed.items.map(item => {
          // sentiment analysis of the item.content comes next
          console.log(item.title);
          titles.push({name: alert.name, item: item });
        });
        resolve(titles);
      })();
    });

  });
});

exports.news = news;
