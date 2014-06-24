# Contributing

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [Directory Structure](#directory-structure)
- [Under the hood](#under-the-hood)
- [Running the tests](#running-the-tests)
- [Publishing a release](#publishing-a-release)
- [Related Material](#related-material)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Directory Structure

```
lib/                         # Source code
lib/model/                   # Semantic data structures hydrated from dav data
lib/parser/                  # Abstractions for parsing server dav responses
lib/request/                 # Abstractions for creating dav client requests
lib/template/                # Facilities for generating xml request bodies
lib/transport/               # Things that authorize and issue requests
test/                        # Test code
test/integration/            # End-to-end tests run against a dav server
test/integration/data/       # Fixture data for integration tests
test/integration/server/     # Code to bootstrap dav server
test/unit/                   # Unit tests
test/unit/data/              # Fixture data for unit tests
test/unit/model/             # Test cases for model methods
test/unit/parser/            # Test cases for parsing server dav responses
test/unit/request/           # Test cases for issuing dav client requests
test/unit/template/          # Test cases for xml templating helpers
test/unit/transport/         # Test cases for authorizing and issuing requests
```

### Under the hood

dav uses npm to manage external dependencies. External npm modules get bundled into the browser js binary with the (excellent) [browserify](http://browserify.org/) utility. dav uses the `DOMParser` and `XMLHttpRequest` web apis (to parse xml and send http requests). All of the async library operations use es6 [Promises](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### Running the tests

```
///////////////////////////////////////
/ suite       / command               /
///////////////////////////////////////
/ integration / make test-integration /
///////////////////////////////////////
/ lint        / make lint             /
///////////////////////////////////////
/ unit        / make test-unit        /
///////////////////////////////////////
```

Things to note:

+ As of 1.1.1, all of the tests run dav via nodejs. There are no browser tests (yet).
+ You can add helpful debug logs to test output with the `DEBUG` environment variable.
  + Filter logs by setting `DEBUG=dav:*`, `DEBUG=dav:request:*`, etc.
+ Integration tests run against [sabredav](http://sabre.io/)
  + The server code lives [here](https://github.com/gaye/dav/blob/master/test/integration/server/calendarserver.php)
  + There is a make task which downloads a sabredav release from GitHub that `make test-integration` depends on
  + The sabredav instance uses sqlite to store dav collections and objects among other things.
    + The code that seeds the database lives [here](https://github.com/gaye/dav/blob/master/test/integration/server/bootstrap.js)

### Publishing a release

1. Update `package.json` to reflect the new version. Use [semver](http://semver.org/) to help decide what new version number is best.
2. Run `make shrinkwrap` to write changes to `package.json` through npm shrinkwrap.
3. Add a new entry to `HISTORY.md` with the new version number and a description of the changeset.
4. Commit the changes to `package.json`, `npm-shrinkwrap.json`, and `HISTORY.md`. Push to GitHub.
5. Run `make clean && make` to generate the build outputs.
6. Create a new GitHub release named `v.{MAJOR}.{MINOR}.{PATCH}` with a description of the changeset. Upload the freshly generated zipball.
7. Run `npm publish`.
8. Write the updated binaries through [dav-bower](https://github.com/gaye/dav-bower) with a new git tag `v.{MAJOR}.{MINOR}.{PATCH}`.

### Related Material

+ [Amazing webdav docs](http://sabre.io/dav/)
+ [RFC 4791](http://tools.ietf.org/html/rfc4791)
+ [RFC 5545](http://tools.ietf.org/html/rfc5545)
+ [RFC 6352](http://tools.ietf.org/html/rfc6352)
