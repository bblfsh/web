# Package configuration
PROJECT = dashboard
COMMANDS = server/cmd/bblfsh-dashboard
DEPENDENCIES = \
	github.com/jteeuwen/go-bindata
DEPENDENCIES_DIRECTORY := ./vendor

# Environment
BASE_PATH := $(shell pwd)
ASSETS_PATH := $(BASE_PATH)/build

# Use cgo during build because client-go needs it
CGO_ENABLED = 1

# Cross compilation doesn't work with cgo
PKG_OS = linux

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
CI_PATH ?= $(shell pwd)/.ci
MAKEFILE := $(CI_PATH)/Makefile.main
$(MAKEFILE):
	git clone --quiet --depth 1 $(CI_REPOSITORY) $(CI_PATH);
-include $(MAKEFILE)

dependencies-frontend: dependencies
	$(YARN)	install

test-frontend: dependencies-frontend
	$(YARN) test

lint: dependencies-frontend
	$(YARN) lint

fix-lint-errors: dependencies-frontend
	$(YARN) fix-lint-errors

assets: build
	chmod -R go=r $(ASSETS_PATH); \
	$(BINDATA) \
		-pkg asset \
		-o ./server/asset/asset.go \
		-prefix $(BASE_PATH) \
		$(ASSETS_PATH)/...

build: dependencies-frontend
	GENERATE_SOURCEMAP=false REACT_APP_SERVER_URL=$(SERVER_URL) $(YARN) build

validate-commit: fix-lint-errors no-changes-in-commit

## Compiles the dashboard assets, and serve the dashboard through its API
serve:
	$(MAKE) -C . assets SERVER_URL=http://0.0.0.0:$(API_PORT)/api
	go run server/cmd/bblfsh-dashboard/* -bblfsh-addr=0.0.0.0:$(BBLFSH_PORT) -addr=:$(API_PORT)
