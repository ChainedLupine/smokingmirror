var ThreeDModelTesterScene = function (game) {
  this.game = game ;
  this.name = '3DModelTesterScene' ;
  this.shadersVectrex = require('./shared/shaders_vectrex')(game) ;

  this.r = 127 ;
  this.animTick = 0 ;
  this.flameHue = (12 * 0.0174533) ;

  this.modelGraphics = new PIXI.Graphics() ;
} ;


ThreeDModelTesterScene.prototype = {
  setup: function () {
    this.shadersVectrex.setup() ;

    this.game.wireframeRender.setCamera(
      new SmokingMirror.Vector3 (0, 0, 100),
      new SmokingMirror.Vector3 (0, 0, 0)
    ) ;


    var modelDef = SmokingMirror.ThreeD.Loader.parseWavefront (this.game.assetManager.getAsset ('models.player')) ;

    this.model = new SmokingMirror.ThreeD.Model(modelDef, this.game.wireframeRender) ;

    this.model.materials.Flame.color = 0xFF4212 ;
    this.model.materials.Flame.alpha = 0.7 ;
    this.model.materials.Base.color = 0xE0FFFC ;
    this.model.materials.Cockpit.color = 0x318fdf ;//0xd6ecff ;
    //this.model.materials.Cockpit.alpha = 0.4 ;
    this.model.materials.Detail.color = 0x333333 ;

    this.model.scale = new SmokingMirror.Vector3 (10, 10, 10) ;

    this.shadersVectrex.addRenderChild (this.modelGraphics) ;

    this.game.sceneSetHelpText(
      "<p>Smokingmirror supports models rendered by its 3D vector engine.</p>" +
      "<p>Models are in Alias Wavefront (.obj) format and can contain multiple groups of vertices split into materials.</p>" +
      "<p>Access to materials is provided so parts of the model can be changed at runtime (such as the flame effect on this ship).</p>"
    ) ;

  },

  destroy: function() {
    this.player = null ;
    this.shadersVectrex.removeRenderChild (this.modelGraphics) ;

    this.shadersVectrex.destroy() ;

    this.game.sceneSetHelpText() ;
  },

  resize: function () {
    this.shadersVectrex.resize() ;

    this.game.wireframeRender.setCamera(
      new SmokingMirror.Vector3 (0, 0, 100),
      new SmokingMirror.Vector3 (0, 0, 0)
    ) ;
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

module.exports = ThreeDModelTesterScene ;
