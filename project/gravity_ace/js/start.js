/* globals SmokingMirror */


var blurScale = 0.9 ;
var animTick = 0 ;

var game = new SmokingMirror.Game() ;

var assetList = {
  images: {
    star_background: 'assets/images/star_background.png',
    displace: 'assets/images/displace.png',
    grid: 'assets/images/grid.png',
    eventhorizon_glow: 'assets/images/eventhorizon_glow.png',
  },
  models: {
    player: 'assets/objects/player3.obj'
  }
} ;

var scenes = {} ;

function loadAssetsAndStart () {
  game.assetManager.loadAssets (assetList, function() {
    $('#loader').hide() ;
    var sceneName = scenes.list[0].name ;
    game.startNewScene(new scenes.list[0].source(game)) ;
    game.startLoop() ;
  }) ;
}

function setupScenes() {
  scenes.list = [
    //{ name: 'FollowTesterScene', source: require('./scenes/followscene') },
    //{ name: 'ModelTesterScene', source: require('./scenes/modelscene') },
    //{ name: 'CurveTesterScene', source: require('./scenes/curvescene') },
    { name: 'PlayScene', source: require('./scenes/playscene') },
  ] ;


  scenes.classes = {} ;


  var sceneNames = [] ;
  for (var i = 0; i < scenes.list.length; i++) {
    sceneNames.push (scenes.list[i].name) ;
  }

  var SceneSettings = function() {
    this.currentScene = 'curveScene' ;
  } ;

  var sceneSettings = new SceneSettings() ;

  game.dgui.add(sceneSettings, 'currentScene', sceneNames).onFinishChange(function(value) {
    for (var i = 0; i < scenes.list.length; i++) {
      var sceneData = scenes.list[i] ;
      if (sceneData.name === value) {
        game.startNewScene(new sceneData.source(game)) ;
      }
    }
  }) ;

}

var shaders = {} ;

var pixelEffectContainer = new PIXI.Container() ,
    visualEffectsContainer  = new PIXI.Container() ;


function setupShaderEffects () {
  game.stage.addChild (pixelEffectContainer) ;

  pixelEffectContainer.addChild (visualEffectsContainer) ;

  // create the root of the scene graph
  shaders.renderTextureBlur = new PIXI.RenderTexture(game.PIXIrenderer, game.PIXIrenderer.width, game.PIXIrenderer.height);
  shaders.renderTextureGlow = new PIXI.RenderTexture(game.PIXIrenderer, game.PIXIrenderer.width, game.PIXIrenderer.height);

  var mosaicScale = 0.25 ;

  shaders.renderSpriteBlur = new PIXI.Sprite(shaders.renderTextureBlur) ;
  shaders.renderSpriteBlur.position.x = game.canvasSettings.w / 2 ;
  shaders.renderSpriteBlur.position.y = game.canvasSettings.h / 2 ;
  shaders.renderSpriteBlur.anchor.set(0.5) ;


  shaders.renderSpriteGlow = new PIXI.Sprite(shaders.renderTextureGlow) ;
  shaders.renderSpriteGlow.position.x = game.canvasSettings.w / 2 ;
  shaders.renderSpriteGlow.position.y = game.canvasSettings.h / 2 ;
  shaders.renderSpriteGlow.anchor.set(0.5) ;

  shaders.glowFilter = new SmokingMirror.Shaders.GlowFilter();

  shaders.blurFilter = new PIXI.filters.BlurFilter();
  shaders.blurFilter.blur = 50 ;

  shaders.renderSpriteGlow.filters = [shaders.glowFilter] ;
  shaders.renderSpriteBlur.filters = [shaders.blurFilter] ;
  shaders.renderSpriteBlur.alpha = 0.5 ;

  game.stage.addChild (pixelEffectContainer) ;

  shaders.renderSpriteGlow.blendMode = PIXI.BLEND_MODES.ADD;
  shaders.renderSpriteBlur.blendMode = PIXI.BLEND_MODES.OVERLAY;
  pixelEffectContainer.addChild (shaders.renderSpriteGlow) ;
  pixelEffectContainer.addChild (shaders.renderSpriteBlur) ;

  var pixelFilter = new PIXI.filters.PixelateFilter() ;
  pixelFilter.size = { x: 1, y: 1 } ;
  pixelEffectContainer.filters = [pixelFilter] ;
}


function postAnimate(dt) {

  shaders.renderTextureBlur.render(visualEffectsContainer, null, true);
  shaders.renderTextureGlow.render(visualEffectsContainer, null, true);

  shaders.blurFilter.blur = 30 * blurScale + Math.sin(animTick) * 10.0 * blurScale ;
  shaders.renderSpriteBlur.alpha = 1.0 - (0.7 + Math.abs (Math.sin(animTick)) * 0.2) * blurScale ;

  animTick += 0.1 * dt ;

}

game.addRenderChild = function (target) {
  visualEffectsContainer.addChild(target);
} ;

game.removeRenderChild = function (target) {
  visualEffectsContainer.removeChild(target);
} ;

game.getVisualEffectsContainer = function () {
  return visualEffectsContainer ;
} ;


$(document).ready (function() {

  game.init() ;

  game.pixelTo3D_X = function (v) {
    return -this.PIXIrenderer.width / 2 + v ;
  } ;

  game.pixelTo3D_Y = function (v) {
    return -this.PIXIrenderer.height / 2 + v ;
  } ;

  game.wireframeRender.setCamera(
    new SmokingMirror.Vector3 (0, 0, game.PIXIrenderer.height),
    new SmokingMirror.Vector3 (0, 0, 0)
  ) ;


  game.postAnimate = postAnimate ;

  setupShaderEffects() ;

  setupScenes() ;

  loadAssetsAndStart() ;

});
