# Package configuration
PROJECT = web
COMMANDS = server/cmd/bblfsh-web
DEPENDENCIES = \
	github.com/jteeuwen/go-bindata
DEPENDENCIES_DIRECTORY := ./vendor

# Environment
BASE_PATH := $(shell pwd)
ASSETS_PATH := $(BASE_PATH)/build

# Tools
YARN = yarn
REMOVE = rm -rf
BINDATA = go-bindata
GODEP = dep

SERVER_URL ?= /api
BBLFSH_PORT ?= 9432
API_PORT ?= 9999

# Including ci Makefile
CI_REPOSITORY ?= https://github.com/src-d/ci.git
CI_BRANCH ?= v1
CI_PATH ?= .ci
MAKEFILE := $(CI_PATH)/Makefile.main
$(MAKEFILE):
	git clone --quiet --depth 1 -b $(CI_BRANCH) $(CI_REPOSITORY) $(CI_PATH);
-include $(MAKEFILE)

dependencies-frontend: dependencies
	$(YARN)	install

test-frontend: dependencies-frontend
	$(YARN) test

lint: dependencies-frontend
	$(YARN) lint

fix-lint-errors: dependencies-frontend
	$(YARN) fix-lint-errors

assets:
	chmod -R go=r $(ASSETS_PATH); \
	$(BINDATA) \
		-pkg asset \
		-o ./server/asset/asset.go \
		-prefix $(BASE_PATH) \
		$(ASSETS_PATH)/...

front-build: dependencies-frontend
	GENERATE_SOURCEMAP=false REACT_APP_SERVER_URL=$(SERVER_URL) $(YARN) build

build: front-build assets
	@echo

validate-commit: fix-lint-errors no-changes-in-commit

## Compiles web client assets, and serve the web client through its API
serve:
	$(MAKE) -C . assets SERVER_URL=http://0.0.0.0:$(API_PORT)/api
	go run server/cmd/bblfsh-web/* -bblfsh-addr=0.0.0.0:$(BBLFSH_PORT) -addr=:$(API_PORT)
