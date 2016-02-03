module.exports = function(grunt) {
  grunt.config.merge({
    // ***[[ WEBSERVER ]] ------------------------------------------------------
    webserver: {
      gravity_ace: {
        port: 8088,
        docroot: '../project/gravity_ace/build/',
        websiteRoot: '/',
        interfaceUrls: [],
        filterUrls: [
          //{ url: '/', projectRoot: true, replace: 'always_fail' }
        ]
      }
    },

    // ***[[ clean ]] ----------------------------------------------------------
    clean: {
      gravity_ace: [
        '../project/gravity-ace/build/'
      ]
    },


    // ***[[ jshint ]] ---------------------------------------------------------
    jshint: {
      gravity_ace: {
        src: [
          '../project/gravity_ace/js/**/*.js',
        ]
      }
    },

    // ***[[ browserify ]] -----------------------------------------------------
    browserify: {
      gravity_ace: {
        src: [
          '../project/gravity_ace/js/start.js'
        ],
        dest: '../project/gravity_ace/build/js/gravity_ace-bundle.js'
      }
    },

    // ***[[ uglify ]] ---------------------------------------------------------
    uglify: {
      gravity_ace: {
        src: [
          '../project/gravity_ace/build/js/gravity_ace-bundle.js',
        ],
        dest: '../project/gravity_ace/build/js/gravity_ace-bundle.min.js'
      },
    },

    // ***[[ sync ]] -----------------------------------------------------------
    sync: {
      gravity_ace_assets: {
        files: [{
          cwd: '../project/gravity_ace/assets',
          src: [
            '**/*.obj',
            '**/*.mp3',
            '**/*.png',
            '**/*.jpg',
          ],
          dest: '../project/gravity_ace/build/assets',
        }],
        //pretend: true,
        verbose: true
      },
      gravity_ace_libraries: {
        files: [{
          cwd: '../libs',
          src: [
            'dat.gui/**/*.js',
            'dat.gui/**/*.map',
            'pixi/**/*.js',
            'pixi/**/*.map',
            'jquery/**/*.js',
            'jquery/**/*.map',
          ],
          dest: '../project/gravity_ace/build/libs',
        }],
        verbose: true
      },
      gravity_ace_engine: {
        files: [{
          cwd: '../build/js',
          src: [
            '*.js',
            '*.map',
          ],
          dest: '../project/gravity_ace/build/libs/smokingmirror',
        }],
        verbose: true
      },
      gravity_ace_html: {
        files: [{
          cwd: '../project/gravity_ace/html',
          src: [
            'index.html',
          ],
          dest: '../project/gravity_ace/build',
        }],
        //pretend: true,
        verbose: true
      },
    },

    // ***[[ watch ]] ----------------------------------------------------------
    watch: {
      gravity_ace_scripts: {
        files: ['../project/gravity_ace/js/**/*.js'],
        tasks: ['jshint:gravity_ace', 'browserify:gravity_ace', 'uglify:gravity_ace', 'sync'],
      },
      gravity_ace_assets: {
        files: [
          '../project/gravity_ace/assets/**/*.*',
          '../project/gravity_ace/html/**/*.html',
          '../build/js/smokingmirror*.js'
        ],
        tasks: ['sync:gravity_ace_assets', 'sync:gravity_ace_libraries', 'sync:gravity_ace_engine', 'sync:gravity_ace_html'],
      },
    }
  }); // grunt.config

  grunt.registerTask('gravity_ace-webserver', [
    'webserver:gravity_ace'
  ]) ;

  grunt.registerTask('gravity_ace-build', [
    'default-jshint', 'jshint:engine', 'jshint:gravity_ace',
    'browserify:engine', 'browserify:gravity_ace',
    'sync:gravity_ace_assets', 'sync:gravity_ace_libraries', 'sync:gravity_ace_engine', 'sync:gravity_ace_html'
  ]) ;

  grunt.registerTask('gravity_ace-watch', [
    'watch'
  ]) ;

}; // module.exports
