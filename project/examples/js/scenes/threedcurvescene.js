var Player = require ('../models/player') ;

var ThreeDCurveTesterScene = function (game) {
  this.game = game ;
  this.name = '3DCurveTester' ;
  this.shadersVectrex = require('./shared/shaders_vectrex')(game) ;
  this.r = 0 ;
  this.r2 = 0 ;
  this.r3 = 0 ;

  this.modelGraphics = new PIXI.Graphics() ;
} ;


ThreeDCurveTesterScene.prototype = {
  setup: function () {
    this.shadersVectrex.setup() ;

    this.game.wireframeRender.setCamera(
      new SmokingMirror.Vector3 (0, 0, 100),
      new SmokingMirror.Vector3 (0, 0, 0)
    ) ;

    this.shadersVectrex.addRenderChild (this.modelGraphics) ;

    var curve = new SmokingMirror.ThreeD.Curve(this.game.wireframeRender) ;

    curve.setPoints ([
      0, 0, 0,
      1, 0, 0,
      1, 1, 0,
      0, 1, 0,
      0, 1, 1,
    ]) ;

    var CurveSettings = function () {
      this.tension = 0.5 ;
      this.segments = 8 ;
      this.closed = true ;
    } ;

    var curvesettings = new CurveSettings() ;
    this.curvesettings = curvesettings ;

    var updateCurve = function() {
      curve.tension = curvesettings.tension ;
      curve.segments = Math.ceil (curvesettings.segments) ;
      curve.closed = curvesettings.closed ;
      curve.dirtyPoints = true ;
    } ;

    var folder = this.game.dgui.addFolder ("Curve Params") ;
    folder.add(curvesettings, 'tension', -1.0, 1).onFinishChange (function(value) {
      updateCurve() ;
    }) ;
    folder.add(curvesettings, 'segments', 1, 16).step(1).onFinishChange (function(value) {
      updateCurve() ;
    }) ;
    folder.add(curvesettings, 'closed', false, true).onFinishChange (function(value) {
      updateCurve() ;
    }) ;

    updateCurve() ;

    curve.scale = new SmokingMirror.Vector3 (20, 20, 20) ;

    this.curve = curve ;

    this.generateCurve() ;

    $("div#scenetext").empty().append (
      "<p>Smokingmirror contains a cardinal splines curve renderer for use with the 3D vector engine.</p>" +
      "<p>Open and closed curves are supported.</p>"
    ) ;

  },

  generateCurve: function() {
    var pts = [] ;

    var amt = 16 ;

    for (var i = 0; i < amt; i++) {
      var a = (360 / amt) * i ;
      var d = i % 2 === 0 ? 1 - Math.sin (this.r2) * 0.2 : 2 + Math.cos (this.r2) * 0.4 ;
      var x = Math.sin (a * SmokingMirror.Math.DTR) * d ;
      var y = Math.cos (a * SmokingMirror.Math.DTR) * d ;
      var z = i % 2 === 0  ? Math.cos (this.r3) * 1.2 : -Math.cos (this.r3) * 0.2 ;
      pts.push (x, y, z) ;
    }

    this.curve.setPoints (pts) ;
  },

  destroy: function() {
    this.player = null ;
    this.curve = null ;

    this.game.dgui.removeFolder ('Curve Params') ;

    this.shadersVectrex.removeRenderChild (this.modelGraphics) ;

    this.shadersVectrex.destroy() ;

    $("div#scenetext").empty() ;
  },

  resize: function () {
    this.shadersVectrex.resize() ;

    this.game.wireframeRender.setCamera(
      new SmokingMirror.Vector3 (0, 0, 100),
      new SmokingMirror.Vector3 (0, 0, 0)
    ) ;
  },

  update: function(dt) {
    this.r += dt * 30 ;
    this.r2 += dt * 5 ;
    this.r3 += dt * 1 ;

    this.curve.rotation.y = this.r * SmokingMirror.Math.DTR ;
    this.curve.rotation.x = this.r * SmokingMirror.Math.DTR * 0.5 ;

    this.generateCurve() ;

    this.curve.update(dt) ;
  },

  render: function() {
    this.modelGraphics.clear() ;

    this.curve.render(this.modelGraphics) ;
  }

};

module.exports = ThreeDCurveTesterScene ;
