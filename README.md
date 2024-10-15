[![Actions Status](https://github.com/ccnmtl/locustempus/workflows/build-and-test/badge.svg)](https://github.com/ccnmtl/locustempus/actions)

# Locus Tempus
## Quick Start
Use `make dev`. This is equivalent to running Django's `./manage.py runserver` in one shell and Webpack in another. The output from both will be printed to the shell. Use CTR-C to exit.

To test, use `make all`. This is what Jenkins runs to build the project.

## JavaScript Stack
### Explanation
Locus Tempus makes use of several JavaScript libraries and technologies, and it can be hard to understand how its all wired up at first glance.

At the highest level of abstraction, you need to know that the JavaScript in Locus Tempus is written in TypeScript. TypeScript is a superset of JavaScript, meaning that all valid JavaScript is valid TypeScript. TypeScript adds type annotations and other language features to help write correct code. This is the impetus for using it on this project.

At the next level, the JavaScript in this project uses a framework called React. We're using React for its ability to manage data within the front-end application, and cause changes to the page when that data is updated. React is used only on the pages where there's a large degree of user interaction required. Otherwise, plain JavaScript suffices.

Moving to more detailed level, Locus Tempus uses of several libraries to achieve a richly interactive experience for users. In particular:
* Mapbox GL: This library implements the underlying mapping for Locus Tempus
* Deck GL: This is a data visualization library. It layers information on top of the map provided by Mapbox. It utilizes the WebGL API to efficiently render annotations and visualizations over the map.

Webpack is a utility that glues all these parts together. It reads in the TypeScript source files and passes it through the TypeScript compiler, which emits vanilla js for browsers. Webpack also manages the compilation of SCSS files to CSS, first by loading them into the JavaScript build, and then by stripping the styles out of the compiled JS an writing them to separate files.

### Static Assets
This project diverges from the standard CTL project layout. The `media/js` and `media/css` directories have been removed in favor of `media/src`. Compiled assets are written to `media/build`.

This project's Webpack configuration makes use of multiple entry points for TypeScript source files. Most CTL sites have a single JavaScript file that is loaded on every page of a site. Because of the extensive use of JavaScript and correspondingly large asset files, loading the entire application's JavaScript on each page is inefficient. Webpack helps solve this problem by defining multiple 'entry points' - base files where we can include only the needed source TS files are included for a given route or template.

To compile these assets during development, run `make webpack`.

## Make Targets for Development
### Overview
Locus Tempus relies on a number of different technologies during development:
- Webpack to transpile TypeScript code to JavaScript.
- Webpack also compiles SCSS files to CSS, along with generated source maps
- Cypress for client-side testing

During development, you'll need to run Django's server and Webpack for most development tasks. In addition, you may want to run Cypress in its headed mode, so that you can validate your client-side tests as you write. (Or TDD)

To that end, you can run each of these in separate shells: `make runserver`, `make webpack`, and optionally `make cypress-open`.

### Kitchen Sink
For a kitchen sink approach, use `make cypress`. This will bring up `make integrationserver`, `make webpack`, and `make cypress-open` in a single shell. CTR-C will exit all three processes.

### Port Already Bound Errors
It's possible that `make dev` and `make cypress` don't clean up their constituent processes on exit. In particular, if you try to start Django's server and you get an error that the port is already bound, use `ps aux | grep runserver` to get the process and kill it manually.

### Make Target Explanations
Selected explanations of various make targets

#### django.mk Make Targets
- `make test`: runs all Python tests
- `make runserver`: runs Django's dev server, using local database settings
- `make integrationserver`: runs Django's dev server, except that it uses a test database populated with data created from factory methods

#### js.mk Make Targets
- `make eslint`: Runs ESLint on project.
- `make jstest`: Runs Mocha tests on project js files.
- `make js-typecheck`: Runs TypeScript to type check the JS/TS code. It runs the TypeScript compiler but does not emit compiled code.
- `make webpack`: Runs Webpack in watch mode, watches files and rebuilds on change.
- `make cypress-run`: Runs Cypress tests in headless mode, does not bring up test server. Use this when you want to run headless Cypress tests against a running test server.
- `make cypress-open`: Runs Cypress tests in headed mode, does not bring up test server. Use this when you want to run Cypress during dev.
- `make cypress-test`: Runs Cypress tests in headless mode, uses `make integrationserver`. Use this for CI testing, or if you'd like to run Cypress tests before creating a PR.
- `make cypress-watch`: Runs `make integrationserver`, `make webpack`, and `make cypress-open` all at once. It will only output text from Cypress; so it's not as useful as `make dev`.
