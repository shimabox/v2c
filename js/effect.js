'use strict';

function effect(effectType) {
    switch (effectType){
        case 'grayscale':
            return grayscale();
        case 'invert':
            return invert();
        case 'threshold':
            return threshold();
        case 'bayerDither':
            return bayerDither();
        case 'sepia':
            return sepia();
        case 'heatmap':
            return heatmap();
        case 'mosaic':
            return mosaic();
        default:
            break;
    }
}

/**
 * グレースケール
 * @link https://developer.mozilla.org/ja/docs/Web/Guide/HTML/Canvas_tutorial/Pixel_manipulation_with_canvas#Grayscaling_and_inverting_colors
 */
function grayscale() {
    return (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for(let i = 0; i < data.length; i += 4) {
            let r = data[i + 0];
            let g = data[i + 1];
            let b = data[i + 2];

            let avg = r * 0.298912 + g * 0.586611 + b * 0.114478;
            data[i]     = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
        }

        ctx.putImageData(imageData, 0, 0);
    }
}

/**
 * 反転
 * @link https://developer.mozilla.org/ja/docs/Web/Guide/HTML/Canvas_tutorial/Pixel_manipulation_with_canvas#Grayscaling_and_inverting_colors
 */
function invert() {
    return (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i]     = 255 - data[i];     // red
            data[i + 1] = 255 - data[i + 1]; // green
            data[i + 2] = 255 - data[i + 2]; // blue
        }

        ctx.putImageData(imageData, 0, 0);
    }
}

/**
 * 2値化（threshold）
 * @link http://blog.nariyu.jp/2015/01/canvas-image-effects/
 */
function threshold() {
    const threshold = 255 / 2;
    return (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i + 0];
            let g = data[i + 1];
            let b = data[i + 2];

            let v = r * 0.298912 + g * 0.586611 + b * 0.114478;
            if (v > threshold) {
                data[i + 0] = data[i + 1] = data[i + 2] = 255;
            } else {
                data[i + 0] = data[i + 1] = data[i + 2] = 0;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }
}

/**
 * 2値化（ベイヤーディザ）
 * @link http://blog.nariyu.jp/2015/01/canvas-image-effects/
 */
function bayerDither() {
    const matrix = [
        0,  8,  2, 10,
       12,  4, 14,  6,
        3, 11,  1,  9,
       15,  7, 13,  5
    ];
    return (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const cw = canvas.width;
        const ch = canvas.height;

        for (let x = 0; x < cw; x++) {
            for (let y = 0; y < ch; y++) {
                let index = (x + y * cw) * 4;
                let threshold = matrix[(x % 4) + (y % 4) * 4];

                let r = data[index + 0] / 16;
                let g = data[index + 1] / 16;
                let b = data[index + 2] / 16;

                let v = r * 0.298912 + g * 0.586611 + b * 0.114478;
                if (v > threshold) {
                    data[index + 0] = data[index + 1] = data[index + 2] = 255;
                } else {
                    data[index + 0] = data[index + 1] = data[index + 2] = 0;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }
}

/**
 * セピア
 * @link https://www.pazru.net/html5/Canvas/180.html
 */
function sepia() {
    return (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let brightness = data[i]*0.34 + data[i+1]*0.5 + data[i+2]*0.16;
            data[i]     = (brightness / 255) * 240; // red
            data[i + 1] = (brightness / 255) * 200; // green
            data[i + 2] = (brightness / 255) * 145; // blue
        }

        ctx.putImageData(imageData, 0, 0);
    }
}

/**
 * 擬似カラー
 * @link http://blog.nariyu.jp/2015/01/canvas-image-effects/
 */
function heatmap() {
    return (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for(let index = 0; index < data.length; index += 4) {
            let r = data[index + 0];
            let g = data[index + 1];
            let b = data[index + 2];

            // 明るさを色相に変換する
            let brightness = (r + g + b) / 3;
            let h = 240 - 240 / 255 * brightness;

            let s = 1;
            let v = 1;

            // HSV を RGB に変換する
            let u = v * 255;
            let i = Math.floor(h / 60) % 6;
            let f = (h / 60) - i;
            let p = u * (1 - s);
            let q = u * (1 - f * s);
            let t = u * (1 - (1 - f) * s);

            switch (i) {
                case 0:
                    [r, g, b] = [u, t, p];
                    break;
                case 1:
                    [r, g, b] = [q, u, p];
                    break;
                case 2:
                    [r, g, b] = [p, u, t];
                    break;
                case 3:
                    [r, g, b] = [p, q, u];
                    break;
                case 4:
                    [r, g, b] = [t, p, u];
                    break;
                case 5:
                    [r, g, b] = [u, p, q];
                    break;
            }

            data[index]     = Math.round(r); // red
            data[index + 1] = Math.round(g); // green
            data[index + 2] = Math.round(b); // blue
        }

        ctx.putImageData(imageData, 0, 0);
    }
}

/**
 * モザイク
 * @link http://blog.nariyu.jp/2015/01/canvas-image-effects/
 */
function mosaic() {
    const size = 8;
    return (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const cw = canvas.width;
        const ch = canvas.height;

        for (let x = 0; x < cw; x += size) {
            for (let y = 0; y < ch; y += size) {
                let index = (x + y * cw) * 4;
                let r = data[index + 0];
                let g = data[index + 1];
                let b = data[index + 2];

                for (let x2 = 0; x2 < size; x2++) {
                    for (let y2 = 0; y2 < size; y2++) {
                        let i = (cw * (y + y2) * 4) + ((x + x2) * 4)
                        data[i + 0] = r;
                        data[i + 1] = g;
                        data[i + 2] = b;
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }
}