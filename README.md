# ZXingScanner
Thin wrapper around [ZXing](https://github.com/yushulx/zxing-cpp-emscripten) for browsers.

## Setup
```html
<script src="zxing.js"></script>
<script src="scanner.js"></script>
```

## API
### ZXingScanner.init(callback)
Initialize the scanner and set a callback function for detected codes.  
The callback function is invoked for each detected code, receiving a single object argument with the following keys:
  * data - *the content of the code*
  * type - *'qr' or 'bar'*
  * finderPoints - *the coordinates of the detected code's corners on the canvas*

### ZXingScanner.scanCanvas(canvas, single)
Scan a canvas for qr/bar codes.  
Set the second argument as true to scan for a single qr/bar code only.  
Returns *null* if the scan was succesfull or an *object* with error codes.

## Demo
Check out the [test](./test/index.html).
