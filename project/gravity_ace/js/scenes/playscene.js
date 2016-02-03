
var Blackhole = require('../models/blackhole') ;

var PlayScene = function (game) {
  this.game = game ;
  this.name = 'PlayScene' ;

  this.modelGraphics = new PIXI.Graphics() ;

  var starBackgroundTx = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.star_background"))) ;
  //var starBackgroundTx = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.grid"))) ;
  this.backgroundSpr = new PIXI.extras.TilingSprite(starBackgroundTx, game.PIXIrenderer.width, game.PIXIrenderer.height) ;
  this.game.addRenderChild (this.backgroundSpr) ;

  var displaceSprTx = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.displace"))) ;

  game.getVisualEffectsContainer().filters = [] ;

  /*this.blackholeTest = new Blackhole (game, displaceSprTx) ;
  this.game.addRenderChild (this.blackholeTest) ;
  this.blackholeTest.scale.x = 4.0 ;
  this.blackholeTest.scale.y = 4.0 ;
  this.blackholeTest.position.x = game.PIXIrenderer.width / 2 - this.blackholeTest.width / 2 ;
  this.blackholeTest.position.y = game.PIXIrenderer.height / 2 - this.blackholeTest.height / 2 ;*/
  this.blackholeTest = null ;

  var displaceSprTx2 = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.displace"))) ;
  this.blackholeTest2 = new Blackhole (game, displaceSprTx2) ;
  this.game.addRenderChild (this.blackholeTest2) ;
  this.blackholeTest2.scale.x = 2.0 ;
  this.blackholeTest2.scale.y = 2.0 ;
  //this.blackholeTest2.position.x = 50 + game.PIXIrenderer.width / 2 - this.blackholeTest2.width / 2 ;
  //this.blackholeTest2.position.y = -50 + game.PIXIrenderer.height / 2 - this.blackholeTest2.height / 2 ;
  console.log ("bkl=" + this.blackholeTest2.width + " " + this.blackholeTest2.height) ;

  this.blackholeTest2.generateCurves() ;

  this.test = 0 ;
} ;


PlayScene.prototype = {
  setup: function () {
    this.game.addRenderChild (this.modelGraphics) ;
  },

  destroy: function() {
    if (this.blackholeTest) {
      this.game.removeRenderChild (this.blackholeTest) ;
      this.blackholeTest.destroy() ;
    }
    //this.game.getVisualEffectsContainer().filters = [] ;
    this.game.removeRenderChild (this.modelGraphics) ;
    this.game.removeRenderChild (this.backgroundSpr) ;
  },

  update: function(dt) {
    this.backgroundSpr.tilePosition.x += 30 * dt ;
    this.backgroundSpr.tilePosition.y += 20 * dt ;

    if (this.blackholeTest) {
      this.blackholeTest.update(dt) ;
    }

    this.blackholeTest2.position.x = this.game.PIXIrenderer.width / 2 - this.blackholeTest2.width / 2 + Math.sin (this.test * 2) * 190 ;
  //this.blackholeTest2.position.x = (this.game.PIXIrenderer.width / 2 - this.blackholeTest2.width / 2) - 100 ;
  //this.blackholeTest2.position.x = 100 ;
    this.blackholeTest2.position.y = this.game.PIXIrenderer.height / 2 - this.blackholeTest2.height / 2 + Math.cos (this.test * 2) * 120 ;
    this.blackholeTest2.position.y = this.game.PIXIrenderer.height / 2 - this.blackholeTest2.height / 2 ;
    console.log ("bhx=" + this.blackholeTest2.position.x) ;

    if (this.test > 1) {

      //this.blackholeTest2.position.x = Math.random() * 300 ;
      //this.blackholeTest2.position.y = Math.random() * 200 ;
      //this.test = 0 ;
    }

    this.blackholeTest2.update(dt) ;

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
    this.blackholeTest2.render(this.modelGraphics) ;

  }

};

module.exports = PlayScene ;
