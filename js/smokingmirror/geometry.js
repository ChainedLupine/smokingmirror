"use strict";
/* globals Smokingmirror */

Smokingmirror.Geometry = function() {

};

Smokingmirror.Geometry.prototype = {

  generatePerspectiveView: function (fovAngle, w, h, near, far) {

    //var fov = 1.0 / Math.tan(THREE.Math.degToRad(fovAngle) / 2.0) ;
    var aspect = w / h ;

    var m = new Smokingmirror.Matrix4() ;

    return m.makePerspective (fovAngle, aspect, near, far) ;

    //console.log (JSON.stringify(model.projMatrix.elements, 2, 2)) ;
  },

  generateOrthoView: function (left, right, top, bottom, near, far) {
    var m = new Smokingmirror.Matrix4() ;
    return m.makeOrthographic (left, right, top, bottom, near, far) ;
  },

  // take vertices, project by projMatrix and move by modelMatrix then convert to clip space
  generateTransformedVerts: function (projMatrix, modelMatrix, vertices) {
    var combinedM = new Smokingmirror.Matrix4() ;
    combinedM.multiplyMatrices (projMatrix, modelMatrix) ;

    //console.log (JSON.stringify(model.modelMatrix.elements, 2, 2)) ;

    var e = combinedM.elements;
    var vertsXYZW = [] ;

    // apply model + view + proj matrix to verts to convert straight to homogenious clip space (XYZW)
    for (var i = 0; i < vertices.length; i += 3 ) {
      var x = vertices[i] ;
      var y = vertices[i+1] ;
      var z = vertices[i+2] ;

      // we're assuming w=1 here
      vertsXYZW.push (e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ]) ;
      vertsXYZW.push (e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ]) ;
      vertsXYZW.push (e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ]) ;
      vertsXYZW.push (e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ]) ;
    }

    return vertsXYZW ;
  },


}; // prototype

Smokingmirror.geometry = new Smokingmirror.Geometry() ;
