"use strict";
/* globals Smokingmirror */

Smokingmirror.WireframeRender = function() {

    this.viewWidth = 0 ;
    this.viewHeight = 0 ;
    this.viewX = 0 ;
    this.viewY = 0 ;
    this.clipToViewport = true ;
    this.clipToFrustrum = true ;
    // to note about view matrix:  Only orthogonal, no scaling/skewing!
    this.viewMatrix = new Smokingmirror.Matrix4() ;
    this.viewMatrixInv = new Smokingmirror.Matrix4() ;

    this.nearPlane = 0 ;

    var OUTCODES = Object.freeze ({"INSIDE": 0, "LEFT": 1, "RIGHT": 2, "BOTTOM": 4, "TOP": 8}) ;

    var clip_graphics, clip_xmin, clip_ymin, clip_xmax, clip_ymax ;

    var computeOutCode2D = function (x, y) {
      var code = OUTCODES.INSIDE ;

      if (x < clip_xmin) {
        code |= OUTCODES.LEFT ;
      } else if (x > clip_xmax) {
        code |= OUTCODES.RIGHT ;
      }
      if (y < clip_ymin) {
        code |= OUTCODES.BOTTOM ;
      } else if (y > clip_ymax) {
        code |= OUTCODES.TOP ;
      }
      return code ;
    } ;

    this.setupClip = function (graphics, xmin, ymin, xmax, ymax) {
      clip_graphics = graphics ;
      clip_xmin = xmin ;
      clip_ymin = ymin ;
      clip_xmax = xmax ;
      clip_ymax = ymax ;
    } ;

    // Cohen-Sutherland clipping (2D)
    this.clipAndDrawLine2D = function (x0, y0, x1, y1) {
      var outcode0 = computeOutCode2D (x0, y0) ;
      var outcode1 = computeOutCode2D (x1, y1) ;
      var accept = false ;

      while (true) {
        if (!(outcode0 | outcode1)) {
          accept = true ;
          break ;
        } else if (outcode0 & outcode1) {
          break ;
        } else {
          var x, y ;

          var outcodeOut = outcode0 ? outcode0 : outcode1 ;

          if (outcodeOut & OUTCODES.TOP) {
            x = x0 + (x1 - x0) * (clip_ymax - y0) / (y1 - y0) ;
            y = clip_ymax ;
          } else if (outcodeOut & OUTCODES.BOTTOM) {
            x = x0 + (x1 - x0) * (clip_ymin - y0) / (y1 - y0) ;
            y = clip_ymin ;
          } else if (outcodeOut & OUTCODES.RIGHT) {
            y = y0 + (y1 - y0) * (clip_xmax - x0) / (x1 - x0) ;
            x = clip_xmax ;
          } else if (outcodeOut & OUTCODES.LEFT) {
            y = y0 + (y1 - y0) * (clip_xmin - x0) / (x1 - x0) ;
            x = clip_xmin ;
          }

          if (outcodeOut === outcode0) {
            x0 = x ;
            y0 = y ;
            outcode0 = computeOutCode2D (x0, y0) ;
          } else {
            x1 = x ;
            y1 = y ;
            outcode1 = computeOutCode2D (x1, y1) ;
          }
        }
      }
      if (accept) {
        clip_graphics.moveTo (x0, y0) ;
        clip_graphics.lineTo (x1, y1) ;
      }
    } ;


};


