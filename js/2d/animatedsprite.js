var AnimatedSprite = function (source, anims, game) {
  this.currAnim = {} ;

  this.game = game ;

  this.animStates = {} ;
  this.animationStack = [] ;
  this.currAnim = null ;
  this.currAnimState = null ;
  this._speed = 1 ;

  if (anims) {
    this.anims = anims ;
  }

  this.textures = null ;

  if (Array.isArray (source) && source.length > 0 && source[0] instanceof PIXI.Texture) { // source as array of textures
    this.textures = source ;
  } else if (source instanceof SmokingMirror.TwoD.SpriteSheet) { // must be a spritesheet
    this.textures = source.textures ;
  } else {
    throw new Error ("AnimatedSprite: Expect either array of Textures or SpriteSheet.") ;
  }

  // prepare animations
  if (anims) {
    if (anims.frames) {
        this.anims = { default: this.prepareAnimation (anims) } ;
    } else {
      var animNames = Object.keys (anims) ;
      for (var i = 0; i < animNames.length; i++) {
        var animName = animNames[i] ;
        this.anims[animName] = this.prepareAnimation(animName, anims[animName]) ;
      }
    }
  } else {
    this.prepareAnimation ({ frames: "all" }) ;
  }

  PIXI.Sprite.call(this, this.textures[0] instanceof PIXI.Texture ? this.textures[0] : this.textures[0].texture) ;
} ;

AnimatedSprite.prototype = Object.create(PIXI.Sprite.prototype);
AnimatedSprite.prototype.constructor = AnimatedSprite ;
module.exports = AnimatedSprite ;


Object.defineProperties(AnimatedSprite.prototype, {
  totalFrames: {
    get: function() {
      return this.textures.length;
    }
  },

  currAnimName: {
    get: function() {
      return this.currAnim ? this.currAnim.name : null ;
    }
  },

  currFrame: {
    get: function() {
      return this.currAnim ? this.currAnimState.currFrame : null ;
    }
  },

  numFrames: {
    get: function() {
      return this.currAnim ? this.currAnim.frames.length : 0 ;
    }
  },

  reverse: {
    get: function () { return this.currAnim ? this.currAnimState.reverse : false ; },
    set: function (v) {
      this.currAnimState.reverse = v ;
    }
  },

  loop: {
    get: function () { return this.currAnim ? this.currAnimState.loop : false ; },
    set: function (v) {
      this.currAnimState.loop = v ;
    }
  },

  speed: {
    get: function () { return this._speed ; },
    set: function (v) { this._speed = v ; }
  }
}); // defineProperties

AnimatedSprite.prototype.prepareAnimation = function (name, anim) {
  if (!anim) {
    anim = name ;
    name = "default" ;
  }
  if (typeof name !== "string" && name === "") {
    throw new Error ("Name of animation needs to be a non-empty string.") ;
  }
  anim.name = name ;
  if (!anim.speed) { anim.speed = 12 ; }
  if (typeof anim.loop === "undefined") { anim.loop = true ; }
  if (typeof anim.reverse === "undefined") { anim.reverse = false ; }
  if (!Array.isArray(anim.frames)) {
    anim.frames = [] ;
    for (var i = 0; i < this.textures.length; i++) {
      anim.frames.push (i) ;
    }
  }
  anim.perFrameDelay = (1 / anim.speed) ;
  anim.duration = anim.perFrameDelay * anim.frames.length ;

  var animdata = {} ;
  animdata.currTime = 0 ;
  animdata.currFrame = 0 ;
  animdata.playing = false ;
  animdata.loop = anim.loop ;
  animdata.reverse = anim.reverse ;

  this.animStates[name] = animdata ;

  return anim ;
} ;

AnimatedSprite.prototype.play = function (name) {
  if (!name) {
    name = "default" ;
  }

  if (this.anims.hasOwnProperty(name)) {
    this.currAnim = this.anims[name] ;
    this.currAnimState = this.animStates[name] ;
    this._texture = this.textures[this.currAnimState.currFrame] ;
    //this.reset() ;
    this.currAnimState.playing = true ;

  } else {
    throw new Error ("Animation of " + name + " not found!") ;
  }
} ;

AnimatedSprite.prototype.reset = function () {
  this.currAnimState.currTime = 0 ;
  this.currAnimState.currFrame = 0 ;
  //this.currAnimState.playing = false ;
  this.currAnimState.currFrame = this.currAnim.frames[this.currAnimState.reverse ? (this.currAnim.frames.length - 1) : 0] ;
  this._texture = this.textures[this.currAnimState.currFrame] ;
} ;

AnimatedSprite.prototype.update = function (dt) {
  if (this.currAnim) {
    var anim = this.currAnim ;
    var animState = this.currAnimState ;

    if (!animState.playing) {
      return ;
    }

    animState.currTime += dt * this._speed ;

    if (animState.currTime > anim.duration) {
      animState.currTime -= anim.duration ;
      if (!animState.loop) {
        animState.playing = false ;
        if (anim.onComplete) {
          anim.onComplete () ;
        } else {
          if (this.onComplete) { this.onComplete () ; }
        }
        return ;
      } else {
        if (anim.onCycle) {
           anim.onCycle () ;
        } else {
          if (this.onCycle) { this.onCycle () ; }
        }
      }
    }

    if (animState.playing) {
      //var idx = Math.abs (Math.round (((animState.currTime % anim.duration) / anim.duration) * (anim.frames.length - 1))) ;
      var idx = Math.abs (Math.floor ((animState.currTime % anim.duration) / anim.perFrameDelay)) ;
      animState.currFrame = anim.frames[animState.reverse ? (anim.frames.length - 1) - idx : idx] ;
      //console.log (animState.currFrame, animState.currTime % anim.duration, anim.perFrameDelay) ;

      this._texture = this.textures[animState.currFrame] ;
    }
  }
} ;

AnimatedSprite.prototype.destroy = function (dt) {
  this.textures = null ;
  this.game = null ;
  this.animStates = null ;
  this.animationStack = null ;
} ;

AnimatedSprite.prototype.stop = function () {
  if (this.currAnim) {
    this.currAnimState.playing = false ;
  }
} ;

AnimatedSprite.prototype.goto = function (frameIdx) {
  if (this.currAnim) {
    if (0 < frameIdx < this.currAnim.frames.length ) {
      //this.currAnimState.currFrame = this.currAnim.frames[animState.reverse ? (this.currAnim.frames.length - frameIdx) : frameIdx] ;
      this.currAnimState.currFrame = frameIdx ;
      this.currAnimState.currTime = frameIdx * this.currAnim.perFrameDelay ;
      this._texture = this.textures[this.currAnimState.currFrame] ;
    }
  }
} ;

AnimatedSprite.prototype.push = function () {
  if (this.currAnim) {
    var state = {
      name: this.currAnimName,
      state: Object.assign ({}, this.currAnimState)
    } ;

    this.animationStack.push (state) ;
  } else {
    throw new Error ("No current animation!") ;
  }
} ;

AnimatedSprite.prototype.pop = function () {
  if (this.animationStack.length > 0) {
    var item = this.animationStack.pop() ;
    this.animStates[item.name] = Object.assign ({}, item.state) ;
    this.currAnim = this.anims[item.name] ;
    this.currAnimState = this.animStates[item.name] ;
    this._texture = this.textures[this.currAnimState.currFrame] ;
  } else {
    throw new Error ("Animation stack empty!") ;
  }
} ;
