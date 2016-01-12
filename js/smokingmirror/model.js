"use strict";
/* globals Smokingmirror */

Smokingmirror.Model = function(def) {
  this.lineThickness = 1.0 ;
  this.alpha = 1.0 ;
  this.transformedVerts = [] ;
  this.modelMatrix = new Smokingmirror.Matrix4() ;
  this.rotation = new Smokingmirror.Vector3() ;
  this.position = new Smokingmirror.Vector3() ;
  this.scale = new Smokingmirror.Vector3(1, 1, 1) ;

  if (typeof def !== 'undefined') {
    this.loadDef (def) ;
  }
};

Smokingmirror.Model.prototype = {
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
    var scaleM = new Smokingmirror.Matrix4() ;
    scaleM.scale (this.scale) ;

    var rotM = new Smokingmirror.Matrix4() ;
    rotM.makeRotationFromVector3 (this.rotation) ;

    var transM = new Smokingmirror.Matrix4() ;
    transM.makeTranslation (this.position.x, this.position.y, this.position.z) ;

    this.modelMatrix.identity() ;
    this.modelMatrix.multiply (Smokingmirror.render.viewMatrixInv) ;
    this.modelMatrix.multiply (transM) ;
    this.modelMatrix.multiply (rotM) ;
    this.modelMatrix.multiply (scaleM) ;

    //console.log (JSON.stringify(model.modelMatrix.elements, 2, 2)) ;
    //model.modelMatrix.identity() ;
  },

  update: function() {
    this.applyModelTransforms () ;
    this.transformedVerts = Smokingmirror.geometry.generateTransformedVerts (Smokingmirror.render.projMatrix, this.modelMatrix, this.def.vertices) ;
  },

  render: function(graphics) {
    Smokingmirror.render.renderModelToGraphics(this, graphics, this.lineThickness) ;
  }


};
