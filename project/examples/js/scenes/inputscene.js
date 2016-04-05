
var InputManagerScene = function (game) {
  this.game = game ;
  this.name = 'Input Manager Scene' ;
} ;

var iconWidth = 426 ;
var iconHeight = 240 ;

InputManagerScene.prototype = {
  setup: function () {

    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST ;

    var scene = this ;

    // define graphics stuff

    var textStyle = {
        font : "12px 'Lucida Grande'",
        fill : '#fff',
        //stroke : '#4a1850',
        //strokeThickness : 5,
        dropShadow : true,
        dropShadowColor : '#000000',
        dropShadowAngle : Math.PI / 6,
        dropShadowDistance : 0,
        //wordWrap : true,
        //wordWrapWidth : 440
    };

    this.mouseText = new PIXI.Text('Mouse X, Y', textStyle) ;
    this.mouseText.x = 10 ;
    this.mouseText.y = iconHeight - this.mouseText.height - 5 ;

    this.mouseDrops = [] ;

    this.mouseTx = new PIXI.Texture(new PIXI.BaseTexture(this.game.assetManager.getAsset("images.trashcan"))) ;

    var gridTx = new PIXI.Texture(new PIXI.BaseTexture(this.game.assetManager.getAsset("images.grid"))) ;

    this.gridSpr = new PIXI.extras.TilingSprite(gridTx, this.game.PIXIrenderer.width, this.game.PIXIrenderer.height) ;
    this.gridSpr.alpha = 0.2 ;
    this.game.stage.addChild (this.gridSpr) ;

    this.iconCtr = new PIXI.Container() ;
    this.game.stage.addChild (this.iconCtr) ;

    this.iconCtr.addChild (this.mouseText) ;

    var temp = new PIXI.Sprite(
      new PIXI.Texture(new PIXI.BaseTexture(this.game.assetManager.getAsset("images.test_box")))
    ) ;
    this.iconCtr.addChild (temp) ;
    temp.alpha = 0.1 ;

    var spacing = (iconWidth - 50) / 4 ;

    var createSprite = function (name, pos) {
      var spr = new PIXI.Sprite(
        new PIXI.Texture(new PIXI.BaseTexture(scene.game.assetManager.getAsset(name)))
      ) ;

      spr.x = (iconWidth - (spacing * 4) + 25) + (spacing * pos) - spr.width / 2 ;
      spr.y = iconHeight / 2 - spr.height / 2 ;

      spr.alpha = 0 ;

      return spr ;
    } ;

    var icons = [] ;
    icons.push (createSprite ("images.mine", 0)) ;
    icons.push (createSprite ("images.crystals", 1)) ;
    icons.push (createSprite ("images.pirates", 2)) ;
    icons.push (createSprite ("images.vpilot", 3)) ;
    this.icons = icons ;

    this.iconCtr.addChild (icons[0]) ;
    this.iconCtr.addChild (icons[1]) ;
    this.iconCtr.addChild (icons[2]) ;
    this.iconCtr.addChild (icons[3]) ;

    this.scaleIconContainer() ;

    // define controls

    SmokingMirror.Input.InputManager.begin ("Original Controls") ;

    SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_A, function () {
      scene.icons[0].alpha = 1 ;
    }, function () {
      scene.icons[0].alpha = 0 ;
    }) ;

    SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_S, function () {
      scene.icons[1].alpha = 1 ;
    }, function () {
      scene.icons[1].alpha = 0 ;
    }) ;

    SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_D, function () {
      scene.icons[2].alpha = 1 ;
    }, function () {
      scene.icons[2].alpha = 0 ;
    }) ;

    SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_W, function () {
      scene.icons[3].alpha = 1 ;
    }, function () {
      scene.icons[3].alpha = 0 ;
    }) ;


    var doDrop = function (x, y) {
      var temp = new PIXI.Sprite(scene.mouseTx) ;
      temp.anchor.x = 0.5 ;
      temp.anchor.y = 0.5 ;
      temp.x = x ;
      temp.y = y ;
      temp.alpha = 0.5 ;
      scene.game.stage.addChild (temp) ;
      scene.mouseDrops.push (temp) ;
    } ;

    SmokingMirror.Input.InputManager.createMouseEvent (SmokingMirror.Input.InputManager.MOUSE_LEFT, function (event) {
      var x = Math.ceil (scene.game.toCanvasFromMouse_X (event.clientX)) ;
      var y = Math.ceil (scene.game.toCanvasFromMouse_Y (event.clientY)) ;
      doDrop (x, y) ;
    }) ;

    SmokingMirror.Input.InputManager.createTouchEvent (function (event) {
      var x = Math.ceil (scene.game.toCanvasFromMouse_X (event.touches[0].clientX)) ;
      var y = Math.ceil (scene.game.toCanvasFromMouse_Y (event.touches[0].clientY)) ;
      doDrop (x, y) ;
    }) ;

    SmokingMirror.Input.InputManager.createMouseMoveEvent (function (event) {
      //console.log ("Mouse moving " + event.clientX + ", " + event.clientY) ;
      scene.mouseText.text = Math.max (0, Math.min (scene.game.PIXIrenderer.height, Math.ceil (scene.game.toCanvasFromMouse_X (event.clientX)))) + ", " +
        Math.max (0, Math.min (scene.game.PIXIrenderer.width, Math.ceil (scene.game.toCanvasFromMouse_Y (event.clientY)))) ;
    }) ;

    SmokingMirror.Input.InputManager.end () ;
    SmokingMirror.Input.InputManager.enable() ;

    var pushButton, popButton ;


    this.alternativeControls = function () {
      if (SmokingMirror.Input.InputManager.getCurrentName() === "Original Controls") {
        SmokingMirror.Input.InputManager.push() ; // push current input events to stack

        SmokingMirror.Input.InputManager.begin ("Alternative Controls") ;

        SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_Q, function () {
          scene.icons[0].alpha = 1 ;
        }, function () {
          scene.icons[0].alpha = 0 ;
        }) ;

        SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_W, function () {
          scene.icons[1].alpha = 1 ;
        }, function () {
          scene.icons[1].alpha = 0 ;
        }) ;

        SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_E, function () {
          scene.icons[2].alpha = 1 ;
        }, function () {
          scene.icons[2].alpha = 0 ;
        }) ;

        SmokingMirror.Input.InputManager.createKeyEvent (SmokingMirror.Input.InputManager.KEY_R, function () {
          scene.icons[3].alpha = 1 ;
        }, function () {
          scene.icons[3].alpha = 0 ;
        }) ;

        SmokingMirror.Input.InputManager.end () ;
        SmokingMirror.Input.InputManager.enable() ;

        scene.sceneFolder.remove (pushButton) ;
        scene.enable = true ;

        popButton = scene.sceneFolder.add(scene, "originalControls") ;
        for (var i = 0; i < scene.icons.length; i++ ) { scene.icons[i].alpha = 0 ; }
      }
    } ;

    this.originalControls = function () {
      SmokingMirror.Input.InputManager.pop() ;
      scene.enable = true ;
      scene.sceneFolder.remove(popButton) ;
      pushButton = scene.sceneFolder.add(scene, "alternativeControls") ;
      for (var i = 0; i < scene.icons.length; i++ ) { scene.icons[i].alpha = 0 ; }
    } ;



    this.enable = true ;
    this.sceneFolder = this.game.dgui.addFolder ("Input Manager") ;
    var enableOption = this.sceneFolder.add(this, "enable").listen() ;
    pushButton = this.sceneFolder.add(this, "alternativeControls") ;

    this.sceneFolder.open() ;

    enableOption.onFinishChange (function (value) {
      var i ;

      if (value) {
        SmokingMirror.Input.InputManager.enable() ;
        for (i = 0; i < scene.icons.length; i++ ) { scene.icons[i].alpha = 0 ; }
      } else {
        SmokingMirror.Input.InputManager.disable() ;
        for (i = 0; i < scene.icons.length; i++ ) { scene.icons[i].alpha = 0 ; }
      }
    }) ;

    this.game.sceneSetHelpText(
      "<p>Input manager allows you to define keyboard and mouse/touch events easily.</p>" +
      "<p>Multiple states are allowed, so you can define a block of inputs and reference them in one go.<p>" +
       "Such as, enable/disable all inputs at once, or push/pop them as needed, for easy multi-layered control schemes.</p>" +
       "<p>To test the controls, A/W/S/D are initially enabled.  You can also click using the mouse or touch the screen.</p>" +
       "<p>You can flip to alternative controls, which are Q/W/E/R along with the mouse/touch click.  The mouse coordinates will stop " + 
       "updating in the alternative control scheme, as no touch/mouse move is defined.</p>"
    ) ;
  },

  destroy: function() {
    SmokingMirror.Input.InputManager.clear() ;

    this.game.stage.removeChild (this.iconCtr) ;

    this.game.stage.removeChild (this.gridSpr) ;
    this.gridSpr = null ;

    this.game.dgui.removeFolder ("Input Manager") ;

    this.game.sceneSetHelpText() ;

    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.LINEAR ;
  },

  resize: function () {
    this.gridSpr.width = this.game.PIXIrenderer.width ;
    this.gridSpr.height = this.game.PIXIrenderer.height ;

    this.scaleIconContainer() ;

    /*if (this.game.PIXIrenderer.type === PIXI.RENDERER_TYPE.CANVAS) {
      this.game.PIXIrenderer.context[this.game.PIXIrenderer.smoothProperty] = false ;
    }*/
  },

  scaleIconContainer: function () {
    //console.log (this.game.PIXIrenderer.width, this.game.PIXIrenderer.height) ;
    var ratio = Math.floor (Math.min (this.game.PIXIrenderer.width / iconWidth, this.game.PIXIrenderer.height / iconHeight)) ;
    //console.log (ratio) ;

    this.iconCtr.scale.x = ratio ;
    this.iconCtr.scale.y = ratio ;
    this.iconCtr.x = (this.game.PIXIrenderer.width - (iconWidth * ratio)) * 0.5 ;
    this.iconCtr.y = (this.game.PIXIrenderer.height - (iconHeight * ratio)) * 0.5 ;
  },

  update: function(dt) {
    this.gridSpr.tilePosition.x += 20 * dt ;
    this.gridSpr.tilePosition.y += 10 * dt ;

    for (var i = this.mouseDrops.length - 1; i >= 0; i--) {
      var drop = this.mouseDrops[i] ;
      drop.alpha -= dt * 0.5 ;
      drop.scale.x -= dt * 1.5 ;
      drop.scale.y -= dt * 1.5 ;
      if (drop.scale.x <= 0) {
        this.mouseDrops.splice (i, 1) ;
      }
    }


  },

  render: function() {
    //this.modelGraphics.clear() ;

    //this.modelGraphics.lineStyle (4, 0xFF00FF, 1) ;

  }

};

module.exports = InputManagerScene ;
