/* globals alert */
/* globals dat */
/* globals requestAnimationFrame */


var AssetManager = require('./assets') ;
var WireframeRender = require('./3d/render') ;
var Vector3 = require('./3d/math/vector3') ;
var math = require('./3d/math/misc') ;

var Game = function () {
  this.canvasSettings = { w: 900, h: 600 } ;
  this.PIXIrenderer = null ;
  this.wireframeRender = new WireframeRender() ;

  this.timeCurrent = null ;
  this.timeDelta = 0 ;
  this.timePrev = null ;

  this.postAnimate = null ;

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

    var game = this ;

  },

  startNewScene: function(scene) {
    if (typeof (this.currentScene) !== 'undefined' && this.currentScene !== null) {
      this.currentScene.destroy() ;
    }

    console.log ('Switching scene to ' + (typeof(scene.name) !== 'undefined' ? scene.name : 'unknown') + '!') ;

    scene.setup() ;
    this.currentScene = scene ;
  },

  startLoop: function() {
    requestAnimationFrame (this.animate.bind(this)) ;
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
      new Vector3 (this.cameraMenu.posX, this.cameraMenu.posY, this.cameraMenu.posZ),
      new Vector3 (this.cameraMenu.rotX * math.DTR, this.cameraMenu.rotY * math.DTR, this.cameraMenu.rotZ * math.DTR)
    ) ;

    this.currentScene.update(this.timeDelta) ;

    if (this.postAnimate !== null) {
      this.postAnimate(this.timeDelta) ;
    }

    this.currentScene.render() ;

    this.PIXIrenderer.render(this.stage);

    requestAnimationFrame (this.animate.bind(this)) ;

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

    gui.add(engineSettings, 'timeScale', 0, 2);
    var game = this ;


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
