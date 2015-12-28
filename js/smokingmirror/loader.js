"use strict";
/* globals Smokingmirror */

Smokingmirror.Loader = function() {


} ;

Smokingmirror.Loader.prototype = {
  parseWavefront: function (data) {
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
    var datalines = data.split('\n') ;
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
      for (var vi = 0; vi < lines.length; vi += 2) {
        var v1 = lines[vi] ;
        var v2 = lines[vi + 1] ;

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
}; // prototype

Smokingmirror.loader = new Smokingmirror.Loader() ;
