/* globals dat */

var SoundEngine = require('./sound/sound') ;
var Scenegraph = require('./scene/scenegraph') ;

var smokingmirror = {
  Math: require('./3d/math/misc'),
  Vector3: require('./3d/math/vector3'),
  Quaternion: require('./3d/math/quat'),
  Matrix4: require('./3d/math/matrix4'),

  AssetManager: require ('./assets'),
  Game: require('./game'),
  Util: require('./util'),

  ThreeD: {
    WireframeRenderer: require ('./3d/render'),
    Geometry: require ('./3d/geometry'),

    Loader: require('./3d/loader'),
    Helpers: require('./3d/helpers'),
    Model: require('./3d/model'),
    Base: require('./3d/base'),

    Curve: require('./3d/curve'),
    CurveFollower: require('./3d/curvefollower'),
  },

  TwoD: {
    SpriteSheet: require ('./2d/spritesheet'),
    AnimatedSprite: require ('./2d/animatedsprite'),
    Tilemap: require ('./2d/tilemap'),
  },

  SceneGraph: {
    SceneObject: require ('./scene/sceneobject'),
    SceneGroup: require ('./scene/scenegroup'),
  },

  Shaders: {
    GlowFilter: require('./shaders/glowfilter')
  },

  Input: require('./input'),

  Sound: new SoundEngine(),

} ;


window.SmokingMirror = smokingmirror ;
