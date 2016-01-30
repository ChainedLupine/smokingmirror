var ModelTesterScene = function (game) {
  this.game = game ;
  this.name = 'ModelTesterScene' ;
  this.r = 127 ;
  this.animTick = 0 ;
  this.flameHue = (12 * 0.0174533) ;

  this.modelGraphics = new PIXI.Graphics() ;
} ;


ModelTesterScene.prototype = {
  setup: function () {

    var modelDef = SmokingMirror.ThreeD.Loader.parseWavefront (this.game.assetManager.getAsset ('models.player')) ;

    this.model = new SmokingMirror.ThreeD.Model(modelDef, this.game.wireframeRender) ;

    this.model.materials.Flame.color = 0xFF4212 ;
    this.model.materials.Flame.alpha = 0.7 ;
    this.model.materials.Base.color = 0xE0FFFC ;
    this.model.materials.Cockpit.color = 0x318fdf ;//0xd6ecff ;
    //this.model.materials.Cockpit.alpha = 0.4 ;
    this.model.materials.Detail.color = 0x333333 ;

    this.model.scale = new SmokingMirror.Vector3 (10, 10, 10) ;

    this.game.addRenderChild (this.modelGraphics) ;

  },

  destroy: function() {
    this.player = null ;
    this.game.removeRenderChild (this.modelGraphics) ;
  },

  update: function(dt) {
    this.model.position.y = -10 ;
    this.model.position.z = -7 ;

    this.r += dt * 10 ;
    this.animTick += dt * 10 ;

    this.model.rotation.x = 147 * SmokingMirror.Math.DTR ;
    this.model.rotation.y = this.r * SmokingMirror.Math.DTR ;
    this.model.rotation.z = 0 * SmokingMirror.Math.DTR ;

    this.model.materials.Flame.color = SmokingMirror.Util.HSVtoHTML ((this.flameHue + Math.sin (this.animTick) * 0.04) / 6.24, 0.93, 1) ;
    this.model.materials.Flame.alpha = 0.7 + (Math.sin (this.animTick) * 0.2) ;

    this.model.update (dt) ;


  },

  render: function() {
    this.modelGraphics.clear() ;

    this.model.render(this.modelGraphics) ;
  }

};

module.exports = ModelTesterScene ;
