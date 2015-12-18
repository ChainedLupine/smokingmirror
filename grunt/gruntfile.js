module.exports = function (grunt) {
  'use strict';

  var webserver = require('./webserver.js')(grunt) ;

  grunt.util.linefeed = '\n';

  grunt.initConfig({
    webserver: {
      website: {
        port: 8088,
        docroot: '..',
        websiteRoot: '/',
        interfaceUrls: [
        ],
        filterUrls: [
          //{ url: '/', projectRoot: true, replace: 'always_fail' }
        ]
      }
    },
  });


  //grunt.loadNpmTasks('webserver') ;


  grunt.registerMultiTask('webserver',
                          'Creates a web server.',
                          webserver.createWebserver);

  grunt.registerTask('default', ['webserver']);

};
