'use strict';

/**
 * ZXingScanner
 * 
 * @return {init, scanCanvas}
 */
const ZXingScanner = (ZXing => {
    if (!ZXing) {
        throw new Error('ZXing is not defined!');
    }

    const ZXingInstance = ZXing();
    let ZXdecodePtrQR;
    let ZXdecodePtrBar;

    /**
     * Initialize the scanner and set a callback function for detected codes
     *
     * @param callback {function} ({data, type, finderPoints})
     */
    const init = callback => {
        if (!ZXingInstance) {
            throw new Error('ZXing instance unavailable.');
        }

        if (ZXdecodePtrQR || ZXdecodePtrBar) {
            throw new Error('Scanner already initialized.');
        }

        // JS callback to receive the result pointer from C++
        const getZXingDecoderCallback = type => {
            return (ptr, len, resultIndex, resultCount, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) => {
                // Convert the result C string into a JS string.
                const result = new Uint8Array(ZXingInstance.HEAPU8.buffer, ptr, len);
                const data = String.fromCharCode.apply(null, result);

                if (typeof callback === 'function') {
                    callback({data, type, finderPoints: {p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y}});
                }
            };
        };

        ZXdecodePtrQR = ZXingInstance.Runtime.addFunction(getZXingDecoderCallback('qr'));
        ZXdecodePtrBar = ZXingInstance.Runtime.addFunction(getZXingDecoderCallback('bar'));
    };

    /**
     * Scan a canvas for bar/qr codes
     *
     * @param canvas {HTMLCanvasElement}
     * @param single {bool} look for a single qr/bar code only
     * @returns error {object|null}
     */
    const scanCanvas = (canvas, single) => {
        if (!ZXingInstance) {
            throw new Error('ZXing instance unavailable.');
        }

        if (!ZXdecodePtrQR && !ZXdecodePtrBar) {
            throw new Error('Scanner not initialized.');
        }

        // Get a write pointer for the QR image data array.
        // The write pointer is a pointer to a width*height Uint8Array of grayscale values.
        const zxWritePtr = ZXingInstance._resize(canvas.width, canvas.height);

        const canvasData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0, j = 0; i < canvasData.length; i += 4, j++) {
            let [r, g, b] = [canvasData[i], canvasData[i + 1], canvasData[i + 2]];
            ZXingInstance.HEAPU8[zxWritePtr + j] = Math.trunc((r + g + b) / 3);
        }

        let errQR;
        let errBar;
        if (single) {
            // Detect a QRcode in the image.
            errQR = ZXdecodePtrQR ? ZXingInstance._decode_qr(ZXdecodePtrQR) : -9;

            // Detect a barcode in the image.
            errBar = ZXdecodePtrBar ? ZXingInstance._decode_any(ZXdecodePtrBar) : -9;
        } else {
            // Detect multiple QRcodes in the image.
            // If there are multiple QRcodes detected, ZXdecodePtrQR is called with each.
            errQR = ZXdecodePtrQR ? ZXingInstance._decode_qr_multi(ZXdecodePtrQR) : -9;

            // Detect multiple barcodes in the image.
            // If there are multiple barcodes detected, ZXdecodePtrBar is called with each.
            errBar = ZXdecodePtrBar ? ZXingInstance._decode_multi(ZXdecodePtrBar) : -9;
        }

        if (errQR && errBar) {
            return {errQR, errBar};
        }

        return null;
    };

    return {
        init,
        scanCanvas
    };

})(window.ZXing);
