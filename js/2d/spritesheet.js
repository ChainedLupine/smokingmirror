

var SpriteSheet = function (sheetJSON, sheetImage, format) {
  var json ;

  if (typeof (sheetJSON) !== "object") {
    json = JSON.parse (sheetJSON) ;
  } else {
    json = sheetJSON ;
  }

  var spriteSheetTx = new PIXI.BaseTexture(sheetImage) ;

  this.textures = [] ;

  format = format ? format : SpriteSheet.FORMAT_TEXTUREPACKER ;

  if (format === SpriteSheet.FORMAT_TEXTUREPACKER && json.frames && json.meta) {
    var frameNames = Object.keys (json.frames) ;

    for (var i = 0; i < frameNames.length; i++) {
      var frameName = frameNames[i] ;
      var frameDefinition = json.frames[frameName] ;
      var frameBounds ;
      var frameTrim = null ;

      // sprite is rotated 90 degrees for maximum packing
      if (frameDefinition.rotated) {
        frameBounds = new PIXI.Rectangle (
          frameDefinition.frame.x, frameDefinition.frame.y,
          frameDefinition.frame.h, frameDefinition.frame.w
        ) ;
      } else {
        frameBounds = new PIXI.Rectangle (
          frameDefinition.frame.x, frameDefinition.frame.y,
          frameDefinition.frame.w, frameDefinition.frame.h
        ) ;
      }

      if (frameDefinition.trimmed) {
        frameTrim = new PIXI.Rectangle (
          frameDefinition.spriteSourceSize.x, frameDefinition.spriteSourceSize.y,
          frameDefinition.sourceSize.w, frameDefinition.sourceSize.h
        ) ;
      }

      if (frameDefinition.rotated) {
        var t = frameBounds.width ;
        frameBounds.width = frameBounds.height ;
        frameBounds.height = t ;
      }

      var frameTx = new PIXI.Texture (spriteSheetTx, frameBounds, frameBounds.clone(), frameTrim, frameDefinition.rotated) ;
      this.textures.push (frameTx) ;
    }

    //// now that we've generated a series of textures, turn them into a movieclip
    //this.movieClip = new PIXI.extras.MovieClip (textures) ;

  } else {
    throw new Error ("This is not a sprite sheet!") ;
  }
} ;

SpriteSheet.FORMAT_TEXTUREPACKER = "TP" ;


SpriteSheet.prototype.destroy = function () {
  this.textures = null ;
} ;

module.exports = SpriteSheet ;
