module.exports = function (game) {

  var boxWidth = 426 ;
  var boxHeight = 240 ;
  var boxCtr = new PIXI.Container() ;
  var demoText ;

  var textStyle = {
      font : "24px 'Lucida Grande'",
      fill : '#fff',
      dropShadow : true,
      dropShadowColor : '#000000',
      dropShadowAngle : Math.PI / 6,
      dropShadowDistance : 0,
  };

  var createDemoText = function (text) {
    var demoText = new PIXI.Text(text, textStyle) ;
    demoText.anchor.x = demoText.anchor.y = 0.5 ;
    demoText.scale.x = demoText.scale.y = 0.5 ;
    demoText.x = boxWidth / 2 ;
    demoText.y = boxHeight - demoText.height / 2 ;
    return demoText ;
  } ;

  var scaleBoxContainer = function () {
    //console.log (this.game.PIXIrenderer.width, this.game.PIXIrenderer.height) ;
    var ratio = Math.floor (Math.min (game.PIXIrenderer.width / boxWidth, game.PIXIrenderer.height / boxHeight)) ;
    //console.log (ratio) ;

    boxCtr.scale.x = ratio ;
    boxCtr.scale.y = ratio ;
    boxCtr.x = (game.PIXIrenderer.width - (boxWidth * ratio)) * 0.5 ;
    boxCtr.y = (game.PIXIrenderer.height - (boxHeight * ratio)) * 0.5 ;
  } ;


  return {
    setup: function (text) {

      game.stage.addChild (boxCtr) ;
      scaleBoxContainer() ;

      var temp = new PIXI.Sprite(
        new PIXI.Texture(new PIXI.BaseTexture(game.assetManager.getAsset("images.test_box")))
      ) ;
      boxCtr.addChild (temp) ;
      temp.alpha = 0.1 ;

      demoText = createDemoText (text) ;
      boxCtr.addChild (demoText) ;

      return boxCtr ;
    },



    destroy: function () {
      boxCtr.removeChild (demoText) ;
      game.stage.addChild (boxCtr) ;
    },

    resize: function () {
      scaleBoxContainer() ;
    },

  } ;
} ;
