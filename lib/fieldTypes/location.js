/*!
 * Module dependencies.
 */

var _ = require('underscore'),
	keystone = require('../../'),
	querystring = require('querystring'),
	https = require('https'),
	util = require('util'),
	utils = require('../utils'),
	super_ = require('../field');

/**
 * Location FieldType Constructor
 * @extends Field
 * @api public
 */

function location(list, path, options) {
	this._format = true;
	this.enableMapsAPI = keystone.get('google api key') ? true : false;
	if (!options.defaults) {
		options.defaults = {};
	}
	location.super_.call(this, list, path, options);
};

/*!
 * Inherit from Field
 */
 
util.inherits(location, super_);


/**
 * Registers the field on the List's Mongoose Schema.
 * 
 * Adds String properties for .first and .last location, and a virtual
 * with get() and set() methods for .full
 * 
 * @api public
 */

location.prototype.addToSchema = function() {
	
	var schema = this.list.schema,
		options = this.options;
	
	var paths = this.paths = {
		number: this._path.append('.number'),
		name: this._path.append('.name'),
		street1: this._path.append('.street1'),
		street2: this._path.append('.street2'),
		suburb: this._path.append('.suburb'),
		state: this._path.append('.state'),
		postcode: this._path.append('.postcode'),
		country: this._path.append('.country'),
		geo: this._path.append('.geo'),
		serialised: this._path.append('.serialised'),
		improve: this._path.append('_improve')
	};
	
	var getFieldDef = function(type, key) {
		var def = { type: type };
		if (options.defaults[key]) {
			def.default = options.defaults[key];
		}
		return def;
	}
	
	schema.nested[this.path] = true;
	schema.add({
		number: getFieldDef(String, 'number' ),
		name: getFieldDef(String, 'name' ),
		street1: getFieldDef(String, 'street1' ),
		street2: getFieldDef(String, 'street2' ),
		street3: getFieldDef(String, 'street3' ),
		suburb: getFieldDef(String, 'suburb' ),
		state: getFieldDef(String, 'state' ),
		postcode: getFieldDef(String, 'postcode' ),
		country: getFieldDef(String, 'country' ),
		geo: { type: [Number], index: '2dsphere' }
	}, this.path + '.');

	schema.virtual(paths.serialised).get(function() {
		return _.compact([
			this.get(paths.number),
			this.get(paths.name),
			this.get(paths.street1),
			this.get(paths.street2),
			this.get(paths.suburb),
			this.get(paths.state),
			this.get(paths.postcode),
			this.get(paths.country)
		]).join(', ');
	});
	
}


/**
 * Formats the field value
 * 
 * @api public
 */

location.prototype.format = function(item) {
	return item.get(this.paths.serialised);
}


/**
 * Detects whether the field has been modified
 * 
 * @api public
 */

location.prototype.isModified = function(item) {
	return item.isModified(this.paths.number)
		|| item.isModified(this.paths.name)
		|| item.isModified(this.paths.street1)
		|| item.isModified(this.paths.street2)
		|| item.isModified(this.paths.suburb)
		|| item.isModified(this.paths.state)
		|| item.isModified(this.paths.postcode)
		|| item.isModified(this.paths.country)
		|| item.isModified(this.paths.geo);
}


/**
 * Validates that a value for this field has been provided in a data object
 * 
 * This should probably be more flexible / robust;
 * Currently it just checks for a stree1 and suburb value.
 * 
 * @api public
 */

location.prototype.validateInput = function(data) {
	return (data[this.paths.street1] && data[this.paths.suburb]) ? true : false;
}


/**
 * Updates the value for this field in the item from a data object
 * 
 * @api public
 */

location.prototype.updateItem = function(item, data) {
	
	var paths = this.paths;
	
	var setValue = function(key) {
		if (paths[key] in data && data[paths[key]] != item.get(paths[key])) {
			item.set(paths[key], data[paths[key]] || null);
		}
	}
	
	_.each(['number', 'name', 'street1', 'street2', 'suburb', 'state', 'postcode', 'country'], setValue);
	
	var oldGeo = item.get(paths.geo),
		newGeo = data[paths.geo];
	
	if ('string' == typeof newGeo) {
		newGeo = newGeo.split();
	}
	
	if (newGeo && newGeo.length == 2) {
		if (newGeo[0] != oldGeo[0] || newGeo[1] != oldGeo[1]) {
			console.log('setting geo');
			item.set(paths.geo, newGeo);
		}
	}
	
}


/*!
 * Export class
 */

exports = module.exports = location;