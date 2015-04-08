import { assert } from 'chai';
import data from '../data';
import * as namespace from '../../../lib/namespace';
import nock from 'nock';
import { extend, verifyNock } from './nock_utils';
import { Request, propfind } from '../../../lib/request';
import * as transport from '../../../lib/transport';

suite('request.propfind', function() {
  let xhr;

  setup(function() {
    xhr = new transport.Basic({ user: 'admin', password: 'admin' });
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should return request.Request', function() {
    assert.instanceOf(
      propfind({
        props: [ { name: 'catdog', namespace: namespace.DAV } ],
        depth: '0'
      }),
      Request
    );
  });

  test('should set depth header', function() {
    let mock = nock('http://127.0.0.1:1337')
      .matchHeader('Depth', '0')  // Will only get intercepted if Depth => 0.
      .intercept('/', 'PROPFIND')
      .reply(200);

    let req = propfind({
      props: [ { name: 'catdog', namespace: namespace.DAV } ],
      depth: '0'
    });

    return verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337'),
      mock
    );
  });

  test('should add specified properties to propfind body', function() {
    let mock = extend(nock('http://127.0.0.1:1337'));
    mock.matchRequestBody('/', 'PROPFIND', function(body) {
      return body.indexOf('<d:catdog />') !== -1;
    });

    let req = propfind({
      props: [ { name: 'catdog', namespace: namespace.DAV } ],
      depth: '0'
    });

    return verifyNock(xhr.send(req, 'http://127.0.0.1:1337'), mock);
  });

  test('should resolve with appropriate data structure', async function() {
    nock('http://127.0.0.1:1337')
      .intercept('/', 'PROPFIND')
      .reply(200, data.propfind);

    let req = propfind({
      props: [
        { name: 'displayname', namespace: namespace.DAV },
        { name: 'getctag', namespace: namespace.CALENDAR_SERVER },
        {
          name: 'supported-calendar-component-set',
          namespace: namespace.CALDAV
        }
      ],
      depth: 1
    });

    let responses = await xhr.send(req, 'http://127.0.0.1:1337/');

    assert.isArray(responses);
    responses.forEach(response => {
      assert.typeOf(response.href, 'string');
      assert.operator(response.href.length, '>', 0);
      assert.ok('props' in response);
      assert.typeOf(response.props, 'object');
      if ('displayname' in response.props) {
        assert.typeOf(response.props.displayname, 'string');
        assert.operator(response.props.displayname.length, '>', 0);
      }
      if ('components' in response.props) {
        assert.isArray(response.props.components);
        assert.include(response.props.components, 'VEVENT');
      }
    });
  });
});
