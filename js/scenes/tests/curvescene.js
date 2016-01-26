var Player = require ('../../player') ;
var math = require('../../smokingmirror/math') ;
var Curve = require('../../curve') ;

var CurveTesterScene = function (game) {
  this.game = game ;
  this.name = 'CurveTester' ;
  this.r = 0 ;
  this.r2 = 0 ;
  this.r3 = 0 ;
} ;


CurveTesterScene.prototype = {
  setup: function () {
    /*
    this.player = new Player (this.game.assetManager.getAsset ('models.player'), this.game.wireframeRender) ;
    this.player.update(0) ;
    this.r = 127 ;
    */

    var curve = new Curve(this.game.wireframeRender) ;

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

    this.curve = curve ;

    this.generateCurve() ;

  },

  generateCurve: function() {
    var pts = [] ;

    var amt = 16 ;

    for (var i = 0; i < amt; i++) {
      var a = (360 / amt) * i ;
      var d = i % 2 === 0 ? 1 - Math.sin (this.r2) * 0.2 : 2 + Math.cos (this.r2) * 0.4 ;
      var x = Math.sin (a * math.DTR) * d ;
      var y = Math.cos (a * math.DTR) * d ;
      var z = i % 2 === 0  ? Math.cos (this.r3) * 1.2 : 0 ;
      pts.push (x, y, z) ;
    }

    this.curve.setPoints (pts) ;
  },

  destroy: function() {
    this.player = null ;
    this.curve = null ;

    this.game.dgui.removeFolder ('Curve Params') ;
  },

  update: function(dt) {



    this.r += dt * 30 ;
    this.r2 += dt * 5 ;
    this.r3 += dt * 1 ;

    this.curve.rotation.y = this.r * math.DTR ;
    this.curve.rotation.x = this.r * math.DTR * 0.5 ;

    this.generateCurve() ;

    this.curve.update(dt) ;
    /*
    this.player.pos.x = -0.9 ; // 1.0 * dt ;
    this.player.pos.y = -1.5 ;
    this.player.pos.z = -7 ;

    this.r += dt * 10 ;

    this.player.rot.x = 147 * math.DTR ;
    this.player.rot.y = this.r * math.DTR ;
    this.player.rot.z = 0 * math.DTR ;

    this.player.update (dt) ;
    */


  },

  render: function() {
    //this.player.render(this.game.modelGraphics) ;
    this.curve.render(this.game.modelGraphics) ;
  }

};

module.exports = CurveTesterScene ;
