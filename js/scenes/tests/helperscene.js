var math = require('../../smokingmirror/math') ;
var Curve = require('../../curve') ;
var Model = require('../../smokingmirror/model') ;
var Loader = require('../../smokingmirror/loader') ;
var Helpers = require('../../smokingmirror/helpers') ;
var util = require('../../util') ;

var HelperTesterScene = function (game) {
  this.game = game ;
  this.name = 'HelperTester' ;
} ;


HelperTesterScene.prototype = {
  setup: function () {

  },

  destroy: function() {
  },

  update: function(dt) {


  },

  render: function() {
    //this.player.render(this.game.modelGraphics) ;
    this.game.modelGraphics.lineStyle (4, 0xFF00FF, 1) ;

    Helpers.renderPoint (this.game.wireframeRender, this.game.modelGraphics, new math.Vector3 (0, 0, 0), 0.05) ;
  }

};

module.exports = HelperTesterScene ;
