module.exports = function MouseEvent(passThrough) {
  "use strict" ;

  var touch = {} ;
  touch.handlerStart = null ;
  touch.handlerEnd = null ;
  touch.handlerMove = null ;
  touch.start = undefined ;
  touch.end = undefined ;
  touch.move = undefined ;
  touch.passThrough = typeof passThrough !== "undefined" ? passThrough : true ;

  touch.startHandler = function(event) {
    if (touch.start) {
      touch.start(event) ;
    }
    if (!touch.passThrough) {
      event.preventDefault();
    }
  };

  touch.endHandler = function(event) {
    if (touch.end) {
      touch.end(event) ;
    }
    if (!touch.passThrough) {
      event.preventDefault();
    }
  };

  touch.moveHandler = function(event) {
    if (touch.move) {
      touch.move(event);
    }
    if (!touch.passThrough) {
      event.preventDefault();
    }
  };

  touch.enable = function() {
    if (touch.start || touch.end) {
      touch.handlerStart = touch.startHandler.bind(touch) ;
      window.addEventListener(
        "touchstart", touch.handlerStart, false
      );

      touch.handlerEnd = touch.endHandler.bind(touch) ;
      window.addEventListener(
        "touchend", touch.handlerEnd, false
      );
    }

    if (touch.move) {
      touch.handlerMove = touch.moveHandler.bind(touch) ;
      window.addEventListener(
        "touchmove", touch.handlerMove, false
      );
    }
  };

  touch.disable = function() {
    if (touch.start || touch.end) {
      window.removeEventListener(
        "touchstart", touch.handlerStart, false
      );

      window.removeEventListener(
        "touchend", touch.handlerEnd, false
      );
    }

    if (touch.move) {
      window.removeEventListener(
        "touchmove", touch.handlerMove, false
      );
    }
  };


  return touch ;
};
