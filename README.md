dav [![Build Status](https://travis-ci.org/gaye/dav.png?branch=master)](https://travis-ci.org/gaye/dav) [![Coverage Status](https://img.shields.io/coveralls/gaye/dav.svg)](https://coveralls.io/r/gaye/dav)
=========

caldav and carddav client for nodejs and the browser.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [API](#api)
  - [dav.createAccount(options)](#davcreateaccountoptions)
  - [dav.createCalendarObject(calendar, options)](#davcreatecalendarobjectcalendar-options)
  - [dav.updateCalendarObject(calendarObject, options)](#davupdatecalendarobjectcalendarobject-options)
  - [dav.deleteCalendarObject(calendarObject, options)](#davdeletecalendarobjectcalendarobject-options)
  - [dav.syncCalendar(calendar, options)](#davsynccalendarcalendar-options)
  - [dav.createCard(addressBook, options)](#davcreatecardaddressbook-options)
  - [dav.updateCard(card, options)](#davupdatecardcard-options)
  - [dav.deleteCard(card, options)](#davdeletecardcard-options)
  - [dav.syncAddressBook(addressBook, options)](#davsyncaddressbookaddressbook-options)
  - [dav.createSandbox()](#davcreatesandbox)
  - [dav.Credentials(options)](#davcredentialsoptions)
  - [dav.transport.Basic(credentials)](#davtransportbasiccredentials)
  - [dav.transport.OAuth2(credentials)](#davtransportoauth2credentials)
  - [dav.Client(xhr)](#davclientxhr)
- [Example Usage](#example-usage)
- [Directory Structure](#directory-structure)
- [Publishing a release](#publishing-a-release)
- [Related Material](#related-material)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### API

#### dav.createAccount(options)

Perform an initial download of a caldav or carddav account's data. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled with a [dav.Account](https://github.com/gaye/dav/blob/master/lib/model/account.js) object.

```
Options:

  (String) accountType - one of 'caldav' or 'carddav'. Defaults to 'caldav'.
  (Array.<Object>) filters - list of caldav filters to send with request.
  (Object) sandbox - optional request sandbox.
  (String) server - some url for server (needn't be base url).
  (String) timezone - VTIMEZONE calendar object.
  (dav.Transport) xhr - request sender.
```

#### dav.createCalendarObject(calendar, options)

Create a calendar object on the parameter calendar. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled when the calendar has been created.

```
@param {dav.Calendar} calendar the calendar to put the object on.

Options:

  (String) data - rfc 5545 VCALENDAR object.
  (String) filename - name for the calendar ics file.
  (Object) sandbox - optional request sandbox.
  (dav.Transport) xhr - request sender.
```

#### dav.updateCalendarObject(calendarObject, options)

Persist updates to the parameter calendar object to the server. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled when the calendar has been updated.

```
@param {dav.CalendarObject} calendarObject updated calendar object.

Options:

  (Object) sandbox - optional request sandbox.
  (dav.Transport) xhr - request sender.
```

#### dav.deleteCalendarObject(calendarObject, options)

Delete the parameter calendar object on the server. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled when the calendar has been deleted.

```
@param {dav.CalendarObject} calendarObject target calendar object.

Options:

  (Object) sandbox - optional request sandbox.
  (dav.Transport) xhr - request sender.
```

#### dav.syncCalendar(calendar, options)

Fetch changes from the remote server to the parameter calendar. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled with an updated [dav.Calendar](https://github.com/gaye/dav/blob/master/lib/model/calendar.js) object once sync is complete.

```
@param {dav.Calendar} calendar the calendar to fetch changes for.

Options:

  (Array.<Object>) filters - list of caldav filters to send with request.
  (Object) sandbox - optional request sandbox.
  (String) syncMethod - either 'basic' or 'webdav'. If unspecified, will
      try to do webdav sync and failover to basic sync if rfc 6578 is not
      supported by the server.
  (String) timezone - VTIMEZONE calendar object.
  (dav.Transport) xhr - request sender.
```

#### dav.createCard(addressBook, options)

Create a vcard object on the parameter address book. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled when the vcard has been created.

```
@param {dav.AddressBook} addressBook the address book to put the object on.

Options:

  (String) data - VCARD object.
  (String) filename - name for the vcard vcf file.
  (Object) sandbox - optional request sandbox.
  (dav.Transport) xhr - request sender.
```

#### dav.updateCard(card, options)

Persist updates to the parameter vcard object to the server. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled when the vcard has been updated.

```
@param {dav.VCard} card updated vcard object.

Options:

  (Object) sandbox - optional request sandbox.
  (dav.Transport) xhr - request sender.
```

#### dav.deleteCard(card, options)

Delete the parameter vcard object on the server. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled when the vcard has been deleted.

```
@param {dav.VCard} card target vcard object.

Options:

  (Object) sandbox - optional request sandbox.
  (dav.Transport) xhr - request sender.
```

#### dav.syncAddressBook(addressBook, options)

Fetch changes from the remote server to the parameter address books. Returns a [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will be fulfilled with an updated [dav.AddressBook](https://github.com/gaye/dav/blob/master/lib/model/address_book.js) object once sync is complete.

```
@param {dav.AddressBook} addressBook the address book to fetch changes for.

Options:

  (Object) sandbox - optional request sandbox.
  (String) syncMethod - either 'basic' or 'webdav'. If unspecified, will
      try to do webdav sync and failover to basic sync if rfc 6578 is not
      supported by the server.
  (dav.Transport) xhr - request sender.
```


#### dav.createSandbox()

Create a request sandbox. Add requests to the sandbox like so:

```js
var sandbox = dav.createSandbox();
dav.createAccount({
  username: 'Yoshi',
  password: 'babybowsersoscaryomg',
  server: 'https://caldav.yoshisstory.com',
  sandbox: sandbox  // <- Insert sandbox here!
}).then(function(calendars) {
  // etc, etc.
});
```
And abort sandboxed requests as a group with `sandbox.abort()`.

#### dav.Credentials(options)

Create a new `dav.Credentials` object. This is a union of various authentication details needed to sign requests.

```
Options:
  (String) username - username (perhaps email) for calendar user.
  (String) password - plaintext password for calendar user.
  (String) clientId - oauth client id.
  (String) clientSecret - oauth client secret.
  (String) authorizationCode - oauth code.
  (String) redirectUrl - oauth redirect url.
  (String) tokenUrl - oauth token url.
  (String) accessToken - oauth access token.
  (String) refreshToken - oauth refresh token.
  (Number) expiration - unix time for access token expiration.
```

#### dav.transport.Basic(credentials)

Create a new `dav.transport.Basic` object. This sends dav requests using http basic authentication.

```
@param {dav.Credentials} credentials user authorization.
```

#### dav.transport.OAuth2(credentials)

Create a new `dav.transport.OAuth2` object. This sends dav requests authorized via rfc 6749 oauth2.

```
@param {dav.Credentials} credentials user authorization.
```

#### dav.Client(xhr)

Create a new `dav.Client` object. The client interface allows consumers to set their credentials and transport once and then make authorized requests without passing them to each request. Each of the other, public API methods should be available on `dav.Client` objects.

```
@param {dav.Transport} xhr - request sender.
```

### Example Usage

```js
var dav = require('dav');

var xhr = new dav.transport.Basic(
  new dav.Credentials({
    username: 'xxx',
    password: 'xxx'
  })
);

dav.createAccount({
  server: 'http://dav.example.com',
  xhr: xhr
})
.then(function(account) {
  // account instanceof dav.Account
  account.calendars.forEach(function(calendar) {
    console.log('Found calendar named ' + calendar.displayName);
  });
});
```

For more example usages, check out the [suite of integration tests](https://github.com/gaye/dav/tree/master/test/integration).

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
test/unit/parser/            # Test cases for parsing server dav responses
test/unit/request/           # Test cases for issuing dav client requests
test/unit/template/          # Test cases for xml templating helpers
test/unit/transport/         # Test cases for authorizing and issuing requests
```

### Publishing a release

1. Update `package.json` to reflect the new version.
2. Run `make shrinkwrap` to write changes to `package.json` through npm shrinkwrap.
3. Add a new entry to `HISTORY.md` with the new version number and a description of the changeset.
4. Commit the changes to `package.json`, `npm-shrinkwrap.json`, and `HISTORY.md`. Push to GitHub.
5. Run `make clean && make` to generate the build outputs.
6. Create a new GitHub release named `v.{x}.{y}.{z}` with a description of the changeset. Upload the freshly generated zipball.
7. Run `npm publish`.

### Related Material

+ [RFC 4791](http://tools.ietf.org/html/rfc4791)
+ [RFC 5545](http://tools.ietf.org/html/rfc5545)
+ [RFC 6352](http://tools.ietf.org/html/rfc6352)
