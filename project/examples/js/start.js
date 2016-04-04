/* globals SmokingMirror */

var game = new SmokingMirror.Game() ;
var defaultScene = 'Blackhole' ;

var assetList = {
  images: {
    star_background: 'assets/images/star_background.png',
    displace: 'assets/images/displace.png',
    grid: 'assets/images/grid.png',
    eventhorizon_glow: 'assets/images/eventhorizon_glow.png',
  },
  models: {
    player: 'assets/objects/player3.obj'
  }
} ;

var scenes = {} ;

function loadAssetsAndStart () {
  game.assetManager.loadAssets (assetList, function() {
    $('#loader').hide() ;
    $("div#debuggui").show() ;

    var sceneName = defaultScene ;
    var scene = _.find (scenes.list, { name: sceneName }) ;
    game.startNewScene(new scene.source(game)) ;
    game.startLoop() ;
  }) ;
}

function setupScenes() {
  scenes.list = [
    { name: '3D Follower', source: require('./scenes/threedfollowscene') },
    { name: '3D Model', source: require('./scenes/threedmodelscene') },
    { name: '3D Curve', source: require('./scenes/threedcurvescene') },
    { name: '3D Helpers', source: require('./scenes/threedhelperscene') },
    { name: 'Blackhole', source: require('./scenes/blackholescene') },
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



$(document).ready (function() {

  game.init(1136, 640) ;

  setupScenes() ;
  loadAssetsAndStart() ;

});
