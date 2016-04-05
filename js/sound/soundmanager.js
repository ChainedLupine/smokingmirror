var SoundEngine = require ('./engine') ;

module.exports = function SoundManager() {

  var engine = new SoundEngine() ;

  var masterVolume = 1.0 ;

  var manager = {
    play: function (snd, volume) {
      snd.volume = volume * masterVolume ;
      snd.play() ;

      return snd ;
    }
  } ;

  Object.defineProperties (manager, {
    "masterVolume": {
      get: function () { return masterVolume ; },
      set: function (v) { masterVolume = v ; }
    },
    "engine": {
      get: function() { return engine ; },
    }
  }) ;

  return manager ; // return


} ; // SoundManager
