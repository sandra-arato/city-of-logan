if (document.readyState !== 'loading') {
    ready();
} else {
    document.addEventListener('DOMContentLoaded', ready);
}

function listSuburbs(subs) {
  var list = document.getElementById('suburbs');
  list.innerHTML = '';
  for (let i = 0; i < subs.length; i++) {
    const li = document.createElement('li');
    li.innerHTML = subs[i];
    list.appendChild(li);
  }
}

function drawChart() {
  var ctx = document.getElementById("myChart").getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          datasets: [{
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  });
}

function ready () {
    // getData('/get-posts');
    console.log('ready to rock');
    drawChart();
    var socket = io.connect('http://localhost:3000');
    socket.on('news', function (data) {
      console.log(data);
      if (data.suburbs) {
        listSuburbs(data.suburbs);
        // drawChart();
      }
      if(Object.keys(data).length > 1 ) {
        console.log('test stream');
        listSuburbs(Object.keys(data));
      }
      // socket.emit('my other event', { my: 'data' });
    });
}
