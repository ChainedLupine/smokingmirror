"use strict";

module.exports = function (grunt) {

	var createWebserver = function () {
		var http = require("http"),
		url = require("url"),
		path = require("path"),
		fs = require("fs") ;

		var port = this.data.port ;
		var docroot = this.data.docroot ;
		var filterUrls = this.data.filterUrls ;
		var interfaceUrls = this.data.interfaceUrls ;
		var websiteRoot = this.data.websiteRoot ;

		var currRef = this ;

		http.createServer(function(request, response) {

			var parsedUri = url.parse(request.url, true) ;

			var uri = decodeURIComponent(parsedUri.pathname) ;

			// Check for script URLs

			var matched = false ;

			interfaceUrls.forEach (function (item) {
				if (matched) {
					return ;
				}

				if (uri.match (item.url)) {
					grunt.log.writeln ('URL interface URL matched for ' + uri) ;

					response = item.exec (parsedUri, response) ;


					matched = true ;
				}
			}) ;

			if (matched) {
				return ;
			}

			// strip off websiteRoot
			if (websiteRoot.length > 0) {
				var reUri = new RegExp ('^' + websiteRoot) ;
				if (uri.match (reUri)) {
					grunt.log.verbose.writeln ('Found websiteRoot, stripping ' + websiteRoot + ' from ' + uri) ;
					uri = uri.replace (reUri, '') ;
				}
			}

			// check for remaps
			var addDocroot = true ;
			matched = false ;

			filterUrls.forEach (function (item) {
				if (matched) {
					return ;
				}

				if (item.url.length > 0 && uri.match (item.url)) {
					var newUri = uri.replace (item.url, item.replace) ;
					grunt.log.writeln ('URL rewrite, matched ' + uri + ', modified to ' + newUri) ;
					uri = newUri ;
					if (item.projectRoot) {
						addDocroot = false ;
					}
					matched = true ;
				}
			}) ;

			var filename ;
			if (addDocroot) {
				filename = path.join(docroot, uri);
			} else {
				filename = uri ;
			}

			//grunt.log.writeln ('Filename= ' + filename) ;

			var contentTypesByExtension = {
				'.html': "text/html",
				'.css':  "text/css",
				'.js':   "text/javascript"
			};

			fs.exists(filename, function(exists) {
				if(!exists) {
					response.writeHead(404, {"Content-Type": "text/plain"});
					response.write("404 Not Found\n");
					response.end();
					grunt.log.writeln (('Unable to find file ' + filename + '!').red) ;
					return;
				}

				if (fs.statSync(filename).isDirectory()) filename += '/index.html';

				fs.readFile(filename, "binary", function(err, file) {
					if(err) {
						response.writeHead(500, {"Content-Type": "text/plain"});
						response.write(err + "\n");
						response.end();
						grunt.log.writeln (('Unable to read file ' + filename + '!').red) ;
						return;
					}

					var headers = {};
					var contentType = contentTypesByExtension[path.extname(filename)];
					if (contentType) headers["Content-Type"] = contentType;
					response.writeHead(200, headers);
					response.write(file, "binary");
					response.end();
				});
			});
		}).listen(parseInt(port, 10));

		grunt.log.writeln('Static file server running at ' + ('http://localhost:' + port + '/\n').green + ' -- CTRL + C to stop!');

		currRef.async();
	}

	return {
		getConfigData: function(parsedUri, response) {

			//console.log (JSON.stringify (parsedUri)) ;
			grunt.log.writeln ('Request for config data, sending.') ;

			var headers = {};
			headers["Content-Type"] = 'application/json';
			response.writeHead(200, headers);
			response.write(String(JSON.stringify (rtype_settings)), "binary");
			response.end();

			return response ;

		},

		getNavLinks: function (parsedUri, response) {
			grunt.log.writeln ('Request for nav links, sending.') ;

			var headers = {};
			headers["Content-Type"] = 'application/json';
			response.writeHead(200, headers);
			response.write(String(JSON.stringify (rtype.bydo.generateNavLinks())), "binary");
			response.end();

			return response ;

		},

		getSnippets: function (parsedUri, response) {
			grunt.log.writeln ('Request for all html snippets, sending.') ;

			var headers = {};
			headers["Content-Type"] = 'application/json';
			response.writeHead(200, headers);
			response.write(String(JSON.stringify (rtype.bydo.getAllSnippets())), "binary");
			response.end();

			return response ;

		},

		getListTemplates: function (parsedUri, response) {
			grunt.log.writeln ('Request for all BYDO template filenames, sending.') ;

			var headers = {};
			headers["Content-Type"] = 'application/json';
			response.writeHead(200, headers);

			var results = String(JSON.stringify (rtype.bydo.getBYDOFilenames())) ;
			response.write(results, "binary");
			response.end();

			return response ;

		},

		getTemplate: function (parsedUri, response) {
			//grunt.log.writeln (JSON.stringify (parsedUri)) ;

			var filename = parsedUri.query.p ;
			grunt.log.writeln ('Request for BYDO template named ' + filename + ', sending.') ;

			var data = rtype.bydo.getBYDOByShortFilename (filename) ;

			var headers = {};
			headers["Content-Type"] = 'text/plain';
			response.writeHead(200, headers);

			response.write(String(data), "binary");
			response.end();

			return response ;

		},

		createWebserver: createWebserver


	}
} ;

