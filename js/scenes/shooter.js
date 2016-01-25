var Player = require ('../player') ;
var math = require('../smokingmirror/math/misc') ;

var ShooterScene = function (game) {
  this.game = game ;
} ;


ShooterScene.prototype = {
  setup: function () {
    this.player = new Player (this.game.assetManager.getAsset ('models.player'), this.game.wireframeRender) ;

    this.player.update(0) ;

    this.r = 127 ;

  },

  destroy: function() {
    this.player = null ;
  },

  update: function(dt) {
    //this.player.pos.x = -0.9 ; // 1.0 * dt ;

    this.player.pos.y = -1.5 ;
    this.player.pos.z = -7 ;

    this.r += dt * 10 ;

    this.player.rot.x = 147 * math.DTR ;
    this.player.rot.y = this.r * math.DTR ;
    this.player.rot.z = 0 * math.DTR ;

    this.player.update (dt) ;


  },

  render: function() {
    this.player.render(this.game.modelGraphics) ;
  }

};

module.exports = ShooterScene ;
