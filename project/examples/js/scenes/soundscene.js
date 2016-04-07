


var SoundScene = function (game) {
  this.game = game ;
  this.name = 'Sound Scene' ;
  this.scenehelpers = require('./shared/scenehelper')(game) ;
} ;

SoundScene.prototype = {
  setup: function () {

    var scene = this ;

    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST ;

    this.boxCtr = this.scenehelpers.setup("Sound Example") ;

    var sounds = [] ;
    sounds.push (this.game.assetManager.getAsset("sounds.enemy_hit")) ;
    sounds.push (this.game.assetManager.getAsset("sounds.machinegun")) ;
    sounds.push (this.game.assetManager.getAsset("sounds.blip_select")) ;
    sounds.push (this.game.assetManager.getAsset("sounds.small_explosion")) ;

    var createSprite = function (x, y) {
      // load a sprite sheet
      var sprite = new SmokingMirror.TwoD.SpriteSheet(
        scene.game.assetManager.getAsset("sprites.sheets.explosion"),
        scene.game.assetManager.getAsset("sprites.textures.explosion")
      ) ;

      sprite.movieClip.anchor.set (0.5) ;
      sprite.movieClip.position.set (x, y) ;
      sprite.movieClip.animationSpeed = 0.5 ;
      sprite.movieClip.alpha = 0 ;
      sprite.movieClip.loop = false ;
      sprite.movieClip.onComplete = function () { this.alpha = 0 ; } ;

      scene.boxCtr.addChild (sprite.movieClip) ;

      return sprite.movieClip ;
    } ;

    var sprites = [] ;
    sprites.push (createSprite (50 + 109 * 0, this.scenehelpers.boxHeight / 2)) ;
    sprites.push (createSprite (50 + 109 * 1, this.scenehelpers.boxHeight / 2)) ;
    sprites.push (createSprite (50 + 109 * 2, this.scenehelpers.boxHeight / 2)) ;
    sprites.push (createSprite (50 + 109 * 3, this.scenehelpers.boxHeight / 2)) ;

    var mineSpr = new PIXI.Sprite(
      new PIXI.Texture(new PIXI.BaseTexture(scene.game.assetManager.getAsset("images.mine")))
    ) ;
    mineSpr.anchor.set (0.5) ;
    mineSpr.position.set (this.scenehelpers.boxWidth / 2, this.scenehelpers.boxHeight - 60) ;
    this.boxCtr.addChild (mineSpr) ;
    mineSpr.alpha = 0;



    var music = this.game.assetManager.getAsset("sounds.music") ;
    music.loop = true ;

    SmokingMirror.Sound.SoundManager.masterVolume = 1.0 ;

    this.soundSpeed = 1.0 ;
    this.reverb = false ;
    this.echo = false ;

    this.sceneFolder = this.game.dgui.addFolder ("Sounds") ;
    this.sceneFolder.add(SmokingMirror.Sound.SoundManager, 'masterVolume', 0.0, 1.0).step (0.1) ;
    this.sceneFolder.add(SmokingMirror.Sound.SoundManager, 'musicVolume', 0.0, 1.0).step (0.1) ;
    this.sceneFolder.add(this, 'soundSpeed', 0.1, 2).step (0.1) ;
    this.sceneFolder.add(this, 'reverb') ;
    this.sceneFolder.add(this, 'echo') ;
    this.sceneFolder.open() ;

    this.game.sceneSetHelpText(
      "<p>Sound manager plays sounds via the AudioContext interface.</p>" +
      "<p>It supports global volume, both realtime and static sounds, plus simple effects such as playback speed changes, reverb, fading, etc.<p>" +
       "<p>1,2,3,4 plays various sound effects.  You can enable/disable various effects for the sound effects.</p>" +
       "<p>M will start or stop the music.  You can use F to fade the music out if it is playing.</p>"
    ) ;

    SmokingMirror.Input.InputManager.begin ("sounds") ;

    var sndPlay = function (snd) {
      snd.playbackRate = scene.soundSpeed ;
      if (scene.reverb) {
        snd.setReverb (1, 2, false) ;
      } else {
        snd.clearReverb() ;
      }
      if (scene.echo) {
        snd.setEcho (0.2, 0.2, 0) ;
      } else {
        snd.clearEcho() ;
      }

      SmokingMirror.Sound.SoundManager.play (snd) ;
    } ;

    var displaySprite = function (which) {
      which.alpha = 1 ;
      which.gotoAndPlay(0) ;
    } ;

    SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_1, function () {
      sndPlay (sounds[0]) ;
      displaySprite (sprites[0]) ;
    }) ;

    SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_2, function () {
      sndPlay (sounds[1]) ;
      displaySprite (sprites[1]) ;
    }) ;

    SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_3, function () {
      sndPlay (sounds[2]) ;
      displaySprite (sprites[2]) ;
    }) ;

    SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_4, function () {
      sndPlay (sounds[3]) ;
      displaySprite (sprites[3]) ;
    }) ;

    SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_M, function () {
      if (mineSpr.alpha === 0) {
        mineSpr.alpha = 1 ;
      } else {
        mineSpr.alpha = 0 ;
      }
      SmokingMirror.Sound.SoundManager.playMusic (music) ;
    }) ;

    SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_F, function () {
      music.fadeOut (2.0) ;
    }) ;

    SmokingMirror.Input.InputManager.end() ;
    SmokingMirror.Input.InputManager.enable() ;

  },

  destroy: function() {
    SmokingMirror.Input.InputManager.clear() ;

    this.game.dgui.removeFolder ("Sounds") ;

    this.scenehelpers.destroy() ;

    this.scenehelpers = null ;

    this.game.sceneSetHelpText() ;
  },

  resize: function () {
    this.scenehelpers.resize() ;
  },


  update: function(dt) {
  },

  render: function() {
    //this.modelGraphics.clear() ;

    //this.modelGraphics.lineStyle (4, 0xFF00FF, 1) ;

  }

};

module.exports = SoundScene ;
