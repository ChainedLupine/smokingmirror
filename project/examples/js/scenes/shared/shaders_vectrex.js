// common shaders used for the vectrex wireframe look

module.exports = function (game) {

  var shaders = {} ;

  var pixelEffectsCtr = new PIXI.Container() ,
      sceneCtr  = new PIXI.Container() ;

  var blurScale = 0.9 ;
  var animTick = 0 ;

  function postAnimate(dt) {
    shaders.renderTextureBlur.render(sceneCtr, null, true, false);
    shaders.renderTextureGlow.render(sceneCtr, null, true, false);

    shaders.blurFilter.blur = 15 ; //30 * blurScale + Math.sin(animTick) * 10.0 * blurScale ;
    shaders.renderSpriteBlur.alpha = 1.0 - (0.7 + Math.abs (Math.sin(animTick)) * 0.2) * blurScale ;

    animTick += 0.1 * dt ;
  }

  return {

    setup: function() {
      game.stage.addChild (sceneCtr) ;
      game.stage.addChild (pixelEffectsCtr) ;

      // create the root of the scene graph
      shaders.renderTextureBlur = new PIXI.RenderTexture(game.PIXIrenderer, game.PIXIrenderer.width, game.PIXIrenderer.height);
      shaders.renderTextureGlow = new PIXI.RenderTexture(game.PIXIrenderer, game.PIXIrenderer.width, game.PIXIrenderer.height);

      var mosaicScale = 0.25 ;

      // blur filter and sprite
      shaders.blurFilter = new PIXI.filters.BlurFilter();
      shaders.blurFilter.blur = 50 ;

      shaders.renderSpriteBlur = new PIXI.Sprite(shaders.renderTextureBlur) ;
      shaders.renderSpriteBlur.position.x = game.canvasSettings.w / 2 ;
      shaders.renderSpriteBlur.position.y = game.canvasSettings.h / 2 ;
      shaders.renderSpriteBlur.anchor.set(0.5) ;
      shaders.renderSpriteBlur.filters = [shaders.blurFilter] ;
      shaders.renderSpriteBlur.alpha = 0.5 ;

      // glow filter and sprite
      shaders.glowFilter = new SmokingMirror.Shaders.GlowFilter();

      shaders.renderSpriteGlow = new PIXI.Sprite(shaders.renderTextureGlow) ;
      shaders.renderSpriteGlow.position.x = game.canvasSettings.w / 2 ;
      shaders.renderSpriteGlow.position.y = game.canvasSettings.h / 2 ;
      shaders.renderSpriteGlow.anchor.set(0.5) ;
      shaders.renderSpriteGlow.filters = [shaders.glowFilter] ;

      // setup blending modes
      shaders.renderSpriteGlow.blendMode = PIXI.BLEND_MODES.ADD;
      shaders.renderSpriteBlur.blendMode = PIXI.BLEND_MODES.OVERLAY;
      pixelEffectsCtr.addChild (shaders.renderSpriteGlow) ;
      pixelEffectsCtr.addChild (shaders.renderSpriteBlur) ;

      game.postAnimate = postAnimate ;

    }, // setup

    destroy: function() {
      game.postAnimate = null ;
      shaders.renderSpriteGlow.filters = null ;
      shaders.renderSpriteBlur.filters = null ;
      pixelEffectsCtr.removeChild (shaders.renderSpriteGlow) ;
      pixelEffectsCtr.removeChild (shaders.renderSpriteBlur) ;
      shaders.renderTextureBlur = null ;
      shaders.renderTextureGlow = null ;

      game.stage.removeChild (sceneCtr) ;
      game.stage.removeChild (pixelEffectsCtr) ;
    },

    resize: function () {
      shaders.renderTextureBlur.resize (game.PIXIrenderer.width, game.PIXIrenderer.height, true) ;
      shaders.renderTextureGlow.resize (game.PIXIrenderer.width, game.PIXIrenderer.height, true) ;
      shaders.renderSpriteBlur.position.x = game.canvasSettings.w / 2 ;
      shaders.renderSpriteBlur.position.y = game.canvasSettings.h / 2 ;
      shaders.renderSpriteGlow.position.x = game.canvasSettings.w / 2 ;
      shaders.renderSpriteGlow.position.y = game.canvasSettings.h / 2 ;
    },

    addRenderChild: function (target) {
      sceneCtr.addChild(target);
    },

    removeRenderChild: function (target) {
      sceneCtr.removeChild(target);
    },

    getSceneCtr: function () {
      return sceneCtr ;
    },

    getEffectsCtr: function () {
      return pixelEffectsCtr ;
    },

  } ; // methods

} ; // shaders
