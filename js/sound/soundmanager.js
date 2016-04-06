var SoundEngine = require ('./engine') ;

module.exports = function SoundManager() {

  var engine = new SoundEngine() ;

  var masterVolume = 1.0 ;

  var activeSounds = [] ;

  var manager = {
    play: function (snd, volume) {
      if (typeof volume === 'undefined') { volume = 1.0 ; }
      snd.originalVolume = volume ;
      snd.volume = volume * masterVolume ;
      var idx = activeSounds.push (snd) - 1 ;
      console.log ("Creating snd at " + idx) ;
      snd.play (function () {
        activeSounds.splice (idx, 1) ;
        console.log ("Removing snd at " + idx) ;
      }) ;

      return snd ;
    },

    update: function (dt) {
      for (var i = 0; i < activeSounds.length; i++) {
        var snd = activeSounds[i] ;
        snd.volume = snd.originalVolume * masterVolume ;
      }
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
