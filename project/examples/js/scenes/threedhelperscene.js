
var ThreeDHelperTesterScene = function (game) {
  this.game = game ;
  this.name = '3DHelperTester' ;
  this.shadersVectrex = require('./shared/shaders_vectrex')(game) ;

  this.modelGraphics = new PIXI.Graphics() ;
} ;


ThreeDHelperTesterScene.prototype = {
  setup: function () {
    this.shadersVectrex.setup() ;

    this.game.wireframeRender.setCamera(
      new SmokingMirror.Vector3 (0, 0, 100),
      new SmokingMirror.Vector3 (0, 0, 0)
    ) ;

    this.shadersVectrex.addRenderChild (this.modelGraphics) ;
  },

  destroy: function() {
    this.shadersVectrex.removeRenderChild (this.modelGraphics) ;

    this.shadersVectrex.destroy() ;
  },

  resize: function () {
    this.shadersVectrex.resize() ;

    this.game.wireframeRender.setCamera(
      new SmokingMirror.Vector3 (0, 0, 100),
      new SmokingMirror.Vector3 (0, 0, 0)
    ) ;
  },

  update: function(dt) {


  },

  render: function() {
    this.modelGraphics.clear() ;

    //this.player.render(this.game.modelGraphics) ;
    this.modelGraphics.lineStyle (4, 0xFF00FF, 1) ;

    SmokingMirror.ThreeD.Helpers.renderPoint (this.game.wireframeRender, this.modelGraphics, new SmokingMirror.Vector3 (0, 0, 0), 0.05) ;
  }

};

module.exports = ThreeDHelperTesterScene ;
