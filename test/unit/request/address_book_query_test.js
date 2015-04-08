import { assert } from 'chai';
import data from '../data';
import nock from 'nock';
import { extend, verifyNock } from './nock_utils';
import * as ns from '../../../lib/namespace';
import { Request, addressBookQuery } from '../../../lib/request';
import * as transport from '../../../lib/transport';

suite('request.addressBookQuery', function() {
  let xhr;

  setup(function() {
    xhr = new transport.Basic({ username: 'admin', password: 'admin' });
  });

  teardown(function() {
    nock.cleanAll();
  });

  test('should return request.Request', function() {
    assert.instanceOf(
      addressBookQuery({
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

    let req = addressBookQuery({
      props: [ { name: 'address-data', namespace: ns.CARDDAV } ],
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

    let req = addressBookQuery({
      props: [ { name: 'catdog', namespace: ns.DAV } ]
    });

    return verifyNock(
      xhr.send(req, 'http://127.0.0.1:1337/principals/admin/'),
      mock
    );
  });

  test('should resolve with appropriate data structure', async function() {
    nock('http://127.0.0.1:1337')
      .intercept('/', 'REPORT')
      .reply(200, data.addressBookQuery);


    let req = addressBookQuery({
      props: [
        { name: 'getetag', namespace: ns.DAV },
        { name: 'address-data', namespace: ns.CARDDAV }
      ]
    });

    let addressBooks = await xhr.send(req, 'http://127.0.0.1:1337');
    assert.lengthOf(addressBooks, 2);
    addressBooks.forEach(addressBook => {
      assert.typeOf(addressBook.href, 'string');
      assert.operator(addressBook.href.length, '>', 0);
      assert.typeOf(addressBook.props, 'object');
    });
  });
});
