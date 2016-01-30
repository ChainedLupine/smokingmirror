var Player = function(defData, renderer) {
  "use strict";

  this.modelDef = Loader.parseWavefront (defData) ;

  this.model = new Model(this.modelDef, renderer) ;

  this.model.materials.Flame.color = 0xFF4212 ;
  this.model.materials.Flame.alpha = 0.7 ;
  this.model.materials.Base.color = 0xE0FFFC ;
  this.model.materials.Cockpit.color = 0x318fdf ;//0xd6ecff ;
  //this.model.materials.Cockpit.alpha = 0.4 ;
  this.model.materials.Detail.color = 0x333333 ;

  this.flameHue = (12 * 0.0174533) ;

  this.pos = new Vector3() ;
  this.rot = new Vector3() ;

  this.animTick = 0 ;
};

Player.prototype = {

  update: function(dt) {
    this.model.position = this.pos ;
    this.model.rotation = this.rot ;

    this.animTick += dt * 10 ;

    this.model.materials.Flame.color = util.HSVtoHTML ((this.flameHue + Math.sin (this.animTick) * 0.04) / 6.24, 0.93, 1) ;
    this.model.materials.Flame.alpha = 0.7 + (Math.sin (this.animTick) * 0.2) ;


    this.model.update() ;
  },

  render: function(modelGraphics) {
    this.model.render(modelGraphics) ;
  }

};

module.exports = Player ;
