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
- Battery exhaustion is intense
- In the case of a smartphone it will be hot

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
  <video width="640" height="320" id="video" playsinline="" autoplay="" style="position: absolute; z-index: -1; transform: scaleX(-1);"></video>
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

## License
The MIT License (MIT). Please see [License File](LICENSE) for more information.
