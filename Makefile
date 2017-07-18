# Package configuration
PROJECT = dashboard
COMMANDS = server/cmd/bblfsh-dashboard

# Including ci Makefile
MAKEFILE = Makefile.main
CI_REPOSITORY = https://github.com/src-d/ci.git
CI_FOLDER = .ci

# Tools
YARN = yarn
REMOVE = rm -rf
BINDATA = go-bindata

$(MAKEFILE):
	@git clone --quiet $(CI_REPOSITORY) $(CI_FOLDER); \
	cp $(CI_FOLDER)/$(MAKEFILE) .;

-include $(MAKEFILE)

install-bindata:
	go get github.com/jteeuwen/go-bindata/...

assets: build install-bindata
	$(BINDATA) -pkg asset -o ./server/asset/asset.go `find ./build -type d`

build: clean-server
	$(YARN) build

clean-server:
	$(REMOVE) build ./server/asset/asset.go

package: assets packages
