davincijs
=========

Javascript CalDAV client library for node.js and the browser.


[![Build Status](https://travis-ci.org/gaye/davincijs.png?branch=master)](https://travis-ci.org/gaye/davincijs)
[![Coverage Status](https://img.shields.io/coveralls/gaye/davincijs.svg)](https://coveralls.io/r/gaye/davincijs)

### API

#### davinci.createAccount = function(options) {};

Perform an initial download of a caldav account's data. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled with a [davinci.Account](https://github.com/gaye/davincijs/blob/master/lib/model/account.js) object.

```
Options:

  (Array.<Object>) filters - list of caldav filters to send with request.
  (String) password - plaintext password for calendar user.
  (Object) sandbox - optional request sandbox.
  (String) server - some url for server (needn't be base url).
  (String) timezone - VTIMEZONE calendar object.
  (String) username - username (perhaps email) for calendar user.
  (davinci.Transport) xhr - optional request sender.
```

#### davinci.createCalendarObject = function(calendar, options) {};

Create a calendar object on the parameter calendar. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled when the calendar has been created.

```
@param {davinci.Calendar} calendar the calendar to put the object on.

Options:

  (String) data - rfc 5545 VCALENDAR object.
  (String) filename - name for the calendar ics file.
  (Object) sandbox - optional request sandbox.
  (davinci.Transport) xhr - optional request sender.
```

#### davinci.updateCalendarObject = function(calendarObject, options) {};

Persist updates to the parameter calendar object to the server. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled when the calendar has been updated.

```
@param {davinci.CalendarObject} calendarObject updated calendar object.

Options:

  (Object) sandbox - optional request sandbox.
  (davinci.Transport) xhr - optional request sender.
```

#### davinci.deleteCalendarObject = function(calendarObject, options) {};

Delete the parameter calendar object on the server. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled when the calendar has been deleted.

```
@param {davinci.CalendarObject} calendarObject target calendar object.

Options:

  (Object) sandbox - optional request sandbox.
  (davinci.Transport) xhr - optional request sender.
```

### davinci.syncCalendar = function(calendar, options) {};

Fetch changes from the remote server to the parameter calendar. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled with an updated [davinci.Calendar](https://github.com/gaye/davincijs/blob/master/lib/model/calendar.js) object once sync is complete.

```
@param {davinci.Calendar} calendar the calendar to fetch changes for.

Options:

  (Array.<Object>) filters - list of caldav filters to send with request.
  (Object) sandbox - optional request sandbox.
  (String) timezone - VTIMEZONE calendar object.
  (davinci.Transport) xhr - optional request sender.
```

#### davinci.createSandbox = function() {};

Create a request sandbox. Add requests to the sandbox like so:

```js
var sandbox = davinci.createSandbox();
davinci.createAccount({
  username: 'Yoshi',
  password: 'babybowsersoscaryomg',
  server: 'https://caldav.yoshisstory.com',
  sandbox: sandbox  // <- Insert sandbox here!
}).then(function(calendars) {
  // etc, etc.
});
```
And abort sandboxed requests as a group with `sandbox.abort()`.

#### davinci.Client = function(options) {};

Create a new `davinci.Client` object. The client interface allows consumers to set their credentials once and then make authorized requests without passing their credentials to each request. Each of the other, public API methods should be available on `davinci.Client` objects.

```
Options:

  (String) password - plaintext password for calendar user.
  (String) server - some url for server (needn't be base url).
  (String) username - username (perhaps email) for calendar user.
```

### Directory Structure

```
lib/                         # Source code
lib/model/                   # Semantic data structures hydrated from dav data
lib/parser/                  # Abstractions for parsing server dav responses
lib/request/                 # Abstractions for issuing dav client requests
lib/template/                # Facilities for generating xml request bodies
test/                        # Test code
test/integration/            # End-to-end tests run against a dav server
test/integration/data/       # Fixture data for integration tests
test/integration/server/     # Code to bootstrap dav server
test/unit/                   # Unit tests
test/unit/data/              # Fixture data for unit tests
test/unit/parser/            # Test cases for parsing server dav responses
test/unit/request/           # Test cases for issuing dav client requests
test/unit/template/          # Test cases for xml templating helpers
```

### Publishing a release

1. Update `package.json` to reflect the new version.
2. Add a new entry to `HISTORY.md` with the new version number and a description of the changeset.
3. Push the `package.json` and `HISTORY.md` updates to GitHub.
4. Run `make` to generate the build outputs.
5. Create a new GitHub release named the new version number with a description of the changeset. Upload the freshly generated build outputs.
6. Run `npm publish`.

### Related Material

+ [RFC 4791](http://tools.ietf.org/html/rfc4791)
+ [RFC 5545](http://tools.ietf.org/html/rfc5545)
