/* globals dat */

// monkeypatch for dat.gui to add removeFolder
if (typeof dat !== "undefined" && typeof dat.GUI !== "undefined") {
  dat.GUI.prototype.removeFolder = function(name) {
    var folder = this.__folders[name];
    if (!folder) {
      return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
  } ;
}

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

  Shaders: {
    GlowFilter: require('./shaders/glowfilter')
  },

  Input: require('./input'),

} ;


window.SmokingMirror = smokingmirror ;
