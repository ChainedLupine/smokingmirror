module.exports = function(grunt) {
  grunt.config.merge({
    // ***[[ WEBSERVER ]] ------------------------------------------------------
    webserver: {
      sleipnyr: {
        port: 8088,
        docroot: '../build/',
        websiteRoot: '/',
        interfaceUrls: [],
        filterUrls: [
          //{ url: '/', projectRoot: true, replace: 'always_fail' }
        ]
      }
    },

    // ***[[ jshint ]] ---------------------------------------------------------
    jshint: {
      sleipnyr: {
        src: [
          '../js/**/*.js',
        ]
      }
    },

    // ***[[ browserify ]] -----------------------------------------------------
    browserify: {
      release: {
        src: [
          //'../js/**/*.js'
          '../js/main.js'
        ],
        dest: '../build/js/sleipnyr-bundle.js'
      }
    },

    // ***[[ uglify ]] ---------------------------------------------------------
    uglify: {
      release: {
        src: [
          '../build/js/slepipnyr-bundle.js',
        ],
        dest: '../build/js/slepipnyr-bundle.min.js'
      },
    },

    // ***[[ sync ]] -----------------------------------------------------------
    sync: {
    },

    // ***[[ watch ]] ----------------------------------------------------------
    watch: {
    },
  }); // grunt.config

  grunt.registerTask('sleipnyr', ['jshint:sleipnyr' ]) ;

}; // module.exports
