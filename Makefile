# Package configuration
PROJECT = dashboard
COMMANDS = server/cmd/bblfsh-dashboard
DEPENDENCIES = \
	github.com/jteeuwen/go-bindata

# Including ci Makefile
MAKEFILE = Makefile.main
CI_REPOSITORY = https://github.com/src-d/ci.git
CI_FOLDER = .ci

# Tools
YARN = yarn
REMOVE = rm -rf
BINDATA = go-bindata

SERVER_URL="/api"

$(MAKEFILE):
	@git clone --quiet $(CI_REPOSITORY) $(CI_FOLDER); \
	cp $(CI_FOLDER)/$(MAKEFILE) .;

-include $(MAKEFILE)

dependencies-frontend: dependencies
	$(YARN)	install

test-frontend: dependencies-frontend
	$(YARN) test

assets: build dependencies-frontend
	$(BINDATA) -pkg asset -o ./server/asset/asset.go `find ./build -type d`

build: dependencies-frontend
	REACT_APP_SERVER_URL=$(SERVER_URL) $(YARN) build
