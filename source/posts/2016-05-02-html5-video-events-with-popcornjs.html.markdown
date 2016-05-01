---
title: HTML5 Video Events with Popcorn.js
date: 2016-05-02
tags: video, prototyping, popcornjs
---

I recently worked on an early stage project that needed to be able to show a video with configurable screens that appeared at specific times. The team wanted a working demo to inform the design process and I had been looking for an excuse to play with <a href='http://popcornjs.org/' target='_blank'>Popcorn.js</a> some more.

After some discussion, I put together a small app that showed questions over a video in a quiz format. If you want to skip ahead, you can <a href='http://neiltron.github.io/video_quiz_demo/public/' target='_blank'>view the demo</a> or <a href='http://github.com/neiltron/video-quiz' target='_blank'>check out the code</a>.


### MV-SORTA
I used a MVC-ish pattern that was heavy on the View. The view also <a href='https://github.com/neiltron/video_quiz_demo/blob/gh-pages/public/js/question-view.js#L6' target='_blank'>holds model data</a>, which is supplied as an array of <a href='https://github.com/neiltron/video_quiz_demo/blob/gh-pages/public/js/questions.js' target='_blank'>pre-loaded question data</a>. In real life, this data would be handled by a CMS and probably served to the client via an API.

To get started, the events/views are initialized at page load and registered with Popcorn.js. This just tells the video what it's supposed to do and when. This is the kick-off point of the app.

It should be noted that the two or three popcorn-specific lines below are **all we really need to do to get Popcorn.js working**. Part of what makes Popcorn so powerful as a tool is how simple it is to get started. It's <a href='http://popcornjs.org/popcorn-docs/' target='_blank'>incredibly flexible</a>, but the most basic uses can be handled in just a few lines.

```javascript
$(document).ready(function () {
  // create a youtube video object
  var youtube = new Popcorn.HTMLYouTubeVideoElement('#video');
  youtube.src = videoUrl;

  // create popcorn player from youtube object
  video = new Popcorn(youtube);

  // create questions via callback
  // and append to popcorn timeline
  var questionsLength = questions.length;
  for (var i = 0; i < questionsLength; i++) {
    video.cue( questions[i].time, returnCallback(questions[i]) );
  }

  // start the video automatically
  video.play();
});
```

Each view has a `render` method that gets called when the video gets to that view's specified time. This is handled by the `returnCallback` method in the example above. In the case of this demo, we want the video to pause and display a question/answer screen. Then, after the users chooses an answer, the view should disappear and the video should resume playing.

```javascript
  render: function () {
    window.video.pause();

    $(this.el)
      .html(tmpl(this.questionData))
      .addClass('active');

    this.bindEvents();
  },

  bindEvents: function () {
    var that = this;

    // handles the user click
    $(this.el).find('li').one('click', function (e) {
      var correctEl = $(that.el).find('li').eq(that.questionData.answer);

      that.checkAnswer($(e.target), correctEl);

      setTimeout(that.close, 3000);
    });
  },

  close: function () {
    $('#quiz_container').removeClass('active');

    window.video.play();
  }
```

![RIP Sir David Attenborough](posts/2016/05/02/html5-video-events-with-popcornjs/quiz.gif)

### Making it real and taking it further
That's really the bulk of this little app. It could be used with just this level of functionality if the end goal was more for entertainment or advertising purposes. It could be deployed as an app component, web banner, etc.

If it was in an education or training product, it could send the answer data back to a server (in the `checkAnswer` method above) to be graded or analyzed. Or it could get rid of the modal screens altogether and just track how far into the video a user had watched.

This could also be re-purposed as an interactive site. The question views could, instead of stoping/restarting the video, just display images/effects over top of the video or modify other DOM elements at choreographed times.