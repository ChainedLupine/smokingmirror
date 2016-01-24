/*jslint node: true */

module.exports = function (grunt) {
  'use strict';

  var webserver = require('./webserver.js')(grunt) ;

  grunt.util.linefeed = '\n';

  grunt.initConfig({
    // ***[[ WEBSERVER ]] ------------------------------------------------------
    webserver: {
      website: {
        port: 8088,
        docroot: '../build/',
        websiteRoot: '/',
        interfaceUrls: [
        ],
        filterUrls: [
          //{ url: '/', projectRoot: true, replace: 'always_fail' }
        ]
      }
    },

    // ***[[ jshint ]] ---------------------------------------------------------
    jshint: {
      options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true,
				globals: {
					require: true,
					define: true,
					requirejs: true,
					describe: true,
					expect: true,
					it: true,
          console: true
				},
				ignores: [
				],
				node: false
			},
      grunt: [
				'gruntfile.js',
			],
			scripts: [
				'../js/**/*.js',
			]
    },

    // ***[[ browserify ]] -----------------------------------------------------
    browserify: {
      release: {
        src: [
          //'../js/**/*.js'
          '../js/main.js'
        ],
        dest: '../build/js/slepinyr-bundle.js'
      }
    },

    // ***[[ uglify ]] ---------------------------------------------------------
    uglify: {
			release: {
				src: [
          '../build/js/slepinyr-bundle.js',
				],
				dest: '../build/js/slepinyr-bundle-min.js'
			},
    },

    // ***[[ sync ]] -----------------------------------------------------------
    sync: {
      assets: {
        files: [{
          cwd: '../assets',
          src: [
            '**/*.obj',
          ],
          dest: '../build/assets',
        }],
        //pretend: true,
        verbose: true
      },
      libraries: {
        files: [{
          cwd: '../libs',
          src: [
            'dat.gui/**/*.js',
            'pixi/**/*.js'
          ],
          dest: '../build/libs',
        }],
        verbose: true
      },
      html: {
        files: [{
          cwd: '../html',
          src: [
            'index.html',
          ],
          dest: '../build',
        }],
        //pretend: true,
        verbose: true
      },
    },

    // ***[[ watch ]] ----------------------------------------------------------
    watch: {
      grunt: {
        files: [ 'gruntfile.js' ],
        tasks: [ 'jshint:grunt' ],
        options: {
          reload: true
        }
      },
      scripts: {
        files: [ '../js/**/*.js' ],
        tasks: [ 'jshint:scripts', 'browserify', 'uglify' ],
        options: {
          spawn: false,
        },
      },
      assets: {
        files: [ '../assets/**/*.*' ],
        tasks: [ 'sync' ],
      },
    },
  });


  //grunt.loadNpmTasks('webserver') ;

  grunt.loadNpmTasks('grunt-sync') ;
  grunt.loadNpmTasks('grunt-contrib-jshint') ;
  grunt.loadNpmTasks('grunt-contrib-uglify') ;
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerMultiTask('webserver',
                          'Creates a web server.',
                          webserver.createWebserver);

  grunt.registerTask('default', ['jshint', 'browserify', 'uglify', 'sync']) ;

};
