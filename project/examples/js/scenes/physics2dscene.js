
var RectSceneObject = function (x, y, w, h, angle, pixiContainer, game) {
  SmokingMirror.SceneGraph.SceneObject.call(this) ;

  this.pixiContainer = pixiContainer ;

  this.sprite = new PIXI.Sprite(
    new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.mine")))) ;
  this.sprite.anchor.set (0.5, 0.5) ;
  pixiContainer.addChild (this.sprite) ;

  this.sprite.scale.set (w / this.sprite.width, h / this.sprite.height) ;

  this.engine = game.physics.engine ;

  this.body = Matter.Bodies.rectangle(x + w / 2, y + h / 2, w, h, { friction: 0.001, restitution: 0.1, density: 5.5 }) ;
  Matter.Body.setAngle (this.body, angle) ;
  Matter.World.add (game.physics.engine.world, this.body) ;

  this.update () ;
} ;

RectSceneObject.prototype = Object.create(SmokingMirror.SceneGraph.SceneObject.prototype) ;
RectSceneObject.prototype.constructor = RectSceneObject ;

RectSceneObject.prototype.update = function (dt) {
  this.sprite.position.set (this.body.position.x, this.body.position.y) ;
  this.sprite.rotation = this.body.angle ;
} ;

RectSceneObject.prototype.render = function () {

} ;


RectSceneObject.prototype.destroy = function () {

  Matter.World.remove(this.engine.world, this.body) ;
  this.engine = null ;
  this.body = null ;

  this.pixiContainer.removeChild (this.sprite) ;
  this.sprite = null ;
  this.pixiContainer = null ;
} ;

var Physics2DScene = function (game) {
  this.game = game ;
  this.name = '2D Physics' ;
  this.scenehelpers = require('./shared/scenehelper')(game) ;

  this.sceneGroup = new SmokingMirror.SceneGraph.SceneGroup() ;
} ;

Physics2DScene.prototype = {
  setup: function () {

    var scene = this ;

    this.game.enablePhysics (this.game.PhysicsEngines.MATTERJS) ;

    PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST ;

    this.gridSpr = new PIXI.extras.TilingSprite(
      new PIXI.Texture(new PIXI.BaseTexture(this.game.assetManager.getAsset("images.background"))),
      this.game.PIXIrenderer.width, this.game.PIXIrenderer.height) ;
    this.gridSpr.alpha = 0.2 ;
    this.game.stage.addChild (this.gridSpr) ;

    this.boxCtr = this.scenehelpers.setup("2D Physics Example") ;

    // set up simple physics scene
    var engine = this.game.physics.engine ;

    var i, cube ;
    for (i = 0; i < 20; i++) {
      cube = new RectSceneObject (10 + i * 20, 20 + Math.random () * 20, 20, 20, Math.random (SmokingMirror.Math.TWO_PI), this.boxCtr, this.game) ;
      this.sceneGroup.add (cube) ;
    }
    for (i = 0; i < 5; i++) {
      cube = new RectSceneObject (Math.random () * this.scenehelpers.boxWidth, Math.random () * this.scenehelpers.boxHeight,
        50, 50, Math.random (SmokingMirror.Math.TWO_PI), this.boxCtr, this.game) ;
      this.sceneGroup.add (cube) ;
    }

    engine.world.gravity.x = 0 ;
    engine.world.gravity.y = 0.3 ;

    // add world boundaries
    var offset = 5;
    Matter.World.add(engine.world, [
      Matter.Bodies.rectangle(this.scenehelpers.boxWidth / 2, -offset * 2, this.scenehelpers.boxWidth, 20, { isStatic: true }),
      Matter.Bodies.rectangle(-offset * 2, this.scenehelpers.boxHeight / 2, 20, this.scenehelpers.boxHeight, { isStatic: true }),
      Matter.Bodies.rectangle(this.scenehelpers.boxWidth + offset * 2, this.scenehelpers.boxHeight / 2, 20, this.scenehelpers.boxHeight, { isStatic: true }),
      Matter.Bodies.rectangle(this.scenehelpers.boxWidth / 2, this.scenehelpers.boxHeight + offset * 2, this.scenehelpers.boxWidth, 20, { isStatic: true }),
    ]);

    // make sure to add the debug render layer last, so it shows up over everything else
    this.boxCtr.addChild (this.game.physics.physicsDebugCtnr) ;

    this.sceneFolder = this.game.dgui.addFolder ("2D Physics") ;
    this.game.physics.debugView = this.debugView = true ;

    this.sceneFolder.add (this, "debugView").onFinishChange (function (v) {
      if (v) {
        scene.game.physics.debugView = true ;
        scene.boxCtr.addChild (scene.game.physics.physicsDebugCtnr) ;
      } else {
        scene.game.physics.debugView = false ;
        scene.boxCtr.removeChild (scene.game.physics.physicsDebugCtnr) ;
      }
    }) ;

    this.sceneFolder.open() ;

    this.game.sceneSetHelpText(
      "<p>SmokingMirror has integration with the Javascript physics library Matter.js.</p>"
    ) ;
  },

  destroy: function() {
    SmokingMirror.Input.InputManager.clear() ;

    this.boxCtr.removeChild (this.game.physics.physicsDebugCtnr) ;

    this.sceneGroup.destroy() ;
    this.sceneGroup.engine = null ;

    this.game.stage.removeChild (this.gridSpr) ;
    this.gridSpr = null ;

    this.game.dgui.removeFolder ("2D Physics") ;

    this.sprites = null ;

    this.scenehelpers.destroy() ;

    this.scenehelpers = null ;

    this.game.physics.physicsDebugCtnr = null ;

    this.game.disablePhysics() ;

    this.game.sceneSetHelpText() ;
  },

  resize: function () {
    this.gridSpr.width = this.game.PIXIrenderer.width ;
    this.gridSpr.height = this.game.PIXIrenderer.height ;

    this.scenehelpers.resize() ;
  },


  update: function(dt) {
    this.gridSpr.tilePosition.x += 20 * dt ;
    this.gridSpr.tilePosition.y += 10 * dt ;

    this.sceneGroup.update(dt) ;
  },

  render: function() {
    this.sceneGroup.render() ;
  }

};

module.exports = Physics2DScene ;
