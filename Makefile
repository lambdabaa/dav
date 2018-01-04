HBS := $(shell find src/template/ -name "*.hbs")
JS := $(shell find src/ -name "*.js")

SABRE_DAV_VERSION=2.0.1
SABRE_DAV_RELEASE=sabredav-$(SABRE_DAV_VERSION)
SABRE_DAV_ZIPBALL=$(SABRE_DAV_RELEASE).zip

dist/dav.browser.min.js dist/dav.browser.min.js.map: dist/dav.browser.js dist/dav.browser.js.map node_modules
	./node_modules/.bin/uglifyjs ./dist/dav.browser.js \
		--compress \
		--mangle \
		--source-map \
		--output ./dist/dav.browser.min.js

dist/dav.browser.js dist/dav.browser.js.map: dist/dav.js node_modules
	./node_modules/.bin/browserify --standalone dav --debug ./dist/dav.js | \
		./node_modules/.bin/exorcist ./dist/dav.browser.js.map > ./dist/dav.browser.js

dist/dav.js dist/dav.es.js dist_test/dav.js: $(JS) $(HBS) node_modules rollup.config.js
	./node_modules/.bin/rollup -c

node_modules: package.json
	npm install

.PHONY: clean
clean:
	rm -rf *.zip SabreDAV dist dist_test coverage dav.* node_modules test/integration/server/SabreDAV .reify-cache

.PHONY: test
test: test-unit test-integration

.PHONY: test-unit
test-unit: node_modules dist_test/dav.js
	./node_modules/.bin/mocha test/unit

.PHONY: test-integration
test-integration: node_modules test/integration/server/SabreDAV dist_test/dav.js
	./node_modules/.bin/mocha test/integration

.PHONY: toc
toc: node_modules
	./node_modules/.bin/doctoc CONTRIBUTING.md
	./node_modules/.bin/doctoc HISTORY.md
	./node_modules/.bin/doctoc README.md

test/integration/server/SabreDAV: SabreDAV
	cp -r SabreDAV test/integration/server/SabreDAV
	cd test/integration/server/SabreDAV && cp ../calendarserver.php calendarserver.php

SabreDAV:
	wget -O $(SABRE_DAV_ZIPBALL) https://github.com/fruux/sabre-dav/releases/download/$(SABRE_DAV_VERSION)/$(SABRE_DAV_ZIPBALL)
	unzip -q $(SABRE_DAV_ZIPBALL)
