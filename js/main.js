/* globals dat */

// patch dat.gui
dat.GUI.prototype.removeFolder = function(name) {
  var folder = this.__folders[name];
  if (!folder) {
    return;
  }
  folder.close();
  this.__ul.removeChild(folder.domElement.parentNode);
  delete this.__folders[name];
  this.onResize();
} ;


var smokingmirror = require('./smokingmirror') ;
var Game = require ('./game') ;

var game = new Game() ;

$(document).ready (function() {
  game.init() ;

});
