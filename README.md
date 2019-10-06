ccd3
====

## Summary
* **C**ustomizable **C**hart for **D3**.js
* Javascript chart library for d3.js
* MIT License

## Requirements
* depends only on d3.js(>=3.4.1)
* work with Chrome,Firefox,Safari,IE
 * same as d3.js

## How to use

### html

```html
<script type="text/javascript" src="xxxx/ccd3/dist/bundle.js"></script>
<script type="text/javascript">
    ...
    var chart = new ccd3.ccd3.Chart(div_id, data);
    ...
</script>
```

### es6

```js
import ccd3 from "ccd3";

...
const chart = new ccd3.Chart(div_id, data);
...
```

## migrating from v1 to v2

- change src path
- change global variables
  - `ccd3.Xxxx` -> `ccd3.ccd3.Xxxx`

## Tutorial
* See [official site](http://g0e.net/ccd3).

## Documents
* See [wiki](https://github.com/g0e/ccd3/wiki)
