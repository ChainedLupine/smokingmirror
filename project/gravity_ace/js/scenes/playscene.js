
var Blackhole = require('../models/blackhole') ;

var PlayScene = function (game) {
  this.game = game ;
  this.name = 'PlayScene' ;

  this.test = 0 ;

  this.gameCtr = null ;
  this.blackholeEffectsCtr = null ;
  this.blackholeDisplaceCtr = null ;
  this.blackholeGlowCtr = null ;
} ;


PlayScene.prototype = {
  setup: function () {
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
    this.game.addRenderChild (this.gameCtr) ;

    this.blackholeEffectsCtr = new PIXI.Container() ;

    this.blackholeDisplaceCtr = new PIXI.Container() ;
    this.blackholeEffectsCtr.addChild (this.blackholeDisplaceCtr) ;

    this.blackholeGlowCtr = new PIXI.Container() ;
    this.blackholeEffectsCtr.addChild (this.blackholeGlowCtr) ;

    this.blackholeGlowGrf = new PIXI.Graphics() ;
    this.blackholeGlowCtr.addChild (this.blackholeGlowGrf) ;

    this.gameCtr.filters = null ;

    var starBackgroundTx = new PIXI.Texture(new PIXI.BaseTexture(this.game.assetManager.getAsset("images.star_background"))) ;
    //var starBackgroundTx = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.grid"))) ;
    this.backgroundSpr = new PIXI.extras.TilingSprite(starBackgroundTx, this.game.PIXIrenderer.width, this.game.PIXIrenderer.height) ;
    this.gameCtr.addChild (this.backgroundSpr) ;

    this.gameCtr.addChild (this.modelGraphics) ;

    this.blackholesCtr = new PIXI.Container() ;
    this.gameCtr.addChild (this.blackholesCtr) ;

    this.game.addRenderChild (this.blackholeEffectsCtr) ;


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


    //var displaceSprTx2 = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.displace"))) ;
    //this.blackholeTest2 = new Blackhole (game, blackholeSettings, 200) ;
    //this.game.addRenderChild (this.blackholeTest2) ;

    this.sceneFolder = this.game.dgui.addFolder ("Blackhole") ;
    this.sceneFolder.add(this.blackholeTest, 'agitation', 0.0, 1.0).step (0.1) ;

  },

  destroy: function() {
    if (this.blackholeTest) {
      this.blackholeTest.destroy() ;
    }
    this.game.removeRenderChild (this.blackholeEffectsCtr) ;

    this.game.removeRenderChild (this.gameCtr) ;
    this.gameCtr.removeRenderChild (this.black) ;

    this.game.dgui.removeFolder ("Blackhole") ;

    this.gameCtr = null ;
    this.blackholeEffectsCtr = null ;
    this.blackholeDisplaceCtr = null ;
    this.blackholeGlowCtr = null ;
  },

  update: function(dt) {
    this.backgroundSpr.tilePosition.x += 30 * dt ;
    this.backgroundSpr.tilePosition.y += 20 * dt ;



    if (this.blackholeTest) {
      this.blackholeTest.x = this.game.PIXIrenderer.width / 2 + Math.sin (this.test * 2) * 70 ;
      this.blackholeTest.y = this.game.PIXIrenderer.height / 2 + Math.sin (this.test * 3) * 30 ;

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
      //this.blackholesCtr.removeChild (this.blackholeTest) ;
      //this.blackholeTest.destroy() ;
      //this.blackholeTest = null ;
    }


  },

  render: function() {
    this.modelGraphics.clear() ;
    this.blackholeGlowGrf.clear() ;

    if (this.blackholeTest) {
      this.blackholeTest.render(this.modelGraphics) ;
    }

    //this.blackholeTest2.render(this.modelGraphics) ;
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
