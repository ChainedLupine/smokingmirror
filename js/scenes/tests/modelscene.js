var math = require('../../smokingmirror/math/misc') ;
var Model = require('../../smokingmirror/model') ;
var Loader = require('../../smokingmirror/loader') ;
var util = require('../../util') ;

var ModelTesterScene = function (game) {
  this.game = game ;
  this.name = 'ModelTesterScene' ;
  this.r = 127 ;
  this.animTick = 0 ;
  this.flameHue = (12 * 0.0174533) ;
} ;


ModelTesterScene.prototype = {
  setup: function () {

    var modelDef = Loader.parseWavefront (this.game.assetManager.getAsset ('models.player')) ;

    this.model = new Model(modelDef, this.game.wireframeRender) ;

    this.model.materials.Flame.color = 0xFF4212 ;
    this.model.materials.Flame.alpha = 0.7 ;
    this.model.materials.Base.color = 0xE0FFFC ;
    this.model.materials.Cockpit.color = 0x318fdf ;//0xd6ecff ;
    //this.model.materials.Cockpit.alpha = 0.4 ;
    this.model.materials.Detail.color = 0x333333 ;



  },

  destroy: function() {
    this.player = null ;
  },

  update: function(dt) {
    //this.player.pos.x = -0.9 ; // 1.0 * dt ;

    this.model.position.y = -1.5 ;
    this.model.position.z = -7 ;

    this.r += dt * 10 ;
    this.animTick += dt * 10 ;

    this.model.rotation.x = 147 * math.DTR ;
    this.model.rotation.y = this.r * math.DTR ;
    this.model.rotation.z = 0 * math.DTR ;

    this.model.materials.Flame.color = util.HSVtoHTML ((this.flameHue + Math.sin (this.animTick) * 0.04) / 6.24, 0.93, 1) ;
    this.model.materials.Flame.alpha = 0.7 + (Math.sin (this.animTick) * 0.2) ;

    this.model.update (dt) ;


  },

  render: function() {
    this.model.render(this.game.modelGraphics) ;
  }

};

module.exports = ModelTesterScene ;
