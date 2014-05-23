davinci.js
==========

Javascript CalDAV client library (rfc 4791, rfc 5545)

### Design Goals

1. Abstract ical.js and caldav behind a unified backend API.
2. Use abstraction (in the programming sense) very sparsely [if at all].
3. Expose async operations via promises.
4. Should run in node.js and the browser.
5. Make it very easy to extend with webdav sync (rfc 6578) and scheduling.
