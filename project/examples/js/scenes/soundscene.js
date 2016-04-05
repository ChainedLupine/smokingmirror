


var SoundScene = function (game) {
  this.game = game ;
  this.name = 'Sound Scene' ;
  this.scenehelpers = require('./shared/scenehelper')(game) ;
} ;

SoundScene.prototype = {
  setup: function () {

    var scene = this ;

    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST ;

    this.scenehelpers.setup("Sound Example") ;

    var sfx = this.game.assetManager.getAsset("sounds.enemy_hit") ;
    SmokingMirror.Sound.SoundManager.masterVolume = 1.0 ;
    SmokingMirror.Sound.SoundManager.play(sfx, 1.0) ;

    this.sceneFolder = this.game.dgui.addFolder ("Sounds") ;

    this.sceneFolder.open() ;

    this.game.sceneSetHelpText(
      "<p>Sound manager plays sounds via the AudioContext interface.</p>" +
      "<p>It supports global volume, both realtime and static sounds, plus simple effects such as reverb, fading, etc.<p>" +
       "<p>A,S,D,F plays various sound effects.</p>" +
       "<p>M will start or stop the music.  You can use F to fade the music out if it is playing.</p>"
    ) ;
  },

  destroy: function() {
    SmokingMirror.Input.InputManager.clear() ;

    this.game.dgui.removeFolder ("Sounds") ;

    this.scenehelpers.destroy() ;

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
