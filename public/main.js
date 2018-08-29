if (document.readyState !== 'loading') {
    ready();
} else {
    document.addEventListener('DOMContentLoaded', ready);
}

function ready () {
    // getData('/get-posts');
    getData('/trends');
    getAlerts('/alerts');
    // send posts to server
    var form = document.querySelector('form');
    form.addEventListener('submit', function (event) {

        event.preventDefault(); // prevents the form from contacting our server automatically (we want to do it ourselves)
        var formActionUrl = form.action; // 'form.action' is the url '/create-post'
        var formData = new FormData(form);

        postBlogposts(formActionUrl, formData);
    });
}

/****
 * Function definitions
 ***/
function postBlogposts (url, data) {
    fetch(url, {
        method: 'POST',
        body: data
    })
    .then(function (res) {
        res.json()
            .then(function (json) {
                console.log(json);
                addBlogPostToPage(json);
                document.querySelector('form').reset();
        })
    })
    .catch(function (err) {
        console.error(err)
    });
}

// 2. delete post function

function getData (url) {
    fetch(url, {
        method: 'GET'
    })
    .then(function (res) {
        res.json()
        .then(function (json) {
            console.log(json);
            addBlogpostsToPage(json);
        });
    })
    .catch(function (err) {
        console.error(err)
    });
}

function getAlerts (url) {
    fetch(url, {
        method: 'GET'
    })
    .then(function (res) {
        res.json()
        .then(function (json) {
            console.log('get alerts');
            console.log(json);
            // addBlogpostsToPage(json);
        });
    })
    .catch(function (err) {
        console.error(err)
    });
}

function addBlogPostToPage (post) {
  console.log('add one:', post);
  var postDiv         = document.createElement('div');
  var postText        = document.createElement('div');
  var postContainer   = document.querySelector('.post-container');

  // put <p> tags around each separate line of blogpost, otherwise
  // they will all run together
  postText.innerHTML = post.topic.title;
  postText.className = 'postBody';
  postDiv.id = post.topic.mid;
  postDiv.className = 'post';

  var postDetail = document.createElement('div');
  postDetail.className = 'postDetail';
  postDetail.innerHTML = post.formattedValue;

  // 3. insert delete button here

   // 2. insert mood display here

  postDiv.appendChild(postText);
  postDiv.appendChild(postDetail);
  postContainer.prepend(postDiv);
}

function formatDate(timestamp){
  var dateObj = new Date(timestamp);
  return dateObj.toLocaleString();
}

function addBlogpostsToPage (data) {
    const list = data.default.rankedList[1];
    console.log('add blogposts', list);
    for (var i = 0; i < list.length; i++){
      if (list[i].topic.type !== 'Town in Australia') {
        addBlogPostToPage(list[i]);
      }

    }
}
