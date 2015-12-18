
var cubeModelDef = {
  vertices: [
    -1, -1, 1,
    -1, 1, 1,
    1, 1, 1,
    1, -1, 1,
    -1,-1,-1,
    -1, 1, -1,
    1, 1, -1,
    1, -1, -1,
  ],

  lines: [
    0, 1,
    1, 2,
    2, 3,
    3, 0,
    4, 5,
    5, 6,
    6, 7,
    7, 4,
    0, 4,
    1, 5,
    2, 6,
    3, 7
  ]
};

var canvas = { w: 900, h: 600 } ;
var wireframeEngine = new WireframeEngine() ;

var cubeModel ;

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var renderType = getParameterByName('render') ;
if (renderType === "") {
  renderType = 'webgl' ;
}

console.log (renderType) ;


$(document).ready (function() {

  //cubeModel = wireframeEngine.setupModel (cubeModelDef) ;

  wireframeEngine.readWavefrontObj ('assets/objects/player2.obj', function (modelDef) {
    cubeModel = wireframeEngine.setupModel (modelDef) ;
    //cubeModel = wireframeEngine.setupModel (cubeModelDef) ;

    //console.log (JSON.stringify(cubeModel, 2, 2)) ;

    startup() ;
  }) ;

  //startup() ;
}) ;


