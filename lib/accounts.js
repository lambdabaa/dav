'use strict';

var Calendar = require('./model').Calendar,
    CalendarObject = require('./model').CalendarObject,
    debug = require('debug')('davinci:accounts'),
    request = require('./request'),
    url = require('url');

/**
 * rfc 6764.
 */
function serviceDiscovery(options) {
  debug('Attempt service discovery.');
  return request.discovery({
    bootstrap: 'caldav',
    username: options.username,
    password: options.password,
    server: options.server,
    sandbox: options.sandbox
  })
  .send();
}

/**
 * rfc 5397.
 */
function principalUrl(contextPath, options) {
  debug('Fetch principal url from context path ' + contextPath + '.');
  return request
    .propfind({
      url: contextPath,
      username: options.username,
      password: options.password,
      sandbox: options.sandbox,
      props: [ { name: 'current-user-principal', namespace: 'd' } ],
      depth: 0,
      mergeResponses: true
    })
    .send()
    .then(function(response) {
      var container = response.props;
      return url.resolve(
        contextPath,
        container['current-user-principal'].href
      );
    });
}

function homeUrl(contextPath, principalUrl, options) {
  debug('Fetch home url from principal url ' + principalUrl + '.');
  return request
    .propfind({
      url: principalUrl,
      username: options.username,
      password: options.password,
      sandbox: options.sandbox,
      props: [ { name: 'calendar-home-set', namespace: 'c' } ],
      mergeResponses: true
    })
    .send()
    .then(function(response) {
      var container = response.props;
      return url.resolve(
        contextPath,
        container['calendar-home-set'].href
      );
    });
}

function getCalendars(contextPath, homeUrl, options) {
  debug('Fetch calendars from home url ' + homeUrl);
  return request
    .propfind({
      url: homeUrl,
      username: options.username,
      password: options.password,
      sandbox: options.sandbox,
      props: [
        { name: 'displayname', namespace: 'd' },
        { name: 'getctag', namespace: 'cs' },
        { name: 'supported-calendar-component-set', namespace: 'c' }
      ],
      depth: 1
    })
    .send()
    .then(function(responses) {
      return responses
        .filter(function(response) {
          // We only want the calendar object if it does events.
          var components = response.props['supported-calendar-component-set'];
          return components && components.indexOf('VEVENT') !== -1;
        })
        .map(function(response) {
          return new Calendar({
            username: options.username,
            password: options.password,
            url: url.resolve(contextPath, response.href),
            ctag: response.props.getctag,
            displayName: response.props.displayname,
            components: response.props['supported-calendar-component-set']
          });
        });
    });
}

function fetchObjects(calendar, contextPath, options) {
  debug('Doing REPORT on calendar ' + calendar.url +
        ' which belongs to ' + calendar.username);
  return request
    .calendarQuery({
      url: calendar.url,
      username: calendar.username,
      password: calendar.password,
      sandbox: options.sandbox,
      depth: 1,
      props: [
        { name: 'getetag', namespace: 'd' },
        { name: 'calendar-data', namespace: 'c' }
      ],
      filters: [
        { type: 'comp', name: 'VCALENDAR', namespace: 'c' }
      ]
    })
    .send()
    .then(function(responses) {
      return responses.map(function(response) {
        return new CalendarObject({
          calendar: calendar,
          url: url.resolve(contextPath, response.href),
          etag: response.props.getetag,
          data: response.props['calendar-data']
        });
      });
    });
}

/**
 * Options:
 *   (String) username - username (perhaps email) for calendar user.
 *   (String) password - plaintext password for calendar user.
 *   (String) server - some url for server (needn't be base url).
 *   (Object) sandbox - optional request sandbox.
 *
 * @return {Promise} a promise that will resolve with an array
 *     of calendar objects.
 */
exports.create = function(options) {
  var caldavUrl;
  return serviceDiscovery(options)
    .then(function(contextPath) {
      caldavUrl = contextPath;
      return principalUrl(caldavUrl, options);
    })
    .then(function(principalUrl) {
      return homeUrl(caldavUrl, principalUrl, options);
    })
    .then(function(homeUrl) {
      return getCalendars(caldavUrl, homeUrl, options);
    })
    .then(function(calendars) {
      return Promise.all(calendars.map(function(calendar) {
        return fetchObjects(calendar, caldavUrl, options)
          .then(function(objects) {
            calendar.objects = objects;
            return calendar;
          });
      }));
    });
};
