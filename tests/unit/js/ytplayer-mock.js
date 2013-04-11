/*global YUI, YT, window */
YUI.add("ytplayer-mock", function (Y) {

    "use strict";

    var STATE;

    window.YT = {};
    YT.PlayerState = {
        UNSTARTED : -1,
        ENDED     : 0,
        PLAYING   : 1,
        PAUSED    : 2,
        BUFFERING : 3,
        CUED      : 5
    };
    STATE = YT.PlayerState;
    YT.Player = function (id, config) {
        config = config || {};
        this._timer = null;
        this.state = STATE.UNSTARTED;
        this.duration = 120;
        this.currentTime = 0;
        this.autoPlay = config.autoPlay || false;
        if (config.events) {
            if (config.events.onReady) {
                this.onReady = config.events.onReady;
            }
            if (config.events.onStateChange) {
                this.onStateChange = config.events.onStateChange;
            }
            if (config.events.onError) {
                this.onError = config.events.onError;
            }
        }
        Y.later(100, this, function () {
            this.onReady.call(this, {target: this});
            if (this.autoPlay) {
                this.playVideo();
            }
        });
    };
    YT.Player.prototype = {
        _createTimer: function () {
            var that = this;
            that._timer = Y.later(1000, null, function () {
                that.currentTime += 1;
                if (that.currentTime > that.duration) {
                    that.stopVideo();
                }
            }, null, true);
        },
        _destroyTimer: function () {
            var that = this;
            if (that.timer) {
                that._timer.cancel();
                that._timer = null;
            }
        },
        destroy: function () {
            if (this._timer) {
                this._timer.cancel();
            }
        },
        getCurrentTime: function () {
            return this.currentTime;
        },
        getDuration: function () {
            return this.duration;
        },
        getPlayerState: function () {
            return this.state;
        },
        getPlaybackQuality: function () {
            return "";
        },
        loadVideoByUrl: function (url, start, quality) {
            var that = this;
            if (Y.Lang.isNumber(start) && start >= 0 && start <= that.duration) {
                that.currentTime = start || 0;
            }
            that.url = url;
            that.playVideo();
        },
        playVideo: function () {
            var that = this;
            switch (that.state) {
            case STATE.PAUSED:
                that.state = STATE.PLAYING;
                that.onStateChange.call(that, {target: that, data: that.state});
                that._createTimer();
                break;
            case STATE.ENDED:
                that.state = STATE.UNSTARTED;
                that.onStateChange.call(that, {target: that, data: that.state});
                Y.later(100, that, function () {
                    var that = this;
                    that.state = STATE.BUFFERING;
                    that.onStateChange.call(that, {target: that, data: that.state});
                    Y.later(1000, that, function () {
                        var that = this;
                        that.state = STATE.PLAYING;
                        that.onStateChange.call(that, {target: that, data: that.state});
                        that._createTimer();
                    });
                });
                break;
            case STATE.UNSTARTED:
                that.state = STATE.BUFFERING;
                that.onStateChange.call(that, {target: that, data: that.state});
                Y.later(1000, that, function () {
                    var that = this;
                    that.state = STATE.PLAYING;
                    that.onStateChange.call(that, {target: that, data: that.state});
                    that._createTimer();
                });
                break;
            }
        },
        pauseVideo: function () {
            var that = this;
            that._destroyTimer();
            that.state = STATE.PAUSED;
            that.onStateChange.call(that, {target: that, data: that.state});
        },
        seekTo: function (second, allowSeekAhead) {
            var that = this;
            if (Y.Lang.isNumber(second) && second >= 0 && second <= that.duration) {
                that.currentTime = second;
            }
        },
        setPlaybackQuality: function () {
            return "";
        },
        stopVideo: function () {
            var that = this;
            that._destroyTimer();
            that.currentTime = 0;
            that.state = STATE.ENDED;
            that.onStateChange.call(that, {target: that, data: that.state});
        }
    };
});
