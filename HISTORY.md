### 0.10.1

+ Set request depth to 0 in the "getctag" propfind issued during sync

### 0.10.0

+ Implement time-range filters for calendar queries

### 0.9.3

+ Remove dependencies on ical.js and underscore

### 0.9.2

+ Fix npm package
+ Change npm name to davincijs

### 0.9.1

+ remove nodejs polyfills for DOMParser and XMLHttpRequest from build output
+ generate minified binaries

### 0.9.0

+ Implement davinci.Client interface
+ Add transport layer to decouple request details and sending

### 0.8.0

+ Expose low-level request methods through davinci.request
+ Add hook to requests to override transformResponse

### 0.7.1

+ Expose the underlying, xml parsed dav responses on davinci.Calendar and davinci.CalendarObject models.

### 0.7.0

+ Support providing timezone option to #createAccount and #syncCalendar

### 0.6.0

+ #syncCalendar added to public api
+ The promise returned from #createAccount now resolves with a davinci.Account object instead of an array of davinci.Calendar objects.

### 0.5.0

+ #deleteCalendarObject added to public api

### 0.4.0

+ #updateCalendarObject added to public api
+ Internal api refactoring to expose Request objects

### 0.3.1

+ Patch bug in build due to bug in brfs.

### 0.3.0

+ #createCalendarObject modified to support sandboxing.

### 0.2.0

+ #createCalendarObject added to public api

### 0.1.0

+ #createAccount added to public api
+ #createSandbox added to public api
