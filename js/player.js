(function(root) {

  root.game.Player = function(defData) {
    "use strict";

    this.modelDef = root.Smokingmirror.loader.parseWavefront (defData) ;

    this.model = new root.Smokingmirror.Model(this.modelDef) ;

    this.model.materials.FlameMat.color = 0xFF4212 ;
    this.model.materials.FlameMat.alpha = 0.7 ;
    this.model.materials.BaseMat.color = 0xE0FFFC ;

    this.pos = new root.Smokingmirror.Vector3() ;
    this.rot = new root.Smokingmirror.Vector3() ;
  };

  root.game.Player.prototype = {
    
    update: function() {
      this.model.position = this.pos ;
      this.model.rotation = this.rot ;

      this.model.update() ;
    },

    render: function(modelGraphics) {
      this.model.render(modelGraphics) ;
    }

  };

})(typeof window !== "undefined" ? window : this) ;
