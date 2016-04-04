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

  this.usingDebugCamera = false ;

  this.currentScene = null ;

} ;

Game.prototype = {
  init: function(desiredWidth, desiredHeight) {

    var renderType = this.getParameterByName('render') ;
    if (renderType === "") {
      renderType = 'webgl' ;
    }

    console.log ("renderType=" + renderType) ;

    this.assetManager = new AssetManager() ;

    this.setupPIXI(renderType, desiredWidth, desiredHeight) ;

    this.setupDebugUI() ;

    var game = this ;

    $( window ).resize(function() {
      game.calculateCanvasSizes (desiredWidth, desiredHeight) ;
      game.wireframeRender.setViewport (0, 0, game.canvasSettings.w, game.canvasSettings.h, 0.1, 1000) ;
      game.wireframeRender.setViewAsPerpsective (90) ;

      game.PIXIrenderer.resize (game.canvasSettings.w, game.canvasSettings.h) ;

      if (typeof (game.eventResize) !== 'undefined' && game.eventResize !== null) {
        game.resize () ;
      }

      if (typeof (game.currentScene) !== 'undefined' && game.currentScene !== null) {
        if (typeof (game.currentScene.resize) !== 'undefined' && game.currentScene.resize !== null) {
          game.currentScene.resize() ;
        }
      }
    }) ;

  },

  startNewScene: function(scene) {
    if (typeof (this.currentScene) !== 'undefined' && this.currentScene !== null) {
      this.currentScene.destroy() ;
    }

    console.log ('Switching scene to ' + (typeof(scene.name) !== 'undefined' ? scene.name : 'unknown') + '!') ;
    this.currentScene = scene ;

    scene.setup() ;
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

    if (this.usingDebugCamera) {
      this.wireframeRender.setCamera(
        new Vector3 (this.cameraMenu.posX, this.cameraMenu.posY, this.cameraMenu.posZ),
        new Vector3 (this.cameraMenu.rotX * math.DTR, this.cameraMenu.rotY * math.DTR, this.cameraMenu.rotZ * math.DTR)
      ) ;
    }

    this.currentScene.update(this.timeDelta) ;

    if (this.postAnimate !== null) {
      this.postAnimate(this.timeDelta) ;
    }

    this.currentScene.render() ;

    this.PIXIrenderer.render(this.stage);

    requestAnimationFrame (this.animate.bind(this)) ;
  },

  calculateCanvasSizes: function (desiredWidth, desiredHeight) {
    this.canvasSettings.desiredWidth = desiredWidth ;
    this.canvasSettings.desiredHeight = desiredHeight ;
    this.canvasSettings.ratio = Math.min (window.innerWidth / desiredWidth, (window.innerHeight - 5) / desiredHeight) ;

    this.canvasSettings.w = desiredWidth * this.canvasSettings.ratio ;
    this.canvasSettings.h = desiredHeight * this.canvasSettings.ratio ;

    console.log (window.innerHeight, this.canvasSettings.h) ;

    $("div#game").css({ top: ((window.innerHeight - 5) / 2 - this.canvasSettings.h / 2) + "px" });
    $("canvas#main").css({ left: (window.innerWidth / 2 - this.canvasSettings.w / 2) + "px" });
  },

  setupPIXI: function(renderType, desiredWidth, desiredHeight) {
    this.calculateCanvasSizes (desiredWidth, desiredHeight) ;

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
      this.currentScene = 'N/A' ;
    } ;

    /*var CameraMenu = function () {
      this.posX = 0.0 ;
      this.posY = 0.0 ;
      this.posZ = 100 ;
      this.rotX = 0 ;
      this.rotY = 0 ;
      this.rotZ = 0 ;
    } ;*/

    var gui = new dat.GUI({ autoPlace: false, width: 300 });

    gui.TEXT_CLOSED = "Close Debug" ;
    gui.TEXT_OPEN = "Open Debug" ;

    //if (this.getParameterByName('debugGui') === "true") {
    $("div#debuggui").append (gui.domElement) ;
    $("div#debuggui").hide() ;
    //}

    //var cameraMenu = new CameraMenu() ;
    var engineSettings = new EngineSettings() ;

    gui.add(engineSettings, 'timeScale', 0, 2);
    var game = this ;


    /*var camFolder = gui.addFolder ("Camera") ;
    camFolder.add(cameraMenu, 'posX', -1000, 1000);
    camFolder.add(cameraMenu, 'posY', -1000, 1000);
    camFolder.add(cameraMenu, 'posZ', -1000, 1000);
    camFolder.add(cameraMenu, 'rotX', 0, 360);
    camFolder.add(cameraMenu, 'rotY', 0, 360);
    camFolder.add(cameraMenu, 'rotZ', 0, 360);

    this.cameraMenu = cameraMenu ;*/
    this.engineSettings = engineSettings ;

    //gui.close() ;

    this.dgui = gui ;

  },

  getParameterByName: function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  },

  toVector_X: function (v) {
    return -this.PIXIrenderer.width / 2 + v ;
  },

  toVector_Y: function (v) {
    return -this.PIXIrenderer.height / 2 + v ;
  },

  toPixel_X: function (v) {
    return this.PIXIrenderer.width / 2 + v ;
  },

  toPixel_Y: function (v) {
    return this.PIXIrenderer.height / 2 + v ;
  },


};

module.exports = Game ;
