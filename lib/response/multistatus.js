var Response = require('./response');

var MultiStatus = function(xhr) {

    // Calling parent constructor
    Response.call(this, xhr);

}

module.exports = MultiStatus;

MultiStatus.prototype = Object.create(Response);
MultiStatus.prototype.multiStatus = [];
