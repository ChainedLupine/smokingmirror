
var Matrix4 = require('./math/matrix4') ;
var Vector3 = require('./math/vector3') ;
var Geometry = require('./geometry') ;

var Model = function(def, renderer) {
  if (typeof renderer === 'undefined') {
    throw "Must define a renderer!" ;
  }

  this.renderer = renderer ;

  this.lineThickness = 1.0 ;
  this.alpha = 1.0 ;
  this.transformedVerts = [] ;
  this.modelMatrix = new Matrix4() ;
  this.rotation = new Vector3() ;
  this.position = new Vector3() ;
  this.scale = new Vector3(1, 1, 1) ;

  if (typeof def !== 'undefined') {
    this.loadDef (def) ;
  }
};

Model.prototype = {
  loadDef: function (modelDef) {
    var initMaterials = {} ;
    var mats = Object.keys(modelDef.lines) ;

    for (var i = 0; i < mats.length; i++) {
      initMaterials[mats[i]] = {
        alpha: 1.0,
        color: 0xFFFFFF
        //color: Math.floor(Math.random()*16777215)
      };
    }

    this.def = modelDef ;
    this.materials = initMaterials ;
  },

  applyModelTransforms: function () {
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
    this.applyModelTransforms () ;
    this.transformedVerts = Geometry.generateTransformedVerts (this.renderer.projMatrix, this.modelMatrix, this.def.vertices) ;
  },

  render: function(graphics) {
    this.renderer.renderModelToGraphics(this, graphics, this.lineThickness) ;
  }


};

module.exports = Model ;
