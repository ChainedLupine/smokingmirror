var Geometry = require('./geometry') ;
var Base = require('./base') ;

var Curve = function(renderer) {
  Base.call(this, renderer) ;

  this.points = [ ];
  this.lineThickness = 1 ;
  this.lineColor = 0xFFFFFF ;
  this.lineAlpha = 1.0 ;
  this.generatedVerts = [] ;
  this.transformedVerts = [] ;
  this.dirtyPoints = true ;
  this.closed = false ;
  this.tension = 0.5 ;
  this.segments = 4 ;
} ;

Curve.prototype = Object.create(Base.prototype) ;
Curve.prototype.constructor = Curve ;

Curve.prototype.setPoints = function (points) {
  if (points.length % 3 !== 0) {
    throw "Curve: Number of points must be div by 3." ;
  }
  this.points = points ;
  this.dirtyPoints = true ;
} ;

Curve.prototype.curvesegments = function (_pts, l, tension, numSegments) {
  var
    t1x, t2x, t1y, t2y, t1z, t2z, cci,
    c1, c2, c3, c4,
    st, t, i, out = [], cardinals = this.cardinals ;

  for (i = 3; i < l; i += 3) {
    cci = 0;

    for (t = 0; t <= numSegments; t++) {
      var pt1x = _pts[i],
          pt1y = _pts[i+1],
          pt1z = _pts[i+2],
          pt2x = _pts[i+3],
          pt2y = _pts[i+4],
          pt2z = _pts[i+5],

          opt1x = _pts[i-3],
          opt1y = _pts[i-2],
          opt1z = _pts[i-1],
          opt2x = _pts[i+6],
          opt2y = _pts[i+7],
          opt2z = _pts[i+8] ;

      t1x = (pt2x - opt1x) * tension ;
      t1y = (pt2y - opt1y) * tension ;
      t1z = (pt2z - opt1z) * tension ;
      t2x = (opt2x - pt1x) * tension ;
      t2y = (opt2y - pt1y) * tension ;
      t2z = (opt2z - pt1z) * tension ;

      /*
      st = t / numSegments;
      c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1;
      c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
      c3 =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st;
      c4 =       Math.pow(st, 3)  -     Math.pow(st, 2);
      */

      c1 = cardinals[cci++] ;
      c2 = cardinals[cci++] ;
      c3 = cardinals[cci++] ;
      c4 = cardinals[cci++] ;

      out.push (c1 * pt1x + c2 * pt2x + c3 * t1x + c4 * t2x) ;
      out.push (c1 * pt1y + c2 * pt2y + c3 * t1y + c4 * t2y) ;
      out.push (c1 * pt1z + c2 * pt2z + c3 * t1z + c4 * t2z) ;
    }
  }

  return out ;
} ;

Curve.prototype.regenerateLineSegments = function() {
  var tension = this.tension ;
  var numSegments = this.segments ;

  var gpoints = [] ;
  var pts = this.points ;

  //console.log (JSON.stringify(this.points, 2, 2)) ;

  var len = pts.length ;
  if (len < 2) { return [] ; }

  if (len === 2) {
    //graphics.moveTo(pts[0], pts[1]);
    //ctx.lineTo(pts[2], pts[3]);
    gpoints.push (pts[0][0]) ;
    gpoints.push (pts[0][1]) ;
    gpoints.push (pts[0][2]) ;

    gpoints.push (pts[1][0]) ;
    gpoints.push (pts[1][1]) ;
    gpoints.push (pts[1][2]) ;

    return gpoints ;
  } else {
    var _pts = [] ;

    _pts = pts.slice(0) ;
    var l = pts.length ;

    if (this.closed) {
      _pts.unshift(pts[l - 1]) ;
      _pts.unshift(pts[l - 2]) ;
      _pts.unshift(pts[l - 3]) ;
      _pts.push(pts[0]) ;
      _pts.push(pts[1]) ;
      _pts.push(pts[2]) ;
    } else {
      _pts.unshift(pts[2]) ;
      _pts.unshift(pts[1]) ;
      _pts.unshift(pts[0]) ;
      _pts.push(pts[l - 3]) ;
      _pts.push(pts[l - 2]) ;
      _pts.push(pts[l - 1]) ;
    }

    // precalculate cardinals
    var cardinals = [], cci = 0, st ;
    for (var t = 0; t <= numSegments; t++) {
      st = t / numSegments;

      cardinals[cci++] =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1;
      cardinals[cci++] = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
      cardinals[cci++] =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st;
      cardinals[cci++] =       Math.pow(st, 3)  -     Math.pow(st, 2);
    }

    this.cardinals = cardinals ;

    //console.log (JSON.stringify(_pts, 2, 2)) ;

    gpoints = this.curvesegments (_pts, _pts.length - 6, tension, numSegments) ;

    if (this.closed) {
      // now join the second to last and last to the first and second cp
      _pts = [
        pts[l - 6],
        pts[l - 5],
        pts[l - 4],
        pts[l - 3],
        pts[l - 2],
        pts[l - 1],
        pts[0],
        pts[1],
        pts[2],
        pts[3],
        pts[4],
        pts[5]
      ] ;

      gpoints = gpoints.concat (this.curvesegments (_pts, 4, tension, numSegments)) ;
    }
  }

  //console.log (JSON.stringify(gpoints, 2, 2)) ;

  return gpoints ;
} ;

Curve.prototype.checkPoints = function() {
  if (this.dirtyPoints) {
    this.generatedVerts = this.regenerateLineSegments() ;
    this.dirtyPoints = false ;
  }
} ;

Curve.prototype.update = function (dt) {
  this.checkPoints() ;

  this.applyTransforms () ;
  this.transformedVerts = Geometry.generateTransformedVerts (
    this.renderer.projMatrix, this.modelMatrix, this.generatedVerts) ;
} ;

Curve.prototype.render = function (graphics) {
  graphics.lineStyle (this.lineThickness, this.lineColor, this.lineAlpha) ;
  this.renderer.renderLinesToGraphics (this.transformedVerts, graphics) ;

} ;


module.exports = Curve ;
