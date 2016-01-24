(function(root) {
  "use strict";

  root.game = {

    version: "0.99.0",

  } ;


  root.game.Loader = function() {
    this.assets = {} ;
  };

  root.game.Loader.prototype = {

  } ;

  root.game.loader = new root.game.Loader() ;

})(typeof window !== "undefined" ? window : this) ;
