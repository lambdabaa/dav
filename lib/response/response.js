'use strict';

function Response(xhr) {

    this.xhr = xhr;

}
module.exports = Response;

Response.prototype = {

    getStatus : function() {

        return this.xhr.status;

    },

    getHeader : function(name) {

        return this.xhr.getResponseHeader(name);

    },

    getBody : function() {

        return this.xhr.responseText;

    }

};
