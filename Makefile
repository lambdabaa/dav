SABRE_DAV_VERSION=2.0.1
SABRE_DAV_RELEASE=sabredav-$(SABRE_DAV_VERSION)
SABRE_DAV_ZIPBALL=$(SABRE_DAV_RELEASE).zip

.PHONY: default
default: davinci.js

.PHONY: clean
clean:
	rm -rf *.zip \
		SabreDAV/ \
		davinci.js \
		node_modules/ \
		test/integration/server/SabreDAV/

.PHONY: lint
lint:
	./node_modules/.bin/jshint --verbose lib/ test/

# IMPORTANT: Only run |make shrinkwrap| when making changes to dependencies.
.PHONY: shrinkwrap
shrinkwrap:
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
	unzip $(SABRE_DAV_ZIPBALL)

davinci.js: node_modules
	./node_modules/.bin/browserify \
		-e ./lib/index.js \
		-t brfs \
		-o ./davinci.js

node_modules:
	npm install

test/integration/server/SabreDAV: SabreDAV
	cp -r SabreDAV test/integration/server/SabreDAV
	cd test/integration/server/SabreDAV && \
		cp ../calendarserver.php calendarserver.php && \
		mkdir data && \
		cat examples/sql/sqlite.* | sqlite3 data/db.sqlite && \
		chmod -R a+w data/ && \
		echo "INSERT INTO calendars (principaluri,displayname,uri,description,components,transparent) VALUES ('principals/admin','default calendar','default','','VEVENT,VTODO', '0');" | sqlite3 data/db.sqlite
