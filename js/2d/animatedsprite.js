var AnimatedSprite = function (source, anims) {
  this.currAnim = {} ;

  if (anims) {
    this.anims = anims ;
  }

  this.textures = null ;

  if (Array.isArray (source) && source.length > 0) { // source as array of textures
    this.textures = source ;
  } else if (typeof (source) === "object") { // must be a spritesheet
    this.textures = source.textures ;
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

/*  textures: {
    get: function() {
      return this._textures;
    },
    set: function(value) {
      if (value[0] instanceof core.Texture) {
        this._textures = value;
        this._durations = null;
      } else {
        this._textures = [];
        this._durations = [];
        for (var i = 0; i < value.length; i++) {
          this._textures.push(value[i].texture);
          this._durations.push(value[i].time);
        }
      }
    }
  },
*/
/*  currentFrame: {
    get: function() {
      var currentFrame = Math.floor(this._currentTime) % this._textures.length;
      if (currentFrame < 0) {
        currentFrame += this._textures.length;
      }
      return currentFrame;
    }
  }*/
});
AnimatedSprite.prototype.update = function (dt) {

} ;

AnimatedSprite.prototype.destroy = function (dt) {

} ;
