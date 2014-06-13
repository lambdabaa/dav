'use strict';

var Request = require('./request'),
    dav = require('./dav'),
    parser = require('../parser'),
    template = require('../template');

require('../promise-polyfill.js');

module.exports = function(url, properties, filters) {

    Request.call(this, {
        method  : 'REPORT',
        url     : url,
        headers : {
            'Content-Type' : 'application/xml; charset=utf8',
            'Depth'        : '1',
            'Prefer'       : 'return-minimal'
        },
        body : template.calendarQuery({
            props: properties,
            filters: [filters]
        })
    });

}

module.exports.prototype = Object.create(Request.prototype);

