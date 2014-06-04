davinci.js
==========

Javascript CalDAV client library for node.js and the browser.


[![Build Status](https://travis-ci.org/gaye/davinci.js.png?branch=master)](https://travis-ci.org/gaye/davinci.js)

### Directory Structure

```
lib/                         # Source code
lib/model/                   # Semantic data structures hydrated from dav data
lib/parser/                  # Abstractions for parsing server dav responses
lib/request/                 # Abstractions for issuing dav client requests
lib/template/                # Facilities for generating xml request bodies
test/                        # Test code
test/integration/            # End-to-end tests run against a dav server
test/integration/server/     # Code to bootstrap dav server
test/unit/                   # Unit tests
test/unit/data/              # Fixture data for unit tests
test/unit/parser/            # Test cases for parsing server dav responses
test/unit/request/           # Test cases for issuing dav client requests
test/unit/template/          # Test cases for xml templating helpers
```

### Related Material

+ [RFC 4791](http://tools.ietf.org/html/rfc4791)
+ [RFC 5545](http://tools.ietf.org/html/rfc5545)
