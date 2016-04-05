module.exports = function InputManager() {

  var inputStates = [] ;
  var newState = null ;
  var currState = null ;

  var enable = function (name) {
    var state = currState ;

    if (typeof name !== "undefined") {

    } else {
      if (currState === null) {
        throw new Error ("No state defined!  Did you forget the begin/end?") ;
      }
    }

    console.log ("Enable: Enabling input state of " + state.name) ;

    for (var i = 0; i < state.events.length; i++) {
      state.events[i].enable() ;
    }
  } ;

  var disable = function (name) {
    var state = currState ;

    if (typeof name !== "undefined") {

    } else {
      if (currState === null) {
        throw new Error ("No state defined!  Did you forget the begin/end?") ;
      }
    }

    console.log ("Disable: Disabling input state of " + state.name) ;

    for (var i = 0; i < state.events.length; i++) {
      state.events[i].disable() ;
    }
  } ;

  return {
    KEY_BACKSPACE:  8,
    KEY_TAB:        9,
    KEY_ENTER:      13,
    KEY_SHIFT:      16,
    KEY_CTRL:       17,
    KEY_ALT:        18,
    KEY_PAUSE:      19,
    KEY_CAPSLOCK:   20,
    KEY_ESCAPE:     27,
    KEY_SPACE:      32,
    KEY_PAGEUP:     33,
    KEY_PAGEDN:     34,
    KEY_END:        35,
    KEY_HOME:       36,
    KEY_LEFT:       37,
    KEY_UP:         38,
    KEY_RIGHT:      39,
    KEY_DOWN:       40,
    KEY_INSERT:     45,
    KEY_DELETE:     36,
    KEY_0:          48,
    KEY_1:          49,
    KEY_2:          50,
    KEY_3:          51,
    KEY_4:          52,
    KEY_5:          53,
    KEY_6:          54,
    KEY_7:          55,
    KEY_8:          56,
    KEY_9:          57,
    KEY_A:          65,
    KEY_B:          66,
    KEY_C:          67,
    KEY_D:          68,
    KEY_E:          69,
    KEY_F:          70,
    KEY_G:          71,
    KEY_H:          72,
    KEY_I:          73,
    KEY_J:          74,
    KEY_K:          75,
    KEY_L:          76,
    KEY_M:          77,
    KEY_N:          78,
    KEY_O:          79,
    KEY_P:          80,
    KEY_Q:          81,
    KEY_R:          82,
    KEY_S:          83,
    KEY_T:          84,
    KEY_U:          85,
    KEY_V:          86,
    KEY_W:          87,
    KEY_X:          88,
    KEY_Y:          89,
    KEY_Z:          90,
    KEY_F1:         112,
    KEY_F2:         113,
    KEY_F3:         114,
    KEY_F4:         115,
    KEY_F5:         116,
    KEY_F6:         117,
    KEY_F7:         118,
    KEY_F8:         119,
    KEY_F9:         120,
    KEY_F10:        121,
    KEY_F11:        122,
    KEY_F12:        123,
    KEY_SEMI:       186,
    KEY_EQUAL:      187,
    KEY_COMMA:      188,
    KEY_DASH:       189,
    KEY_PERIOD:     190,
    KEY_SLASH:      191,
    KEY_GRAVE:      192,
    KEY_LBRACKET:   219,
    KEY_BACKSLASH:  220,
    KEY_RBRACKET:   221,
    KEY_SINGLEQUOTE:222,

    MOUSE_LEFT:       0,
    MOUSE_MIDDLE:     1,
    MOUSE_RIGHT:      2,

    begin: function (name) {
      newState = { events: [] } ;
      newState.name = typeof name !== "undefined" ? name : "default" ;
      console.log ("Begin: Defining input state of " + newState.name) ;
    },

    end: function () {
      if (newState === null) {
        throw new Error ("No state in progress!  Did you forget the begin?") ;
      }

      currState = newState ;
      console.log ("End: Defined new input state of " + currState.name) ;
    },

    createKeyEvent: function (keyCode, onPress, onRelease) {
      if (newState === null) {
        throw new Error ("No state in progress!  Did you forget the begin?") ;
      }

      var key = SmokingMirror.Input.KeyboardEvent (keyCode) ;
      key.press = onPress ;
      key.release = onRelease ;

      if (newState !== null) {
        newState.events.push (key) ;
      }

      return key ;
    },

    createMouseMoveEvent: function (onMove, passThrough) {
      if (newState === null) {
        throw new Error ("No state in progress!  Did you forget the begin?") ;
      }

      var mouse = SmokingMirror.Input.MouseEvent (null, passThrough) ;
      mouse.move = onMove ;

      if (newState !== null) {
        newState.events.push (mouse) ;
      }

      return mouse ;
    },

    createMouseEvent: function (button, onPress, onRelease, passThrough) {
      if (newState === null) {
        throw new Error ("No state in progress!  Did you forget the begin?") ;
      }

      var mouse = SmokingMirror.Input.MouseEvent (button, passThrough) ;
      mouse.press = onPress ;
      mouse.release = onRelease ;

      if (newState !== null) {
        newState.events.push (mouse) ;
      }

      return mouse ;
    },

    createTouchEvent: function (onStart, onEnd, onMove, passThrough) {
      if (newState === null) {
        throw new Error ("No state in progress!  Did you forget the begin?") ;
      }

      var touch = SmokingMirror.Input.TouchEvent (passThrough) ;
      touch.start = onStart ;
      touch.end = onEnd ;
      touch.move = onMove ;

      if (newState !== null) {
        newState.events.push (touch) ;
      }

      return touch ;
    },



    getCurrentName: function () {
      return currState !== null ? currState.name : null ;
    },

    enable: enable,
    disable: disable,

    push: function () {
      disable() ;
      inputStates.push (currState) ;
    },

    pop: function () {
      disable() ;
      currState = inputStates.pop() ;
      enable() ;
    },

    clear: function () {
      if (currState !== null) {
        console.log ("Clear: Disabling current input state of " + currState.name) ;
        disable() ;
      }

      for (var si = 0; si < inputStates.length; si++) {
        var state = inputStates[si] ;
        console.log ("Clear: Disabling input state of " + state.name) ;

        for (var i = 0; i < state.events.length; i++) {
          state.events[i].disable() ;
          state.events[i] = null ;
        }
      }

      inputStates = [] ;
      currState = null ;
      newState = null ;
    },


  } ; // return


} ; // InputManager
