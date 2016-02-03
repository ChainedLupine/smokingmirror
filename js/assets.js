var AssetManager = function() {
  this.assetCache = {} ;

} ;



AssetManager.prototype = {
  loadAssets: function (assets, callback) {

    var toLoad = [] ;

    var enumAssets = function (obj, path) {
      for (var i in obj) {
        if (typeof (obj[i]) === 'object') {
          enumAssets (obj[i], i + '.') ;
        } else {
          toLoad.push ({ name: path + i, pathToAsset: obj[i]}) ;
        }
      }

    } ;

    enumAssets (assets, '') ;

    //console.log (JSON.stringify (toLoad, 2, 2)) ;

    var loaders = [] ;

    var cache = this.assetCache ;

    var loadProcessor = function (itemToLoad) {
      return function (data) {
        console.log ('AssetManager: Loaded key ' + itemToLoad.name ) ;
        cache[itemToLoad.name] = data ;
      };
    } ;

    var loadAsyncImage = function (source) {
      return $.Deferred (function (task) {
        var image = new Image();
        image.onload = function () { task.resolve(image); } ;
        image.onerror = function () { task.reject(); } ;
        image.src = source ;
      }).promise();
    } ;

    var count = toLoad.length ;

    while (toLoad.length > 0) {
      var itemToLoad = toLoad.shift() ;
      var loader ;

      if (itemToLoad.pathToAsset.match("\\.(obj|txt|json)$")) { // text
        loader = $.get (itemToLoad.pathToAsset, loadProcessor(itemToLoad)) ;
      } if (itemToLoad.pathToAsset.match("\\.(png|jpg)$")) { // image
        loader = loadAsyncImage (itemToLoad.pathToAsset).done(loadProcessor(itemToLoad)) ;
      }

      loaders.push (loader) ;
    }

    $.when.apply ($, loaders).then (function() {
      console.log ('AssetLoader: All ' + count + ' items loaded') ;
      callback() ;
    }) ;

  },

  getAsset: function (path) {
    if (!this.assetCache.hasOwnProperty (path)) {
      throw "Unable to find cache item " + path ;
    }
    return this.assetCache[path] ;
  },

} ;


module.exports = AssetManager ;
