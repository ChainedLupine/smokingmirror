
var Blackhole = function (game, displaceSprTx) {
  PIXI.Container.call(this) ;

  this.game = game ;

  // glow
  var glowSprTx = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.eventhorizon_glow"))) ;
  this.eventGlowSpr = new PIXI.Sprite (glowSprTx) ;
  //this.eventGlowSpr.scale.x = 1.0 * 1.4 ;
  //this.eventGlowSpr.scale.y = 1.0 * 1.4 ;
  //this.eventGlowSpr.position.x = -(this.eventGlowSpr.width - this.displaceSpr.width) / 2 ;
  //this.eventGlowSpr.position.y = -(this.eventGlowSpr.height - this.displaceSpr.height) / 2 ;

  // displacement sprite
  this.displaceSpr = new PIXI.Sprite (displaceSprTx) ;
  this.displaceFilter = new PIXI.filters.DisplacementFilter(this.displaceSpr) ;
  this.displaceFilter.scale.x = 400 ;
  this.displaceFilter.scale.y = 400 ;
  this.displaceSpr.scale.x = 0.7 ;
  this.displaceSpr.scale.y = 0.7 ;
  this.displaceSpr.position.x = (this.eventGlowSpr.width - this.displaceSpr.width) / 2 ;
  this.displaceSpr.position.y = (this.eventGlowSpr.height - this.displaceSpr.height) / 2 ;


  this.addChild (this.eventGlowSpr) ;
  this.addChild (this.displaceSpr) ;
/*
  var graphics = new PIXI.Graphics();

  graphics.beginFill(0xFFFF00);
  // set the line style to have a width of 5 and set the color to red
  graphics.lineStyle(1, 0xFF0000);
  // draw a rectangle
  graphics.drawRect(0, 0, 100, 100);
  graphics.alpha = 0.2 ;

  this.addChild(graphics);
*/
  //game.getVisualEffectsContainer().filters = game.getVisualEffectsContainer().filters.concat ([this.displaceFilter]) ;
  game.getVisualEffectsContainer().filters = null ;


  var curve = new SmokingMirror.ThreeD.Curve(this.game.wireframeRender) ;
  this.curve = curve ;
  curve.tension = 0.5 ;
  curve.segments = 4 ;
  curve.lineColor = 0xdfb600 ;
  curve.closed = true ;

  this.x = 0 ;
  this.y = 0 ;
  this.anim = 0 ;
} ;

Blackhole.prototype = Object.create(PIXI.Container.prototype) ;
Blackhole.prototype.constructor = Blackhole ;

Blackhole.prototype.generateCurves = function() {
  var pts = [] ;

  var agitation = 1.0 ;
  var amt = 64 ;
  var s = this.scale.x ;
  var diameter = this.width / 2 - (10 * s) ;
  var k = 0 ;
  for (var i = 0; i < amt; i++) {
    var a = (360 / amt) * i ;
    var d = i % 2 === 0 ? diameter - Math.sin (this.anim * 10) * s : diameter + Math.cos (this.anim * 10) * s * 2 ;
    if (i % 2 === 0) {
      d += Math.random() * agitation * 30 * s;
    }
    var x = Math.sin (a * SmokingMirror.Math.DTR) * d ;
    var y = Math.cos (a * SmokingMirror.Math.DTR) * d ;

    pts.push (x, y, 0) ;
  }

  /*pts = [
    -50, -50, 0,
    50, -50, 0,
    50, 50, 0,
    -50, 50, 0
 ] ;*/
 pts = [
   0, 0, 0,
   100, 0, 0,
   100, 100, 0,
   0, 100, 0
] ;

  this.curve.setPoints (pts) ;
} ;

Blackhole.prototype.update = function(dt) {
  this.anim += dt * 2 ;

  this.eventGlowSpr.alpha = 0.35 + Math.abs (Math.sin (this.anim * 0.9) * 0.4) ;
  this.eventGlowSpr.tint = SmokingMirror.Util.HSVtoHTML (((50 - Math.sin (this.anim) * 3.0) * 0.0174533) / 6.24, 0.93, 0.43) ;

  this.curve.lineAlpha = 0.1 + Math.abs (Math.sin (this.anim * 0.3) * 0.2) ;

  //this.generateCurves() ;
  this.curve.position.x = this.game.pixelTo3D_X (this.x + this.width / 2) ;
  this.curve.position.y = this.game.pixelTo3D_Y (this.y + this.height / 2) ;
  console.log ("cx=" + this.curve.position.x) ;
  //this.curve.rotation.z += dt * 0.5 ;
  this.curve.update(dt) ;
} ;

Blackhole.prototype.render = function(graphics) {
  this.curve.lineThickness = 2.0 + Math.sin (this.anim) * 1.5 ;
  this.curve.render (graphics) ;
} ;

Blackhole.prototype.destroy = function() {
  var filters = this.game.getVisualEffectsContainer().filters ;
  var idx = filters.indexOf (this.displaceFilter) ;
  filters.splice (idx, 1) ;
  if (filters.length === 0) {
    // bug in PIXI, must set to null if filters=[]
    this.game.getVisualEffectsContainer().filters = null ;
  } else {
    this.game.getVisualEffectsContainer().filters = filters ;
  }
  this.curve = null ;
} ;

module.exports = Blackhole ;
