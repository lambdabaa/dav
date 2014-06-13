'use strict';

var
    url = require('url'),
    debug = require('debug')('davinci:calendars'),
    requests = require('../request'),
    response = require('../response'),
    /* jshint -W079 */
    Promise = require('es6-promise').Promise;
    /* jshint +W079 */

function CalDAV(client) {

    this.client = client;

}

module.exports = CalDAV;

CalDAV.prototype = {

    /**
     * @param {davinci.Calendar} calendar the calendar to put the object on.
     * @param {String} path the name of the calendar object, such as UUID.ics
     * @param {String} data rfc 5545 VCALENDAR object.
     * @return {Promise} promise will resolve when the calendar has been
     *                           created.
     */
    createCalendarObject : function(calendar, path, data) {

      var objectUrl = url.resolve(calendar.url, path);
      var headers = {
        'If-None-Match' : '*'
      };
      return this.client.request('PUT', objectUrl, headers, data);

    },

    /**
     * @param {davinci.Calendar} calendar the calendar to put the object on.
     * @param {String} path the name of the calendar object, such as UUID.ics
     * @param {String} data rfc 5545 VCALENDAR object.
     * @param {String} etag Optional etag, will be used to prevent missing
     *                      overwrites.
     * @return {Promise} promise will resolve when the calendar has been
     *                           created.
     */
    updateCalendarObject : function(calendar, path, data, etag) {

      var objectUrl = url.resolve(calendar.url, path);

      var headers = {};
      if (etag) {
         headers['If-Match'] = etag;
      }

      return this.client.request('PUT', objectUrl, headers, data);

    },

    /**
     * @param {davinci.Calendar} calendar the calendar to put the object on.
     * @param {String} path the name of the calendar object, such as UUID.ics
     * @param {String} etag Optional etag, will be used to prevent missing
     *                      overwrites.
     * @return {Promise} promise will resolve when the calendar has been
     *                           created.
     */
    deleteCalendarObject : function(calendar, path, etag) {

      var objectUrl = url.resolve(calendar.url, path);

      var headers = {};
      if (etag) {
         headers['If-Match'] = etag;
      }

      return this.client.request('DELETE', objectUrl, headers);

    },

    /**
     * Fetch all objects for a given calendar.
     *
     * @param {davinci.Calendar} calendar the calendar to fetch objects for.
     */
    calendarQuery : function(calendar) {

        var calendarQuery = new requests.CalendarQuery({
            url: calendar.url,
            properties : [
                'd:getetag',
                'cal:calendar-data'
            ],
            filters : {
                type : 'comp',
                name : 'VCALENDAR',
            }
        });

        return this.client.send(calendarQuery, response.MultiStatus);

    },

    /**
     * @param {davinci.Calendar} calendar the calendar to fetch updates to.
     * @return {Promise} promise will resolve with updated calendar object.
     *
     * Options:
     *   (Object) sandbox - optional request sandbox.
     *   (String) timezone - VTIMEZONE calendar object.
     */
    sync : function(calendar) {

      return new Promise(function(resolve, reject) {
        if (!calendar.ctag) {
          debug('Missing ctag.');
          return resolve(false);
        }

        debug('Fetch remote getctag prop.');

        this.client.propFind(
            calendar.url,
            [ 'cs:getctag' ],
            0 // depth
        ).then(function(response) {
          debug('Calendar was found');
          var properties = response.multiStatus[0].props[200];
          debug('New ctag: ' + properties);
          return resolve(calendar.ctag !== properties.getctag);
        }, function(err) {
          return reject(err);
        });
      })
      .then(function(sync) {
        if (!sync) {
          debug('Local ctag matched remote! No need to sync :).');
          return calendar;
        }

        debug('ctag changed so we need to fetch stuffs.');
        return this.calendarQuery(calendar).then(function(responses) {
            calendar.objects = responses;
        });
      }.call(this),
      function(err) {
        debug(err);
      });

    }

};
