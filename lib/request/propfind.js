'use strict';

var Request = require('./request'),
    dav = require('./dav'),
    parser = require('../parser'),
    template = require('../template');

require('../promise-polyfill.js');

function PropFind(url, properties, depth) {

    Request.call(this, {
        method  : 'PROPFIND',
        url     : url,
        headers : {
            'Content-Type' : 'application/xml; charset=utf8',
            'Depth'        : depth,
            'Prefer'       : 'return-minimal'
        },
        body    : generateBody(properties)
    });

}

module.exports = PropFind;

PropFind.prototype = Object.create(Request.prototype);

function generateBody(properties) {

    // TODO: should use the DOM or equivalent
    var body = '<?xml version="1.0"?><d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/"><d:prop>\n';

    for(var ii in properties) {
        body+="  <" + properties[ii] + " />\n";
    }

    body+='</d:prop></d:propfind>';
    return body;

}
