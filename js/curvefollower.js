var math = require('./smokingmirror/math') ;

var CurveFollower = function () {
  this.follower = null ;
  this.curve = null ;
  this.snapToStart = true ;
  this.followerIsChild = true ;
  this.waypointIdx = 0 ;
  this.speed = 0.5 ;
  this.rotSpeed = 1.5 ;
  this.rotLookahead = 4 ;
  this.epsilon = 0.01 ;
  this.rotate = true ;
  this.initialRot = new math.Quaternion() ;
  this.initialRot.setFromAxisAngle (new math.Vector3(0, 1, 0), 90 * math.DTR) ;
  this.initialRot.multiply (new math.Quaternion().setFromAxisAngle (new math.Vector3(0, 0, 1), 90 * math.DTR)) ;

  this.followerUp = new math.Vector3(0, 1, 0) ;

  this.followerRotateOverride = null ;

  this.currRot = new math.Quaternion().copy(this.initialRot) ;
  this.r = 0 ;
};


CurveFollower.prototype = {
  getWaypoint: function(idx, world) {
    var verts = this.curve.generatedVerts ;
    if (verts.length === 0) {
      //throw "Curve not generated yet!" ;
      this.curve.checkPoints() ;
      verts = this.curve.generatedVerts ;
    }

    var point = new math.Vector3 (verts[idx], verts[idx+1], verts[idx+2]);

    if (world !== 'undefined' && world) {
      point.applyMatrix4 (this.curve.getWorldMatrix()) ;
    }

    return point ;
  },

  getAhead: function (currIdx, idx) {
    var next = currIdx + (idx * 3) ;
    if (next >= this.curve.generatedVerts.length) {
      next -= this.curve.generatedVerts.length ;
    }

    return next ;
  },

  startFollow: function () {
    this.waypointIdx = 0 ;
    if (this.snapToStart) {
      this.follower.position.copy (this.getWaypoint(this.waypointIdx, !this.followerIsChild)) ;
      this.follower.update() ;
    }
  },

  selectNextWaypoint: function () {
    this.waypointIdx += 3 ;
    if (this.waypointIdx >= this.curve.generatedVerts.length) {
      this.waypointIdx = 0 ;
    }
    //this.waypoint = this.getWaypoint (this.waypointIdx) ;
  },



  setupFollower: function () {
    if (this.followerIsChild) {
      this.follower.parent = this.curve ;
    }

    this.startFollow() ;
  },

  updateFollower: function(dt) {
    var dir = new math.Vector3() ;
    var target = this.getWaypoint(this.getAhead(this.waypointIdx, 1), !this.followerIsChild) ;
    var fPos = this.follower.position ;
    var oPos = new math.Vector3().copy (this.follower.position) ;

    dir.copy (target) ;
    dir.sub (fPos) ;
    dir.normalize() ;

    fPos.addScaledVector (dir, dt * this.speed) ;

    if (this.rotate) {

      var quat = new math.Quaternion() ;
      var looktarget = this.getWaypoint(this.getAhead(this.waypointIdx, this.rotLookahead), !this.followerIsChild) ;
      var up = new math.Vector3().copy(this.followerUp).applyQuaternion(this.initialRot) ;
      var lookAt = new math.Matrix4().lookAt (looktarget, oPos, up) ;

      quat.setFromRotationMatrix(lookAt) ;
      if (this.followerRotateOverride !== null) {
        quat = this.followerRotateOverride (quat, up, looktarget) ;
      }

      this.currRot.slerp (quat, dt * this.rotSpeed) ;

      this.follower.rotation.setFromQuat (this.currRot) ;
    }

    var epi = this.epsilon + (this.speed * 0.25) ;

    if (fPos.distanceToSquared (target) < epi * epi) {
      this.selectNextWaypoint() ;
    }
  },

  update: function (dt) {
    this.r += dt * 5 ;
    //var wp = this.getWaypoint (this.waypointIdx) ;
    //if (this.model.position.distanceTo (wp) < 0.05) {

    this.updateFollower(dt) ;
  },
} ;


module.exports = CurveFollower ;
