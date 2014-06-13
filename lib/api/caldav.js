'use strict';

var
    url = require('url'),
    debug = require('debug')('davinci:calendars'),
    requests = require('../request'),
    response = require('../response');

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

        var calendarQuery = new requests.CalendarQuery(
            calendar.url,
            [
                'd:getetag',
                'cal:calendar-data'
            ],
            {
                type : 'comp',
                name : 'VCALENDAR',
            }
        );

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

      var self = this;

      var promise = new Promise(function(resolve, reject) {

          /**
           * Syncing currently happens in two steps:
           *
           * 1. Compare our local ctag to a remote ctag.
           * 2. Download every item from the remote collection.
           *
           * This needs to be optimized quite a bit, but it's a start.
           */
           var foo = self.client.propFind(
                calendar.url,
                [ 'cs:getctag' ],
                0 // depth
           );

           foo.then(
              function(result) {
                 // received a multi-status response.
                 // TODO: this needs to be a million times better, as it makes
                 // a lot of assumptions about the returned data
                 var newCTag = result.responses[0].propstats[0].prop.getctag;
                 debug('New ctag: ' + newCTag);
                 resolve(newCTag !== calendar.ctag);

              },
              function(err) {
                 reject(err);
              }
           );
      });

      return promise.then(
          function(sync) {

            if (!sync) {
                debug('No sync was required');
                return calendar;
            }

            debug('CTag changed, so we need to fetch stuffs.');

            return self.calendarQuery(calendar).then(
                function(responses) {
                    console.log(calendar);
                    calendar.objects = responses;
                    return calendar;
                },
                function(err) {
                    debug(err);
                    return err;
                }
            );

          },
          function(err) {

            debug(err);
            return err;

          }
      );

    }

};
