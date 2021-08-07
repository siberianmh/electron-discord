---
title: Why isn't the relative path in my app code working?
---

To make a path work in both development and packaged mode, you'll need to
generate a path based on the location of the JavaScript file that is referencing
the file. For example, if you had an app structure like the following:

<!-- prettier-ignore-start -->
```md
AppName
├── package.json
├── data
│   └── somedata.json
└── src
    └── main.js
```
<!-- prettier-ignore-end -->

In `src/main.js`, you would access `data/somedata.json` similar to this:

```js
const path = require('path')
const jsonFilename = path.resolve(__dirname, '..', 'data', 'somedata.json')
console.log(require(jsonFilename))
```
