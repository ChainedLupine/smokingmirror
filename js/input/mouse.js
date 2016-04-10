module.exports = function MouseEvent(button, passThrough) {
  "use strict" ;

  var mouse = {} ;
  mouse.button = button ;
  mouse.isDown = false ;
  mouse.isUp = true ;
  mouse.press = undefined ;
  mouse.release = undefined ;
  mouse.move = undefined ;
  mouse.handlerPress = null ;
  mouse.handlerRelease = null ;
  mouse.handlerMove = null ;
  mouse.passThrough = typeof passThrough !== "undefined" ? passThrough : true ;

  mouse.downHandler = function(event) {
    if (event.button === mouse.button) {
      if (mouse.isUp && mouse.press) {
        mouse.press(event);
      }
      mouse.isDown = true;
      mouse.isUp = false;
    }
    if (!mouse.passThrough) {
      event.preventDefault();
    }
  };

  mouse.upHandler = function(event) {
    if (event.button === mouse.button) {
      if (mouse.isDown && mouse.release) {
        mouse.release(event);
      }
      mouse.isDown = false;
      mouse.isUp = true;
    }
    if (!mouse.passThrough) {
      event.preventDefault();
    }
  };

  mouse.moveHandler = function(event) {
    if (mouse.move) {
      mouse.move(event);
    }
    if (!mouse.passThrough) {
      event.preventDefault();
    }
  };

  mouse.enable = function() {
    if (mouse.press || mouse.release) {
      mouse.handlerPress = mouse.downHandler.bind(mouse) ;
      window.addEventListener(
        "mousedown", mouse.handlerPress, false
      );

      mouse.handlerRelease = mouse.upHandler.bind(mouse) ;
      window.addEventListener(
        "mouseup", mouse.handlerRelease, false
      );
    }

    if (mouse.move) {
      mouse.handlerMove = mouse.moveHandler.bind(mouse) ;
      window.addEventListener(
        "mousemove", mouse.handlerMove, false
      );
    }
  };

  mouse.disable = function() {
    if (mouse.handlerPress || mouse.handlerRelease) {
      window.removeEventListener(
        "mousedown", mouse.handlerPress, false
      );

      window.removeEventListener(
        "mouseup", mouse.handlerRelease, false
      );
    }

    if (mouse.handlerMove) {
      window.removeEventListener(
        "mousemove", mouse.handlerMove, false
      );
    }
  };

  return mouse ;
};
