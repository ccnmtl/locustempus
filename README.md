# Tempus Locus

## Static Assets
This project diverges from the standard CTL project layout. The `media/js` and `media/css` directories have been removed in favor of `media/src`. Compiled assets are written to `media/build`.

To compile these assets during development, run `make webpack`.

## Make Targets for Development
### Overview
Locus Tempus relies on a number of different technologies during development:
- Webpack to transpile ES6/React code to JavaScript
- Webpack also compiles SCSS files to CSS, along with generated source maps
- Cypress for client-side testing

During development, you'll need to run Django's server and Webpack for most development tasks. In addition, you may want to run Cypress in its headed mode, so that you can validate your client-side tests as you write. (Or TDD)

To that end, you can run each of these in seperate shells: `make runserver`, `make webpack`, and optionally `make cypress-open`.

If you're feeling lucky and want to take a kitchen-sink approach, you can use `make cypress-watch`. This will bring up all three services, though you'll only see the output of Cypress on the shell. It uses `make fakeserver`.

### Make Target Explanations
Selected explanations of various make targets

#### django.mk Make Targets
- `make test`: runs all Python tests
- `make mypy`: runs MyPy type checking
- `make runserver`: runs Django's dev server, using local database settings
- `make fakeserver`: runs Django's dev server, except that it uses a test database populated with data created from factory methods

#### js.mk Make Targets
- `make eslint`: runs ESLint on project
- `make jstest`: runs Mocha tests on project js files
- `make webpack`: runs Webpack in watch mode, watches files and rebuils on change
- `make cypress-run`: runs Cypress tests in headless mode, does not bring up test server
- `make cypress-open`: runs Cypress tests in headed mode, does not bring up test server
- `make cypress-test`: runs Cypress tests in headless mode, uses `make fakeserver`
- `make cypress-watch`: runs `make fakeserver`, `make webpack`, and `make cypress-open` all at once
