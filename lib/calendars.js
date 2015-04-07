'use strict';

import debug from 'debug';
import * as model from './model';
import * as ns from './namespace';
import * as request from './request';
import url from 'url';
import * as webdav from './webdav';

debug = debug('dav:calendars');

/**
 * @param {dav.Account} account to fetch calendars for.
 */
export async function listCalendars(account, options) {
  debug(`Fetch calendars from home url ${account.homeUrl}`);
  var req = request.propfind({
    props: [
      { name: 'calendar-description', namespace: ns.CALDAV },
      { name: 'calendar-timezone', namespace: ns.CALDAV },
      { name: 'displayname', namespace: ns.DAV },
      { name: 'getctag', namespace: ns.CALENDAR_SERVER },
      { name: 'resourcetype', namespace: ns.DAV },
      { name: 'supported-calendar-component-set', namespace: ns.CALDAV },
      { name: 'sync-token', namespace: ns.DAV }
    ],
    depth: 1
  });

  let responses = await options.xhr.send(req, account.homeUrl, {
    sandbox: options.sandbox
  });

  debug(`Found ${responses.length} calendars.`);
  let cals = responses
    .filter(res => {
      // We only want the calendar object if it does events.
      let components = res.props.supportedCalendarComponentSet;
      return components && components.indexOf('VEVENT') !== -1;
    })
    .map(res => {
      debug(`Found calendar ${res.props.displayname},
             props: ${JSON.stringify(res.props)}`);
      return new model.Calendar({
        data: res,
        account: account,
        description: res.props.calendarDescription,
        timezone: res.props.calendarTimezone,
        url: url.resolve(account.rootUrl, res.href),
        ctag: res.props.getctag,
        displayName: res.props.displayname,
        components: res.props.supportedCalendarComponentSet,
        resourcetype: res.props.resourcetype,
        syncToken: res.props.syncToken
      });
    });

  return Promise.all(cals.map(async function(cal) {
    cal.reports = await webdav.supportedReportSet(cal, options);
    if (options.loadObjects) {
      cal.objects = await listCalendarObjects(cal, options);
    }

    return cal;
  }));
}

/**
 * @param {dav.Calendar} calendar the calendar to put the object on.
 * @return {Promise} promise will resolve when the calendar has been created.
 *
 * Options:
 *
 *   (String) data - rfc 5545 VCALENDAR object.
 *   (String) filename - name for the calendar ics file.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
export function createCalendarObject(calendar, options) {
  var objectUrl = url.resolve(calendar.url, options.filename);
  return webdav.createObject(objectUrl, options.data, options);
};

/**
 * @param {dav.CalendarObject} calendarObject updated calendar object.
 * @return {Promise} promise will resolve when the calendar has been updated.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
export function updateCalendarObject(calendarObject, options) {
  return webdav.updateObject(
    calendarObject.url,
    calendarObject.calendarData,
    calendarObject.etag,
    options
  );
}

/**
 * @param {dav.CalendarObject} calendarObject target calendar object.
 * @return {Promise} promise will resolve when the calendar has been deleted.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
export function deleteCalendarObject(calendarObject, options) {
  return webdav.deleteObject(
    calendarObject.url,
    calendarObject.etag,
    options
  );
}

/**
 * @param {dav.Calendar} calendar the calendar to fetch objects for.
 *
 * Options:
 *
 *   (Array.<Object>) filters - optional caldav filters.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
export async function listCalendarObjects(calendar, options) {
  debug(`Doing REPORT on calendar ${calendar.url} which belongs to
         ${calendar.account.credentials.username}`);

  let filters = options.filters || [{
    type: 'comp-filter',
    attrs: { name: 'VCALENDAR' },
    children: [{
      type: 'comp-filter',
      attrs: { name: 'VEVENT' }
    }]
  }];

  let req = request.calendarQuery({
    depth: 1,
    props: [
      { name: 'getetag', namespace: ns.DAV },
      { name: 'calendar-data', namespace: ns.CALDAV }
    ],
    filters: filters
  });

  let responses = await options.xhr.send(req, calendar.url, {
    sandbox: options.sandbox
  });

  return responses.map(res => {
    debug(`Found calendar object with url ${res.href}`);
    return new model.CalendarObject({
      data: res,
      calendar: calendar,
      url: url.resolve(calendar.account.rootUrl, res.href),
      etag: res.props.getetag,
      calendarData: res.props.calendarData
    });
  });
}

/**
 * @param {dav.Calendar} calendar the calendar to fetch updates to.
 * @return {Promise} promise will resolve with updated calendar object.
 *
 * Options:
 *
 *   (Array.<Object>) filters - list of caldav filters to send with request.
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (String) syncMethod - either 'basic' or 'webdav'. If unspecified, will
 *       try to do webdav sync and failover to basic sync if rfc 6578 is not
 *       supported by the server.
 *   (String) timezone - VTIMEZONE calendar object.
 *   (dav.Transport) xhr - request sender.
 */
export function syncCalendar(calendar, options) {
  options.basicSync = basicSync;
  options.webdavSync = webdavSync;
  return webdav.syncCollection(calendar, options);
}

/**
 * @param {dav.Account} account the account to fetch updates for.
 * @return {Promise} promise will resolve with updated account.
 *
 * Options:
 *
 *   (dav.Sandbox) sandbox - optional request sandbox.
 *   (dav.Transport) xhr - request sender.
 */
export async function syncCaldavAccount(account, options={}) {
  options.loadObjects = false;
  if (!account.calendars) account.calendars = [];

  let cals = await listCalendars(account, options);
  cals
    .filter(cal => {
      // Filter the calendars not previously seen.
      return account.calendars.every(prev => prev.url.indexOf(cal.url) === -1);
    })
    .forEach(cal => {
      // Add them to the account's calendar list.
      account.calendars.push(cal);
    });

  options.loadObjects = true;
  await Promise.all(account.calendars.map(async function(cal, index) {
    try {
      await syncCalendar(cal, options);
    } catch (error) {
      debug(`Sync calendar ${cal.displayName} failed with ${error}`);
      account.calendars.splice(index, 1);
    }
  }));

  return account;
}

async function basicSync(calendar, options) {
  let sync = await webdav.isCollectionDirty(calendar, options);
  if (!sync) {
    debug('Local ctag matched remote! No need to sync :).');
    return calendar;
  }

  debug('ctag changed so we need to fetch stuffs.');
  calendar.objects = await listCalendarObjects(calendar, options);
  return calendar;
}

async function webdavSync(calendar, options) {
  var req = request.syncCollection({
    props: [
      { name: 'getetag', namespace: ns.DAV },
      { name: 'calendar-data', namespace: ns.CALDAV }
    ],
    syncLevel: 1,
    syncToken: calendar.syncToken
  });

  let result = await options.xhr.send(req, calendar.url, {
    sandbox: options.sandbox
  });

  // TODO(gareth): Handle creations and deletions.
  result.responses.forEach(function(response) {
    // Find the calendar object that this response corresponds with.
    var calendarObject = calendar.objects.filter(function(object) {
      return object.url.indexOf(response.href) !== -1;
    })[0];

    if (!calendarObject) {
      return;
    }

    calendarObject.etag = response.props.getetag;
    calendarObject.calendarData = response.props.calendarData;
  });

  calendar.syncToken = result.syncToken;
  return calendar;
}
