const req = require('request');
const fs = require('fs');

const QLD_TRAFFIC_URL = 'https://api.qldtraffic.qld.gov.au/v1/events';
const QLD_TRAFFIC_API_KEY = '3e83add325cbb69ac4d8e5bf433d770b';

const getSuburbs = cb => fs.readFile(__dirname+'/data/suburbs.json', function(error, data) {
  console.log('parsing traffic through suburbs');
  if(error){
    console.log('getSuburbs error', error);
    return error;
  } else {
    cb(data.toString());
  }
});


const traffic = new Promise((resolve, reject) => {
  console.log('getting something from traffic');
  req(`${QLD_TRAFFIC_URL}?apikey=${QLD_TRAFFIC_API_KEY}`,
    (err, data) => {
      console.log('resolving traffic data');
      if (err) { return console.log(err); reject(err); }
      if (data && data.body) {
        const response = JSON.parse(data.body);
        // console.log('resolving traffic data', response);
        if (response && response.features) {
          const events = {};
          // console.log(response.features);
          getSuburbs(suburbData => {
            const suburbs = JSON.parse(suburbData).suburb;
            const counter = suburbs.length;
            suburbs.forEach((suburb) => {
              response.features.forEach(item => {
                const event = item.properties;
                const locality = event.road_summary.locality;

                if (event.road_summary && locality.indexOf(suburb) > -1) {
                  console.log('matched traffic event in suburb', suburb);
                  const date = event.last_updated;
                  const title = event.description;
                  const type = event.event_type;
                  if (!events[suburb]) {
                    events[suburb] = [{ suburb, title, type, date }];
                  } else {
                    events[suburb].push({ suburb, title, type, date });
                  }
                }
                if (Object.getOwnPropertyNames(events).length) {
                   console.log(events);
                }
                return events;
              });
              return events;
            });
            resolve(events);
          });
          resolve(events);
        }
      }
  });
});

exports.traffic = traffic;
