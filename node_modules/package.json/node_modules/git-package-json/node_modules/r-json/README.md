
# r-json

 [![PayPal](https://img.shields.io/badge/%24-paypal-f39c12.svg)][paypal-donations] [![AMA](https://img.shields.io/badge/ask%20me-anything-1abc9c.svg)](https://github.com/IonicaBizau/ama) [![Version](https://img.shields.io/npm/v/r-json.svg)](https://www.npmjs.com/package/r-json) [![Downloads](https://img.shields.io/npm/dt/r-json.svg)](https://www.npmjs.com/package/r-json) [![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/johnnyb?utm_source=github&utm_medium=button&utm_term=johnnyb&utm_campaign=github)

> A small module to read JSON files.

If you want to write JSON files, check out [`w-json`](https://github.com/IonicaBizau/node-w-json).

## :cloud: Installation

```sh
$ npm i --save r-json
```


## :clipboard: Example



```js
// Dependencies
var ReadJson = require("r-json");

// Read the json file asynchronously
ReadJson(__dirname + "/test.json", function (err, data) {
    console.log(err || data);
});

// Read the same file synchronously
console.log(ReadJson(__dirname + "/test.json"));
```

## :memo: Documentation


### `rJson(path, callback)`

#### Params
- **String** `path`: The JSON file path.
- **Function** `callback`: An optional callback. If not passed, the function will run in sync mode.



## :yum: How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## :dizzy: Where is this library used?
If you are using this library in one of your projects, add it in this list. :sparkles:


 - [`bible`](https://github.com/BibleJS/BibleApp)—Read the Holy Bible via the command line.
 - [`birthday`](https://github.com/IonicaBizau/birthday)—Know when a friend's birthday is coming.
 - [`blah`](https://github.com/IonicaBizau/blah)—A command line tool to optimize the repetitive actions.
 - [`cdnjs-importer`](https://github.com/cdnjs/cdnjs-importer)—Easy way to import a library into CDNJS.
 - [`cli-sunset`](https://github.com/IonicaBizau/cli-sunset)—A fancy command line tool for knowing the sunset time.
 - [`emojic`](https://github.com/IonicaBizau/emojic#readme)—Emoji in your Node.js command line apps.
 - [`engine-app`](https://github.com/jillix/engine-app#readme) (by jillix)—Engine app related helper functions.
 - [`engine-composition-crud`](https://github.com/jillix/engine-composition-crud#readme) (by jillix)—The default module for creating, reading, updating and deleting Engine instances.
 - [`engine-parser`](https://github.com/IonicaBizau/engine-parser) (by jillix)—Engine composition parser.
 - [`engine-tools`](https://github.com/jillix/engine-tools) (by jillix)—Engine Tools library and CLI app.
 - [`gh-notifier`](https://bitbucket.org/IonicaBizau/gh-notifier#readme)—Receive desktop notifications from your GitHub dashboard.
 - [`ghcal`](https://github.com/IonicaBizau/ghcal)—See the GitHub contributions calendar of a user in the command line.
 - [`git-package-json`](https://github.com/IonicaBizau/git-package-json#readme)—Get the package.json contents from git repositories.
 - [`git-stats`](https://github.com/IonicaBizau/git-stats)—Local git statistics including GitHub-like contributions calendars.
 - [`github-labeller`](https://github.com/IonicaBizau/github-labeller#readme)—Automagically create issue labels in your GitHub projects.
 - [`gpm`](https://github.com/IonicaBizau/gpm)—npm + git = gpm - Install NPM packages and dependencies from git repositories.
 - [`idea`](https://github.com/IonicaBizau/idea)—A lightweight CLI tool and module for keeping ideas in a safe place quick and easy.
 - [`namy`](https://github.com/IonicaBizau/namy)—Gets the name of the exported function.
 - [`np-init`](https://github.com/IonicaBizau/np-init#readme)—Easily start a npm package from scratch.
 - [`packy`](https://github.com/IonicaBizau/packy#readme)—Set default fields in your package.json files.
 - [`r-package-json`](https://github.com/IonicaBizau/r-package-json#readme)—Read package.json files.
 - [`ship-release`](https://github.com/IonicaBizau/ship-release#readme)—Publish new versions on GitHub and npm with ease.
 - [`test-youtube-api`](https://github.com/IonicaBizau/test-youtube-api)—Test Youtube API NodeJS module
 - [`tilda`](https://github.com/IonicaBizau/tilda)—Tiny module for building command line tools.
 - [`tithe`](https://github.com/IonicaBizau/tithe)—Organize and track the tithe payments.
 - [`web-term`](https://github.com/IonicaBizau/web-term)—A full screen terminal in your browser.
 - [`youtube-album-uploader`](https://github.com/jpchip/youtube-album-uploader) (by Jared Chapiewsky)—Uploads an mp3 album to Youtube

## :scroll: License

[MIT][license] © [Ionică Bizău][website]

[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[license]: http://showalicense.com/?fullname=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica%40gmail.com%3E%20(http%3A%2F%2Fionicabizau.net)&year=2015#license-mit
[website]: http://ionicabizau.net
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md
