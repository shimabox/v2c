# v2c
Video(webcam) to canvas.  
And canvas to the image.

## Demo

![demo](https://github.com/shimabox/assets/blob/master/v2c/demo.gif)

https://shimabox.github.io/v2c/

![demo-qr](https://github.com/shimabox/assets/blob/master/v2c/qr.png)

It runs if it is a browser supporting the **getUserMedia API**.  
[Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/#search=getUserMedia "Can I use... Support tables for HTML5, CSS3, etc")

## Notes
- Battery exhaustion is intense.
- In the case of a smartphone it will be hot.

## Usage

### Basic.

```js
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>
<body>

<!-- Prepare a wrapper element -->
<div id="v2c-wrapper"></div>

<!-- Load v2c.js -->
<script src="js/v2c.js"></script>
<script>
// Create instance.
// Wrapper element selector is required.
// `option` is optional.
const v2c = new V2C('#v2c-wrapper'/*, option */);

// Start.
v2c.start();
</script>
</body>
</html>
```

When create an instance (`new V2C('#v2c-wrapper')`), the following elements are created in the wrapper element:

```html
<div id="v2c-wrapper" style="display: flex; flex-direction: column; width: min-content;">
  <video width="640" height="320" id="video" playsinline autoplay style="position: absolute; z-index: -1; transform: scaleX(-1);"></video>
  <canvas width="640" height="320" id="canvas" style="transform: scaleX(-1);"></canvas>
</div>
```

### Stop.
```js
v2c.stop();
```

### Capture.
```js
// The image name is `capture.png` by default.
v2c.capture();

// If you want to change the name, give a filename to the argument.
v2c.capture('modify'); // => modify.png
```

### Switch camera.

- Can switch the front and back cameras.
- By default the front camera is used first.

```js
v2c.switchCamera();
```

### Get canvas element being drawn by callback.
```js
v2c.start((canvas, t) => {
    // Do something.
    // `t` is the elapsed time since the last drawing.
});
```

## Option

Can control the behavior by passing an option.

|name|default|type|
|:---|:---|:---|
|longSideSize|640|int|
|canvasId|'canvas'|string|
|videoId|'video'|string|
|useFrontCamera|true|boolean|
|constraintsForFront|`{video: {facingMode : 'user'}}`|object|
|constraintsForRear|`{video: {facingMode : {exact : 'environment'}}}`|object|
|callbackOnAfterInit|null|function|
|callbackOnOrientationChange|null|function|
|callbackOnLoadedmetadataVideo|null|function|
|callbackOnVideoLoadSuccess|`v2c._callbackOnVideoLoadSuccess`|function|
|callbackOnVideoLoadError|`v2c._callbackOnVideoLoadError`|function|
|callbackOnAfterVideoLoadError|null|function|

### Description

`longSideSize`

- Specifies the size of the long side of canvas.
- The size of the short side matches the ratio to the long side.
- The ratio is ratio of `video.videoWidth` and `video.videoHeight`.

`canvasId`

- Specify ID name of canvas element.

`videoId`

- Specify ID name of video element.

`useFrontCamera`

- Specifying the First Camera.
- `true`
  - Use the front camera.
- `false`
  - Use the rear camera.

`constraintsForFront`

- It is specification of constraints when using the front camera.
- [MediaDevices.getUserMedia() - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia "MediaDevices.getUserMedia() - Web APIs | MDN")

`constraintsForRear`

- It is specification of constraints when using the rear camera.
- [MediaDevices.getUserMedia() - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia "MediaDevices.getUserMedia() - Web APIs | MDN")

`callbackOnAfterInit`

- Callback when after initialization.
- v2c instance is passed as an argument.
```js
const _callbackOnAfterInit = function(v2c) {
    console.log(v2c);
}
```

`callbackOnOrientationChange`

- Callback when `orientationchange` event occurs.
```js
const _callbackOnOrientationChange = function() {
    // Do something.
}
```

`callbackOnLoadedmetadataVideo`

- Callback when `loadedmetadata` event occurs.
- The video element is passed as an argument.
```js
const _callbackOnLoadedmetadataVideo = function(video) {
    console.log(video);
}
```

`callbackOnVideoLoadSuccess`

- Callback on successful loading of video.
- The canvas element is passed as an argument.
```js
const _callbackOnVideoLoadSuccess = function(canvas) {
    console.log(canvas);
}
```

`callbackOnVideoLoadError`

- Callback when failed to load video.
- Error message, canvas element, flag for using front camera (useFrontCamera), `callbackOnAfterVideoLoadError` will be passed as arguments
```js
const _callbackOnVideoLoadError = function(err, canvas, useFrontCamera, callback) {
    // callback is null if `callbackOnAfterVideoLoadError` is not specified.
    console.log(err, canvas, useFrontCamera, callback);
}
```

`callbackOnAfterVideoLoadError`

- Callback after video load error.
- An error message is passed as an argument.
```js
const _callbackOnAfterVideoLoadError = function(err) {
    console.log(err);
}
```

#### Example.
```js
// When specifying an option.

// Callback when after initialization.
const _callbackOnAfterInit = function(v2c) {
    console.log(v2c);
}

// Callback when failed to load video.
const _callbackOnVideoLoadError = function(err, canvas, useFrontCamera) {
    console.log(err, canvas, useFrontCamera);
}

// Override option.
const option = {
    'longSideSize': 360,
    'useFrontCamera': false, // When using a rear camera.
    'callbackOnAfterInit': _callbackOnAfterInit,
    'callbackOnVideoLoadError': _callbackOnVideoLoadError
};

const v2c = new V2C('#v2c-wrapper', option);
// or
const v2c = new V2C('#v2c-wrapper', {'useFrontCamera': false});

v2c.start();
```

## Public Function

### getCanvas() `:HTMLElement`

- Return the canvas element.

### getVideo() `:HTMLElement`

- Return the video element.

### useFrontCamera() `:boolean`

- Return the flag whether to use the front camera.

### start()

- Start drawing process.
- Can receive a callback function and can reference the canvas being drawn.
```js
v2c.start((canvas, t) => {
    // Do something.
    // `t` is the elapsed time since the last drawing.
});
```

### stop()

- Stop the drawing process.

### switchCamera()

- Switch between front and rear camera.

### changeLongSideSize(size: int)

- `size` is required.
- Change the long side size of canvas.
  - The size of the short side matches the ratio to the long side.

### getDataUrl() `:string`

- Returns the `data: URL` for the image of canvas.

### capture(filename: string)

- Convert canvas to png image.
- `filename` is optional.
  - If you want to change the name, give a `filename` to the argument.
  - Default is `'capture'`(capture.png).

## License
The MIT License (MIT). Please see [License File](LICENSE) for more information.
