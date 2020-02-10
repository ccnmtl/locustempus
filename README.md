# Tempus Locus

## Static Assets
This project diverges from the standard CTL project layout. The `media/js` and `media/css` directories have been removed in favor of `media/src`. Compiled assets are written to `media/build`.

To compile these assets during development, run `make webpack`.

## Make Targets for Development
### TL;DR
For most cases use `make dev`. This will bring up all three needed processes for local development. It runs `make integrationserver`, `make webpack`, and `make cypress-open`. CTR-C will exit all three processes.

It's possible this command won't clean up all the processes. In particular, if you try to start Django's server and you get an error that the port is already bound, use `ps aux | grep runserver` to get the process and kill it manually.

### Overview
Locus Tempus relies on a number of different technologies during development:
- Webpack to transpile ES6/React code to JavaScript
- Webpack also compiles SCSS files to CSS, along with generated source maps
- Cypress for client-side testing

During development, you'll need to run Django's server and Webpack for most development tasks. In addition, you may want to run Cypress in its headed mode, so that you can validate your client-side tests as you write. (Or TDD)

To that end, you can run each of these in seperate shells: `make runserver`, `make webpack`, and optionally `make cypress-open`.

If you're feeling lucky and want to take a kitchen-sink approach, you can use `make cypress-watch`. This will bring up all three services, though you'll only see the output of Cypress on the shell. It uses `make integrationserver`.

### Make Target Explanations
Selected explanations of various make targets

#### django.mk Make Targets
- `make test`: runs all Python tests
- `make mypy`: runs MyPy type checking
- `make runserver`: runs Django's dev server, using local database settings
- `make integrationserver`: runs Django's dev server, except that it uses a test database populated with data created from factory methods

#### js.mk Make Targets
- `make eslint`: Runs ESLint on project.
- `make jstest`: Runs Mocha tests on project js files.
- `make webpack`: Runs Webpack in watch mode, watches files and rebuils on change.
- `make cypress-run`: Runs Cypress tests in headless mode, does not bring up test server. Use this when you want to run headless Cypress tests against a running test server. 
- `make cypress-open`: Runs Cypress tests in headed mode, does not bring up test server. Use this when you want to run Cypress during dev.
- `make cypress-test`: Runs Cypress tests in headless mode, uses `make integrationserver`. Use this for CI testing, or if you'd like to run Cypress tests before creating a PR.
- `make cypress-watch`: Runs `make integrationserver`, `make webpack`, and `make cypress-open` all at once. It will only output text from Cypress; so it's not as useful as `make dev`.
