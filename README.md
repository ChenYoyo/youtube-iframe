youtube-iframe
==============

It's an YouTube IFrame Player API wrapper for YUI.

## Build Status

![Build Status](https://api.travis-ci.org/josephj/youtube-iframe.png?branch=master)

## How to use

1. Add YouTube Iframe API library to your webpage.

    ```html
    <script type="text/javascript" src="//www.youtube.com/iframe_api"></script>
    ````
1. Sample code - config and player.

    ```javascript
    var config = {
        "container": "#yt",  // HTML selector, it can be id, class or html tag name (like body)
        "size": ["1280px","780px"],  //width, height in px
        "hasControl": true,          //show control?
        "autoPlay": false,                   //auto play or not
        "url": "http://www.youtube.com/watch?v=faVCwOesYl8" //youtube url
    };
    var player = new Y.YoutubeIframe(config);
    ```
1. Play YouTube video with an existed player.

    ```javascript
    player.play("http://www.youtube.com/watch?v=faVCwOesYl8");
    ```
1. Listen event

    ```javascript
    player.on("ready", _handleReady);
    player.on("playing", function (e) {
        console.log(e.position + "/" + e.duration);
    });
    player.on("ended", _handleEnded);
    player.on("error", _handleError);
    ```

## Reference

* [YouTube Player API for Embedded Iframe](https://developers.google.com/youtube/iframe_api_reference)
