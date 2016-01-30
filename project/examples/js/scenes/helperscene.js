
var HelperTesterScene = function (game) {
  this.game = game ;
  this.name = 'HelperTester' ;

  this.modelGraphics = new PIXI.Graphics() ;
} ;


HelperTesterScene.prototype = {
  setup: function () {
    this.game.addRenderChild (this.modelGraphics) ;
  },

  destroy: function() {
    this.game.removeRenderChild (this.modelGraphics) ;
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

module.exports = HelperTesterScene ;
