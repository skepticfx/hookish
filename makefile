SRC = ./src

MANIFEST_VERSION = `node -pe "require('./src/manifest.json').version"`

all: clean $(SRC)
	@echo 'Using $(SRC) as the source folder.'
	@echo 'Beautifying JS files'
	@js-beautify $(SRC)/js/*.js -r -s 2
	@zip -q -r Hookish-Chrome-$(MANIFEST_VERSION).zip $(SRC)
	@echo 'The release file: Hookish-Chrome-'$(MANIFEST_VERSION)'.zip is ready to be uploaded to Chrome Store.'

clean: 
	@rm -rf *.zip