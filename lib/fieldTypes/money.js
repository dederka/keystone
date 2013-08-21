/*!
 * Module dependencies.
 */

var util = require('util'),
	numeral = require('numeral'),
	utils = require('../utils'),
	super_ = require('../field');

/**
 * Money FieldType Constructor
 * @extends Field
 * @api public
 */

function money(list, path, options) {
	this._nativeType = Number;
	this._format = true;
	money.super_.call(this, list, path, options);
};

/*!
 * Inherit from Field
 */

util.inherits(money, super_);


/**
 * Formats the field value
 * 
 * @api public
 */

money.prototype.format = function(item, format) {
	return numeral(item.get(this.path)).format(format || '$0,0.00');
}


/*!
 * Export class
 */

exports = module.exports = money;