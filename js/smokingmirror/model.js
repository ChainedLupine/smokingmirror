
var Matrix4 = require('./math/matrix4') ;
var Vector3 = require('./math/vector3') ;
var Geometry = require('./geometry') ;
var Base = require('./base') ;

var Model = function(def, renderer) {
  Base.call(this, renderer) ;

  if (typeof renderer === 'undefined') {
    throw "Must define a renderer!" ;
  }

  this.transformedVerts = [] ;

  if (typeof def !== 'undefined') {
    this.loadDef (def) ;
  }
};

Model.prototype = Object.create(Base.prototype) ;
Model.prototype.constructor = Model ;

Model.prototype.loadDef = function (modelDef) {
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
} ;

Model.prototype.update = function() {
  this.applyTransforms () ;
  this.transformedVerts = Geometry.generateTransformedVerts (
    this.renderer.projMatrix, this.modelMatrix, this.def.vertices) ;
} ;

Model.prototype.render = function(graphics) {
  this.renderer.renderModelToGraphics(this, graphics, this.lineThickness) ;
} ;

module.exports = Model ;
