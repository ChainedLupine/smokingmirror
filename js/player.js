"use strict";
/* globals Smokingmirror */
/* globals Game */

Game.Player = function(defData) {
  this.modelDef = Smokingmirror.loader.parseWavefront (defData) ;

  this.model = new Smokingmirror.Model(this.modelDef) ;

  this.model.materials.FlameMat.color = 0xFF4212 ;
  this.model.materials.FlameMat.alpha = 0.7 ;
  this.model.materials.BaseMat.color = 0xE0FFFC ;

  this.pos = new Smokingmirror.Vector3() ;
  this.rot = new Smokingmirror.Vector3() ;
};

Game.Player.prototype = {


  update: function() {
    this.model.position = this.pos ;
    this.model.rotation = this.rot ;

    this.model.update() ;
  },

  render: function(modelGraphics) {
    this.model.render(modelGraphics) ;
  }

};
