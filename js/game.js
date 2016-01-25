/* globals alert */
/* globals dat */
/* globals requestAnimationFrame */

var WireframeRender = require ('./smokingmirror/render') ;
var GlowFilter = require ('./shaders/glowfilter') ;
var Player = require ('./player') ;
var Vector3 = require ('./smokingmirror/math/vector3') ;

var Game = function () {
  this.canvasSettings = { w: 900, h: 600 } ;
  this.PIXIrenderer = null ;
  this.wireframeRender = new WireframeRender() ;
  this.blurScale = 0.9 ;
} ;

Game.prototype = {
  init: function() {

    var renderType = this.getParameterByName('render') ;
    if (renderType === "") {
      renderType = 'webgl' ;
    }

    console.log ("renderType=" + renderType) ;

    this.setupPIXI(renderType) ;

    this.setupDebugUI() ;

    this.setupShaderEffects() ;

    var playerShipDef ;
    var game = this ;

    $.when (
      $.get ('assets/objects/player2.obj', function (data) {
        playerShipDef = data ;
      })
    ).then (function() {
      game.player = new Player (playerShipDef, game.wireframeRender) ;

      game.player.update() ;

      game.animate() ;
    }) ;
  },

  animate: function () {
    this.player.pos.x = this.objMenu.posX ;
    this.player.pos.y = this.objMenu.posY ;
    this.player.pos.z = this.objMenu.posZ ;

    this.player.rot.x = this.objMenu.rotX * 0.0174533 ;
    this.player.rot.y = this.objMenu.rotY * 0.0174533 ;
    this.player.rot.z = this.objMenu.rotZ * 0.0174533 ;

    this.wireframeRender.setCamera(
      //new Vector3 (0, 0, 0), new Vector3 (0, 0, 0)
      new Vector3 (this.cameraMenu.posX, this.cameraMenu.posY, this.cameraMenu.posZ),
      new Vector3 (this.cameraMenu.rotX * 0.0174533, this.cameraMenu.rotY * 0.0174533, this.cameraMenu.rotZ * 0.0174533)
    ) ;

    this.player.update() ;

    this.modelGraphics.clear() ;
    this.player.render(this.modelGraphics) ;

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
    var ObjMenu = function() {
      this.posX = 0.0 ;
      this.posY = 0.0 ;
      this.posZ = -7.0 ;
      this.rotX = 90 ;
      this.rotY = 0 ;
      this.rotZ = 0 ;
    } ;
    var CameraMenu = function () {
      this.posX = 0.0 ;
      this.posY = 0.0 ;
      this.posZ = 0 ;
      this.rotX = 0 ;
      this.rotY = 0 ;
      this.rotZ = 0 ;
    } ;

    var gui = new dat.GUI({ autoPlace: false });

    $("div#debuggui").append (gui.domElement) ;

    var objMenu = new ObjMenu() ;
    var cameraMenu = new CameraMenu() ;

    var objFolder = gui.addFolder ("Spaceship") ;
    objFolder.add(objMenu, 'posX', -10, 10);
    objFolder.add(objMenu, 'posY', -10, 10);
    objFolder.add(objMenu, 'posZ', -10, 10);
    objFolder.add(objMenu, 'rotX', 0, 360);
    objFolder.add(objMenu, 'rotY', 0, 360);
    objFolder.add(objMenu, 'rotZ', 0, 360);

    var camFolder = gui.addFolder ("Camera") ;
    camFolder.add(cameraMenu, 'posX', -10, 10);
    camFolder.add(cameraMenu, 'posY', -10, 10);
    camFolder.add(cameraMenu, 'posZ', -10, 10);
    camFolder.add(cameraMenu, 'rotX', 0, 360);
    camFolder.add(cameraMenu, 'rotY', 0, 360);
    camFolder.add(cameraMenu, 'rotZ', 0, 360);

    this.objMenu = objMenu ;
    this.cameraMenu = cameraMenu ;

    objFolder.open() ;

  },

  getParameterByName: function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

};

module.exports = Game ;
