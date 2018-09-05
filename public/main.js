if (document.readyState !== 'loading') {
    ready();
} else {
    document.addEventListener('DOMContentLoaded', ready);
}

const arrayOf69 = () => {
  const array = [];
  for (var i = 0; i < 69; i++) {
    array.push('');
  }
  return array;
};

const state = {
  labels: [],
  search: [],
  positive: arrayOf69(),
  neutral: arrayOf69(),
  negative: arrayOf69(),
  search: arrayOf69(),
  traffic: arrayOf69(),
};

function listSuburbs(subs) {
  var list = document.getElementById('suburbs');
  list.innerHTML = '';
  for (let i = 0; i < subs.length; i++) {
    const li = document.createElement('li');
    li.innerHTML = subs[i];
    list.appendChild(li);
  }
}

function updateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const timestring = `
    ${hours > 9 ? hours : '0' + hours}:${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}
  `;
  return document.querySelector('.header p').innerHTML = timestring;
}

function insertNews(newsArray) {
  const feed = document.getElementById('feed');
  const items = newsArray.map((item) => {
    const date = new Date(item.date);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timestring = `${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}`;

    //  news
    if (item.result) {
      const score = item.result.score;
      let className = '';
      if (score > 0) { className = "positive"; }
      if (score === 0) { className = "neutral"; }
      if (score < 0) { className = "negative"; }
      const itemHtml = `
          <h3>News feed</h3>
          <p>${item.title}</p>
          <p>
            <span>${item.suburb}</span>
            <span>${timestring}</span>
          </p>
      `;
      const div = document.createElement('div');
      div.classList.add('news', className);
      div.innerHTML = itemHtml;
      feed.insertBefore(div, feed.firstElementChild);
      return div;
    }
    if (item.type) {
      const itemHtml = `
          <h3>${item.type}</h3>
          <p>${item.title}</p>
          <p>
            <span>${item.suburb}</span>
            <span>${timestring}</span>
          </p>
      `;
      const div = document.createElement('div');
      div.classList.add('news', 'traffic');
      div.innerHTML = itemHtml;
      feed.insertBefore(div, feed.firstElementChild);
      return div;
    }
    if (item.search) {
      const itemHtml = `
          <h3>${item.search}</h3>
          <p>${item.title}</p>
          <p>
            <span>${item.suburb}</span>
            <span>${timestring}</span>
          </p>
      `;
      const div = document.createElement('div');
      div.classList.add('news', 'search');
      div.innerHTML = itemHtml;
      feed.insertBefore(div, feed.firstElementChild);
      return div;
    }
  })
  return items;
}

function drawChart() {
  var ctx = document.getElementById("myChart").getContext('2d');
  const randomPositive = () => {
    return Math.floor(Math.random() * 7);
  };
  var barChartData = {
    labels: state.labels,
    datasets: [{
      label: 'Search events',
      backgroundColor: 'rgba(74, 84, 175, 1)',
      data: arrayOf69(),
    },{
      label: 'Good news',
      backgroundColor: 'rgba(54, 162, 235, 1)',
      data: state.positive,
    }, {
      label: 'Neutral news',
      backgroundColor: 'rgba(120, 214, 120, 1)',
      data: state.neutral,
    }, {
      label: 'Bad news',
      backgroundColor: 'rgba(243, 205, 20, 1)',
      data: state.negative,
    }, {
      label: 'Traffic events',
      backgroundColor: 'rgba(247, 82, 20, 1)',
      data: state.traffic,
    }]
  };

  var myChart = new Chart(ctx, {
    type: 'bar',
    data: barChartData,
    options: {
      title: {
        display: false,
        text: 'Chart.js Bar Chart - Stacked'
      },
      ticks: {
        autoSkip: false,
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      responsive: true,
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true
        }]
      }
    },
  });
}

function ready () {
    // getData('/get-posts');
    console.log('ready to rock');

    var socket = io.connect('http://localhost:3000');
    socket.on('news', function (data) {
      updateTime();
      if (state.labels && state.labels.length) {

        for (let i = 0; i < state.labels.length; i++) {
          const suburb = state.labels[i];
          if (data.suburbs[suburb]) {
            // update graph
            const positive = (accumulator, currentValue) => {
              if (currentValue.result.score > 0) {
                return accumulator + currentValue.result.score;
              }
              return 0;
            }
            const negative = (accumulator, currentValue) => {
              if (currentValue.result.score < 0) {
                return accumulator + currentValue.result.score;
              }
              return 0;
            }
            const neutral = (accumulator, currentValue) => {
              if (currentValue.result.score === 0) {
                return accumulator + 1;
              }
              return 0;
            }
            state.positive[i] = data.suburbs[suburb].reduce(positive, 0);
            state.neutral[i] = data.suburbs[suburb].reduce(neutral, 0);
            state.negative[i] = Math.abs(data.suburbs[suburb].reduce(negative, 0));
            if (data.suburbs[suburb].length) {
              console.log(`news for ${suburb} loaded`);
              insertNews(data.suburbs[suburb]);
              // add news item to feed
            }
          }

        }
      }
      drawChart();
    });

    socket.on('traffic', function (data) {
      console.log('traffic', data);
      if (state.labels && state.labels.length) {
        for (let i = 0; i < state.labels.length; i++) {
          const suburb = state.labels[i];
          if (data.traffic[suburb]) {
            state.traffic[i] = data.traffic[suburb].length;
            insertNews(data.traffic[suburb]);
          }
        }
      }
      drawChart();
    });
    socket.on('search', function (data) {
      state.labels = Object.keys(data.suburbs);
      const searchTerms = [];
      if (state.labels.length && !data.suburbs.length) {
        for (let i = 0; i < state.labels.length; i++) {
          const suburb = state.labels[i];
          if (data.suburbs[suburb].length) {
            const time = new Date();
            state.search[i] = data.suburbs[suburb].length;
            searchTerms.push({
              search: 'Trend event',
              title: `Someone has recently searched for the following term(s): ${data.suburbs[suburb].join(', ')}`,
              date: time.toString(),
              suburb: suburb,
            });

          }
        }
      }
      insertNews(searchTerms);
      console.log('search data', data);
      drawChart();
    });

}
