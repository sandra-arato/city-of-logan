const req = require('request');

const QLD_TRAFFIC_URL = 'https://api.qldtraffic.qld.gov.au/v1/events';
const QLD_TRAFFIC_API_KEY = '3e83add325cbb69ac4d8e5bf433d770b';

const traffic = (request, response) => {
  req(`${QLD_TRAFFIC_URL}?apikey=${QLD_TRAFFIC_API_KEY}`,
    (err, data) => {
      if (err) { return console.log(err); }
      console.log(data);
      response.send(data.body);
    });
};

exports.traffic = traffic;
