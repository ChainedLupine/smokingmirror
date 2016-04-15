


var TilemapScene = function (game) {
  this.game = game ;
  this.name = 'Tilemap Scene' ;
  this.scenehelpers = require('./shared/scenehelper')(game) ;
} ;

TilemapScene.prototype = {
  setup: function () {

    var scene = this ;

    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST ;

    this.gridSpr = new PIXI.extras.TilingSprite(
      new PIXI.Texture(new PIXI.BaseTexture(this.game.assetManager.getAsset("images.background"))),
      this.game.PIXIrenderer.width, this.game.PIXIrenderer.height) ;
    this.gridSpr.alpha = 0.2 ;
    this.game.stage.addChild (this.gridSpr) ;

    this.boxCtr = this.scenehelpers.setup("Tilemap Example") ;



    this.sceneFolder = this.game.dgui.addFolder ("Tilemap") ;
    this.sceneFolder.open() ;

    this.game.sceneSetHelpText(
      "<p>SmokingMirror can load tilemaps.</p>"
    ) ;
  },

  destroy: function() {
    SmokingMirror.Input.InputManager.clear() ;

    this.game.stage.removeChild (this.gridSpr) ;
    this.gridSpr = null ;

    this.game.dgui.removeFolder ("Tilemap") ;

    this.sprites = null ;

    this.scenehelpers.destroy() ;

    this.scenehelpers = null ;

    this.game.sceneSetHelpText() ;
  },

  resize: function () {
    this.gridSpr.width = this.game.PIXIrenderer.width ;
    this.gridSpr.height = this.game.PIXIrenderer.height ;

    this.scenehelpers.resize() ;
  },


  update: function(dt) {
    this.gridSpr.tilePosition.x += 20 * dt ;
    this.gridSpr.tilePosition.y += 10 * dt ;
  },

  render: function() {
  }

};

module.exports = TilemapScene ;
