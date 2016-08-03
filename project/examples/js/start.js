/* globals SmokingMirror */

var game = new SmokingMirror.Game() ;
//var defaultScene = 'Spritesheets' ;
var defaultScene = 'Intro' ;

var assetList = {
  images: {
    star_background: 'assets/images/star_background.png',
    displace: 'assets/images/displace.png',
    grid: 'assets/images/grid.png',
    mine: 'assets/images/mine.png',
    crystals: 'assets/images/crystals.png',
    test_box: 'assets/images/test-box.png',
    pirates: 'assets/images/pirateattack.png',
    vpilot: 'assets/images/portrait-vpilot.png',
    trashcan: 'assets/images/trashcan-scaled.png',
    eventhorizon_glow: 'assets/images/eventhorizon_glow.png',
    background: 'assets/images/background.png',
    background2: 'assets/images/background2.png',
    sm_logo: 'assets/images/sm-logo.png'
  },

  level: {
    test: 'assets/levels/test.tmx',
    tiles: {
      sheet: 'assets/tiles/tiles.json',
      texture: 'assets/tiles/tiles.png',
    }
  },

  models: {
    player: 'assets/objects/player3.obj',
  },

  sprites: {
    sheets: {
      explosion: 'assets/sprites/explosion.json',
      explosion2: 'assets/sprites/explosion2.json',
    },
    textures: {
      explosion: 'assets/sprites/packed/explosion.png',
      explosion2: 'assets/sprites/packed/explosion2.png',
    }
  },
  sounds: {
    music: 'assets/sounds/musicingame.mp3',
    enemy_hit: 'assets/sounds/EnemyHit.wav',
    engine_loop: 'assets/sounds/EngineBetterLooped1.wav',
    machinegun: 'assets/sounds/MachineGunBetter.wav',
    reward: 'assets/sounds/RewardGet.wav',
    small_explosion: 'assets/sounds/SmallExplosion.wav',
    blip_select: 'assets/sounds/Blip_Select.wav',
  },
} ;

var scenes = {} ;

function loadAssetsAndStart () {
  game.assetManager.loadAssets (assetList, function() {
    $('#loader').hide() ;
    var textparent = $("div#scenehelp") ;
    textparent.show() ;
    var textdiv = $("div#scenetext") ;
    //textparent.addClass ("background") ;

    $('div#closebar input[type=checkbox]').change(function() {
      if (this.checked) {
        textdiv.slideDown ("fast") ;
        //textparent.addClass ("background") ;
        textparent.animate({
          backgroundColor: "rgba(0,0,0,0.8)"
        }, "fast") ;
      } else {
        textdiv.slideUp ("slow") ;
        //textparent.removeClass ("background") ;
        textparent.animate({
          backgroundColor: "rgba(0,0,0,0.0)"
        }, "slow") ;
      }
    }) ;

    game.enableLivereload() ;

    var sceneName = defaultScene ;
    var scene = _.find (scenes.list, { name: sceneName }) ;

    game.startNewScene(new scene.source(game)) ;
    game.startLoop() ;
  }, function (loaded, max) {
    $('#loader p').text("Loaded " + loaded + " of " + max) ;
  }) ;
}

function setupScenes() {
  scenes.list = [
    { name: '3D Follower', source: require('./scenes/threedfollowscene') },
    { name: '3D Model', source: require('./scenes/threedmodelscene') },
    { name: '3D Curve', source: require('./scenes/threedcurvescene') },
    { name: '3D Helpers', source: require('./scenes/threedhelperscene') },
    { name: '2D/3D Mixing', source: require('./scenes/blackholescene') },
    { name: 'Input Manager', source: require('./scenes/inputscene') },
    { name: 'Sounds', source: require('./scenes/soundscene') },
    { name: '2D Spritesheets', source: require('./scenes/spritesheetscene') },
    //{ name: '2D Tilemap', source: require('./scenes/tilemapscene') },
    { name: '2D Physics', source: require('./scenes/physics2dscene') },
    //{ name: '3D Physics', source: require('./scenes/physics3dscene') },
    { name: 'Intro', source: require('./scenes/introscene') },
  ] ;

  scenes.classes = {} ;

  var sceneNames = [] ;
  for (var i = 0; i < scenes.list.length; i++) {
    sceneNames.push (scenes.list[i].name) ;
  }

  var SceneSettings = function() {
    this.currentScene = defaultScene ;
  } ;

  var sceneSettings = new SceneSettings() ;

  game.dgui.add(sceneSettings, 'currentScene', sceneNames).onFinishChange(function(value) {
    for (var i = 0; i < scenes.list.length; i++) {
      var sceneData = scenes.list[i] ;
      if (sceneData.name === value) {
        game.startNewScene(new sceneData.source(game)) ;
      }
    }
  }) ;

}

function createSceneHelpers() {
  game.sceneSetHelpText = function (text) {
    var div = $("div#scenetext").empty() ;

    if (typeof (text) !== "undefined") {
        div.append (text) ;
    }
  } ;

}

$(document).ready (function() {

  $("div#scenehelp").hide() ;

  var canvas = $("canvas#main").get(0) ;

  game.onResize = function (canvasSettings) {
    $("div#game").css({ top: canvasSettings.y + "px" });
    $("canvas#main").css({ left: canvasSettings.x + "px" });
  } ;

  game.patchDatGUI() ;

  game.init(canvas, 1136, 640) ;

  game.enableDebug (game.DebugFlags.STATS_FPS) ;
  game.enableDebug (game.DebugFlags.DAT_GUI) ;

  // prevent mouse events from triggering under the UI box at capture phase
  /*$(".dg.main").get(0).addEventListener("mousedown", function(event) {
    event.stopPropagation() ;
  }, false);

  $(".dg.main").get(0).addEventListener("mouseup", function(event) {
    event.stopPropagation() ;
  }, false);*/

  createSceneHelpers() ;
  setupScenes() ;
  loadAssetsAndStart() ;

});
