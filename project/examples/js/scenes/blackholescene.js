
var Blackhole = require('../models/blackhole') ;

var PlayScene = function (game) {
  this.game = game ;
  this.name = 'BlackHoleScene' ;
  this.shadersVectrex = require('./shared/shaders_vectrex')(game) ;

  this.animTick = 0 ;

  this.gameCtr = null ;
  this.blackholeEffectsCtr = null ;
  this.blackholeDisplaceCtr = null ;
  this.blackholeGlowCtr = null ;
} ;


PlayScene.prototype = {
  setup: function () {
    this.shadersVectrex.setup() ;

    this.game.wireframeRender.setCamera(
      new SmokingMirror.Vector3 (0, 0, this.game.PIXIrenderer.height),
      new SmokingMirror.Vector3 (0, 0, 0)
    ) ;

    this.modelGraphics = new PIXI.Graphics() ;

    /*
      scene [blur, bloom]
        + game [displace]
          + background
          + blackholes
          + etc
        + bhEffects
          + bhDisplace
          + bhGlow

    */

    this.gameCtr = new PIXI.Container() ;
    this.shadersVectrex.addRenderChild (this.gameCtr) ;

    this.blackholeEffectsCtr = new PIXI.Container() ;

    this.blackholeDisplaceCtr = new PIXI.Container() ;
    this.blackholeEffectsCtr.addChild (this.blackholeDisplaceCtr) ;

    this.blackholeGlowCtr = new PIXI.Container() ;
    this.blackholeEffectsCtr.addChild (this.blackholeGlowCtr) ;

    this.blackholeGlowGrf = new PIXI.Graphics() ;
    this.blackholeGlowCtr.addChild (this.blackholeGlowGrf) ;

    this.gameCtr.filters = null ;

    var starBackgroundTx = new PIXI.Texture(new PIXI.BaseTexture(this.game.assetManager.getAsset("images.star_background"))) ;
    this.backgroundSpr = new PIXI.extras.TilingSprite(starBackgroundTx, this.game.PIXIrenderer.width, this.game.PIXIrenderer.height) ;
    this.gameCtr.addChild (this.backgroundSpr) ;

    this.gameCtr.addChild (this.modelGraphics) ;

    this.blackholesCtr = new PIXI.Container() ;
    this.gameCtr.addChild (this.blackholesCtr) ;

    this.shadersVectrex.addRenderChild (this.blackholeEffectsCtr) ;


    var displaceTxr = new PIXI.Texture(new PIXI.BaseTexture(this.game.assetManager.getAsset("images.displace"))) ;

    var blackholeSettings = {
      displaceTxr: displaceTxr,
      blackholeGlowCtr: this.blackholeGlowCtr,
      blackholeDisplaceCtr: this.blackholeDisplaceCtr,
      blackholeGlowGrf: this.blackholeGlowGrf,
    } ;

    this.blackholeTest = new Blackhole (this.game, blackholeSettings, 500) ;
    this.blackholeTest.agitation = 0.1 ;
    this.blackholesCtr.addChild (this.blackholeTest) ;

    this.sceneFolder = this.game.dgui.addFolder ("Blackhole") ;
    this.sceneFolder.add(this.blackholeTest, 'agitation', 0.0, 1.0).step (0.1) ;
    this.sceneFolder.open() ;

    this.game.sceneSetHelpText(
      "<p>This is a demonstration of mixing the 3D vector line engine with standard 2D PIXI sprites.</p>" +
      "<p>The black hole is a combination of several PIXI sprites, plus WebGL filter effects, along with a vector curve.</p>" +
      "<p>The 3D camera height is set to equal the canvas height, therefore there is a 1:1 correspondance to pixel vs vector coordinates.</p>"
    ) ;
  },

  destroy: function() {
    if (this.blackholeTest) {
      this.blackholesCtr.removeChild (this.blackholeTest) ;
      this.blackholeTest.destroy() ;
    }

    this.shadersVectrex.removeRenderChild (this.blackholeEffectsCtr) ;
    this.shadersVectrex.removeRenderChild (this.gameCtr) ;

    this.game.dgui.removeFolder ("Blackhole") ;

    this.gameCtr = null ;
    this.blackholeEffectsCtr = null ;
    this.blackholeDisplaceCtr = null ;
    this.blackholeGlowCtr = null ;

    this.shadersVectrex.destroy() ;

    this.game.sceneSetHelpText() ;
  },

  resize: function () {
    this.backgroundSpr.width = this.game.PIXIrenderer.width ;
    this.backgroundSpr.height = this.game.PIXIrenderer.height ;

    this.shadersVectrex.resize() ;

    this.game.wireframeRender.setCamera(
      new SmokingMirror.Vector3 (0, 0, this.game.PIXIrenderer.height),
      new SmokingMirror.Vector3 (0, 0, 0)
    ) ;
  },

  update: function(dt) {
    this.backgroundSpr.tilePosition.x += 30 * dt ;
    this.backgroundSpr.tilePosition.y += 20 * dt ;

    if (this.blackholeTest) {
      this.blackholeTest.x = this.game.PIXIrenderer.width / 2 + Math.sin (this.animTick * 2) * 70 ;
      this.blackholeTest.y = this.game.PIXIrenderer.height / 2 + Math.sin (this.animTick * 3) * 30 ;

      this.blackholeTest.update(dt) ;
    }

    this.animTick += dt * 0.8 ;

  },

  render: function() {
    this.modelGraphics.clear() ;
    this.blackholeGlowGrf.clear() ;

    if (this.blackholeTest) {
      this.blackholeTest.render(this.modelGraphics) ;
    }
  },

  addBlackholeFilter: function (filter) {
    if (this.gameCtr.filters === null) {
      this.gameCtr.filters = [filter] ;
    } else {
      this.gameCtr.filters = this.gameCtr.filters.concat ([filter]) ;
    }
  },

  removeBlackholeFilter: function (filter) {
    var filters = this.gameCtr.filters ;
    var idx = filters.indexOf (filter) ;
    filters.splice (idx, 1) ;
    if (filters.length === 0) {
      // bug in PIXI, must set to null if filters=[]
      this.gameCtr.filters = null ;
    } else {
      this.gameCtr.filters = filters ;
    }
  },

};

module.exports = PlayScene ;
