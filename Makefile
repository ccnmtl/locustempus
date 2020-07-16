APP=locustempus
JS_FILES=media/src media/tests

all: jenkins mypy js-typecheck cypress-test

include *.mk

ifeq ($(TRAVIS),true)
	MYPY ?= mypy
else
	MYPY ?= $(VE)/bin/mypy
endif

test-travis:
	$(MANAGE) test --settings=$(APP).settings_travis

travis: check flake8 test-travis eslint bandit mypy js-typecheck cypress-test-travis

mypy: $(PY_SENTINAL)
	$(MYPY)

integrationserver: check
	$(MANAGE) integrationserver --addrport $(INTERFACE):$(RUNSERVER_PORT) --noinput

integrationserver-travis: check
	$(MANAGE) integrationserver --addrport $(INTERFACE):$(RUNSERVER_PORT) --noinput --settings=$(APP).settings_travis

webpack: $(JS_SENTINAL)
	npm run dev

js-typecheck: $(JS_SENTINAL)
	npm run typecheck

cypress-run: $(JS_SENTINAL)
	npm run cypress:run

cypress-open: $(JS_SENTINAL)
	npm run cypress:open

cypress-test: $(JS_SENTINAL)
	npm run cypress:test

cypress-test-travis: $(JS_SENTINAL)
	npm run cypress:test-travis

cypress-watch: $(JS_SENTINAL)
	npm run cypress:watch 

dev:
	trap 'kill 0' EXIT; make runserver & make webpack

cypress:
	trap 'kill 0' EXIT; make integrationserver & make webpack & make cypress-open

.PHONY: mypy integrationserver webpack cypress-run cypress-open cypress-test cypress-watch dev js-typecheck cypress
