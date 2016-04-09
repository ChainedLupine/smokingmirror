
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
      "<p>SpriteSheet allow you to import a single sprite atlas and convert it into individual textures for animation.</p>" +
      "<p>Sprite on left is a standard fixed-sized sprite sheet, while the sprite on the right utilizes advanced packing methods such as " +
      "rotated images and cropped frames to maximize atlas texture usage.</p>" +
      "<p>Currently, sprite sheets of TexturePacker JSON format is supported but the SpriteSheet class can be easily extended to add more.</p>" +
      "<p>AnimatedSprites render the SpriteSheet to the PIXI canvas.  You can define any number of individual animations, and play them forward " +
      "or backwards.</p>" +
      "<p>You can also perform automatic looping, with callbacks on both each cycle of an animation, or when an animation completes.</p>" +
      "<p>AnimatedSprites allows for stacked animations.  At any time, you can push the current animation to a stack in order to play another, " +
      "and then restore the prior animation.</p>"
    ) ;

    this.sceneFolder = this.game.dgui.addFolder ("Spritesheet Example") ;
    this.sceneFolder.open() ;

    // load a sprite sheet
    var sheetExplosion = new SmokingMirror.TwoD.SpriteSheet(
      this.game.assetManager.getAsset("sprites.sheets.explosion"),
      this.game.assetManager.getAsset("sprites.textures.explosion")
    ) ;

    var animSpriteExplosion = new SmokingMirror.TwoD.AnimatedSprite (sheetExplosion, {
      explode: {
        frames: "all", // special, just use all.  Otherwise give this an array of frame indexes (where 0 = first frame)
        speed: 12, // in FPS
        loop: true, // by default, loops (can override)
        reverse: false, // reverse animation frames
        onComplete: function () { // when playing the last frame, you can trigger an event
          console.log ("completed!") ;
        },
        onCycle: function () { // when a looped animation hits the last frame and is about to go back to start, you can trigger event
          console.log ("cycled!  Current frame is " + animSpriteExplosion.currFrame + " for anim " + animSpriteExplosion.currAnimName) ;
        }
      }
    }, this.game) ;

    this.boxCtr.addChild (animSpriteExplosion) ;
    animSpriteExplosion.anchor.set (0.5) ;
    animSpriteExplosion.position.set (100, this.scenehelpers.boxHeight / 2) ;
    animSpriteExplosion.play("explode") ;

    this.animSpriteExplosion = animSpriteExplosion ;

    this.resetAnim = function () {
      scene.animSpriteExplosion.reset() ;
    } ;

    this.stopAnim = function () {
      scene.animSpriteExplosion.stop() ;
    } ;

    this.playAnim = function () {
      scene.animSpriteExplosion.play("explode") ;
    } ;

    this.pushAnim = function () {
      scene.animSpriteExplosion.push() ;
    } ;
    this.popAnim = function () {
      scene.animSpriteExplosion.pop() ;
    } ;

    this.sceneFolder.add (animSpriteExplosion, "speed", 0, 2).step(0.1) ;
    this.sceneFolder.add (animSpriteExplosion, "reverse").listen() ;
    this.sceneFolder.add (this, "resetAnim") ;
    this.sceneFolder.add (this, "playAnim") ;
    this.sceneFolder.add (this, "stopAnim") ;
    //this.sceneFolder.add (this, "pushAnim") ;
    //this.sceneFolder.add (this, "popAnim") ;

    var sheetExplosion2 = new SmokingMirror.TwoD.SpriteSheet(
      this.game.assetManager.getAsset("sprites.sheets.explosion2"),
      this.game.assetManager.getAsset("sprites.textures.explosion2")
    ) ;

    var animSpriteExplosion2 = new SmokingMirror.TwoD.AnimatedSprite (sheetExplosion2, {
      explode: {
        frames: "all", // special, just use all.  Otherwise give this an array of frame indexes (where 0 = first frame)
        speed: 24, // in FPS
        loop: true, // by default, loops (can override)
        reverse: false, // reverse animation frames
      }
    }, this.game) ;

    this.boxCtr.addChild (animSpriteExplosion2) ;
    animSpriteExplosion2.anchor.set (0.5) ;
    animSpriteExplosion2.position.set (this.scenehelpers.boxWidth - 100, this.scenehelpers.boxHeight / 2) ;
    animSpriteExplosion2.play("explode") ;

    this.animSpriteExplosion2 = animSpriteExplosion2 ;

  },

  destroy: function() {
    SmokingMirror.Input.InputManager.clear() ;

    this.game.stage.removeChild (this.boxCtr) ;
    this.boxCtr = null ;

    this.scenehelpers.destroy() ;

    this.scenehelpers = null ;

    this.game.dgui.removeFolder ("Spritesheet Example") ;

    this.game.sceneSetHelpText() ;

    this.animSpriteExplosion = this.animSpriteExplosion2 = null ;

    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR ;
  },

  resize: function () {
    this.scenehelpers.resize() ;
  },


  update: function(dt) {
    this.animSpriteExplosion.update(dt) ;
    this.animSpriteExplosion2.update(dt) ;
  },

  render: function() {
  }

};

module.exports = SpriteSheetScene ;
