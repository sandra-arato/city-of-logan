const HttpsProxyAgent = require('https-proxy-agent');
const googleTrends = require('google-trends-api');
const fs = require('fs');

const getSuburbs = cb => fs.readFile(__dirname+'/data/suburbs.json', function(error, data) {
  console.log('trend request');
  if(error){
    console.log('getSuburbs error', error);
    return error;
  } else {
    cb(data.toString());
  }
});

const getTrends = (suburb, time, cb) => {
  const proxyAgent =  new HttpsProxyAgent('http://proxy-host:8888/');
  let query = {
    keyword: suburb,
    startTime: time,
    granularTimeResolution: true,
    geo: 'AU-QLD',
  };
  setTimeout(() => {
    googleTrends.relatedQueries(query)
    .then((res) => {
      // do something else..
      return cb(res.toString());
    })
    .catch((err) => {
      // console.log(err);
      return err;
    });
  }, 250);
}

const trends = new Promise((resolve, reject) => {
  setInterval(() => {
    getSuburbs((data) => {
      const suburbs = JSON.parse(data).suburb;
      const counter = suburbs.length;
      const keywords = {};
      const now = new Date();
      // get search results from the last 2 hours
      const time = new Date(now.getTime() - (2000*60*60));
      console.log(`Search Trends for ${counter} suburbs ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`);
      for (let i = counter; i > -1; i--) {
        const suburb = suburbs[i];
        const proxyAgent =  new HttpsProxyAgent('http://proxy-host:8888/');
        let query = {
          keyword: suburb,
          startTime: time,
          granularTimeResolution: true,
          geo: 'AU-QLD',
        };
        googleTrends.relatedQueries(query)
        .then((res) => {
          // do something else..
          const trend = JSON.parse(res.toString()).default.rankedList;
          const words = [];
          if (trend && trend.length ) {
            const list = trend[0].rankedKeyword;
            for (j = 0; j < list.length; j++) {
              if (list[j].value > 10 && list[j].query.indexOf('qld') === -1) {
                // getting search terms by suburb
                const keyword = list[j].query
                  .toLowerCase()
                  .replace(suburb.toLowerCase(), '')
                  .trim();
                words.push(keyword);
              }
            }
          }
          keywords[suburb] = words;

          if (i === 0) {
            console.log('All fetched search results fetched');
            resolve(keywords);
          }
        })
        .catch((err) => {
          // console.log(err);
          return err;
        });

      }
    });
  }, 3200);
});


exports.trends = trends;
