var Lightning = function(x, y, dir, len, color) {
  "use strict";

  this.lifetime = 0.5 + Math.random() * 1.0 ;
  this.length = len + Math.random() * (len * 0.1) ;
  this.x = x ;
  this.y = y ;
  this.dir = dir ;
  this.startThickness = this.length * 0.01 ;
  this.curld = Math.random() > 0.5 ? 1 : -1 ;
  this.curlAmt = 0 ;
  this.curlSpd = 0.1 + Math.random() * 0.20 ;
  this.alpha = 1 ;
  this.active = true ;
  this.color = color ;

  var dx = 1.0 ;
  var dy = 0 ;
  var px = -dy ;
  var py = dx ;

  var offsetAmount = this.length * 0.03 ;

  this.lines = [] ;
  var lightning = this ;

  var doSort = function (a, b) {
    var la = Math.sqrt (a[0] * a[0] + a[1] * a[1]) ;
    var lb = Math.sqrt (b[0] * b[0] + b[1] * b[1]) ;
    if (a[0] === b[0] && a[0] === b[0]) {
      return 0 ;
    }

    return (la < lb ? -1 : 1) ;
  } ;

  var generateLines = function (sx, sy, ex, ey) {
    var segments = [{ sx: sx, sy: sy, ex: ex, ey: ey, id: 0, start: true}] ;
    var id = 0 ;
    for (var gi = 0; gi < 4; gi++) {
      var newsegments = [] ;
      for (var si = 0; si < segments.length; si++) {
        var mx = segments[si].sx * 0.5 + segments[si].ex * 0.5 ;
        var my = segments[si].sy * 0.5 + segments[si].ey * 0.5 ;
        var cid = segments[si].id ;
        var amt = -offsetAmount + Math.random() * offsetAmount * 2 ;
        mx += px * amt ;
        my += py * amt ;

        newsegments.push ({ sx: segments[si].sx, sy: segments[si].sy, ex: mx, ey: my, id: cid }) ;
        newsegments.push ({ sx: mx, sy: my, ex: segments[si].ex, ey: segments[si].ey, id: cid }) ;
        // occasionally start new branch
        if (Math.random() < 0.5) {
          var sdx = (mx - segments[si].sx) * 0.7 + Math.random() * 2 ;
          var sdy = (my - segments[si].ey) * 0.7 + Math.random() * 2 ;
          id++ ;
          newsegments.push ({ sx: mx, sy: my, ex: mx + sdx, ey: my + sdy, id: id }) ;
        }
      }
      segments = newsegments.slice() ;
    }

    // now turn segments into sections of lines
    var points ;
    id = 0 ;

    for (id = 0; id < 20; id++) {
      var segs = [] ;
      for (var i = 0; i < segments.length; i++) {
        if (segments[i].id === id) {
          segs.push (segments[i]) ;
        }
      }

      if (segs.length === 0) {
        break ;
      }

      points = [] ;
      points.push ([segs[0].sx, segs[0].sy]) ;
      for (i = 0; i < segs.length; i++) {
        points.push ([segs[i].ex, segs[i].ey]) ;
      }

      if (points.length === 0) {
        break ;
      }
      // sort points
      points.sort (doSort) ;
      lightning.lines.push (points) ;
    }

  } ; // generateLines

  generateLines (0, 0, dx * this.length, dy * this.length) ;

  //console.log (JSON.stringify (this.lines, 2, 2)) ;
} ;

