.PHONY: default
default: davinci.js

davinci.js:
	./node_modules/.bin/browserify -e ./lib/index.js -o ./davinci.js

node_modules:
	npm install

.PHONY: test
test: node_modules
	NODE_TLS_REJECT_UNAUTHORIZED=0 ./node_modules/.bin/mocha