function startup() {

  wireframeEngine.viewAsPerspective (cubeModel, 90, canvas.w, canvas.h, 1, 100) ;

  var modelGraphics = new PIXI.Graphics() ;

  //console.log (JSON.stringify(cubeModel, 2, 2)) ;

  var renderer ; //= PIXI.autoDetectRenderer(canvas.w, canvas.h, {backgroundColor : 0x000000}) ;

  if (renderType === 'webgl') {
    renderer = new PIXI.WebGLRenderer ( canvas.w, canvas.h, {backgroundColor : 0x000000} );
  } else if (renderType === 'canvas') {
    renderer = new PIXI.CanvasRenderer ( canvas.w, canvas.h, {backgroundColor : 0x000000} );
  } else {
    alert ("Unknown render method.") ;
    return ;
  }

  document.body.appendChild(renderer.view);

  // create the root of the scene graph
  var stage = new PIXI.Container() ;
  stage.interactive = true;

  var pixelEffectContainer = new PIXI.Container() ;
  stage.addChild (pixelEffectContainer) ;

  var visualEffectsContainer = new PIXI.Container() ;

  pixelEffectContainer.addChild (visualEffectsContainer) ;


  var renderTextureBlur = new PIXI.RenderTexture(renderer, renderer.width, renderer.height);
  var renderTextureGlow = new PIXI.RenderTexture(renderer, renderer.width, renderer.height);

  var mosaicScale = 0.25 ;

  var renderSpriteBlur = new PIXI.Sprite(renderTextureBlur) ;
  renderSpriteBlur.position.x = canvas.w / 2 ;
  renderSpriteBlur.position.y = canvas.h / 2 ;
  renderSpriteBlur.anchor.set(0.5) ;


  var renderSpriteGlow = new PIXI.Sprite(renderTextureGlow) ;
  renderSpriteGlow.position.x = canvas.w / 2 ;
  renderSpriteGlow.position.y = canvas.h / 2 ;
  renderSpriteGlow.anchor.set(0.5) ;

  /*var textureBack = PIXI.Texture.fromImage('assets/inkscape/background.png');

  // create a new Sprite using the texture
  var backSpr = new PIXI.Sprite(textureBack);

  // center the sprite's anchor point
  backSpr.anchor.x = 0.5;
  backSpr.anchor.y = 0.5;

  // move the sprite to the center of the screen
  backSpr.position.x = canvas.w / 2;
  backSpr.position.y = canvas.h / 2 ;

  backSpr.scale.x = 0.7 ;
  backSpr.scale.y = 0.7 ;
  */

  visualEffectsContainer.addChild(modelGraphics);


  var glowFilter = new GlowFilter();

  var blurFilter = new PIXI.filters.BlurFilter();
  blurFilter.blur = 50 ;

  renderSpriteGlow.filters = [glowFilter] ;
  renderSpriteBlur.filters = [blurFilter] ;
  renderSpriteBlur.alpha = 0.5 ;

  stage.addChild (pixelEffectContainer) ;

  renderSpriteGlow.blendMode = PIXI.BLEND_MODES.ADD;
  pixelEffectContainer.addChild (renderSpriteGlow) ;
  renderSpriteBlur.blendMode = PIXI.BLEND_MODES.OVERLAY;
  pixelEffectContainer.addChild (renderSpriteBlur) ;

  var pixelFilter = new PIXI.filters.PixelateFilter() ;
  pixelFilter.size = { x: 2, y: 2 } ;
  pixelEffectContainer.filters = [pixelFilter] ;

  var animTick = 0 ;
  var blurScale = 0.9 ;
  var lineThickness = 4 ;

  var guitheme;

  var modelPos = new THREE.Vector3(0, 0, 0.35) ;

  function onCompleteThemeLoad() {
    // initialize theme
    /*var aeonbtn;
    aeonbtn = new GOWN.Button(guitheme);
    aeonbtn.width = 150;
    aeonbtn.height = 30;
    aeonbtn.x = 20;
    aeonbtn.y = 30;
    aeonbtn.label = "first";
    stage.addChild(aeonbtn);
    aeonbtn.tap = aeonbtn.click = function (evt) {
      if (window.console) {
        console.log("you clicked the first button!");
      }
    };*/

    var uiGroup = new GOWN.LayoutGroup() ;
    uiGroup.x = 10 ;
    uiGroup.y = 10 ;
    uiGroup.width = 400 ;
    uiGroup.height = 400 ;

    uiGroup.layout = new GOWN.VerticalLayout() ; //GOWN.TiledRowsLayout() ;
    uiGroup.gap = 15 ;
    stage.addChild (uiGroup) ;


    var slider = new GOWN.Slider(null, guitheme);
    slider.width = 300;
    slider.height = 40 ;
    slider.minimum = 0.1 ;
    slider.maximum = 1 ;
    slider.value = blurScale ;
    uiGroup.addChild(slider);

    var sliderGlow = new GOWN.Slider(null, guitheme);
    sliderGlow.width = 300;
    sliderGlow.height = 40 ;
    sliderGlow.minimum = 0.0 ;
    sliderGlow.maximum = 1 ;
    sliderGlow.value = 1 ;
    uiGroup.addChild(sliderGlow);

    var sliderGlowFactorMax = new GOWN.Slider(null, guitheme);
    sliderGlowFactorMax.width = 300;
    sliderGlowFactorMax.height = 40 ;
    sliderGlowFactorMax.minimum = 0.5 ;
    sliderGlowFactorMax.maximum = 4 ;
    sliderGlowFactorMax.value = glowFilter.factorMax ;
    uiGroup.addChild(sliderGlowFactorMax);


    var sliderGlowSumBias = new GOWN.Slider(null, guitheme);
    sliderGlowSumBias.width = 300;
    sliderGlowSumBias.height = 40 ;
    sliderGlowSumBias.minimum = 0.01 ;
    sliderGlowSumBias.maximum = 0.05 ;
    sliderGlowSumBias.value = glowFilter.sumBias ;
    uiGroup.addChild(sliderGlowSumBias);


    var sliderPixels = new GOWN.Slider(null, guitheme);
    sliderPixels.width = 300;
    sliderPixels.height = 40 ;
    sliderPixels.minimum = 1 ;
    sliderPixels.maximum = 30 ;
    sliderPixels.value = pixelFilter.size.x ;
    uiGroup.addChild(sliderPixels);

    var sliderLineThickness = new GOWN.Slider(null, guitheme);
    sliderLineThickness.width = 300;
    sliderLineThickness.height = 40 ;
    sliderLineThickness.minimum = 1 ;
    sliderLineThickness.maximum = 30 ;
    sliderLineThickness.value = lineThickness ;
    uiGroup.addChild(sliderLineThickness);

    var sliderX = new GOWN.Slider(null, guitheme);
    sliderX.width = 300;
    sliderX.height = 40 ;
    sliderX.minimum = -5  ;
    sliderX.maximum = 5 ;
    sliderX.value = 0.001 ;
    uiGroup.addChild(sliderX);

    var sliderY = new GOWN.Slider(null, guitheme);
    sliderY.width = 300;
    sliderY.height = 40 ;
    sliderY.minimum = -5 ;
    sliderY.maximum = 5 ;
    sliderY.value = 0.001 ;
    uiGroup.addChild(sliderY);

    var sliderZ = new GOWN.Slider(null, guitheme);
    sliderZ.width = 300;
    sliderZ.height = 40 ;
    sliderZ.minimum = -10 ;
    sliderZ.maximum = 10 ;
    sliderZ.value = modelPos.z ;
    //uiGroup.addChild(sliderZ);


    var chkBlur;
    chkBlur = new GOWN.CheckBox(true, guitheme);
    chkBlur.width = 30 ;
    chkBlur.height = 30 ;
    uiGroup.addChild(chkBlur) ;

    var chkGlow;
    chkGlow = new GOWN.CheckBox(true, guitheme);
    chkGlow.width = 30 ;
    chkGlow.height = 30 ;
    uiGroup.addChild(chkGlow) ;


    chkBlur.change = function(selected) {
      renderSpriteBlur.visible = selected ;
    };
    chkGlow.change = function(selected) {
      renderSpriteGlow.visible = selected ;
    };

    slider.change = function(sliderData) {
      blurScale = sliderData.value ;
    };
    sliderGlow.change = function(sliderData) {
      renderSpriteGlow.alpha = sliderData.value ;
    };
    sliderGlowFactorMax.change = function(sliderData) {
      glowFilter.factorMax = sliderData.value ;
      console.log ("factorMax=" + glowFilter.factorMax) ;
    };
    sliderGlowSumBias.change = function(sliderData) {
      glowFilter.sumBias = sliderData.value ;
      console.log ("sumBias=" + glowFilter.sumBias) ;
    };
    sliderPixels.change = function(sliderData) {
      pixelFilter.size = { x: sliderData.value, y: sliderData.value } ;
      console.log ("sumBias=" + sliderData.value) ;
    };
    sliderLineThickness.change = function(sliderData) {
      lineThickness = sliderData.value ;
      console.log ("lineThickness=" + sliderData.value) ;
    };
    sliderX.change = function(sliderData) {
      modelPos.x = sliderData.value ;
    };
    sliderY.change = function(sliderData) {
      modelPos.y = sliderData.value ;
    };
    sliderZ.change = function(sliderData) {
      modelPos.z = sliderData.value ;
    };


    requestAnimationFrame(animate);
  }

  //guitheme = new GOWN.AeonTheme(
  //        ["gown.js/themes/assets/aeon/aeon_desktop.json"], onCompleteThemeLoad);

  guitheme = new GOWN.MetalWorksMobileTheme(
        ["gown.js/themes/assets/metalworks/metalworks.json"], onCompleteThemeLoad);

  var moveAxisZVel = 0 ;

  function animate() {

      requestAnimationFrame( animate );

      //cubeModel.scale.x = 0.5 ;
      //cubeModel.scale.y = 0.5 ;
      //cubeModel.scale.z = 0.5 ;

      cubeModel.position.x = modelPos.x ;
      cubeModel.position.y = modelPos.y ;
      //cubeModel.position.z = modelPos.z ;
      cubeModel.position.z += moveAxisZVel ;
      cubeModel.rotation.x += 0.01 ;
      cubeModel.rotation.y += 0.01 ;
      cubeModel.rotation.z += 0.01 ;
      wireframeEngine.applyModelTransforms (cubeModel) ;
      wireframeEngine.generateLines (cubeModel) ;
      wireframeEngine.renderModelToGraphics (cubeModel, modelGraphics, lineThickness) ;

      renderTextureBlur.render(visualEffectsContainer, null, true);
      renderTextureGlow.render(visualEffectsContainer, null, true);

      renderer.render(stage);

      blurFilter.blur = 30 * blurScale + Math.sin(animTick) * 10.0 * blurScale ;
      renderSpriteBlur.alpha = 1.0 - (0.7 + Math.abs (Math.sin(animTick)) * 0.2) * blurScale ;

      animTick += 0.03 ;
  }

  // setup keyboard events
  var keyX = keyboard(88) ;
  var keyC = keyboard(67) ;

  var amt = 0.1 ;

  keyX.press = function() {
    moveAxisZVel = -amt ;
  };

  keyX.release = function() {
    if (!keyC.isDown) {
      moveAxisZVel = 0 ;
    }
  };

  keyC.press = function() {
    moveAxisZVel = amt ;
  };

  keyC.release = function() {
    if (!keyX.isDown) {
      moveAxisZVel = 0 ;
    }
  };



}
