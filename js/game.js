/* globals alert */
/* globals dat */
/* globals requestAnimationFrame */
/* globals Stats */
/* globals Matter */


var AssetManager = require('./assets') ;
var WireframeRender = require('./3d/render') ;
var Vector3 = require('./3d/math/vector3') ;
var math = require('./3d/math/misc') ;


var Game = function () {
  this.canvasSettings = { w: 900, h: 600 } ;
  this.PIXIrenderer = null ;
  this.wireframeRender = new WireframeRender() ;

  this.engineSettings = {
    timeScale: 1.0,
    currentScene: null,
  } ;

  this.timeCurrent = null ;
  this.timeDelta = 0 ;
  this.timePrev = null ;

  this.stats = null ;

  this.onResize = null ;

  this.postAnimate = null ;

  this.renderType = null ;

  this.usingDebugCamera = false ;

  this.currentScene = null ;

  this.debugFlags = { ALL: 0xffff, DAT_GUI: 0x1, STATS_FPS: 0x2 } ;
  this.physicsEngines = { MATTERJS: 1, CANNONJS: 2 } ;
} ;

Game.prototype = {
  init: function(canvas, desiredWidth, desiredHeight) {

    var renderType = this.getParameterByName('render') ;
    if (renderType === "") {
      renderType = 'webgl' ;
    }

    this.canvas = canvas ;

    this.renderType = renderType ;

    console.log ("renderType=" + renderType) ;

    this.assetManager = new AssetManager() ;

    this.setupPIXI(renderType, desiredWidth, desiredHeight) ;


    var game = this ;

    window.onresize = function() {
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
    } ;

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

    if (this.stats !== null) {
      this.stats.begin() ;
    }

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

    if (this.stats !== null) {
      this.stats.end() ;
    }

    requestAnimationFrame (this.animate.bind(this)) ;
  },

  calculateCanvasSizes: function (desiredWidth, desiredHeight) {
    this.canvasSettings.desiredWidth = desiredWidth ;
    this.canvasSettings.desiredHeight = desiredHeight ;
    this.canvasSettings.ratio = Math.min (window.innerWidth / desiredWidth, (window.innerHeight - 5) / desiredHeight) ;

    this.canvasSettings.w = Math.floor (desiredWidth * this.canvasSettings.ratio) ;
    this.canvasSettings.h = Math.floor (desiredHeight * this.canvasSettings.ratio) ;

    this.canvasSettings.x = (window.innerWidth / 2 - this.canvasSettings.w / 2) ;
    this.canvasSettings.y = ((window.innerHeight - 5) / 2 - this.canvasSettings.h / 2) ;

    if (this.onResize) {
      this.onResize (this.canvasSettings) ;
    }
  },

  setupPIXI: function(renderType, desiredWidth, desiredHeight) {
    this.calculateCanvasSizes (desiredWidth, desiredHeight) ;

    this.wireframeRender.setViewport (0, 0, this.canvasSettings.w, this.canvasSettings.h, 0.1, 1000) ;
    this.wireframeRender.setViewAsPerpsective (90) ;

    if (renderType === 'webgl') {
      this.PIXIrenderer = new PIXI.WebGLRenderer ( this.canvasSettings.w, this.canvasSettings.h, { view: this.canvas, backgroundColor : 0x000000} );
    } else if (renderType === 'canvas') {
      this.PIXIrenderer = new PIXI.CanvasRenderer ( this.canvasSettings.w, this.canvasSettings.h, { view: this.canvas, backgroundColor : 0x000000} );
    } else {
      alert ("Unknown render method.") ;
      return ;
    }

    this.stage = new PIXI.Container() ;
    this.stage.interactive = true;

  },

  patchDatGUI: function() {
    // monkeypatch for dat.gui to add removeFolder
    if (typeof dat !== "undefined" && typeof dat.GUI !== "undefined") {
      dat.GUI.prototype.removeFolder = function(name) {
        var folder = this.__folders[name];
        if (!folder) {
          return;
        }
        folder.close();
        this.__ul.removeChild(folder.domElement.parentNode);
        delete this.__folders[name];
        this.onResize();
      } ;
    }
  },

  setupDebugUI: function() {

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

    var debugGUI = document.querySelector('div#debuggui') ;

    debugGUI.appendChild (gui.domElement) ;

    debugGUI.style.display = "none" ;
    //$("div#debuggui").hide() ;

    //var cameraMenu = new CameraMenu() ;

    gui.add(this.engineSettings, 'timeScale', 0, 2);
    var game = this ;


    /*var camFolder = gui.addFolder ("Camera") ;
    camFolder.add(cameraMenu, 'posX', -1000, 1000);
    camFolder.add(cameraMenu, 'posY', -1000, 1000);
    camFolder.add(cameraMenu, 'posZ', -1000, 1000);
    camFolder.add(cameraMenu, 'rotX', 0, 360);
    camFolder.add(cameraMenu, 'rotY', 0, 360);
    camFolder.add(cameraMenu, 'rotZ', 0, 360);

    this.cameraMenu = cameraMenu ;*/

    //gui.close() ;

    this.dgui = gui ;

  },

  enableDebug: function (system) {
    if (this.renderType === null) {
      throw new Error ("Need to init() the engine, first.") ;
    }

    var flags = 0 ;
    if (typeof system === "undefined") {
      flags = this.debugFlags.ALL ;
    }

    // requires dat.gui to be already loaded
    if (system & this.debugFlags.DAT_GUI) {
      this.setupDebugUI() ;

      //$("div#debuggui").show() ;
      document.querySelector('div#debuggui').style.display = "block" ;
    }

    // requires Stats to be already loaded
    if (system & this.debugFlags.STATS_FPS) {
      this.stats = new Stats() ;
      this.stats.setMode(0) ;

      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.right = '20px';
      this.stats.domElement.style.bottom = '10px';

      document.body.appendChild (this.stats.domElement) ;
    }

  },

  enableLivereload: function (port) {
    //<script src="//localhost:35729/livereload.js"></script>
    port = typeof port !== 'undefined' ? port : 35729 ;
    //$.getScript("//localhost:" + port + "/livereload.js") ;
    var scriptE = document.createElement('script'),
        priorScriptE = document.getElementsByTagName('script')[0] ;
    scriptE.src = "//localhost:" + port + "/livereload.js" ;
    priorScriptE.parentNode.insertBefore(scriptE, priorScriptE) ;

  },

  enablePhysics: function (engineType) {

    if (engineType === this.physicsEngines.MATTERJS) {
      this.physics = {
        world: Matter.World,
        engine: Matter.Engine.create ({
          enableSleeping: true,
        }),

      } ;

    } else if (engineType === this.physicsEngines.CANNONJS) {
    } else {
      throw new Error ("Unknown physics engine type!") ;
    }
  },

  disablePhysics: function () {
    this.physics = null ;
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

  toCanvasFromMouse_X: function (x) {
    return x - this.canvasSettings.x ;
  },

  toCanvasFromMouse_Y: function (y) {
    return y - this.canvasSettings.y ;
  },

};

Object.defineProperties (Game.prototype, {
  timeScale: {
    get: function () { return this.engineSettings.timeScale ; },
    set: function (v) {
      this.engineSettings.timeScale = v ;
    }
  },
  currSceneName: {
    get: function () { return this.engineSettings.currentScene ; },
  }
}) ;


module.exports = Game ;
