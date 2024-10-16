APP=locustempus
JS_FILES=media/src

all: jenkins
.PHONY: all

include *.mk

test-travis:
	$(MANAGE) test --settings=$(APP).settings_travis --noinput
.PHONY: test-travis

travis: check flake8 test-travis eslint bandit js-typecheck cypress-test-travis
.PHONY: travis

tileserver: $(PY_SENTINAL)
	cd tiles && ../$(VE)/bin/python3 ./server.py
.PHONY: tileserver

integrationserver: check
	$(MANAGE) integrationserver --addrport $(INTERFACE):$(RUNSERVER_PORT) --noinput
.PHONY: integrationserver

integrationserver-travis: check
	$(MANAGE) integrationserver --addrport $(INTERFACE):$(RUNSERVER_PORT) --noinput --settings=$(APP).settings_travis
.PHONY: integrationserver-travis

webpack: $(JS_SENTINAL)
	npm run dev
.PHONY: webpack

js-typecheck: $(JS_SENTINAL)
	npm run typecheck
.PHONY: js-typecheck

js-build: $(JS_SENTINAL)
	rm -rf media/build/*
	npm run build
.PHONY: js-build

cypress-run: $(JS_SENTINAL)
	npm run cypress:run
.PHONY: cypress-run

cypress-open: $(JS_SENTINAL)
	npm run cypress:open
.PHONY: cypress-open

cypress-test: js-build
	npm run cypress:test
.PHONY: cypress-test

cypress-test-travis: js-build
	npm run cypress:test-travis
.PHONY: cypress-test-travis

cypress-watch: $(JS_SENTINAL)
	npm run cypress:watch
.PHONY: cypress-watch

dev:
	trap 'kill 0' EXIT; make runserver & make webpack
.PHONY: dev

cypress:
	trap 'kill 0' EXIT; make integrationserver & make tileserver & make webpack & make cypress-open
.PHONY: cypress
