// concat this to the misc functions
var math = module.exports = Object.assign (require('./misc'), {

  Vector3: require ('./vector3'),
  Matrix4: require ('./matrix4'),
  Quaternion: require ('./quat'),
});
