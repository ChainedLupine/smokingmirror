module.exports = function(grunt) {
  grunt.config.merge({
    // ***[[ WEBSERVER ]] ------------------------------------------------------
    webserver: {
      examples: {
        port: 8088,
        docroot: '../project/examples/build/',
        websiteRoot: '/',
        interfaceUrls: [],
        filterUrls: [
          //{ url: '/', projectRoot: true, replace: 'always_fail' }
        ]
      }
    },

    // ***[[ clean ]] ----------------------------------------------------------
    clean: {
      examples: [
        '../project/examples/build/'
      ]
    },


    // ***[[ jshint ]] ---------------------------------------------------------
    jshint: {
      examples: {
        src: [
          '../project/examples/js/**/*.js',
        ]
      }
    },

    // ***[[ browserify ]] -----------------------------------------------------
    browserify: {
      examples: {
        src: [
          '../project/examples/js/start.js'
        ],
        dest: '../project/examples/build/js/examples-bundle.js'
      }
    },

    // ***[[ uglify ]] ---------------------------------------------------------
    uglify: {
      examples: {
        src: [
          '../project/examples/build/js/examples-bundle.js',
        ],
        dest: '../project/examples/build/js/examples-bundle.min.js'
      },
    },

    // ***[[ sync ]] -----------------------------------------------------------
    sync: {
      examples_assets: {
        files: [{
          cwd: '../project/examples/assets',
          src: [
            '**/*.obj',
            '**/*.mp3',
            '**/*.png',
            '**/*.jpg',
          ],
          dest: '../project/examples/build/assets',
        }],
        //pretend: true,
        verbose: true
      },
      examples_libraries: {
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
          ],
          dest: '../project/examples/build/libs',
        }],
        verbose: true
      },
      examples_engine: {
        files: [{
          cwd: '../build/js',
          src: [
            '*.js',
            '*.map',
          ],
          dest: '../project/examples/build/libs/smokingmirror',
        }],
        verbose: true
      },
      examples_html: {
        files: [{
          cwd: '../project/examples/html',
          src: [
            'index.html',
          ],
          dest: '../project/examples/build',
        }],
        //pretend: true,
        verbose: true
      },
    },

    // ***[[ watch ]] ----------------------------------------------------------
    watch: {
      examples_scripts: {
        files: ['../project/examples/js/**/*.js'],
        tasks: ['jshint:examples', 'browserify:examples', 'uglify:examples', 'sync'],
      },
      examples_assets: {
        files: [
          '../project/examples/assets/**/*.*',
          '../project/examples/html/**/*.html',
          '../build/js/smokingmirror*.js'
        ],
        tasks: ['sync:examples_assets', 'sync:examples_libraries', 'sync:examples_engine', 'sync:examples_html'],
      },
    }
  }); // grunt.config

  grunt.registerTask('examples-webserver', [
    'webserver:examples'
  ]) ;

  grunt.registerTask('examples-build', [
    'default-jshint', 'jshint:engine', 'jshint:examples',
    'browserify:engine', 'browserify:examples',
    'sync:examples_assets', 'sync:examples_libraries', 'sync:examples_engine', 'sync:examples_html'
  ]) ;

  grunt.registerTask('examples-watch', [
    'watch'
  ]) ;

}; // module.exports
