/*global window, YUI, YT, document */
YUI.add("youtube-iframe-tests", function (Y) {

    "use strict";

    var Assert = Y.Assert,
        suite = new Y.Test.Suite("youtube-iframe"),
        createPlayer;

    createPlayer = function (o) {
        o = o || {};
        var attrs = {
            "autoPlay": true,
            "url": "http://www.youtube.com/watch?v=faVCwOesYl8",
            "size": ["200px", "200px"]
        };
        return new Y.YoutubeIframe(Y.merge(attrs, o));
    };

    suite.add(new Y.Test.Case({
        name: "Y.YoutubeIframe",
        _should: {
            ignore: {
                "size of container should be equal to size attribute": true
            }
        },
        //======================
        // Setup and tear down
        //======================
        setUp: function () {
            this.player = null;
        },
        tearDown: function () {
            if (this.player) {
                this.player.destroy();
            }
        },
        //======================
        // Tests
        //======================
        "instance should be rendered without url attribute": function () {
            this.player = new Y.YoutubeIframe({
                "size": ["200px", "200px"]
            });
            Assert.isTrue(this.player instanceof Y.YoutubeIframe);
        },
        "instance should be rendered without autoPlay attribute": function () {
            this.player = new Y.YoutubeIframe({
                "size": ["200px", "200px"],
                "url": "http://www.youtube.com/watch?v=faVCwOesYl8"
            });
            Assert.isTrue(this.player instanceof Y.YoutubeIframe);
        },
        "instance should be an YT.Player instance": function () {
            var that = this;
            that.player = new Y.YoutubeIframe({
                "size": ["200px", "200px"],
                "url": "http://www.youtube.com/watch?v=faVCwOesYl8"
            });
            that.player.on("ready", function () {
                that.resume(function () {
                    Assert.isTrue(that.player.get("instance") instanceof YT.Player);
                });
            }, that);
            that.wait();
        },
        "duration should be readOnly": function () {
            var that = this;
            that.player = createPlayer();
            that.player.on("playing", function () {
                that.resume(function () {
                    var notExpected = 3000,
                        beforeValue,
                        afterValue;
                    beforeValue = that.player.get("duration");
                    that.player.set("duration", notExpected);
                    afterValue = that.player.get("duration");
                    Assert.isNumber(afterValue);
                    Assert.areEqual(beforeValue, afterValue);
                });
            });
            that.wait();
        },
        "duration should not equal to zero after state changes to 'playing'": function () {
            var that = this;
            that.player = createPlayer();
            that.player.on("playing", function () {
                Y.later(1000, null, function () {
                    that.resume(function () {
                        Assert.isTrue(that.player.get("duration") > 0);
                    });
                });
            }, that);
            that.wait();
        },
        "ready event should be triggered after initialization": function () {
            var that = this;
            that.player = createPlayer();
            that.player.on("ready", function () {
                that.resume(function () {
                    Assert.pass();
                });
            }, that);
            that.wait();
        },
        "mode should always be 0": function () {
            var that = this;
            that.player = createPlayer();
            Assert.areEqual(0, that.player.get("mode"));
            that.player.on("ready", function () {
                that.resume(function () {
                    Assert.areEqual(0, that.player.get("mode"));
                });
            }, that);
            that.wait();
        },
        "position could be configured at initialization": function () {
            var that = this,
                expected = 3;
            that.player = createPlayer({
                "autoPlay": true,
                "size": ["200px", "200px"],
                "position": expected,
                "url": "http://www.youtube.com/watch?v=faVCwOesYl8"
            });
            that.player.on("playing", function () {
                that.resume(function () {
                    Assert.isTrue(that.player.get("position") >= expected);
                });
            }, that);
            that.wait();
        },
        "position should be updated by setting position attribute": function () {
            var that = this,
                expected = 3;
            that.player = createPlayer({
                "autoPlay": true,
                "size": ["200px", "200px"],
                "url": "http://www.youtube.com/watch?v=faVCwOesYl8"
            });
            that.player.on("ready", function () {
                that.player._set("position", expected);
            }, that);
            that.player.on("playing", function () {
                that.resume(function () {
                    Assert.areEqual(expected, that.player.get("position"));
                });
            }, that);
            that.wait(5000);
        },
        "position should not equal to zero after playing for 3 secs": function () {
            var that = this;
            that.player = createPlayer();
            that.player.once("playing", function () {
                that.resume(function () {
                    that.wait(function () {
                        Assert.areNotEqual(0, that.player.get("position"));
                    }, 3000);
                });
            });
            that.wait();
        },
        "size of container should be equal to size attribute": function () {
            var that = this,
                id,
                width,
                height,
                node;

            that.player = new Y.YoutubeIframe({
                "container": "#test-size",
                "size": ["200px", "200px"],
                "url": "http://www.youtube.com/watch?v=faVCwOesYl8"
            });
            that.player.on("ready", function () {
                that.resume(function () {
                    id = that.player.get("container").get("id");
                    node = document.getElementById(id);
                    width = node.offsetWidth + "px";
                    height = node.offsetHeight + "px";
                    Assert.areEqual("200px,200px", width + "," + height);
                });
            });
            that.wait();
        },
        "state should be 'initializing' at the beginning": function () {
            var that = this;
            that.player = createPlayer();
            Assert.areEqual("initializing", that.player.get("state"));
        },
        "state should be 'ready' immediately after player is ready": function () {
            var that = this;
            that.player = new Y.YoutubeIframe({
                "autoPlay": true,
                "url": "http://www.youtube.com/watch?v=faVCwOesYl8"
            });
            that.player.on("ready", function () {
                that.resume(function () {
                    Assert.areEqual("ready", that.player.get("state"));
                });
            });
            that.wait();
        },
        "state should be 'paused' after pause method executes": function () {
            var that = this;
            that.player = createPlayer();
            that.player.on("playing", function (e) {
                that.resume(function () {
                    that.player.pause();
                    Assert.areEqual("paused", that.player.get("state"));
                });
            });
            that.wait();
        },
        "state should be 'playing' after play method executes after paused": function () {
            var that = this;
            that.player = createPlayer();
            that.player.on("playing", function (e) {
                that.resume(function () {
                    that.player.pause();
                    that.wait(function () {
                        that.player.resume();
                        Assert.areEqual("playing", that.player.get("state"));
                    }, 1000);
                });
            });
            that.wait();
        },
        "state should be 'stopped' after stop method executes": function () {
            var that = this;
            that.player = createPlayer();
            that.player.on("playing", function (e) {
                that.resume(function () {
                    that.player.stop();
                    Assert.areEqual("stopped", that.player.get("state"));
                });
            });
            that.wait();
        },
        "state should be 'play' after play executes after stop": function () {
            var that = this;
            that.player = createPlayer();
            that.player.on("playing", function (e) {
                that.resume(function () {
                    that.player.stop();
                    that.wait(function () {
                        that.player.play();
                        Assert.areEqual("play", that.player.get("state"));
                    }, 1000);
                });
            });
            that.wait();
        },
        "url should be updated after play method executes": function () {
            var that = this;
            that.player = createPlayer();
            that.player.on("playing", function (e) {
                Y.later(1000, null, function () {
                    that.resume(function () {
                        var expected = "http://www.youtube.com/watch?v=u1zgFlCw8Aw";
                        that.player.play(expected);
                        Assert.areEqual(expected, that.player.get("url"));
                    });
                });
            });
            that.wait();
        }
    }));

    Y.Test.Runner.add(suite);

}, "@VERSION", {
    "requires": [
        "youtube-iframe",
        "ytplayer-mock",
        "test"
    ]
});
