SABRE_DAV_VERSION=2.0.1
SABRE_DAV_RELEASE=sabredav-$(SABRE_DAV_VERSION)
SABRE_DAV_ZIPBALL=$(SABRE_DAV_RELEASE).zip

.PHONY: default
default: davinci.js

.PHONY: clean
clean:
	rm -rf *.zip \
		SabreDAV/ \
		coverage/ \
		davinci.js \
		node_modules/ \
		test/integration/server/SabreDAV/

.PHONY: ci
ci: lint test-unit test-integration coverage

.PHONY: coverage
coverage: node_modules
	./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha --report lcovonly
	cat ./coverage/lcov.info | ./node_modules/.bin/coveralls
	rm -rf ./coverage

.PHONY: lint
lint: node_modules
	./node_modules/.bin/jshint --verbose lib/ test/

# IMPORTANT: Only run |make shrinkwrap| when making changes to dependencies.
.PHONY: shrinkwrap
shrinkwrap: node_modules
	rm -f ./npm-shrinkwrap.json
	npm shrinkwrap --dev

.PHONY: test
test: lint test-unit test-integration

.PHONY: test-unit
test-unit: node_modules
	./node_modules/.bin/mocha test/unit

.PHONY: test-integration
test-integration: node_modules test/integration/server/SabreDAV
	./node_modules/.bin/mocha test/integration

SabreDAV:
	wget -O $(SABRE_DAV_ZIPBALL) https://github.com/fruux/sabre-dav/releases/download/$(SABRE_DAV_VERSION)/$(SABRE_DAV_ZIPBALL)
	unzip -q $(SABRE_DAV_ZIPBALL)

davinci.js: node_modules
	./node_modules/.bin/browserify -t brfs ./lib/index.js > ./davinci.js

node_modules:
	npm install

test/integration/server/SabreDAV: SabreDAV
	cp -r SabreDAV test/integration/server/SabreDAV
	cd test/integration/server/SabreDAV && cp ../calendarserver.php calendarserver.php
