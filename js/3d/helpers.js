var math = require('./math') ;
var Geometry = require('./geometry') ;

var Helpers = {
  renderPoint: function (renderer, graphics, pos, diameter) {
    if (typeof (diameter) === 'undefined') {
      diameter = 1 ;
    }

    var modelMatrix = new math.Matrix4() ;

    var transM = new math.Matrix4() ;
    transM.makeTranslation (pos.x, pos.y, pos.z) ;

    modelMatrix.identity() ;
    modelMatrix.multiply (renderer.viewMatrixInv) ;
    modelMatrix.multiply (transM) ;

    var pts = [], s, i ;
    for (i = 0; i < 8; i++) {
      s = (360 / 8) * i ;
      pts.push (Math.sin (s * math.DTR) * diameter) ;
      pts.push (Math.cos (s * math.DTR) * diameter) ;
      pts.push (0) ;
    }
    pts.push (Math.sin (0 * math.DTR) * diameter) ;
    pts.push (Math.cos (0 * math.DTR) * diameter) ;
    pts.push (0) ;

    for (i = 0; i < 8; i++) {
      s = (360 / 8) * i ;
      pts.push (0) ;
      pts.push (Math.sin (s * math.DTR) * diameter) ;
      pts.push (Math.cos (s * math.DTR) * diameter) ;
    }

    pts.push (0) ;
    pts.push (Math.sin (0 * math.DTR) * diameter) ;
    pts.push (Math.cos (0 * math.DTR) * diameter) ;

    var xformVerts = Geometry.generateTransformedVerts (
      renderer.projMatrix, modelMatrix, pts) ;

    renderer.renderLinesToGraphics (xformVerts, graphics) ;
  },
}; // prototype

module.exports = Helpers ;
