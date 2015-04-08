import { assert } from 'chai';
import * as namespace from '../../../lib/namespace';
import nock from 'nock';
import { extend, verifyNock } from './nock_utils';
import { Request, syncCollection } from '../../../lib/request';
import * as transport from '../../../lib/transport';

suite('request.syncCollection', function() {
  let xhr;

  setup(function() {
    xhr = new transport.Basic({ username: 'admin', password: 'admin' });
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should return request.Request', function() {
    assert.instanceOf(
      syncCollection({
        syncLevel: 1,
        syncToken: 'abc123',
        props: [
          { name: 'getetag', namespace: namespace.DAV },
          { name: 'calendar-data', namespace: namespace.CALDAV }
        ]
      }),
      Request
    );
  });

  test('should add props to request body', function() {
    let mock = extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody(
      '/principals/admin/default/',
      'REPORT',
      function(body) {
        return body.indexOf('<d:getetag />') !== -1 &&
               body.indexOf('<c:calendar-data />') !== -1;
      }
    );

    let req = syncCollection({
      syncLevel: 1,
      syncToken: 'abc123',
      props: [
        { name: 'getetag', namespace: namespace.DAV },
        { name: 'calendar-data', namespace: namespace.CALDAV }
      ]
    });

    return verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/default/'),
      mock
    );
  });

  test('should set sync details in request body', function() {
    let mock = extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody(
      '/principals/admin/default/',
      'REPORT',
      function(body) {
        return body.indexOf('<d:sync-level>1</d:sync-level>') !== -1 &&
               body.indexOf('<d:sync-token>abc123</d:sync-token>') !== -1;
      }
    );

    let req = syncCollection({
      syncLevel: 1,
      syncToken: 'abc123',
      props: [
        { name: 'getetag', namespace: namespace.DAV },
        { name: 'calendar-data', namespace: namespace.CALDAV }
      ]
    });

    return verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/default/'),
      mock
    );
  });
});
