/*!
 * TroopJS util/uri module
 * 
 * parts of code from parseUri 1.2.2 Copyright Steven Levithan <stevenlevithan.com>
 * 
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose" ], function URIModule(Compose) {
	var NULL = null;
	var FUNCTION = Function;
	var ARRAY = Array;
	var RE_URI = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
	var RE_QUERY = /(?:^|&)([^&=]*)=?([^&]*)/g;

	var PROTOCOL = "protocol";
	var AUTHORITY = "authority";
	var PATH = "path";
	var QUERY = "query";
	var ANCHOR = "anchor";

	var KEYS = [ "source",
		PROTOCOL,
		AUTHORITY,
		"userInfo",
		"user",
		"password",
		"host",
		"port",
		"relative",
		PATH,
		"directory",
		"file",
		QUERY,
		ANCHOR ];

	// Store current Compose.secure setting
	var SECURE = Compose.secure;

	// Prevent Compose from creating constructor property
	Compose.secure = true;

	var Query = Compose(function Query(str) {
		if (!str) {
			return;
		}

		var self = this;
		var matches;
		var key;
		var value;

		while (matches = RE_QUERY.exec(str)) {
			key = matches[1];

			if (key in self) {
				value = self[key];

				if (value instanceof ARRAY) {
					value[value.length] = matches[2];
				}
				else {
					self[key] = [ value, matches[2] ];
				}
			}
			else {
				self[key] = matches[2];
			}
		}
	}, {
		toString : function toString() {
			var self = this;
			var key = NULL;
			var value = NULL;
			var query = Array();
			var i = 0;
			var j;

			for (key in self) {
				if (self[key] instanceof FUNCTION) {
					continue;
				}

				query[i++] = key;
			}

			query.sort();

			while (i--) {
				key = query[i];
				value = self[key];

				if (value instanceof ARRAY) {
					value = value.slice(0);

					value.sort();

					j = value.length;

					while (j--) {
						value[j] = key + "=" + value[j];
					}

					query[i] = value.join("&");
				}
				else {
					query[i] = key + "=" + value;
				}
			}

			return query.join("&");
		}
	});

	var URI = Compose(function URI(str) {
		if (!str) {
			return;
		}

		var self = this;
		var matches = RE_URI.exec(str);
		var i = 14;
		var value;

		while (i--) {
			value = matches[i];

			if (value) {
				self[KEYS[i]] = value;
			}
		}

		if (QUERY in self) {
			self[QUERY] = Query(self[QUERY]);
		}

	}, {
		toString : function toString() {
			var self = this;
			var uri = [ PROTOCOL , "://", AUTHORITY, PATH, "?", QUERY, "#", ANCHOR ];
			var i;
			var key;

			if (!(PROTOCOL in self)) {
				uri.splice(0, 3);
			}

			if (!(ANCHOR in self)) {
				uri.splice(-2, 2);
			}

			if (!(QUERY in self)) {
				uri.splice(-2, 2);
			}

			i = uri.length;

			while (i--) {
				key = uri[i];

				if (key in self) {
					uri[i] = self[key];
				}
			}

			return uri.join("");
		}
	});

	// Restore Compose.secure setting
	Compose.secure = SECURE;

	return URI;
});