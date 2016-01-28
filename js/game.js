/* globals alert */
/* globals dat */
/* globals requestAnimationFrame */

var WireframeRender = require ('./smokingmirror/render') ;
var GlowFilter = require ('./shaders/glowfilter') ;
var AssetManager = require ('./assets') ;
var math = require('./smokingmirror/math/misc') ;

var ShooterScene = require('./scenes/shooterscene') ;
var CurveTesterScene = require('./scenes/tests/curvescene') ;
var FollowTesterScene = require('./scenes/tests/followscene') ;
var ModelTesterScene = require('./scenes/tests/modelscene') ;
var HelperTesterScene = require('./scenes/tests/helperscene') ;

var assetList = {
  models: {
    player: 'assets/objects/player3.obj'
  }
} ;

var Game = function () {
  this.canvasSettings = { w: 900, h: 600 } ;
  this.PIXIrenderer = null ;
  this.wireframeRender = new WireframeRender() ;
  this.blurScale = 0.9 ;

  this.timeCurrent = null ;
  this.timeDelta = 0 ;
  this.timePrev = null ;

  this.scenes = [
    { name: 'FollowTesterScene', source: './scenes/tests/followscene' },
    { name: 'ModelTesterScene', source: './scenes/tests/modelscene' },
    { name: 'CurveTesterScene', source: './scenes/tests/curvescene' },
    { name: 'HelperTesterScene', source: './scenes/tests/helperscene' },
  ] ;

  this.sceneClasses = [] ;
} ;

