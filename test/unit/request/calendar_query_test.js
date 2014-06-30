'use strict';

var assert = require('chai').assert,
    data = require('../data'),
    ns = require('../../../lib/namespace'),
    nock = require('nock'),
    nockUtils = require('./nock_utils'),
    request = require('../../../lib/request'),
    transport = require('../../../lib/transport');

suite('request.calendarQuery', function() {
  var xhr;

  setup(function() {
    xhr = new transport.Basic({ username: 'admin', password: 'admin' });
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should return request.Request', function() {
    assert.instanceOf(
      request.calendarQuery({
        props: [],
        depth: 1
      }),
      request.Request
    );
  });

  test('should set depth header', function() {
    var mock = nock('http://127.0.0.1:1337')
      .matchHeader('Depth', 1)
      .intercept('/principals/admin/', 'REPORT')
      .reply(200);

    var req = request.calendarQuery({
      props: [ { name: 'calendar-data', namespace: ns.CALDAV } ],
      depth: 1
    });

    return nockUtils.verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/'),
      mock
    );
  });

  test('should add specified props to report body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/principals/admin/', 'REPORT', function(body) {
      return body.indexOf('<d:catdog />') !== -1;
    });

    var req = request.calendarQuery({
      props: [ { name: 'catdog', namespace: ns.DAV } ]
    });

    return nockUtils.verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/'),
      mock
    );
  });

  test('should add specified filters to report body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/principals/admin/', 'REPORT', function(body) {
      return body.indexOf('<c:comp-filter name="VCALENDAR"/>') !== -1;
    });

    var req = request.calendarQuery({
      filters: [{
        type: 'comp-filter',
        attrs: { name: 'VCALENDAR' },
      }]
    });

    return nockUtils.verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/'),
      mock
    );
  });

  test('should add timezone to report body', function() {
    var mock = nockUtils.extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/principals/admin/', 'REPORT', function(body) {
      var data = '<c:timezone>BEGIN:VTIMEZONE\nEND:VTIMEZONE</c:timezone>';
      return body.indexOf(data) !== -1;
    });

    var req = request.calendarQuery({
      url: 'http://127.0.0.1:1337/principals/admin/',
      timezone: 'BEGIN:VTIMEZONE\nEND:VTIMEZONE'
    });

    return nockUtils.verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/'),
      mock
    );
  });

  test('should resolve with appropriate data structure', function() {
    nock('http://127.0.0.1:1337')
      .intercept('/', 'REPORT')
      .reply(200, data.calendarQuery);

    var req = request.calendarQuery({
      props: [
        { name: 'getetag', namespace: ns.DAV },
        { name: 'calendar-data', namespace: ns.CALDAV }
      ],
      filters: [ { type: 'comp', attrs: { name: 'VCALENDAR' } } ]
    });

    return xhr.send(req, 'http://127.0.0.1:1337/')
    .then(function(calendars) {
      assert.lengthOf(calendars, 2);
      calendars.forEach(function(calendar) {
        assert.typeOf(calendar.href, 'string');
        assert.operator(calendar.href.length, '>', 0);
        assert.include(calendar.href, '.ics');
        assert.typeOf(calendar.props, 'object');
        assert.typeOf(calendar.props.getetag, 'string');
        assert.operator(calendar.props.getetag.length, '>', 0);
        assert.typeOf(calendar.props.calendarData, 'string');
        assert.operator(calendar.props.calendarData.length, '>', 0);
      });
    });
  });
});
