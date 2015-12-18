var THREE = {} ;
var OUTCODES = Object.freeze ({"INSIDE": 0, "LEFT": 1, "RIGHT": 2, "BOTTOM": 4, "TOP": 8}) ;

var WireframeEngine = function() {

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

WireframeEngine.prototype = {

  setupModel: function (modelDef) {

    var initMaterials = {} ;
    var mats = Object.keys(modelDef.lines) ;

    for (var i = 0; i < mats.length; i++) {
      initMaterials[mats[i]] = {
        alpha: 1.0,
        color: 0xFFFFFF
        //color: Math.floor(Math.random()*16777215)
      }
    }


    var newModel = {
      xformedVerts: [],
      def: modelDef,
      projMatrix: new THREE.Matrix4(),
      modelMatrix: new THREE.Matrix4(),
      rotation: new THREE.Euler(0, 0, 0, 'XYZ'),
      position: new THREE.Vector3(),
      scale: new THREE.Vector3(1,1,1),
      clipToViewport: true,
      clipToFrustrum: true,
      near: null,
      alpha: 1.0,
      materials: initMaterials
    } ;

    return newModel ;
  },

  parseWavefrontObj: function (data) {
    var modelDef = { vertices: [], lines: {} } ;

    // regex for vertices
    var re = /^v\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/gm ;
    var match ;
    while ((match = re.exec (data)) !== null) {
      //console.log (JSON.stringify(match, 2, 2)) ;
      modelDef.vertices.push (Number(match[1])) ;
      modelDef.vertices.push (Number(match[2])) ;
      modelDef.vertices.push (Number(match[3])) ;
    }

    // regex for faces
    //(\d*)\/(\d*)\/(\d*)
    var face_re = /^f\s(.+)/ ;
    var material_re = /^usemtl\s+(.+)/ ;
    datalines = data.split('\n') ;
    var materialName = null ;

    for (var i = 0; i < datalines.length; i++) {
      var line = datalines[i] ;

      if ((match = material_re.exec (line)) !== null) {
        var newName = match[1] ;
        if (materialName === null || !modelDef.lines.hasOwnProperty(newName)) {
          modelDef.lines[newName] = [] ;
        }
        materialName = newName ;

      } else if ((match = face_re.exec (line)) !== null) {

        // if no material, create one
        if (materialName === null) {
          materialName = "default" ;
          modelDef.lines[materialName] = [] ;
        }

        // now split this apart
        var fre = /(\d*)\/(\d*)\/(\d*)/g ;
        var fmatch ;
        var firstV = null ;
        var lastV ;
        //console.log (JSON.stringify(match, 2, 2)) ;

        // convert faces into lines
        while ((fmatch = fre.exec (match[1])) !== null) {
          //console.log (JSON.stringify(fmatch, 2, 2)) ;
          // format is f v/t/n    v=vertex, tv=texture coord, nv=normal
          var v = parseInt(fmatch[1]) - 1 ; // we only care about the face vertex
          if (firstV === null) {
            firstV = v ;
          } else {
            modelDef.lines[materialName].push (lastV) ;
            modelDef.lines[materialName].push (v) ;
          }
          lastV = v ;
        }

        modelDef.lines[materialName].push (firstV) ;
        modelDef.lines[materialName].push (lastV) ;
      }
    }

    // now do a line check for no line overdraw, horrible O(n^2) thing
    var mats = Object.keys(modelDef.lines) ;

    for (var mi = 0; mi < mats.length; mi++) {
      var lines = modelDef.lines[mats[mi]] ;
      var optimizedLines = [] ;
      for (var i = 0; i < lines.length; i += 2) {
        var v1 = lines[i] ;
        var v2 = lines[i + 1] ;

        //console.log (v1 + " " + v2) ;

        var found = false ;
        for (var i2 = 0; i2 < optimizedLines.length; i2 += 2) {
          if (((v1 === optimizedLines[i2] && v2 === optimizedLines[i2 + 1]) ||
               (v2 === optimizedLines[i2] && v1 === optimizedLines[i2 + 1]))) {
            found = true ;
            break ;
          }
        }

        if (!found) {
          optimizedLines.push (v1) ;
          optimizedLines.push (v2) ;
        }

      }
      modelDef.lines[mats[mi]] = optimizedLines ;
    }

    //console.log (JSON.stringify(optimizedLines, 2, 2)) ;





    return modelDef ;
  },

  applyModelTransforms: function (model) {
    // first, build all of our matrices
    var scaleM = new THREE.Matrix4() ;
    scaleM.scale (model.scale) ;

    var rotM = new THREE.Matrix4() ;
    rotM.makeRotationFromEuler (model.rotation) ;

    var transM = new THREE.Matrix4() ;
    transM.makeTranslation (model.position.x, model.position.y, model.position.z) ;

    model.modelMatrix.identity() ;
    model.modelMatrix.multiply (transM) ;
    model.modelMatrix.multiply (rotM) ;
    model.modelMatrix.multiply (scaleM) ;

    //console.log (JSON.stringify(model.modelMatrix.elements, 2, 2)) ;
    //model.modelMatrix.identity() ;
  },

  generateLines: function (model) {
    var combinedM = new THREE.Matrix4() ;
    combinedM.multiplyMatrices (model.projMatrix, model.modelMatrix) ;

    //console.log (JSON.stringify(model.modelMatrix.elements, 2, 2)) ;

    var e = combinedM.elements;
    var vertsXYZW = [] ;

    // apply model + view + proj matrix to verts to convert straight to homogenious clip space (XYZW)
    for (var i = 0; i < model.def.vertices.length; i += 3 ) {
      var x = model.def.vertices[i] ;
      var y = model.def.vertices[i+1] ;
      var z = model.def.vertices[i+2] ;

      // we're assuming w=1 here
      vertsXYZW.push (e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ]) ;
      vertsXYZW.push (e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ]) ;
      vertsXYZW.push (e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ]) ;
      vertsXYZW.push (e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ]) ;
    }

    model.xformedVerts = vertsXYZW ;
    //console.log (JSON.stringify(model.xformedVerts, 2, 2)) ;

  },


  viewAsPerspective: function (model, fovAngle, x, y, w, h, near, far) {

    //var fov = 1.0 / Math.tan(THREE.Math.degToRad(fovAngle) / 2.0) ;
    var aspect = w / h ;

    model.viewWidth = w ;
    model.viewHeight = h ;

    model.viewX = x ;
    model.viewY = y ;
    model.near = near ;

    model.projMatrix.makePerspective (fovAngle, aspect, near, far) ;

    //console.log (JSON.stringify(model.projMatrix.elements, 2, 2)) ;
  },

  viewAsOrtho: function (model, left, right, top, bottom, near, far) {
    model.projMatrix.makeOrthographic (left, right, top, bottom, near, far) ;
  },

  renderModelToGraphics: function (model, modelGraphics, thickness) {
    if (typeof (thickness) === 'undefined') {
      thickness = 4 ;
    }
    modelGraphics.clear() ;

    //modelGraphics.lineStyle (4, Math.random() * 0xFFFFFF, 1) ;
    modelGraphics.lineStyle (thickness, 0xFFFFFF, model.alpha) ;

    var lastVert = THREE.Vector3() ;

    this.setupClip (modelGraphics, model.viewX, model.viewY, model.viewWidth, model.viewHeight) ;

    var near = model.near ;
    var verts = model.xformedVerts ;

    var vX = model.viewX ;
    var vY = model.viewY ;
    var vW = model.viewWidth ;
    var vH = model.viewHeight ;
    var clipViewport = model.clipToViewport ;
    var clipFrustrum = model.clipToFrustrum ;

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
            var n = (w2 - near) / (w2 - w1) ;
            var xc = (n * x1) + ((1-n) * x2) ;
            var yc = (n * y1) + ((1-n) * y2) ;
            var zc = (n * z1) + ((1-n) * z2) ;
            var wc = (n * w1) + ((1-n) * w2) ;
            x1 = xc ;
            y1 = yc ;
            z1 = zc ;
            w1 = wc ;
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