Smokingmirror.WireframeRender.prototype = {
  setViewport: function (x, y, w, h, near, far) {
    this.viewWidth = w ;
    this.viewHeight = h ;
    this.viewX = x ;
    this.viewY = y ;

    this.nearPlane = near ;
    this.farPlane = far ;

    this.projMatrix = new Smokingmirror.Matrix4() ;
  },

  setViewAsPerpsective: function (fovAngle) {
    this.projMatrix = Smokingmirror.geometry.generatePerspectiveView (fovAngle,
      this.viewWidth, this.viewHeight, this.nearPlane, this.farPlane) ;
  },

  setCamera: function (pos, rot) {
    // calculate view matrix
    this.viewMatrix.identity() ;
    var posM = new Smokingmirror.Matrix4() ;
    posM.setPosition (pos) ;
    this.viewMatrix.multiply (posM) ;

    if (typeof (rot) !== 'undefined') {
      var rotM = new Smokingmirror.Matrix4() ;
      rotM.makeRotationFromVector3 (rot) ;
      this.viewMatrix.multiply (rotM) ;
    }

    // calculate inverse
    var temp = new Smokingmirror.Matrix4() ;
    temp.copy (this.viewMatrix) ;
    temp.setPosition ({ x: 0, y: 0, z: 0}) ;
    temp.transpose() ;
    //temp.identity() ;
    //temp.makeRotationFromVector3 (new Smokingmirror.Vector3(0, 0, 45 * 0.0174533)) ;
    var e = this.viewMatrix.elements ;

    temp.setPosition ({ x: -e[12], y: -e[13], z: -e[14]}) ;
    this.viewMatrixInv = temp ;
  },

  renderModelToGraphics: function (model, modelGraphics, thickness) {
    if (typeof (thickness) === 'undefined') {
      thickness = 4 ;
    }

    //modelGraphics.lineStyle (4, Math.random() * 0xFFFFFF, 1) ;
    modelGraphics.lineStyle (thickness, 0xFFFFFF, model.alpha) ;

    var lastVert = Smokingmirror.Vector3() ;

    this.setupClip (modelGraphics, this.viewX, this.viewY, this.viewWidth, this.viewHeight) ;

    var near = this.nearPlane ;
    var verts = model.transformedVerts ;

    var vX = this.viewX ;
    var vY = this.viewY ;
    var vW = this.viewWidth ;
    var vH = this.viewHeight ;
    var clipViewport = this.clipToViewport ;
    var clipFrustrum = this.clipToFrustrum ;

    var mats = Object.keys(model.def.lines) ;

    for (var mi = 0; mi < mats.length; mi++) {
      var lines = model.def.lines[mats[mi]] ;
      var matDef = model.materials[mats[mi]] ;
      modelGraphics.lineStyle (thickness, matDef.color, matDef.alpha * model.alpha) ;

      for (var i = 0; i < lines.length; i += 2) {
        //modelGraphics.lineStyle (thickness, 0xFFFFFF, 1) ;

        // lookup vert for this line
        var firstVertIdx = lines[i] * 4 ;
        var secVertIdx = lines[i + 1] * 4 ;

        var x1 = verts[firstVertIdx] ;
        var y1 = verts[firstVertIdx+1] ;
        var z1 = verts[firstVertIdx+2] ;
        var w1 = verts[firstVertIdx+3] ;

        var x2 = verts[secVertIdx] ;
        var y2 = verts[secVertIdx+1] ;
        var z2 = verts[secVertIdx+2] ;
        var w2 = verts[secVertIdx+3] ;

        if (clipFrustrum) {
          // do near-plane clipping if needed
          if (w1 < near && w2 < near) { // if both are behind, just don't render
            //modelGraphics.lineStyle (thickness, 0xFF0000, 0.2) ;
            continue ;
          }

          if (w1 >= near && w2 < near) { // if v1 is in front, and v2 is behind, clip v2 at intersection w/view plane
            //modelGraphics.lineStyle (thickness, 0xFFFF00, 0.5) ;
            var n = (w1 - near) / (w1 - w2) ;
            var xc = (n * x2) + ((1-n) * x1) ;
            var yc = (n * y2) + ((1-n) * y1) ;
            var zc = (n * z2) + ((1-n) * z1) ;
            var wc = (n * w2) + ((1-n) * w1) ;
            x2 = xc ;
            y2 = yc ;
            z2 = zc ;
            w2 = wc ;
          }

          if (w1 < near && w2 >= near) { // if v2 is behind, and v1 is in front, clip v1 at intersection w/view plane
            //modelGraphics.lineStyle (thickness, 0xFF00FF, 0.5) ;
            var n2 = (w2 - near) / (w2 - w1) ;
            var xc2 = (n2 * x1) + ((1-n2) * x2) ;
            var yc2 = (n2 * y1) + ((1-n2) * y2) ;
            var zc2 = (n2 * z1) + ((1-n2) * z2) ;
            var wc2 = (n2 * w1) + ((1-n2) * w2) ;
            x1 = xc2 ;
            y1 = yc2 ;
            z1 = zc2 ;
            w1 = wc2 ;
          }
        }

        // project both vertices
        var px1 = vX + (x1 * vW) / w1 + vW / 2 ;
        var py1 = vY + (y1 * vH) / w1 + vH / 2 ;

        var px2 = vX + (x2 * vW) / w2 + vW / 2 ;
        var py2 = vY + (y2 * vH) / w2 + vH / 2 ;

        // Finally, do cohen-sutherlane clipping for 2D line segment (if desired)
        if (clipViewport) {
          this.clipAndDrawLine2D (
            px1, py1,
            px2, py2
          ) ;
        } else {
          modelGraphics.moveTo (px1, py1) ;
          modelGraphics.lineTo (px2, py2) ;
        }
      } // lines
    } // materials
  },


};

Smokingmirror.render = new Smokingmirror.WireframeRender() ;