Lightning.prototype = (function() {
  "use strict";

  return {
    update: function (dt) {
      if (!this.active) {
        return ;
      }

      this.curlAmt = SmokingMirror.Math.clamp (this.curlAmt + (this.curlSpd * dt * this.curld), -0.1, 0.1) ;
      this.alpha = 1.0 - 1.0 * (Math.abs (this.curlAmt) / 0.1) ;
      if (this.alpha <= 0) {
        this.active = false ;
      }
    },

    render: function (graphics) {
      if (!this.active) {
        return ;
      }

      var x = this.x, y = this.y ;
      var st = this.startThickness ;
      var a = this.alpha ;
      var tx, ty ;
      var r = 0 ;

      for (var li = 0; li < this.lines.length; li++) {
        var points = this.lines[li] ;
        tx = points[0][0] ;
        ty = points[0][1] ;
        var plen = (tx / this.length) ;
        r = this.dir * SmokingMirror.Math.DTR + plen * (this.curlAmt * 15.0) ;
        graphics.moveTo (
            x + (tx * Math.cos(r) - ty * Math.sin (r)),
            y + (tx * Math.sin(r) + ty * Math.cos (r))
          );
        for (var i = 1; i < points.length; i++) {
          graphics.lineStyle (st, this.color, a) ;
          tx = points[i][0] ;
          ty = points[i][1] ;
          graphics.lineTo (
              x + (tx * Math.cos(r) - ty * Math.sin (r)),
              y + (tx * Math.sin(r) + ty * Math.cos (r))
            ) ;
          st = SmokingMirror.Math.clamp (st - 0.1, 0.1, 10) ;
          a = SmokingMirror.Math.clamp (a - 0.03, 0.0, 1) ;
          r += this.curlAmt ;
        }
      }

    }

  } ;
})() ;

var Blackhole = function (game, blackholeSettings, diameter) {
  "use strict";
  PIXI.Container.call(this) ;

  this.diameter = diameter ;
  this.blackholeSettings = blackholeSettings ;

  this.game = game ;
  this.agitation = 1.0 ;

  // glow
  var glowSprTx = new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.eventhorizon_glow"))) ;
  this.eventGlowSpr = new PIXI.Sprite (glowSprTx) ;
  this.eventGlowSpr.scale.x = diameter / glowSprTx.width ;
  this.eventGlowSpr.scale.y = diameter / glowSprTx.height ;

  // displacement sprite

  this.displaceSpr = new PIXI.Sprite (blackholeSettings.displaceTxr) ;
  this.displaceFilter = new PIXI.filters.DisplacementFilter(this.displaceSpr) ;
  this.displaceFilter.scale.x = 500 ;
  this.displaceFilter.scale.y = 500 ;
  this.displaceSpr.scale.x = (diameter / blackholeSettings.displaceTxr.width) * 1.2 ;
  this.displaceSpr.scale.y = (diameter / blackholeSettings.displaceTxr.height) * 1.2 ;


  blackholeSettings.blackholeDisplaceCtr.addChild (this.displaceSpr) ;
  blackholeSettings.blackholeGlowCtr.addChild (this.eventGlowSpr) ;


  this.game.currentScene.addBlackholeFilter (this.displaceFilter) ;


  var curve = new SmokingMirror.ThreeD.Curve(this.game.wireframeRender) ;
  this.curve = curve ;
  curve.tension = 0.5 ;
  curve.segments = 4 ;
  curve.lineColor = 0xdfb600 ;
  curve.closed = true ;

  this.x = 0 ;
  this.y = 0 ;
  this.anim = 0 ;
  this.bolts = [] ;
  this.boltTime = 0 ;

} ;

Blackhole.prototype = Object.create(PIXI.Container.prototype) ;
Blackhole.prototype.constructor = Blackhole ;



Blackhole.prototype.generateCurves = function() {
  var pts = [] ;

  var agitation = this.agitation * 2 ;
  var amt = 64 ;
  var diameter = this.diameter / 2 - this.diameter * 0.09 ;
  var k = 0 ;
  for (var i = 0; i < amt; i++) {
    var a = (360 / amt) * i ;
    var d = i % 2 === 0 ? diameter + Math.sin (this.anim * 10) * diameter * 0.01 : diameter ;
    if (i % 2 === 0) {
      d += Math.random() * agitation * diameter * 0.2 ;
    }
    var x = Math.sin (a * SmokingMirror.Math.DTR) * d ;
    var y = Math.cos (a * SmokingMirror.Math.DTR) * d ;

    pts.push (x, y, 0) ;
  }

  this.curve.setPoints (pts) ;
} ;

