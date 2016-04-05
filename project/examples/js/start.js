/* globals SmokingMirror */

var game = new SmokingMirror.Game() ;
var defaultScene = 'Sounds' ;

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
  },
  models: {
    player: 'assets/objects/player3.obj'
  },
  sounds: {
    music: 'assets/sounds/musicingame.mp3',
    enemy_hit: 'assets/sounds/EnemyHit.wav',
    engine_loop: 'assets/sounds/EngineBetterLooped1.wav',
    machinegun: 'assets/sounds/MachineGunBetter.wav',
    reward: 'assets/sounds/RewardGet.wav',
    small_explosion: 'assets/sounds/SmallExplosion.wav',
  },
} ;

var scenes = {} ;

function loadAssetsAndStart () {
  game.assetManager.loadAssets (assetList, function() {
    $('#loader').hide() ;

    game.enableDebug (game.debugFlags.ALL) ;
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
    { name: 'Blackhole', source: require('./scenes/blackholescene') },
    { name: 'Input Manager', source: require('./scenes/inputscene') },
    { name: 'Sounds', source: require('./scenes/soundscene') },
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

  game.init(1136, 640) ;

  createSceneHelpers() ;
  setupScenes() ;
  loadAssetsAndStart() ;

});
