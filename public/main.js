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
  positive: [],
  neutral: [],
  negative: [],
  search: [],
  traffic: [],
  chart: null,
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
      // return div;
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
      // return div;
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
      // return div;
    }
  })
  return items;
}

function drawChart() {
  if (!state.chart) {
    const ctx = document.getElementById("myChart").getContext('2d');
    var barChartData = {
      labels: state.labels,
      datasets: [{
        label: 'Search events',
        backgroundColor: 'rgba(74, 84, 175, 1)',
        data: state.search,
      },{
        label: 'Good news score',
        backgroundColor: 'rgba(54, 162, 235, 1)',
        data: state.positive,
      }, {
        label: 'Neutral news score',
        backgroundColor: 'rgba(120, 214, 120, 1)',
        data: state.neutral,
      }, {
        label: 'Bad news score',
        backgroundColor: 'rgba(243, 205, 20, 1)',
        data: state.negative,
      }, {
        label: 'Traffic events',
        backgroundColor: 'rgba(247, 82, 20, 1)',
        data: state.traffic,
      }]
    };
    state.chart = new Chart(ctx, {
      type: 'bar',
      data: barChartData,
      options: {
        title: {
          display: false,
          text: 'Live events in Logan City',
          fontFamily: ' "SF Mono", "Segoe UI Mono", "Roboto Mono", Menlo, Courier, monospace',
        },
        legend: {
          labels: {
            boxWidth: 32,
            fontFamily: ' "SF Mono", "Segoe UI Mono", "Roboto Mono", Menlo, Courier, monospace',
          },
        },
        ticks: {
          autoSkip: false,
        },
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: false,
        },
        responsive: true,
        scales: {
          xAxes: [{
            stacked: true,
            fontFamily: ' "SF Mono", "Segoe UI Mono", "Roboto Mono", Menlo, Courier, monospace',
          }],
          yAxes: [{
            stacked: true,
            fontFamily: ' "SF Mono", "Segoe UI Mono", "Roboto Mono", Menlo, Courier, monospace',
            label: 'Number of Events',
          }]
        }
      },
    });
  } else {
    // console.log('popping empty values from chart', state);
    // if (state && state.labels) {
    //   for (let i = 0; i < state.labels.length; i++) {
    //     const { positive, negative, search, neutral, traffic } = state;
    //     console.log(state.labels[i]);
    //     // if (!positive[i] && !negative[i] && !search[i] &&  !neutral[i] && !traffic[i]) {
    //     //   console.log(`${state.labels[i]} has no data`);
    //     //   state.labels.splice(i, 1);
    //     //   positive.splice(i, 1);
    //     //   negative.splice(i, 1);
    //     //   neutral.splice(i, 1);
    //     //   search.splice(i, 1);
    //     //   traffic.splice(i, 1);
    //     // }
    //   }
    // }
    console.log('data in graph', state);

    state.chart.clear();
    state.chart.update();
  }
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
                return accumulator + currentValue.result.comparative;
              }
              return accumulator;
            }
            const negative = (accumulator, currentValue) => {
              if (currentValue.result.score < 0) {
                console.log(currentValue);
                return accumulator + currentValue.result.comparative ;
              }
              return accumulator;
            }
            const neutral = (accumulator, currentValue) => {
              if (currentValue.result.comparative === 0) {
                return accumulator + 0.5;
              }
              return accumulator;
            }

            state.positive[i] = data.suburbs[suburb].reduce(positive, 1);
            state.neutral[i] = data.suburbs[suburb].reduce(neutral, 1);
            state.negative[i] = Math.abs(data.suburbs[suburb].reduce(negative, 0));
            if (suburb === 'Jimboomba') {
              console.log(data.suburbs[suburb]);
            }
            if (data.suburbs[suburb].length) {
              // console.log(`news for ${suburb} loaded`);

              insertNews(data.suburbs[suburb]);
              // add news item to feed
            }
          }

        }
      }
      drawChart();
    });

    socket.on('traffic', function (data) {
      updateTime();
      if (state.labels && state.labels.length) {
        state.labels.forEach(suburb => {
          const index = state.labels.indexOf(suburb);
          if (data.traffic[suburb]) {
            state.traffic[index] = data.traffic[suburb].length;
            insertNews(data.traffic[suburb]);
            // const found = state.traffic[index].find(element => element.id === )
          } else {
            state.traffic[index] = [];
          }
        });
        drawChart();
      }

    });
    socket.on('search', function (data) {
      updateTime();
      const searchTerms = [];
      if (state.labels.length && !data.suburbs.length) {
        for (let i = 0; i < state.labels.length; i++) {
          const suburb = state.labels[i];
          // console.log(data.suburbs);
          if (data.suburbs[suburb] && data.suburbs[suburb].length) {
            const time = new Date();
            state.search[i] = data.suburbs[suburb].length || 0;
            searchTerms.push({
              search: 'Trend event',
              title: `Someone has recently searched for the following term(s): ${data.suburbs[suburb].join(', ')}`,
              date: time.toString(),
              suburb: suburb,
            });

          }
        }
      } else {
        console.log(data);
        state.labels = data.suburbs;
      }
      insertNews(searchTerms);
      drawChart();
    });

}
