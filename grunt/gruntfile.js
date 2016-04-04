/*jslint node: true */

module.exports = function (grunt) {
  'use strict';

  var webserver = require('./webserver.js')(grunt) ;

  grunt.util.linefeed = '\n';

  grunt.initConfig({
    pkg: require('./package.json'),
  });

  grunt.config.init({
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
    }, // -jshint

    clean: {
      options: {
        force: true,
      },
      engine: [
        '../build/'
      ]
    },

    watch: {
      grunt: {
        files: [
          'gruntfile.js',
          'configs/*.js'
        ],
        tasks: ['jshint:grunt'],
        options: {
          reload: true
        }
      },
      engine: {
        files: ['../js/**/*.js'],
        tasks: ['jshint:engine', 'browserify:engine', 'uglify:engine'],
      },
    }, // watch

    browserify: {
      options: {
        plugin: [
          [
            'remapify', [
              {
                src: '**/*.js',  // glob for the files to remap
                expose: 'smokingmirror', // this will expose `__dirname + /client/views/home.js` as `views/home.js`
                cwd: '../js'  // defaults to process.cwd()
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
    },

    uglify: {
      options: {
        sourceMap: true,
      },
      engine: {
        src: [
          '../build/js/smokingmirror-bundle.js',
        ],
        dest: '../build/js/smokingmirror-bundle.min.js'
      },
    }, // uglify



  }) ;

  require('./configs/config-examples.js')(grunt) ;

  //grunt.loadNpmTasks('webserver') ;

  grunt.loadNpmTasks('grunt-sync') ;
  grunt.loadNpmTasks('grunt-contrib-jshint') ;
  grunt.loadNpmTasks('grunt-contrib-uglify') ;
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerMultiTask('webserver',
                          'Creates a web server.',
                          webserver.createWebserver);

  //grunt.registerTask('default', ['jshint', 'browserify', 'uglify', 'sync']) ;
  grunt.registerTask('default-jshint', ['jshint:grunt']) ;
  grunt.registerTask('default-watch', ['watch:grunt']) ;
  grunt.registerTask('engine-jshint', ['jshint:engine']) ;
  grunt.registerTask('engine-watch', ['watch:engine']) ;
  grunt.registerTask('engine-build', ['jshint:engine', 'browserify:engine', 'uglify:engine']) ;

};
