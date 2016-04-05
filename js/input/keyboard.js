module.exports = function KeyboardEvent(keyCode) {
  "use strict" ;

  var key = {} ;
  key.code = keyCode ;
  key.isDown = false ;
  key.isUp = true ;
  key.press = undefined ;
  key.release = undefined ;
  key.handlerPress = null ;
  key.handlerRelease = null ;

  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) {
        key.press();
      }
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) {
        key.release();
      }
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  key.enable = function() {
    key.handlerPress = key.downHandler.bind(key) ;
    key.handlerRelease = key.upHandler.bind(key) ;
    window.addEventListener(
      "keydown", key.handlerPress, false
    );
    window.addEventListener(
      "keyup", key.handlerRelease, false
    );
  };

  key.disable = function() {
    window.removeEventListener(
      "keydown", key.handlerPress, false
    );
    window.removeEventListener(
      "keyup", key.handlerRelease, false
    );
  };

  return key;
};
