
var ThreeDFollowTesterScene = function (game) {
  this.game = game ;
  this.name = '3DCurveTester' ;
  this.shadersVectrex = require('./shared/shaders_vectrex')(game) ;

  this.r = 0 ;
  this.r2 = 0 ;
  this.r3 = 0 ;

  this.pauseTime = 0 ;

  this.quat = new SmokingMirror.Quaternion() ;

  this.modelGraphics = new PIXI.Graphics() ;
} ;


ThreeDFollowTesterScene.prototype = {
  setup: function () {
    this.shadersVectrex.setup() ;

    this.shadersVectrex.addRenderChild (this.modelGraphics) ;

    this.game.wireframeRender.setCamera(
      new SmokingMirror.Vector3 (0, 0, 100),
      new SmokingMirror.Vector3 (0, 0, 0)
    ) ;

    var modelDef = SmokingMirror.ThreeD.Loader.parseWavefront (this.game.assetManager.getAsset ('models.player')) ;

    this.model = new SmokingMirror.ThreeD.Model(modelDef, this.game.wireframeRender) ;

    this.model.materials.Flame.color = 0xFF4212 ;
    this.model.materials.Flame.alpha = 0.7 ;
    this.model.materials.Base.color = 0xE0FFFC ;
    this.model.materials.Cockpit.color = 0x318fdf ;
    this.model.materials.Detail.color = 0x333333 ;
    this.model.scale = new SmokingMirror.Vector3 (0.1, 0.1, 0.1) ;

    var curve = new SmokingMirror.ThreeD.Curve(this.game.wireframeRender) ;

    curve.setPoints ([
      0, 0, 0,
      1, 0, 0,
      1, 1, 0,
      0, 1, 0,
      0, 1, 1,
    ]) ;

    var scene = this ;

    var CurveSettings = function () {
      this.show = true ;
      this.showPoints = true ;
      this.tension = 0.5 ;
      this.segments = 8 ;
      this.closed = true ;
      this.lobes = 6 ;
      this.circle = 0 ;
      this.zoffset = 1 ;
    } ;

    var FollowerSettings = function () {
      this.snapToStart = true ;
      this.followerIsChild = true ;
      this.speed = 0.5 ;
      this.rotSpeed = 1.5 ;
      this.rotLookahead = 4 ;
      this.rotate = true ;
      this.restart = function() { scene.curvefollower.startFollow() ; };
      this.banking = true ;
    } ;

    var curvesettings = new CurveSettings() ;
    var followersettings = new FollowerSettings() ;
    this.curvesettings = curvesettings ;
    this.followersettings = followersettings ;

    var updateCurve = function() {
      curve.tension = curvesettings.tension ;
      curve.segments = curvesettings.segments ;
      curve.closed = curvesettings.closed ;
      curve.dirtyPoints = true ;
    } ;

    var updateFollower = function() {
      scene.curvefollower.snapToStart = followersettings.snapToStart ;
      scene.curvefollower.followerIsChild = followersettings.followerIsChild ;
      scene.curvefollower.speed = followersettings.speed ;
      scene.curvefollower.rotSpeed = followersettings.rotSpeed ;
      scene.curvefollower.rotLookahead = followersettings.rotLookahead ;
      scene.curvefollower.rotate = followersettings.rotate ;
    } ;

    var followerRotateOverride = function (quat, up) {
      var spinQ = new SmokingMirror.Quaternion () ;
      spinQ.setFromAxisAngle (new SmokingMirror.Vector3(0, 0, 1), scene.r3) ;
      quat.multiply (spinQ) ;
      return quat ;
    } ;


    var folder = this.game.dgui.addFolder ("Curve Params") ;
    folder.add(curvesettings, 'show', false, true).onFinishChange (function(value) {
      updateCurve() ;
    }) ;
    folder.add(curvesettings, 'showPoints', false, true).onFinishChange (function(value) {
      updateCurve() ;
    }) ;
    folder.add(curvesettings, 'tension', -1.0, 1).onFinishChange (function(value) {
      updateCurve() ;
    }) ;
    folder.add(curvesettings, 'segments', 1, 16).step(1).onFinishChange (function(value) {
      updateCurve() ;
    }) ;
    folder.add(curvesettings, 'closed', false, true).onFinishChange (function(value) {
      updateCurve() ;
    }) ;
    folder.add(curvesettings, 'lobes', 3, 16).step(1).onFinishChange (function(value) {
      updateCurve() ;
    }) ;
    folder.add(curvesettings, 'circle', 0, 1).onFinishChange (function(value) {
      updateCurve() ;
    }) ;
    folder.add(curvesettings, 'zoffset', 0, 1).onFinishChange (function(value) {
      updateCurve() ;
    }) ;

    var folderFollower = this.game.dgui.addFolder ("Follower Params") ;
    folderFollower.add (followersettings, 'snapToStart').onFinishChange(function(){
      updateFollower() ;
    }) ;
    folderFollower.add (followersettings, 'followerIsChild', false, true).onFinishChange(function(v){
      if (v) {
        scene.model.parent = scene.curve ;
        scene.model.scale = new SmokingMirror.Vector3 (0.1, 0.1, 0.1) ;
        scene.model.position = new SmokingMirror.Vector3 (0, 0, 0) ;
        scene.model.applyTransforms() ;
      } else {
        scene.model.parent = null ;
        scene.model.scale = new SmokingMirror.Vector3 (1, 1, 1) ;
        scene.model.position = new SmokingMirror.Vector3 (0, 0, 0) ;
        scene.model.applyTransforms() ;
      }
      updateFollower() ;
    }) ;
    folderFollower.add (followersettings, 'speed', 0.1, 15).onFinishChange(function(){
      updateFollower() ;
    }) ;
    folderFollower.add (followersettings, 'rotate', false, true).onFinishChange(function(){
      updateFollower() ;
    }) ;
    folderFollower.add (followersettings, 'rotSpeed', 0.1, 15).onFinishChange(function(){
      updateFollower() ;
    }) ;
    folderFollower.add (followersettings, 'rotLookahead', 1, 10).step(1).onFinishChange(function(){
      updateFollower() ;
    }) ;
    folderFollower.add (followersettings, 'banking', false, true).onFinishChange(function(v){
      scene.curvefollower.followerRotateOverride = v ? followerRotateOverride : null ;
    }) ;

    folderFollower.add (followersettings, 'restart') ;

    this.curve = curve ;

    curve.scale = new SmokingMirror.Vector3 (20, 20, 20) ;

    updateCurve() ;

    this.generateCurve() ;

    this.curvefollower = new SmokingMirror.ThreeD.CurveFollower () ;

    this.curvefollower.follower = this.model ;
    this.curvefollower.curve = this.curve ;
    this.curvefollower.strict = true ;
    this.curvefollower.child = true ;
    this.curvefollower.setupFollower() ;

    this.curvefollower.followerRotateOverride = followerRotateOverride ;

    $("div#scenetext").empty().append (
      "<p>We are rendering cardinal splines using the 3D vector engine, along with a 3D object which is following the spline path.</p>" +
      "<p>Followers can either be children of the spline path (and therefore inherit its transform) or unattached.  Note that " +
      "speed values will different between a child or unparented follower, because the spline is scaled up.</p>" +
      "<p>rotLookahead controls how many far ahead the follower will anticipate changes in direction.</p>"
    ) ;

  },

  generateCurve: function() {
    var pts = [] ;

    var amt = this.curvesettings.lobes ;

    for (var i = 0; i < amt; i++) {
      var a = (360 / amt) * i ;
      var d = i % 2 === 0 ? 1 + (1 * this.curvesettings.circle) : 2 ;
      var x = Math.sin (a * SmokingMirror.Math.DTR) * d ;
      var y = Math.cos (a * SmokingMirror.Math.DTR) * d ;
      //var z = i % 2 === 0  ? Math.cos (this.r3) * 1.2 : -Math.cos (this.r3) * 0.2 ;
      var z = i % 2 === 0  ? this.curvesettings.zoffset / 2 : -this.curvesettings.zoffset / 2 ;
      //var z = 0 ;
      pts.push (x, y, z) ;
    }

    this.curve.setPoints (pts) ;
  },

  destroy: function() {
    this.model = null ;
    this.curve = null ;
    this.curvefollower = null ;

    this.game.dgui.removeFolder ('Curve Params') ;
    this.game.dgui.removeFolder ('Follower Params') ;

    this.shadersVectrex.removeRenderChild (this.modelGraphics) ;

    this.shadersVectrex.destroy() ;

    $("div#scenetext").empty() ;
  },

  resize: function () {
    this.shadersVectrex.resize() ;

    this.game.wireframeRender.setCamera(
      new SmokingMirror.Vector3 (0, 0, 100),
      new SmokingMirror.Vector3 (0, 0, 0)
    ) ;
  },

  update: function(dt) {

    this.r += dt * 30 ;
    this.r2 += dt * 5 ;
    this.r3 += dt * 1 ;

    this.curve.rotation.y = this.r * SmokingMirror.Math.DTR * 0.5 ;

    this.generateCurve() ;
    this.curve.update(dt) ;

    this.curvefollower.update(dt) ;


    this.model.update (dt) ;
  },

  render: function() {
    this.modelGraphics.clear() ;

    if (this.curvesettings.show) {
      this.curve.render(this.modelGraphics) ;
    }

    this.model.render(this.modelGraphics) ;

    if (this.curvesettings.showPoints) {
      var verts = this.curve.generatedVerts ;
      for (var i = 0; i < verts.length; i += 3) {

        // now extract generated points
        var point = new SmokingMirror.Vector3 (verts[i], verts[i+1], verts[i+2]);

        point.applyMatrix4 (this.curve.getWorldMatrix()) ;

        this.modelGraphics.lineStyle (4, 0xFF00FF, 1) ;

        SmokingMirror.ThreeD.Helpers.renderPoint (this.game.wireframeRender, this.modelGraphics, point, 0.1) ;
      }
    }
  }

};

module.exports = ThreeDFollowTesterScene ;
