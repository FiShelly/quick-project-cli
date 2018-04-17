# quick-project-cli

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

## Features

- Quick start project for javascript.
- And Support vue, react, less, sass.

## Installation

```sh
$ npm install -g quick-project-cli
```

with 1 commands

- qp-cli


## Quick Start

The quickest way to get started with quick-project is to utilize the executable `qp-cli` to generate an application as shown below:

Create the app:

```bash
$ qp-cli /tmp/foo && cd /tmp/foo
```

Install dependencies:

```bash
$ npm install
```

Start App

```bash
$ npm run dev
```


## Command Line Options

Quick-project-cli can also be further configured with the following command line flags.

   Usage: qp-cli [options] [dir]

     Options:

       -V, --version  output the version number
       --vue          add vue.js support
       --react        add react support
       --less         add less support(default)
       --sass         add less support(default is less)
       --git          add .gitignore
       -h, --help     output usage information


## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/quick-project-cli.svg
[npm-url]: https://npmjs.org/package/quick-project-cli
[downloads-image]: https://img.shields.io/npm/dm/quick-project-cli.svg
[downloads-url]: https://npmjs.org/package/quick-project-cli