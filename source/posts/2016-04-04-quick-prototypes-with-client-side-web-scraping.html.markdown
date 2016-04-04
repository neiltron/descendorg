---
title: Quick Prototypes with client-side web scraping
date: 2016-04-04
tags: scraping, prototyping
---

Setting the line-in-the-sand of a minimum viable product can be an art. Sometimes when you're concepting and collaborating with others, you need more than a sloppily drawn sharpie wireframe to tell the story of what you want to build. And sometimes when you're building something just for your own use, that minimum product is all you'll ever need.

If you're building apps that require external data, there's almost no end to the amount of technical foundation you *could* lay before you even start building an interface. API clients, crawlers, scrapers, databases, queues, caches, even more queues with fail modes and staggered retries...

Server-side frameworks for XML parsing and DOM traversal are plentiful. There's Mechanize (for both <a href='http://search.cpan.org/dist/WWW-Mechanize/' target='_blank'>Perl</a> and <a href='https://github.com/sparklemotion/mechanize' target='_blank'>Ruby</a>), <a href='https://github.com/hickford/MechanicalSoup' target='_blank'>MechanicalSoup</a>, <a href='https://github.com/sparklemotion/nokogiri' target='_blank'>Nokogiri</a>, etc. In the most basic version of a crawling system, you can drop any of these libraries into a script, attach it to a cron job, and call it a day.

In an app that's expected to scale or perform any long-term analysis on stored data, your data harvesting needs to be reliable, idempotent, and repeatable. But for building an MVP, all of this can be overkill. Sometimes, all you need is jQuery.

### Move quick and leverage the hard work of others

In this example, I'm pull data from a site that lists upcoming soccer matches. The data is listed in tables sorted by time. We want to grab things like team names, their logos, match times, and URLs so we can link back to the original page.

To start we want to create a `Match` object. This will hold individual match data and necessary functions for fetching and displaying information.

```javascript
var Match = function (opts) {
  // setup initial properties
  this.url = opts.url || '';
    this.homeName = '';
    this.awayName = '';
    this.matchTime = Date.now();

  // kick off any functions you want called on object creation
  this.initialize();
};
```

In this case, our initialize function is simple. Go fetch extra information and then render it as a row in a table.

```javascript
Match.prototype.initialize = function () {
  // get the thing
  this.fetch();

  // display the thing
  this.render();
}};
```

Our data source has a sub-page for each row in the table where extra information is kept. So our `Match` object will have it's own `fetch` method to grab the sub-page and parse all the relevant metadata.

```javascript
Match.prototype.fetch = function () {
  var that = this;

  $.ajax({
    url: this.url,
    success: function (data) {
      that.html = data;

      // process the html
            this.homeImage = $(this.html).find('.homeLogo img').attr('src');
            this.awayImage = $(this.html).find('.awayLogo img').attr('src');
    };
  });
};
```


Instead of creating a whole separate view layer to handle display logic, we can just tack on render function to get everything displayed quickly.

```javascript
Match.prototype.render = function () {
  // initialize the container object if it's the first render
  if (typeof this.el === 'undefined') {
        this.el = $('<tr></tr>').appendTo('#matches tbody');
    }

  // display whatever relevant match information
    this.el.html('<td>' + this.homeTeam + '</td><td>' + this.awayTeam + '</td>');
};
```

Now we just need to scrape the initial page, create new match objects, and render them to the page.

```javascript
var parseMatchLinks = function (html) {
    // loop through each match row
      $(html).find('.match').each(function (i, el) {
        // parse relevant match information
                this.homeTeam = $(el).find('.homeName').text().trim();
                this.awayTeam = $(el).find('.awayName').text().trim();
                this.matchDateTime = $(this.html).find('.matchTime').text().trim();

        // create our match object. from our code above, the Match object will parse it's sub-page and display itself when it's ready
        var match = new Match({ url: url, title: title, otherData: otherData });
      });
    };

$(document).ready(function () {
  // fetch then parse
  $.ajax({ url: 'http://target_site_url' }).then(parseMatchLinks);
});
```

Done! Right? Not quite.

### Proxying cross-origin requests

So far, you could deploy this whole thing on a static server. The issue with prototyping this sort of thing in browser is that most sites won't be fetchable due to security restrictions in browsers. Without <a href='http://en.wikipedia.org/wiki/Cross-origin_resource_sharing' target='_blank'>cross-origin requests</a> (CORS) enabled on the server, you can't use `$.ajax` for content outside of the current domain. I.e., if your site is hosted at http://domain.com, you can't grab data from http://anotherdomain.com.

To get around this, we'll just create a proxy server that passes CORS headers and routes requests to the site we're scraping. I'm going to go with nodejs for this example, but this is simple enough that it shouldn't take much in any language.

This uses express to handle requests and Cacheman to cache responses. Setting up a cache will allow us to serve the data quick while also being good consumers (or at least, <a href='https://danceswithdissonance.files.wordpress.com/2015/01/30-rock-grad-student-are-the-worst.gif' target='_blank'>not the *worst*</a>) of others' data.

```javascript
var express = require('express');
var request = require('request');
var Cacheman = require('cacheman');
var apiServerHost = 'http://targetdomain.com';

var app = express();
var cache = new Cacheman();

app.disable('quiet');

// respond to CORS headers from our client app
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', function(req, res) {
  // transform the url so that all request go to
  // the other site. i.e., if our client hits this
  // proxy server at http://localhost:4000/matches/match_id,
  // it will return html from http://targeturl.com/matches/match_id
    var url = apiServerHost + req.url;

    // check the cache for the content
    cache.get(url, function (error, content) {

      if (error) { throw error; }
      else if (typeof content === 'undefined') {
    // if the content isn't in the cache, request it from the target site.
            content = [];

            request(url, function (error, response, body) {
              content = { html: body };

        // add the content to the cache using the url as
        // the cache key and an expiration of 5 minutes.
        cache.set(url, content, 600)
      });
    }

    // send the content to the client
    res.send(content.html)
  });
});

app.listen(4000);
```

Now to route our requests through the proxy, we just need to change the url used inside of our `$(document).ready()` ajax call to `localhost:4000`.

Blam-o. Done. Well, basically. It would also help to style this thing up a bit and actually have an index.html. And you might also want to build some kind of server or integration to pass your fresh, crisp data off to. But that's for another post.