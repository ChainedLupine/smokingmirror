

var AssetManager = function() {
  this.assetCache = {} ;

} ;



AssetManager.prototype = {
  loadAssets: function (assets, doneCallback, updateCallback) {

    var toLoad = [] ;

    var enumAssets = function (obj, path) {
      for (var i in obj) {
        if (typeof (obj[i]) === 'object') {
          enumAssets (obj[i], (path.length > 0 ? path : "") + i + '.') ;
        } else {
          toLoad.push ({ name: path + i, pathToAsset: obj[i]}) ;
        }
      }

    } ;

    enumAssets (assets, '') ;

    //console.log (JSON.stringify (toLoad, 2, 2)) ;

    var loaders = [] ;

    var cache = this.assetCache ;
    var loadCount = 0 ;

    var loadProcessor = function (itemToLoad) {
      return function (data) {
        console.log ('AssetManager: Loaded key ' + itemToLoad.name ) ;
        cache[itemToLoad.name] = data ;
        loadCount++ ;
        if (updateCallback) {
          updateCallback (loadCount, loaders.length) ;
        }
      };
    } ;

    var loadAsyncImage = function (source) {
      return $.Deferred (function (task) {
        console.log ('AssetManager: Loading image ' + source) ;
        var image = new Image();
        image.onload = function () { task.resolve(image); } ;
        image.onerror = function () {
          throw new Error ("Unable to load(image) " + source) ;
          //task.reject();
        } ;
        image.src = source ;
      }).promise();
    } ;

    var loadAsyncSound = function (source) {
      return $.Deferred (function (task) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', source, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function(e) {
          if (this.status === 200) {
            console.log ('AssetManager: Decoding ' + source) ;
            var newSound = SmokingMirror.Sound.SoundManager.engine.makeSound (source, function () {
              task.resolve (newSound) ;
            }, false, xhr) ;
          } else {
            throw new Error ("Unable to load(sound) " + source) ;
            //task.reject() ;
          }
        };

        xhr.onerror = function() { task.reject() ; } ;

        xhr.send();
      }).promise();
    } ;

    var count = toLoad.length ;

    var makeErrorHandler = function (path) {
      return function () {
        throw new Error ("Unable to load(get) " + path) ;
      } ;
    } ;

    while (toLoad.length > 0) {
      var itemToLoad = toLoad.shift() ;
      var loader ;

      if (itemToLoad.pathToAsset.match("\\.(obj|txt|json)$")) { // text
        loader = $.get (itemToLoad.pathToAsset, loadProcessor(itemToLoad)).fail (makeErrorHandler(itemToLoad.pathToAsset)) ;
      } if (itemToLoad.pathToAsset.match("\\.(png|jpg)$")) { // image
        loader = loadAsyncImage (itemToLoad.pathToAsset).done(loadProcessor(itemToLoad)) ;
      } if (itemToLoad.pathToAsset.match("\\.(wav|mp3)$")) { // sound
        loader = loadAsyncSound (itemToLoad.pathToAsset).done(loadProcessor(itemToLoad)) ;
      }

      loaders.push (loader) ;
    }

    if (updateCallback) {
      updateCallback (0, loaders.length) ;
    }

    $.when.apply ($, loaders).then (function() {
      console.log ('AssetLoader: All ' + count + ' items loaded') ;
      doneCallback() ;
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
