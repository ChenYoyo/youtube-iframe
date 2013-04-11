/*global window, YUI, YT, document */
/**
 * A util for control youtube iframe API.
 *
 * @module youtube-iframe
 * @requires node ,base
 */
YUI.add("youtube-iframe", function (Y) {

    "use strict";

    var _isLoading = false, // Indicates whether the Iframe API is being loaded.
        Lang = Y.Lang,
        //=================
        // Constants
        //=================
        CLASS_NAME = "yui3-youtube-iframe",
        IFRAME_API_SRC = "https://www.youtube.com/iframe_api",
        MODULE_ID = "youtube-iframe",
        //=================
        // Private Methods
        //=================
        _getParameter,
        _loadAPI,
        _loadAPICallback,
        _log;

    /**
     * Loads IFrame Player API asynchronously.
     */
    _loadAPI = function () {
        _log("_loadAPI() is executed().");
        var that = this;
        // Resumes _create method when API is loaded.
        window.onYouTubeIframeAPIReady = function () {
            that._create();
        };
        Y.Get.js(IFRAME_API_SRC, {context: that}, _loadAPICallback);
        _isLoading = true;
    };

    /**
     * Callback of _loadAPI method.
     */
    _loadAPICallback = function (err) {
        _log("_loadAPICallback() is executed.");
        var that = this;
        _isLoading = false;
        if (err) {
            _log("_loadAPICallback() It fails loading.");
            that.destroy();
            Y.error("Error loading JS: " + err[0].error, err, {
                "module" : "youtube-iframe",
                "fnName" : "_create",
                "continue" : false
            });
            return;
        }
        _log("_loadAPICallback() It loads successfully.");
    };

    _log = function (message, type, module) {
        type = type || "info";
        module = module || MODULE_ID;
        Y.log(message, type, module);
    };

    _getParameter = function (url, key) {
        _log("_getParameter() is executed.");
        var urls, queryString;
        urls = url.split("?");
        if (urls.length >= 2) {
            queryString = Y.QueryString.parse(urls[1]);
            return queryString[key];
        }
    };

    /**
     * An utility for youtube iframe API control.
     * The following is sample usage.
     *
     *     var vlc = new Y.YoutubeIframe({
     *         container: "#foo"
     *         url: "http://www.youtube.com/watch?v=uA378g_gD1I",
     *     });
     *
     * @constructor
     * @class YoutubeIframe
     * @param {instance} config attribute instance
     */
    function YoutubeIframe() {
        YoutubeIframe.superclass.constructor.apply(this, arguments);
    }
    /**
     * The status code for youtube iframe API control.
     *
     * @property STATE
     */
    YoutubeIframe.STATE = [
        "initializing",
        "ready",
        "idle",
        "buffering",
        "playing",
        "paused",
        "stopped",
        "ended",
        "error"
    ];
    YoutubeIframe.DEFAULT_WIDTH  = "1280px";
    YoutubeIframe.DEFAULT_HEIGHT = "700px";
    YoutubeIframe.CHECK_RETRY    = 3;
    YoutubeIframe.CHECK_INTERVAL = 1000;
    YoutubeIframe.POLL_INTERVAL  = 1000;
    YoutubeIframe.YOUTUBE_URL    = "http://www.youtube.com/v/{vid}?version=3";
    YoutubeIframe.ATTRS = {
        /**
         * The container to place instance element.
         *
         * @attribute container
         * @type
         */
        "container": {
            value: null,
            writeOnce: true
        },
        /**
         * The instance element.
         *
         * @attribute instance
         * @type HTMLElement
         */
        "instance": {
            value: null,
            readOnly: true
        },
        /**
         * The video URL.
         *
         * @attribute url
         * @type String
         */
        "url" : {
            value : null,
            writeOnce: true
        },
        /**
         * The player's current state.
         *
         * @attribute state
         * @type String
         */
        "state" : {
            value: "initializing",
            readOnly: true
        },
        /**
         * The iframe instance is AutoPlay, reserve for develop.
         *
         * @attribute autoPlay
         * @type Boolean
         */
        "autoPlay" : {
            value: false,
            validator: Y.Lang.isBoolean
        },
         /**
         * The iframe instance hasControl, reserve for develop.
         *
         * @attribute hasControl
         * @type Boolean
         */
        "hasControl" : {
            value: true,
            validator: Y.Lang.isBoolean
        },
        /**
         * Indicates if IFrame API has installed.
         *
         * @attribute installed
         * @type Boolean
         */
        "installed": {
            valueFn: function () {
                return !(Lang.isUndefined(window.YT));
            },
            getter: function () {
                return !(Lang.isUndefined(window.YT));
            }
        },
        /**
         * The iframe instance's start position (current playing time in second) .
         *
         * @attribute startPosition
         * @type Number
         */
        "startPosition": {
            value: 0,
            writeOnce: true,
            validator: Y.Lang.isNumber
        },
        /**
         * The iframe input instance's position (current playing time in second) .
         *
         * @attribute position
         * @type Number
         */
        "position": {
            value: 0,
            getter: function () {
                if (this.get("instance") && this.get("instance").getCurrentTime) {
                    return this.get("instance").getCurrentTime();
                }
            },
            validator: Y.Lang.isNumber
        },
        /**
         * The video's total time in millionsecond.
         *
         * @attribute duration
         * @type Number
         */
        "duration": {
            value: null,
            getter: function () {
                var result = null;
                if (this.get("instance") && this.get("instance").getDuration()) {
                    result = this.get("instance").getDuration();
                }
                return result;
            },
            readOnly: true
        },
        /**
        * the iframe input instance's volume .
        * @attribute volume
        * @type number
        */
        "volume": {
            value: 100,
            getter: function () {
                var result = null;
                if (this.get("instance") && this.get("instance").getVolume()) {
                    result = this.get("instance").getVolume();
                }
                return result;
            }
        },
        /**
         * The instance's size.
         *
         * @attribute size
         * @type Array
         */
        "size": {
            value: [YoutubeIframe.DEFAULT_WIDTH, YoutubeIframe.DEFAULT_HEIGHT],
            validator: Y.Lang.isArray
        },
        /**
         *
         * For extension.
         * @attribute mode
         * @type integer
         */
        "mode": {
            value: 0,
            validator: Y.Lang.isInteger,
            setter: function (value) {
                return value;
            }
        },
         /**
         *
         * small, medium, large , hd720, hd1080, highres, default
         * @attribute resolution
         * @type string
         */
        "resolution": {
            value: "",
            validator: Y.Lang.isString,
            setter: function (value) {
                return value;
            }
        }
    };

    Y.extend(YoutubeIframe, Y.Base, {
        _created    : null,  // Indicates if container is created by this class.
        _mute       : false,
        _paused     : false,
        _playTimer  : null,
        _createContainer: function (id) {
            _log("_createContainer() is executed.");
            var that = this,
                container;
            if (Lang.isString(id) && id.indexOf("#") === 0) {
                id = id.split("#")[1];
            } else {
                id = Y.guid();
            }
            container = Y.Node.create('<div id="' + id + '"/>');
            Y.one("body").append(container);
            that._created = true;
            return container;
        },
        _poll: function () {
            // NOTE - Disables this log because it is too annoying.
            // _log("_poll() is executed.");
            var that = this,
                instance = that.get("instance"),
                state = instance.getPlayerState();
            switch (state) {
            case YT.PlayerState.PLAYING:
                that.fire("playing", {
                    duration: instance.getDuration() * 1000,
                    position: instance.getCurrentTime() * 1000
                });
                that._playTimer = Y.later(YoutubeIframe.POLL_INTERVAL, that, that._poll);
                break;
            case YT.PlayerState.ENDED:
                _log("ended is executed.");
                if (that._playTimer) {
                    that._playTimer.cancel();
                    that._playTimer = null;
                }
                return;
            case YT.PlayerState.BUFFERING:
                that._playTimer = Y.later(YoutubeIframe.POLL_INTERVAL, that, that._poll);
                break;
            case YT.PlayerState.PAUSED:
                if (that._playTimer) {
                    that._playTimer.cancel();
                    that._playTimer = null;
                }
                break;
            }
        },

         /**
        *   2  The request contains an invalid parameter value.
        *   5  The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.
        *   100  The video requested was not found.
        *   101  The owner of the requested video does not allow it to be played in embedded players.
        *   150  This error is the same as 101. It's just a 101 error in disguise!
        */
        _handleError : function (e) {
            var that = this;
            _log("_handleError() is executed");
            that.fire("error", {
                code: e.data,
                message: " error"
            });
            that._set("state", "error");
            that.get("container").removeChild(that.get("instance"));
        },
        _handlePlayerReady : function (e) {
            var that = this;
            _log("_handlePlayerReady() is executed");
            if (that.get("instance")) {
                that._set("state", "ready");
                that._set("instance", e.target);
                that.fire("ready");
                if (that.get("startPosition") !== 0) {
                    e.target.seekTo(that.get("startPosition"));
                }
                if (that.get("autoPlay")) {
                    e.target.playVideo();
                }
            }
        },
        /**
        *   youtube player states
        *   -1 (unstarted)
        *   0 (ended)
        *   1 (playing)
        *   2 (paused)
        *   3 (buffering)
        *   5 (video cued).
        */
        _handlePlayerStateChange : function (e) {
            var that = this,
                state = e.target.getPlayerState();
            _log("onPlayerStateChange() is executed :" + state);
            switch (state) {
            case YT.PlayerState.PLAYING:
                that._set("state", "playing");
                that._set("resolution", that.get("instance").getPlaybackQuality());
                that._set("instance", e.target);
                that._playTimer = Y.later(1000, that, that._poll, null);
                break;
            case YT.PlayerState.ENDED:
                that._set("state", "ended");
                break;
            case YT.PlayerState.BUFFERING:
                that._set("state", "buffering");
                break;
            case YT.PlayerState.PAUSED:
                that._set("state", "paused");
                break;
            }
        },
        _defPositionFn : function (e) {
            _log("_defPositionFn() is executed");
            this.get("instance").seekTo(e.newVal);
        },
        _defResolutionFn : function (e) {
            _log("_defResolutionFn() is executed");
            this.get("instance").setPlaybackQuality(e.newVal);
        },
        _defVolumeFn : function (e) {
            _log("_defVolumeFn() is executed");
            this.get("instance").setVolume(e.newVal);
        },
        initializer : function (config) {
            _log("initializer() is executed");
            var that = this,
                id,
                url,
                hasControl,
                position,
                container;

            config = config || {};
            if (Y.one(config.container)) {
                container = Y.one(config.container);
                container.generateID();
            } else {
                container = that._createContainer(config.container);
            }
            container.addClass(CLASS_NAME);
            that._set("container", container);
            position = config.position || 0;
            that._set("startPosition", position);
            url = config.url || null;
            that._set("url", url);
            if (config.size) {
                that._set("size", config.size);
            }


            that.on("positionChange", that._defPositionFn);
            that.on("resolutionChange", that._defResolutionFn);
            that.on("volumeChange", that._defVolumeFn);
            that._set("hasControl", config.hasControl || false);
            that.publish("error", {
                emitFacade: true
            });
            that.publish("playing", {
                emitFacade: true
            });
            if (url) {
                that._create();
            }
        },
        _create: function () {
            _log("_create() is executed.");

            var that = this,
                container = that.get("container"),
                size = that.get("size"),
                width = parseInt(size[0], 10),
                height = parseInt(size[1], 10),
                ytPlayer,
                nodeId,
                instance = that.get("instance") || null;

            // Tries later if it still loads IFrame Player API code.
            if (_isLoading) {
                Y.later(500, that, that._create);
                return;
            }

            // Loads Iframe Player API code if global variable YT doesn't exist.
            if (!that.get("installed")) {
                _loadAPI.call(this);
                _isLoading = true;
                return;
            }

            nodeId = container.get("id");
            if (!instance) {
                ytPlayer = new YT.Player(nodeId, {
                    height: height,
                    width: width,
                    playerVars: { "controls": Number(that.get("hasControl")) },
                    videoId: _getParameter(that.get("url"), "v"),
                    events: {
                        "onReady": Y.bind(that._handlePlayerReady, that),
                        "onStateChange": Y.bind(that._handlePlayerStateChange, that),
                        "onError" : Y.bind(that._handleError, that)
                    }
                });
                that._set("instance", ytPlayer);
            }
        },
        play: function (url) {
            _log("play() is executed.");
            var that = this,
                instance = that.get("instance");
            url = url || that.get("url");
            that._set("state", "play");
            if (!url) {
                _log("You must provide either url argument or url attribute.", "error");
            } else {
                that._set("url", url);
            }
            _log("play() - The video URL is " + url);
            if (instance && instance.loadVideoByUrl) {
                instance.loadVideoByUrl(Y.Lang.sub(YoutubeIframe.YOUTUBE_URL, {vid: _getParameter(url, "v")}));
            } else {
                that._create();
            }
        },
        stop: function () {
            _log("stop() is executed.");
            var that = this,
                instance = that.get("instance");
            if (that.get("state") !== "playing") {
                return;
            }
            instance.stopVideo();
            if (that._playTimer) {
                that._playTimer.cancel();
                that._playTimer = null;
            }
            that._set("state", "stopped");
            that.fire("stop");
        },
        pause: function () {
            _log("pause() is executed.");
            var that = this,
                instance = that.get("instance");
            if (that._paused) {
                Y.log("pause() - The player has already been paused.", "warn", MODULE_ID);
                return;
            }
            instance.pauseVideo();
            if (that._playTimer) {
                that._playTimer.cancel();
                that._playTimer = null;
            }
            that._paused = true;
            that._set("state", "paused");
            that.fire("pause");
        },
        resume: function () {
            _log("resume() is executed.");
            var that = this,
                instance = that.get("instance");
            if (!that._paused) {
                _log("resume() - The player isn't paused.");
                return;
            }
            instance.playVideo();
            that._playTimer = Y.later(YoutubeIframe.POLL_INTERVAL, that, that._poll);
            that.fire("resume");
            that._set("state", "playing");
            that._paused = false;
        },
        mute: function () {
            _log("mute() is executed.");
            var that = this,
                instance = that.get("instance");
            if (instance.isMuted() || that._paused) {
                Y.log("mute() - The player has already been mute.", "warn", MODULE_ID);
                return;
            }
            instance.mute();
            that._mute = true;
        },
        unmute: function () {
            _log("unmute() is executed.");
            var that = this,
                instance = that.get("instance");
            if (!instance.isMuted()) {
                _log("unmute() - The player isn't mute.");
                return;
            }
            instance.unMute();
            that._mute = false;
        },
        destructor: function () {
            _log("destructor() is executed.");
            var that = this,
                instance = that.get("instance");
            if (that.get("state") === "playing") {
                if (that._playTimer) {
                    that._playTimer.cancel();
                    that._playTimer = null;
                }
            }
            if (instance) {
                instance.destroy();
                instance = null;
            }
            if (that._created) {
                that.get("container").remove();
            }
        }
    });
    Y.YoutubeIframe = YoutubeIframe;
}, "0.0.1", {
    "group"    : "mui",
    "js"       : "youtube-iframe/youtube-iframe.js",
    "requires" : [
        "get",
        "base",
        "node",
        "querystring",
        "oop"
    ]
});
