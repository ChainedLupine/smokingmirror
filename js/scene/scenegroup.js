var SceneGroup = function () {
  this.objects = [] ;
} ;

SceneGroup.prototype.clear = function () {
  this.destroy() ;
} ;

SceneGroup.prototype.destroy = function () {
  for (var i = this.objects.length - 1; i >= 0 ; i--) {
    var o = this.objects[i] ;
    o.destroy() ;
    this.objects.splice (i, 1) ;
  }
} ;


SceneGroup.prototype.add = function (objects) {
  if (!Array.isArray (objects)) {
    objects = [ objects ] ;
  }

  for (var i = 0; i < objects.length; i++) {
    this.objects.push (objects[i]) ;
    objects[i].parent = this ;
  }
} ;

SceneGroup.prototype.remove = function (objects) {
  if (!Array.isArray (objects)) {
    objects = [ objects ] ;
  }

  for (var i = this.objects.length - 1; i >= 0 ; i--) {
    var idx = this.objects.indexOf (objects[i]) ;
    this.objects[idx].parent = null ;
    this.objects.splice (idx, 1) ;
  }

} ;

SceneGroup.prototype.update = function (dt) {
  for (var i = 0; i < this.objects.length; i++) {
    this.objects[i].update (dt) ;
  }
} ;

SceneGroup.prototype.render = function () {
  for (var i = 0; i < this.objects.length; i++) {
    this.objects[i].render() ;
  }

} ;

module.exports = SceneGroup ;
