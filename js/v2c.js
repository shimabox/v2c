'use strict';

const V2C = function(selector, option) {
    const defaultOption = {
        'longSideSize': 640,
        'canvasId': 'canvas',
        'videoId': 'video',
        'useFrontCamera': true,
        // video constraints
        'constraintsForFront': {video: {facingMode : 'user'}},
        'constraintsForRear': {video: {facingMode : {exact : 'environment'}}},
        // callback
        'callbackOnAfterInit': null,
        'callbackOnOrientationChange': null,
        'callbackOnLoadedmetadataVideo': null,
        'callbackOnVideoLoadSuccess': this._callbackOnVideoLoadSuccess,
        'callbackOnVideoLoadError': this._callbackOnVideoLoadError,
        'callbackOnAfterVideoLoadError': null,
    };

    this.wrapper = document.querySelector(selector);
    this.option  = Object.assign({}, defaultOption, option || {});

    this.longSideSize    = this.option.longSideSize;
    this.video           = null;
    this.videoTrack      = null;
    this.trackingStarted = false;
    this.drawLoopFrame   = null;

    this.callbackOnDrawing = null;
    this._useFrontCamera   = this.option.useFrontCamera;

    this._init();
}

V2C.prototype = {
    /**
     * initializer
     */
    _init: function() {
        this._createCanvas();
        this._createVideo();
        this._settingWrapper();
        this._addOrientationChangeEvent(this.option.callbackOnOrientationChange);

        if (typeof this.option.callbackOnAfterInit === 'function') {
            this.option.callbackOnAfterInit(this);
        }
    },
    getCanvas: function() {
        return this.canvas;
    },
    getVideo: function() {
        return this.video;
    },
    useFrontCamera: function() {
        return this._useFrontCamera;
    },
    start: function(callback) {
        if (this.drawLoopFrame) return;

        this._loadVideo().then((stream) => {
            this._loadSuccess(stream);
            this._drawLoop(callback);
            this.callbackOnDrawing = callback;
        }).catch((err) => {
            this._loadFail(err);
            this.stop();
        });
    },
    stop: function() {
        cancelAnimationFrame(this.drawLoopFrame);
        this.drawLoopFrame = null;
        this.trackingStarted = false;
    },
    switchCamera: function() {
        if (this.videoTrack) {
            this.videoTrack.stop();
        }

        this.videoTrack = null;
        this.video.srcObject = null;

        this._useFrontCamera = !this._useFrontCamera;

        // Change scaleX.
        if (this._useFrontCamera) {
            this.video.style.transform  = 'scaleX(-1)';
            this.canvas.style.transform = 'scaleX(-1)';
        } else {
            this.video.style.transform  = 'scaleX(1)';
            this.canvas.style.transform = 'scaleX(1)';
        }

        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Reload video.
        this._loadVideo().then((stream) => {
            this._loadSuccess(stream);

            if (this.drawLoopFrame) return;

            this._drawLoop(this.callbackOnDrawing);
        }).catch((err) => {
            this._loadFail(err);
            this.stop();
        });
    },
    changeLongSideSize: function(size) {
        this.longSideSize = size;
        this._adjustProportions(this.video.videoWidth, this.video.videoHeight, this.trackingStarted);
    },
    getDataUrl: function() {
        return this._getDataUrl(this.canvas, this._useFrontCamera);
    },
    capture: function(n) {
        const name = n || 'caputure';
        const link = document.createElement('a');

        this.wrapper.appendChild(link);

        link.setAttribute('download', name + '.png');
        link.addEventListener('click', (e) => e.target.href = this._getDataUrl(this.canvas, this._useFrontCamera));
        link.click();

        this.wrapper.removeChild(link);
    },
    _getDataUrl: function(canvas, useFrontCamera) {
        const w   = canvas.width;
        const h   = canvas.height;
        const c   = document.createElement('canvas');
        const ctx = c.getContext('2d');

        c.width = w;
        c.height = h;

        if (useFrontCamera) {
            ctx.scale(-1, 1);
            ctx.drawImage(canvas, -w, 0, w, h);
        } else {
            ctx.drawImage(canvas, 0, 0, w, h);
        }

        return c.toDataURL();
    },
    _createCanvas: function() {
        this.canvas    = document.createElement('canvas');
        this.canvasCtx = this.canvas.getContext('2d');

        const ratio = this.canvas.height / this.canvas.width;
        this.canvas.width  = this.longSideSize;
        this.canvas.height = Math.round(this.longSideSize * ratio);

        this.canvas.setAttribute('id', this.option.canvasId);

        if (this._useFrontCamera) {
            this.canvas.style.transform = 'scaleX(-1)';
        }
    },
    _createVideo: function() {
        this.video = document.createElement('video');

        this.video.width  = this.canvas.width;
        this.video.height = this.canvas.height;

        this.video.setAttribute('id', this.option.videoId);
        this.video.setAttribute('playsinline', '');
        this.video.setAttribute('autoplay', '');

        this.video.style.position = 'absolute';
        this.video.style.zIndex   = -1;

        if (this._useFrontCamera) {
            this.video.style.transform = 'scaleX(-1)';
        }

        this._addVideoEvent(this.video);
    },
    _addVideoEvent: function(video) {
        video.addEventListener('loadedmetadata', () => {
            this._callbackOnLoadedmetadataVideo(video, this.option.callbackOnLoadedmetadataVideo)
        });
    },
    _settingWrapper: function() {
        this.wrapper.style.display       = 'flex';
        this.wrapper.style.flexDirection = 'column';
        this.wrapper.style.width         = '-moz-min-content'; /* Firefox */
        this.wrapper.style.width         = 'min-content';

        this.wrapper.insertBefore(this.video, this.wrapper.firstChild);
        this.wrapper.appendChild(this.canvas);
    },
    _addOrientationChangeEvent: function(callback) {
      const _o = window.orientation;
      let before_orientation = _o === undefined ? 90 : _o;

      window.addEventListener('orientationchange', (e) => {
          const _orientation = e.target.orientation;

          // If the orientation of the screen has been changed.
          if (Math.abs(before_orientation) + Math.abs(_orientation) === 90) {
              const w = this.video.videoWidth;
              const h = this.video.videoHeight;
              // Swap width and height.
              this._adjustProportions(h, w, this.trackingStarted);
          }

          before_orientation = e.target.orientation;

          if (typeof callback === 'function') {
              callback(this.video);
          }
      });
    },
    _loadVideo: function() {
        const constraints = this._useFrontCamera === true
                            ? this.option.constraintsForFront
                            : this.option.constraintsForRear;
        return navigator.mediaDevices.getUserMedia(constraints);
    },
    _loadSuccess: function(stream) {
        this.videoTrack = stream.getVideoTracks()[0];
        this.video.srcObject = stream;

        this.option.callbackOnVideoLoadSuccess(this.canvas);
    },
    _loadFail: function(err) {
        console.log(err);

        this.option.callbackOnVideoLoadError(
            err,
            this.canvas,
            this._useFrontCamera,
            this.option.callbackOnAfterVideoLoadError
        );
    },
    _drawLoop: function(callback, elapsedTime) {
        const last = Date.now();

        this.drawLoopFrame = requestAnimationFrame(() => this._drawLoop(callback, Date.now() - last));

        if (this.trackingStarted === false) {
            return;
        }

        const w = this.canvas.width;
        const h = this.canvas.height;

        this.canvasCtx.clearRect(0, 0, w, h);
        this.canvasCtx.drawImage(this.video, 0, 0, w, h);

        if (typeof callback === 'function') {
            callback(this.canvas, elapsedTime || 0);
        }
    },
    _adjustProportions: function(w, h, trackingStarted) {
        // Do not do anything when called when tracking is not done.
        // For example, when the screen rotation is performed with an error message displayed.
        if (trackingStarted === false) {
            return;
        }

        // Align ratio of video size(video.videoWidth, video.videoHeight).
        const proportion = w / h;
        const videoWidth = this.video.height * proportion;
        const ratio      = this.longSideSize / videoWidth;

        this.video.width   = Math.round(videoWidth * ratio);
        this.video.height  = Math.round(this.video.height * ratio);
        this.canvas.width  = this.video.width;
        this.canvas.height = this.video.height;
    },
    _callbackOnVideoLoadSuccess: function(canvas) {
        canvas.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    },
    _callbackOnLoadedmetadataVideo: function(video, callback) {
        if (this.trackingStarted === true) {
            return;
        }

        this.trackingStarted = true;

        this._adjustProportions(video.videoWidth, video.videoHeight, this.trackingStarted);

        if (typeof callback === 'function') {
            callback(video);
        }
    },
    _callbackOnVideoLoadError: function(err, canvas, useFrontCamera, callback) {
        const w   = canvas.width;
        const h   = canvas.height;
        const ctx = canvas.getContext('2d');

        canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        if (useFrontCamera) {
            canvas.style.transform = 'scaleX(1)';
        }

        ctx.clearRect(0, 0, w, h);

        ctx.save();

        ctx.font = "1em 'sans-serif'";
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';

        // Set message to center.
        const metrics   = ctx.measureText(err);
        const textWidth = metrics.width;
        const x         = (w / 2) - (textWidth / 2);
        const y         = h / 2;
        ctx.fillText(err, x, y);

        ctx.restore();

        if (typeof callback === 'function') {
            callback(err);
        }
    }
}