Blackhole.prototype.update = function(dt) {
  this.anim += dt * 2 ;

  this.eventGlowSpr.alpha = SmokingMirror.Math.clamp01 (0.35 + Math.abs (Math.sin (this.anim * 0.9) * 0.4) + this.agitation) ;
  this.eventGlowSpr.tint = SmokingMirror.Util.HSVtoHTML (((50 - Math.sin (this.anim) * 3.0 - this.agitation * 20.0) * 0.0174533) / 6.24, 0.93, 0.43 + this.agitation * 0.5) ;

  this.eventGlowSpr.x = this.x - this.diameter / 2 ;
  this.eventGlowSpr.y = this.y - this.diameter / 2 ;
  this.displaceSpr.x = this.x - this.displaceSpr.width / 2; //  - 13 ;
  this.displaceSpr.y = this.y - this.displaceSpr.height / 2 ; //- 13 ;

  this.curve.lineAlpha = SmokingMirror.Math.clamp01 (0.1 + Math.abs (Math.sin (this.anim * 0.3) * 0.2) + this.agitation * 0.6) ;

  this.generateCurves() ;
  this.curve.position.x = this.game.toVector_X (this.x) ;
  this.curve.position.y = this.game.toVector_Y (this.y) ;
  this.curve.rotation.z += dt * 0.5 ;
  this.curve.update(dt) ;

  // add bolts if near death

  var lx, ly ;
  var ld = this.diameter * 0.5 * 0.8 ;

  if (this.agitation > 0.1) {
    if (this.boltTime > 0) {
      this.boltTime -= dt ;
    }

    if (this.boltTime <= 0) {
      var a = Math.random() * 360 ;
      lx = this.x + Math.cos (a * SmokingMirror.Math.DTR) * ld ;
      ly = this.y + Math.sin (a * SmokingMirror.Math.DTR) * ld ;
      var color = SmokingMirror.Util.HSVtoHTML (((80 - Math.sin (this.anim) * 3.0 - this.agitation * 20.0) * 0.0174533) / 6.24, 0.93, 0.43 + this.agitation * 0.5) ;
      this.bolts.push (new Lightning (lx, ly, a, this.agitation * this.diameter, color)) ;
      this.boltTime = 0.31 - this.agitation * 0.3 ;
    }
  }


  if (this.bolts.length > 0) {
    for (var i = this.bolts.length - 1; i >= 0; i--) {
      var bolt = this.bolts[i] ;
      if (bolt.active) {
        bolt.x = this.x + Math.cos (bolt.dir * SmokingMirror.Math.DTR) * ld ;
        bolt.y = this.y + Math.sin (bolt.dir * SmokingMirror.Math.DTR) * ld ;
        bolt.update(dt) ;
      } else {
        this.bolts.splice (i, 1) ;
      }
    }
  }

} ;

Blackhole.prototype.render = function(graphics) {
  this.curve.lineThickness = 2.3 + Math.sin (this.anim) * 1.8 + this.agitation ;
  this.game.wireframeRender.first = true ;

  var g = this.blackholeSettings.blackholeGlowGrf ;
  g.beginFill (0x000000, 1) ;
  g.drawCircle (this.x, this.y, this.diameter * 0.4) ;
  g.endFill() ;
  this.curve.render (g) ;

  for (var i = 0; i < this.bolts.length; i++) {
    this.bolts[i].render(g) ;
  }

} ;

Blackhole.prototype.destroy = function() {
  this.blackholeSettings.blackholeDisplaceCtr.removeChild (this.displaceSpr) ;
  this.blackholeSettings.blackholeGlowCtr.removeChild (this.eventGlowSpr) ;
  this.blackholeSettings = null ;

  this.game.currentScene.removeBlackholeFilter (this.displaceFilter) ;

  this.curve = null ;
} ;

module.exports = Blackhole ;
