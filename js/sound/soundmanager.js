var SoundEngine = require ('./engine') ;

module.exports = function SoundManager() {

  var engine = new SoundEngine() ;

  var masterVolume = 1.0 ;
  var musicVolume = 1.0 ;

  var manager = {
    play: function (snd, volume) {
      if (typeof volume === 'undefined') { volume = 1.0 ; }
      //snd.originalVolume = volume ;
      snd.volume = volume ;
      snd.play () ;

      return snd ;
    },

    playMusic: function (snd, volume) {
      if (typeof volume === 'undefined') { volume = 1.0 ; }
      //snd.originalVolume = volume ;
      snd.volume = volume ;
      snd.play (true) ;

      return snd ;
    },

    update: function (dt) {
    }
  } ;

  Object.defineProperties (manager, {
    "masterVolume": {
      get: function () { return masterVolume ; },
      set: function (v) {
        masterVolume = v ;
        engine.masterVolume = v ;
      }
    },
    "musicVolume": {
      get: function () { return musicVolume ; },
      set: function (v) {
        musicVolume = v ;
        engine.musicVolume = v ;
      }
    },
    "engine": {
      get: function() { return engine ; },
    }
  }) ;

  return manager ; // return


} ; // SoundManager
