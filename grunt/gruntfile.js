/*jslint node: true */

var defaultProjectName = "examples" ;

module.exports = function (grunt) {
  'use strict';

  var webserver = require('./webserver.js')(grunt) ;

  grunt.util.linefeed = '\n';

  grunt.initConfig({
    pkg: require('./package.json'),
  });

  grunt.config.init({
    base_jshint: {
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
          console: true,
          '$': true,
          '_': true,
          PIXI: true,
          module: true,
          SmokingMirror: true,
        },
        ignores: [],
        node: false
      },
      grunt: {
        src:  [
          'gruntfile.js',
          'config/*.js'
        ]
      },
      engine:{
        src: [
          '../js/**/*.js',
        ]
      }
    }, // base_jshint

    base_clean: {
      options: {
        force: true,
      },
      engine: [
        '../build/'
      ]
    }, // base_clean

    base_watch: {
      options: {
        livereload: true,
      },
      grunt: {
        files: [
          'gruntfile.js',
          'configs/*.js'
        ],
        tasks: ['base_jshint:grunt', 'watch'],
        options: {
          reload: true
        }
      },
      engine: {
        files: ['../js/**/*.js'],
        tasks: ['base_jshint:engine', 'base_browserify:engine', 'base_uglify:engine'],
      },
    }, // base_watch

    base_browserify: {
      options: {
        plugin: [
          [
            'remapify', [
              {
                src: '**/*.js',
                expose: 'smokingmirror',
                cwd: '../js'
              }
            ]
          ]
        ]
      },

      engine: {
        src: [
          '../js/index.js'
        ],
        dest: '../build/js/smokingmirror-bundle.js'
      }
    }, // base_browserify

    base_uglify: {
      options: {
        sourceMap: true,
      },
      engine: {
        src: [
          '../build/js/smokingmirror-bundle.js',
        ],
        dest: '../build/js/smokingmirror-bundle.min.js'
      },
    }, // base_uglify
  }) ; // grunt.config.init

  //require('./configs/config-examples.js')(grunt) ;

  grunt.loadNpmTasks('grunt-sync') ;
  grunt.loadNpmTasks('grunt-contrib-jshint') ;
  grunt.loadNpmTasks('grunt-contrib-uglify') ;
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.task.renameTask('clean', 'base_clean') ;
  grunt.task.renameTask('watch', 'base_watch') ;
  grunt.task.renameTask('jshint', 'base_jshint') ;
  grunt.task.renameTask('browserify', 'base_browserify') ;
  grunt.task.renameTask('uglify', 'base_uglify') ;
  grunt.task.renameTask('sync', 'base_sync') ;

  grunt.task.registerTask ('build', [
    'base_clean:engine', 'clean',
    'base_jshint:engine', 'jshint',
    'base_browserify:engine', 'browserify',
    'base_uglify:engine', 'uglify',
    'sync'
  ]) ;

  grunt.registerMultiTask('webserver',
                          'Creates a web server.',
                          webserver.createWebserver);

  grunt.registerTask ('host', function (projectName) {
    if (arguments.length === 0) {
      projectName = defaultProjectName ;
    }

    grunt.log.writeln ("Creating webserver host for " + projectName.yellow) ;
    grunt.config.merge ({
      webserver: {
        project: {
          port: 8088,
          docroot: '../project/' + projectName + '/build/',
          websiteRoot: '/',
          interfaceUrls: [],
          filterUrls: [
            //{ url: '/', projectRoot: true, replace: 'always_fail' }
          ]
        }
      }
    }) ; // merge

    grunt.task.run ("webserver:project") ;
  }) ; // host

  grunt.registerTask ('clean', function (projectName) {
    if (arguments.length === 0) {
      projectName = defaultProjectName ;
    }

    grunt.config.merge ({
      base_clean: {
        project: [
          '../project/' + projectName + '/build/'
        ]
      }
    }) ; // merge base_clean

    grunt.log.writeln ("Cleaning for " + projectName.yellow) ;
    grunt.task.run ("base_clean:project") ;
  }) ; // clean

  grunt.registerTask ('jshint', function (projectName) {
    if (arguments.length === 0) {
      projectName = defaultProjectName ;
    }

    grunt.config.merge ({
      base_jshint: {
        project: {
          src: [
            '../project/' + projectName + '/js/**/*.js',
          ]
        }
      }
    }) ; // merge base_jshint

    grunt.log.writeln ("Linting for " + projectName.yellow) ;
    //grunt.task.run ("base_jshint:grunt") ;
    //grunt.task.run ("base_jshint:engine") ;
    grunt.task.run ("base_jshint:project") ;
  }) ; // clean

  grunt.registerTask ('browserify', function (projectName) {
    if (arguments.length === 0) {
      projectName = defaultProjectName ;
    }

    grunt.config.merge ({
      base_browserify: {
        project: {
          src: [
            '../project/' + projectName + '/js/start.js'
          ],
          dest: '../project/' + projectName + '/build/js/' + projectName + '-bundle.js'
        }
      }
    }) ; // merge base_browserify

    grunt.log.writeln ("Browserify for " + projectName.yellow) ;
    //grunt.task.run ("base_browserify:engine") ;
    grunt.task.run ("base_browserify:project") ;
  }) ; // browserify

  grunt.registerTask ('uglify', function (projectName) {
    if (arguments.length === 0) {
      projectName = defaultProjectName ;
    }

    grunt.config.merge ({
      base_uglify: {
        project: {
          src: [
            '../project/' + projectName + '/build/js/' + projectName + '-bundle.js',
          ],
          dest: '../project/' + projectName + '/build/js/' + projectName + '-bundle.min.js'
        },
      }
    }) ; // merge base_uglify

    grunt.log.writeln ("Uglify for " + projectName.yellow) ;
    grunt.task.run ("base_uglify:project") ;
  }) ; // uglify

  grunt.registerTask ('sync', function (projectName) {
    if (arguments.length === 0) {
      projectName = defaultProjectName ;
    }

    grunt.config.merge ({
      base_sync: {
        project_assets: {
          files: [{
            cwd: '../project/' + projectName + '/assets',
            src: [
              '**/*.obj',
              '**/*.mp3',
              '**/*.wav',
              '**/*.png',
              '**/*.jpg',
            ],
            dest: '../project/' + projectName + '/build/assets',
          }],
          //pretend: true,
          verbose: true
        },
        project_libraries: {
          files: [{
            cwd: '../libs',
            src: [
              'dat.gui/**/*.js',
              'dat.gui/**/*.map',
              'pixi/**/*.js',
              'pixi/**/*.map',
              'jquery/**/*.js',
              'jquery/**/*.map',
              'lodash/**/*.js',
              'lodash/**/*.map',
              'stats.js/build/**/*.js',
            ],
            dest: '../project/' + projectName + '/build/libs',
          }],
          verbose: true
        },
        project_engine: {
          files: [{
            cwd: '../build/js',
            src: [
              '*.js',
              '*.map',
            ],
            dest: '../project/' + projectName + '/build/libs/smokingmirror',
          }],
          verbose: true
        },
        project_html: {
          files: [{
            cwd: '../project/' + projectName + '/html',
            src: [
              'index.html',
            ],
            dest: '../project/' + projectName + '/build',
          }],
          //pretend: true,
          verbose: true
        }
      }
    }) ; // merge base_sync

    grunt.log.writeln ("Sync for " + projectName.yellow) ;
    grunt.task.run ("base_sync:project_libraries") ;
    grunt.task.run ("base_sync:project_engine") ;
    grunt.task.run ("base_sync:project_assets") ;
    grunt.task.run ("base_sync:project_html") ;
  }) ; // sync

  grunt.registerTask ('watch', function (projectName) {
    if (arguments.length === 0) {
      projectName = defaultProjectName ;
    }

    grunt.config.merge ({
      base_watch: {
        project_scripts: {
          files: ['../project/' + projectName + '/js/**/*.js'],
          tasks: ['jshint:' + projectName, 'browserify:'  + projectName, 'uglify:'  + projectName],
        },
        project_assets: {
          files: [
            '../project/'  + projectName + '/assets/**/*.*',
            '../project/' + projectName + '/html/**/*.html',
            '../build/js/smokingmirror*.js'
          ],
          tasks: ['sync' ],
        },
      }
    }) ; // merge base_watch

    grunt.log.writeln ("Watch for " + projectName.yellow) ;
    grunt.task.run ("base_watch") ;
  }) ; // watch

  //grunt.log.writeln ("loaded " + process.argv) ;


};
