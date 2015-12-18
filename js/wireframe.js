var THREE = {} ;


var WireframeEngine = function() {
};

WireframeEngine.prototype = {

  setupModel: function (modelDef) {
    var newModel = {
      xformedVerts: [],
      def: modelDef,
      projMatrix: new THREE.Matrix4(),
      modelMatrix: new THREE.Matrix4(),
      rotation: new THREE.Euler(0, 0, 0, 'XYZ'),
      position: new THREE.Vector3(),
      scale: new THREE.Vector3(1,1,1),
    } ;

    return newModel ;
  },

  readWavefrontObj: function (filename, callbackCompleted) {
    $.get (filename, function (data) {

      var modelDef = { vertices: [], lines: [] } ;

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
      re = /^f\s(.+)/gm ;
      while ((match = re.exec (data)) !== null) {
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
            modelDef.lines.push (lastV) ;
            modelDef.lines.push (v) ;
          }
          lastV = v ;
        }

        modelDef.lines.push (firstV) ;
        modelDef.lines.push (lastV) ;
      }

      // now do a line check for no line overdraw, horrible O(n^2) thing
      var optimizedLines = [] ;
      for (var i = 0; i < modelDef.lines.length; i += 2) {
        var v1 = modelDef.lines[i] ;
        var v2 = modelDef.lines[i + 1] ;

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

      //console.log (JSON.stringify(optimizedLines, 2, 2)) ;

      modelDef.lines = optimizedLines ;



      callbackCompleted(modelDef) ;
    }) ;
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
    var clipM = new THREE.Matrix4() ;
    clipM.multiplyMatrices (model.projMatrix, model.modelMatrix) ;

    //console.log (JSON.stringify(model.modelMatrix.elements, 2, 2)) ;

    // apply model + view + proj matrix to verts to convert to clip space
    var verts = model.def.vertices.slice(0) ;
    verts = clipM.applyToVector3Array (verts) ;

    //console.log (JSON.stringify(verts, 2, 2)) ;

    // convert clip to screen space
    var verts2D = [] ;
    for (var i = 0; i < verts.length; i += 3 ) {
      //console.log (verts[i] + " " + verts[i+1] + " " + verts[i+2]) ;
      verts2D.push ((verts[i] * model.viewWidth) / (1.0 * verts[i + 2]) + model.viewWidth / 2) ;
      verts2D.push ((verts[i + 1] * model.viewHeight) / (1.0 * verts[i + 2]) + model.viewHeight / 2) ;
    }

    model.xformedVerts = verts2D ;

    //console.log (JSON.stringify(model.xformedVerts, 2, 2)) ;
  },


  viewAsPerspective: function (model, fovAngle, w, h, near, far) {

    //var fov = 1.0 / Math.tan(THREE.Math.degToRad(fovAngle) / 2.0) ;
    var aspect = w / h ;

    model.viewWidth = w ;
    model.viewHeight = h ;

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
    modelGraphics.lineStyle (thickness, 0xFFFFFF, 1) ;

    var lastVert = THREE.Vector3() ;

    for (var i = 0; i < model.def.lines.length; i += 2) {
      var firstVertIdx = model.def.lines[i] * 2 ;
      var secVertIdx = model.def.lines[i + 1] * 2 ;
      // lookup vert for this line
      //modelGraphics.lineStyle (4, Math.random() * 0xFFFFFF, 1) ;
      modelGraphics.moveTo (model.xformedVerts[firstVertIdx], model.xformedVerts[firstVertIdx + 1]) ;
      modelGraphics.lineTo (model.xformedVerts[secVertIdx], model.xformedVerts[secVertIdx + 1]) ;
    }

  },

};

