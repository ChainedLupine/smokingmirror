

var smokingmirror = require('./smokingmirror') ;
var Game = require ('./game') ;

var game = new Game() ;

$(document).ready (function() {
  game.init() ;

  console.log (smokingmirror.Math.degToRad (360) / 2) ;

  var vec3 = new smokingmirror.Math.Vector3() ;

  console.log (vec3) ;

});
