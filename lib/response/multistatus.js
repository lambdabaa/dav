var Response = require('./response');
var parser = require('../parser/multistatus.js');

var MultiStatus = function(xhr) {

    // Calling parent constructor
    Response.call(this, xhr);
    this.parse(this.getBody());

}

module.exports = MultiStatus;

MultiStatus.prototype = Response.prototype;
MultiStatus.prototype.responses = [];
MultiStatus.prototype.parse = function(data) {

    this.responses = parser(data);

}
