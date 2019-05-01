'use strict';

function effect(effectType) {
    switch (effectType){
        case 'grayscale':
            return grayscale();
        case 'invert':
            return invert();
        default:
            break;
    }
}

/**
 * @link https://developer.mozilla.org/ja/docs/Web/Guide/HTML/Canvas_tutorial/Pixel_manipulation_with_canvas#Grayscaling_and_inverting_colors
 */
function grayscale() {
    return (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for(let i = 0; i < data.length; i += 4) {
            let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i]     = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
        }

        ctx.putImageData(imageData, 0, 0);
    }
}

/**
 * @link https://developer.mozilla.org/ja/docs/Web/Guide/HTML/Canvas_tutorial/Pixel_manipulation_with_canvas#Grayscaling_and_inverting_colors
 */
function invert() {
    return (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (var i = 0; i < data.length; i += 4) {
            data[i]     = 255 - data[i];     // red
            data[i + 1] = 255 - data[i + 1]; // green
            data[i + 2] = 255 - data[i + 2]; // blue
        }

        ctx.putImageData(imageData, 0, 0);
    }
}