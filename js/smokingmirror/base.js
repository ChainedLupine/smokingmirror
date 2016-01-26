var Matrix4 = require('./math/matrix4') ;
var Vector3 = require('./math/vector3') ;

var Base3d = function(renderer) {
  this.renderer = renderer ;

  this.alpha = 1.0 ;
  this.lineThickness = 1.0 ;

  this.modelMatrix = new Matrix4() ;
  this.rotation = new Vector3() ;
  this.position = new Vector3() ;
  this.scale = new Vector3(1, 1, 1) ;

} ;


Base3d.prototype = {
  applyTransforms: function () {
    // first, build all of our matrices
    var scaleM = new Matrix4() ;
    scaleM.scale (this.scale) ;

    var rotM = new Matrix4() ;
    rotM.makeRotationFromVector3 (this.rotation) ;

    var transM = new Matrix4() ;
    transM.makeTranslation (this.position.x, this.position.y, this.position.z) ;

    this.modelMatrix.identity() ;
    this.modelMatrix.multiply (this.renderer.viewMatrixInv) ;
    this.modelMatrix.multiply (transM) ;
    this.modelMatrix.multiply (rotM) ;
    this.modelMatrix.multiply (scaleM) ;

    //console.log (JSON.stringify(model.modelMatrix.elements, 2, 2)) ;
    //model.modelMatrix.identity() ;
  },

  update: function() {
    this.applyTransforms () ;
  },


} ;


module.exports = Base3d ;
