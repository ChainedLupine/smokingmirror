var Vector3 = require('./smokingmirror/math/vector3') ;
var Model = require('./smokingmirror/model') ;
var Loader = require('./smokingmirror/loader') ;

var Player = function(defData, renderer) {
  "use strict";

  this.modelDef = Loader.parseWavefront (defData) ;

  this.model = new Model(this.modelDef, renderer) ;

  this.model.materials.FlameMat.color = 0xFF4212 ;
  this.model.materials.FlameMat.alpha = 0.7 ;
  this.model.materials.BaseMat.color = 0xE0FFFC ;

  this.pos = new Vector3() ;
  this.rot = new Vector3() ;
};

Player.prototype = {

  update: function() {
    this.model.position = this.pos ;
    this.model.rotation = this.rot ;

    this.model.update() ;
  },

  render: function(modelGraphics) {
    this.model.render(modelGraphics) ;
  }

};

module.exports = Player ;
