APP=locustempus
JS_FILES=media/src media/tests

all: jenkins mypy cypress-test

include *.mk

ifeq ($(TRAVIS),true)
	MYPY ?= mypy
else
	MYPY ?= $(VE)/bin/mypy
endif

mypy: $(PY_SENTINAL)
	$(MYPY)

fakeserver: check
	$(MANAGE) fakeserver $(INTERFACE):$(RUNSERVER_PORT) --noinput

webpack: $(JS_SENTINAL)
	npm run dev

cypress-run: $(JS_SENTINAL)
	npm run cypress:run

cypress-open: $(JS_SENTINAL)
	npm run cypress:open

cypress-test: $(JS_SENTINAL)
	npm run cypress:test

cypress-watch: $(JS_SENTINAL)
	npm run cypress:watch 

.PHONY: mypy fakeserver webpack cypress-run cypress-open cypress-test cypress-watch
