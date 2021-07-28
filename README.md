# Plain HTML Web Components Library
[The Plain HTML (PH) library](https://github.com/smeans/ph) is designed to make creating and
maintaining web components as easy as humanly possible.
## Installation
1. Include `js/ph.js` in the `<head>` of your HTML page.
2. In a `DOMContentLoaded` event handler, call the `phInit()` function.
## Usage
PH components are defined as HTML `<template>` elements that contain all styling, markup, and code needed to instantiate them:

```
<template name="x-bold">
    <style>
        span {
              font-weight: bold;
        }
    </style>
    <span><slot></slot></span>
    <script>
        class XBold extends PhElement {
            static mappedAttributes = {'data-debug': 'debug'};

            constructor() {
                super();

                this._debug = false;
            }

            set debug(newDebug) {
                this._debug = newDebug;
            }

            get debug() {
                return this._debug;
            }

            connectedCallback() {
                if (this.debug) {
                    console.log('bolding ' + this.innerText);
                }
            }
        }
    </script>
</template>
```

The `<script>` tag should contain the class declaration for your component. The name of the class is constructed by capitalizing the first letter of each hyphen-separated token in the tag name:

* `<template name="x-bold">` => `class XBold {}`
* `<template name="my-tag-name">` => `class MyTagName {}`

The custom component class should subclass the `PhElement` class. This will provide support for attribute aliasing and some helper methods and properties.

### Attribute Aliasing
Components classes frequently expose properties that could also be initialized using element attributes. For example, the `x-bold` component defines a `debug` property. The static `mappedAttributes` property provides a mapping from attribute names to object properties:

```
static mappedAttributes = {'data-debug': 'debug'};
```

This allows the `data-debug` attribute to be used to initialize a component element:

```
<x-bold data-debug="true">Debug, bold!</x-bold>
```

See `index.html` for samples of inline and included components along with basic component architecture patterns.

## Reference
### Helper Methods
`.sq(selector)` - Executes `.querySelector()` against the shadow root of the component.

`.sqa(selector)` - Executes `.querySelectorAll()` against the shadow root of the component.

### Helper Properties
`.templateElement` - Returns a reference to the `<template>` element that was used to construct this component. Useful if there are additional resources or markup that need to be accessed at runtime.

### Tags
`<ph-components>` - Contains `<template>` tags that define PH web components.

`<ph-include src="url"></ph-include>` - Load the referenced file, execute any global `<script>` elements and process all of the `<ph-components>` tags.

## License
The MIT License (MIT)
Copyright © 2021 Scott Means

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
