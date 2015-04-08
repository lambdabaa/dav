import { assert } from 'chai';
import data from '../data';
import * as ns from '../../../lib/namespace';
import nock from 'nock';
import { extend, verifyNock } from './nock_utils';
import { Request, calendarQuery } from '../../../lib/request';
import * as transport from '../../../lib/transport';

suite('request.calendarQuery', function() {
  let xhr;

  setup(function() {
    xhr = new transport.Basic({ username: 'admin', password: 'admin' });
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should return request.Request', function() {
    assert.instanceOf(
      calendarQuery({
        props: [],
        depth: 1
      }),
      Request
    );
  });

  test('should set depth header', function() {
    let mock = nock('http://127.0.0.1:1337')
      .matchHeader('Depth', 1)
      .intercept('/principals/admin/', 'REPORT')
      .reply(200);

    let req = calendarQuery({
      props: [ { name: 'calendar-data', namespace: ns.CALDAV } ],
      depth: 1
    });

    return verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/'),
      mock
    );
  });

  test('should add specified props to report body', function() {
    let mock = extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/principals/admin/', 'REPORT', body => {
      return body.indexOf('<d:catdog />') !== -1;
    });

    let req = calendarQuery({
      props: [ { name: 'catdog', namespace: ns.DAV } ]
    });

    return verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/'),
      mock
    );
  });

  test('should add specified filters to report body', function() {
    let mock = extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/principals/admin/', 'REPORT', body => {
      return body.indexOf('<c:comp-filter name="VCALENDAR"/>') !== -1;
    });

    let req = calendarQuery({
      filters: [{
        type: 'comp-filter',
        attrs: { name: 'VCALENDAR' },
      }]
    });

    return verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/'),
      mock
    );
  });

  test('should add timezone to report body', function() {
    let mock = extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/principals/admin/', 'REPORT', body => {
      let data = '<c:timezone>BEGIN:VTIMEZONE\nEND:VTIMEZONE</c:timezone>';
      return body.indexOf(data) !== -1;
    });

    let req = calendarQuery({
      url: 'http://127.0.0.1:1337/principals/admin/',
      timezone: 'BEGIN:VTIMEZONE\nEND:VTIMEZONE'
    });

    return verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/'),
      mock
    );
  });

  test('should resolve with appropriate data structure', async function() {
    nock('http://127.0.0.1:1337')
      .intercept('/', 'REPORT')
      .reply(200, data.calendarQuery);

    let req = calendarQuery({
      props: [
        { name: 'getetag', namespace: ns.DAV },
        { name: 'calendar-data', namespace: ns.CALDAV }
      ],
      filters: [ { type: 'comp', attrs: { name: 'VCALENDAR' } } ]
    });

    let calendars = await xhr.send(req, 'http://127.0.0.1:1337/');
    assert.lengthOf(calendars, 2);
    calendars.forEach(calendar => {
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