Game.prototype = {
  init: function() {

    var renderType = this.getParameterByName('render') ;
    if (renderType === "") {
      renderType = 'webgl' ;
    }

    console.log ("renderType=" + renderType) ;

    this.assetManager = new AssetManager() ;

    this.setupPIXI(renderType) ;

    this.setupDebugUI() ;

    this.setupShaderEffects() ;

    var game = this ;

    // initialize scenes
    for (var i = 0; i < this.scenes.length; i++) {
      var sceneData = this.scenes[i] ;
      this[sceneData.name] = require (sceneData.source) ;
    }

    this.assetManager.loadAssets (assetList, function() {
      $('#loader').hide() ;
      //game.startNewScene(new ShooterScene(game)) ;
      //game.startNewScene(new CurveTesterScene(game)) ;
      var sceneName = game.scenes[0].name ;
      game.startNewScene(new game[sceneName](game)) ;
      requestAnimationFrame (game.animate.bind(game)) ;
    }) ;
  },

  startNewScene: function(scene) {
    if (typeof (this.currentScene) !== 'undefined' && this.currentScene !== null) {
      this.currentScene.destroy() ;
    }

    console.log ('Switching scene to ' + (typeof(scene.name) !== 'undefined' ? scene.name : 'unknown') + '!') ;

    scene.setup() ;
    this.currentScene = scene ;
  },



  animate: function (timestamp) {
    // update timedelta
    if (!this.timePrev) {
      this.timePrev = timestamp ;
    }
    this.timeDelta = ((timestamp - this.timePrev) / 1000) * this.engineSettings.timeScale ;
    this.timePrev = timestamp ;

    if (this.timeDelta > /*0.01666*/ 0.1) {
      this.timeDelta = /*0.01666*/ 0.1 ;
    }

    this.wireframeRender.setCamera(
      new math.Vector3 (this.cameraMenu.posX, this.cameraMenu.posY, this.cameraMenu.posZ),
      new math.Vector3 (this.cameraMenu.rotX * math.DTR, this.cameraMenu.rotY * math.DTR, this.cameraMenu.rotZ * math.DTR)
    ) ;

    this.currentScene.update(this.timeDelta) ;

    this.modelGraphics.clear() ;
    this.currentScene.render() ;

    this.renderTextureBlur.render(this.visualEffectsContainer, null, true);
    this.renderTextureGlow.render(this.visualEffectsContainer, null, true);

    this.PIXIrenderer.render(this.stage);

    this.blurFilter.blur = 30 * this.blurScale + Math.sin(this.animTick) * 10.0 * this.blurScale ;
    this.renderSpriteBlur.alpha = 1.0 - (0.7 + Math.abs (Math.sin(this.animTick)) * 0.2) * this.blurScale ;

    this.animTick += 0.03 ;

    requestAnimationFrame (this.animate.bind(this)) ;

  },

  setupShaderEffects: function () {
    // create the root of the scene graph
    this.renderTextureBlur = new PIXI.RenderTexture(this.PIXIrenderer, this.PIXIrenderer.width, this.PIXIrenderer.height);
    this.renderTextureGlow = new PIXI.RenderTexture(this.PIXIrenderer, this.PIXIrenderer.width, this.PIXIrenderer.height);

    var mosaicScale = 0.25 ;

    this.renderSpriteBlur = new PIXI.Sprite(this.renderTextureBlur) ;
    this.renderSpriteBlur.position.x = this.canvasSettings.w / 2 ;
    this.renderSpriteBlur.position.y = this.canvasSettings.h / 2 ;
    this.renderSpriteBlur.anchor.set(0.5) ;


    this.renderSpriteGlow = new PIXI.Sprite(this.renderTextureGlow) ;
    this.renderSpriteGlow.position.x = this.canvasSettings.w / 2 ;
    this.renderSpriteGlow.position.y = this.canvasSettings.h / 2 ;
    this.renderSpriteGlow.anchor.set(0.5) ;

    this.glowFilter = new GlowFilter();

    this.blurFilter = new PIXI.filters.BlurFilter();
    this.blurFilter.blur = 50 ;

    this.renderSpriteGlow.filters = [this.glowFilter] ;
    this.renderSpriteBlur.filters = [this.blurFilter] ;
    this.renderSpriteBlur.alpha = 0.5 ;

    this.stage.addChild (this.pixelEffectContainer) ;

    this.renderSpriteGlow.blendMode = PIXI.BLEND_MODES.ADD;
    this.pixelEffectContainer.addChild (this.renderSpriteGlow) ;
    this.renderSpriteBlur.blendMode = PIXI.BLEND_MODES.OVERLAY;
    this.pixelEffectContainer.addChild (this.renderSpriteBlur) ;

    var pixelFilter = new PIXI.filters.PixelateFilter() ;
    pixelFilter.size = { x: 1, y: 1 } ;
    this.pixelEffectContainer.filters = [pixelFilter] ;
  },

  setupPIXI: function(renderType) {
    this.wireframeRender.setViewport (0, 0, this.canvasSettings.w, this.canvasSettings.h, 0.1, 1000) ;
    this.wireframeRender.setViewAsPerpsective (90) ;

    var canvasId = $("canvas#main").get(0) ;

    if (renderType === 'webgl') {
      this.PIXIrenderer = new PIXI.WebGLRenderer ( this.canvasSettings.w, this.canvasSettings.h, { view: canvasId, backgroundColor : 0x000000} );
    } else if (renderType === 'canvas') {
      this.PIXIrenderer = new PIXI.CanvasRenderer ( this.canvasSettings.w, this.canvasSettings.h, { view: canvasId, backgroundColor : 0x000000} );
    } else {
      alert ("Unknown render method.") ;
      return ;
    }

    this.stage = new PIXI.Container() ;
    this.stage.interactive = true;

    this.pixelEffectContainer = new PIXI.Container() ;
    this.stage.addChild (this.pixelEffectContainer) ;

    this.visualEffectsContainer = new PIXI.Container() ;
    this.pixelEffectContainer.addChild (this.visualEffectsContainer) ;

    this.animTick = 0 ;

    this.modelGraphics = new PIXI.Graphics() ;

    this.visualEffectsContainer.addChild(this.modelGraphics);

  },

  setupDebugUI: function() {
    var EngineSettings = function() {
      this.timeScale = 1.0 ;
      this.currentScene = 'curveScene' ;
    } ;

    var CameraMenu = function () {
      this.posX = 0.0 ;
      this.posY = 0.0 ;
      this.posZ = 100 ;
      this.rotX = 0 ;
      this.rotY = 0 ;
      this.rotZ = 0 ;
    } ;

    var gui = new dat.GUI({ autoPlace: false });

    $("div#debuggui").append (gui.domElement) ;

    var cameraMenu = new CameraMenu() ;
    var engineSettings = new EngineSettings() ;

    //var engineFolder = gui.addFolder ("SmokingMirror Engine") ;
    gui.add(engineSettings, 'timeScale', 0, 2);
    var sceneList = [] ;
    for (var i = 0; i < this.scenes.length; i++) {
      sceneList.push (this.scenes[i].name) ;
    }

    var game = this ;

    gui.add(engineSettings, 'currentScene', sceneList).onFinishChange(function(value) {
      game.startNewScene(new game[value](game)) ;
    }) ;

    var camFolder = gui.addFolder ("Camera") ;
    camFolder.add(cameraMenu, 'posX', -1000, 1000);
    camFolder.add(cameraMenu, 'posY', -1000, 1000);
    camFolder.add(cameraMenu, 'posZ', -1000, 1000);
    camFolder.add(cameraMenu, 'rotX', 0, 360);
    camFolder.add(cameraMenu, 'rotY', 0, 360);
    camFolder.add(cameraMenu, 'rotZ', 0, 360);

    this.cameraMenu = cameraMenu ;
    this.engineSettings = engineSettings ;

    //gui.close() ;

    this.dgui = gui ;

  },

  getParameterByName: function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

};

module.exports = Game ;
