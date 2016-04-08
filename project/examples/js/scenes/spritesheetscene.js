
var SpriteSheetScene = function (game) {
  this.game = game ;
  this.name = 'Spritesheet Scene' ;
  this.scenehelpers = require('./shared/scenehelper')(game) ;
} ;

SpriteSheetScene.prototype = {
  setup: function () {

    var scene = this ;

    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST ;

    this.boxCtr = this.scenehelpers.setup("Spritesheet Example") ;
    this.game.stage.addChild (this.boxCtr) ;

    this.game.sceneSetHelpText(
      "<p>Spritesheets allow you to import a single sprite atlas and convert it into individual textures for animation.</p>" +
      "<p>Sprite on left is a standard fixed-sized sprite sheet, while the sprite on the right utilizes advanced packing methods such as " +
      "rotated images and cropped frames to maximize atlas texture usage.</p>" +
      "<p>Currently, sprite sheets of TexturePacker JSON format is supported but the SpriteSheet class can be easily extended to add more.</p>"
    ) ;

    // load a sprite sheet
    var sheetExplosion = new SmokingMirror.TwoD.SpriteSheet(
      this.game.assetManager.getAsset("sprites.sheets.explosion"),
      this.game.assetManager.getAsset("sprites.textures.explosion")
    ) ;

    var animSpriteExplosion = new SmokingMirror.TwoD.AnimatedSprite (sheetExplosion, {
      explode: {
        frames: "all", // special, just use all.  Otherwise give this an array of frame indexes (where 0 = first frame)
        speed: 10, // in FPS
        loop: true, // by default, loops (can override)
        reverse: false, // can be played backwards
      }
    }) ;

    this.boxCtr.addChild (animSpriteExplosion) ;
    animSpriteExplosion.anchor.set (0.5) ;
    animSpriteExplosion.position.set (100, this.scenehelpers.boxHeight / 2) ;
    animSpriteExplosion.play("explode") ;

    this.animSpriteExplosion = animSpriteExplosion ;

    /*var sheetExplosion2 = new SmokingMirror.TwoD.SpriteSheet(
      this.game.assetManager.getAsset("sprites.sheets.explosion2"),
      this.game.assetManager.getAsset("sprites.textures.explosion2")
    ) ;

    this.boxCtr.addChild (sheetExplosion2.movieClip) ;
    sheetExplosion2.movieClip.anchor.set (0.5) ;
    sheetExplosion2.movieClip.position.set (this.scenehelpers.boxWidth - 100, this.scenehelpers.boxHeight / 2) ;
    sheetExplosion2.movieClip.animationSpeed = 0.2 ;
    sheetExplosion2.movieClip.play() ;

    this.sheetExplosion2 = sheetExplosion2 ;*/

  },

  destroy: function() {
    SmokingMirror.Input.InputManager.clear() ;

    this.game.stage.removeChild (this.boxCtr) ;
    this.boxCtr = null ;

    //this.game.dgui.removeFolder ("Sounds") ;

    this.scenehelpers.destroy() ;

    this.scenehelpers = null ;

    this.game.sceneSetHelpText() ;

    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR ;
  },

  resize: function () {
    this.scenehelpers.resize() ;
  },


  update: function(dt) {
  },

  render: function() {
  }

};

module.exports = SpriteSheetScene ;
