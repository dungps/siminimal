var _			= require('lodash');
var config 		= require('../config');
var hbs 		= require('express-hbs');
var functions 	= require('./functions');

var hbs_helper = {
	foreach: function(context, options) {
		var ret = '';
		for(var i=0; i<context.length; i++) {
			ret = ret + options.fn(context[i]);
		}
		return ret;
	},

	assets: function(context, options) {
		return new hbs.handlebars.SafeString(functions.home(context));
	},

	content: function(options) {
		return new hbs.handlebars.SafeString(this.content);
	},

	title: function(options) {
		return new hbs.handlebars.SafeString(this.title);
	},

	is: function(context, options) {
		if (!_.isString(context)) {
			console.log('Attribute must be a string.');
			return false;
		}

		context = _.split(context, ', ');
		for (var i = 0; i < context.length; i++) {
			if ( this.current == context[i] ) {
				return options.fn(this);
			}
		}

		return options.inverse(this);
	},

	body_class: function(context, options) {
		var current = this.current;
		var classes = [];

		classes.push('theme-' + config.options.theme);
		classes.push(current + '-template');

		if ( this.paged ) {
			classes.push('paged-' + this.paged);
		}
		classes = _.join(classes,' ');
		return new hbs.handlebars.SafeString(classes + ' ' + context);
	},

	post_class: function(context, options) {
		var classes = ['hentry'];
		var current = this.current;
		classes.push(current);
		classes = _.join(classes,' ');
		return new hbs.handlebars.SafeString(classes + ' ' + context);
	},

	url: function(options) {
		return new hbs.handlebars.SafeString(functions.home(this.url));
	}
}

module.exports = hbs_helper;