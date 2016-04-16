
var IntroScene = function (game) {
  this.game = game ;
  this.name = 'Intro' ;
  this.scenehelpers = require('./shared/scenehelper')(game) ;

  this.sceneGroup = new SmokingMirror.SceneGraph.SceneGroup() ;
} ;

IntroScene.prototype = {
  setup: function () {

    var scene = this ;

    this.gridSpr = new PIXI.extras.TilingSprite(
      new PIXI.Texture(new PIXI.BaseTexture(this.game.assetManager.getAsset("images.background"))),
      this.game.PIXIrenderer.width, this.game.PIXIrenderer.height) ;

    this.gridSpr.alpha = 0.2 ;
    this.game.stage.addChild (this.gridSpr) ;

    this.boxCtr = this.scenehelpers.setup("Intro") ;

    var sprite = new PIXI.Sprite(
      new PIXI.Texture(new PIXI.BaseTexture(this.game.assetManager.getAsset("images.sm_logo")))) ;
    sprite.anchor.set (0.5, 0.5) ;
    sprite.scale.set (0.6) ;
    sprite.position.set (this.scenehelpers.boxWidth / 2, this.scenehelpers.boxHeight / 2) ;
    this.boxCtr.addChild (sprite) ;

    this.game.sceneSetHelpText(
      "<p>Welcome to SmokingMirror!</p>" +
      "<p>Use the scene selection in the top left to view different examples for Smoking Mirror.</p>"
    ) ;
  },

  destroy: function() {
    this.game.stage.removeChild (this.gridSpr) ;
    this.gridSpr = null ;

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

module.exports = IntroScene ;
