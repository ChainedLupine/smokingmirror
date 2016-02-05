
var Blackhole = require('../models/blackhole') ;

var PlayScene = function (game) {
  this.game = game ;
  this.name = 'PlayScene' ;

  this.modelGraphics = new PIXI.Graphics() ;

  this.blackholeGlowCtr = new PIXI.Container() ;
  this.blackholeDisplaceCtr = new PIXI.Container() ;
  this.game.stage.addChild (this.blackholeDisplaceCtr) ;
  this.game.stage.addChild (this.blackholeGlowCtr) ;
  this.blackholeGlowGrf = new PIXI.Graphics() ;
  this.blackholeGlowCtr.addChild (this.blackholeGlowGrf) ;

  this.game.getSceneCtr().filters = null ;


  var starBackgroundTx = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.star_background"))) ;
  //var starBackgroundTx = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.grid"))) ;
  this.backgroundSpr = new PIXI.extras.TilingSprite(starBackgroundTx, game.PIXIrenderer.width, game.PIXIrenderer.height) ;
  this.game.addRenderChild (this.backgroundSpr) ;

  var displaceTxr = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.displace"))) ;

  var blackholeSettings = {
    displaceTxr: displaceTxr,
    blackholeGlowCtr: this.blackholeGlowCtr,
    blackholeDisplaceCtr: this.blackholeDisplaceCtr,
    blackholeGlowGrf: this.blackholeGlowGrf,
  } ;

  this.blackholeTest = new Blackhole (game, blackholeSettings, 500) ;
  this.blackholeTest.agitation = 0.0 ;
  this.game.addRenderChild (this.blackholeTest) ;


  //var displaceSprTx2 = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.displace"))) ;
  //this.blackholeTest2 = new Blackhole (game, blackholeSettings, 200) ;
  //this.game.addRenderChild (this.blackholeTest2) ;

  this.sceneFolder = game.dgui.addFolder ("Blackhole") ;
  this.sceneFolder.add(this.blackholeTest, 'agitation', 0, 1) ;


  this.test = 0 ;
} ;


PlayScene.prototype = {
  setup: function () {
    this.game.addRenderChild (this.modelGraphics) ;
    //this.game.stage.addChild (this.modelGraphics) ;
  },

  destroy: function() {
    if (this.blackholeTest) {
      this.game.removeRenderChild (this.blackholeTest) ;
      this.blackholeTest.destroy() ;
    }
    this.game.removeRenderChild (this.modelGraphics) ;
    this.game.removeRenderChild (this.backgroundSpr) ;
    this.game.getEffectsCtr().removeChild (this.displaceRenderSpr) ;
    this.game.dgui.removeFolder ("Blackhole") ;
  },

  update: function(dt) {
    this.blackholeGlowGrf.clear() ;

    this.backgroundSpr.tilePosition.x += 30 * dt ;
    this.backgroundSpr.tilePosition.y += 20 * dt ;

    this.blackholeTest.x = this.game.PIXIrenderer.width / 2 + Math.sin (this.test * 2) * 70 ;
    this.blackholeTest.y = this.game.PIXIrenderer.height / 2 + Math.sin (this.test * 3) * 30 ;


    if (this.blackholeTest) {
      this.blackholeTest.update(dt) ;
    }

    //this.blackholeTest2.x = this.game.PIXIrenderer.width / 2 + Math.sin (this.test * 2) * 450 ;
    //this.blackholeTest2.y = this.game.PIXIrenderer.height / 2 + Math.cos (this.test * 3) * 90 ;

    //this.blackholeTest2.update(dt) ;

    if (this.test > 1) {

      //this.blackholeTest2.position.x = Math.random() * 300 ;
      //this.blackholeTest2.position.y = Math.random() * 200 ;
      //this.test = 0 ;
    }

    //this.blackholeTest2.update(dt) ;

    this.test += dt ;

    if (this.test > 1 && this.blackholeTest !== null) {
      //this.game.removeRenderChild (this.blackholeTest) ;
      //this.blackholeTest.destroy() ;
      //this.blackholeTest = null ;
    }


  },

  render: function() {
    this.modelGraphics.clear() ;

    if (this.blackholeTest) {
      this.blackholeTest.render(this.modelGraphics) ;
    }

    //this.blackholeTest2.render(this.modelGraphics) ;
  }

};

module.exports = PlayScene ;
