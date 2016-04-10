

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

    var onDataLoaded = function (itemToLoad) {
      return function (data) {
        console.log ('AssetManager: Loaded key ' + itemToLoad.name + ' from ' + itemToLoad.pathToAsset + ' (' + typeof (data) + ')') ;
        if (itemToLoad.pathToAsset.match("\\.json$")) {
          /*
           * Fixup.  Our test webserver is dumb and does not send things with a Content-Type in response headers.
           *
           * So, for JSON it just replies back with a string.  Browsers, however, will turn "application/json" into an object.
           * This just makes sure we're all on the same page.
           */
           if (typeof data !== 'object') {
             data = JSON.parse (data) ;
           }
        }
        cache[itemToLoad.name] = data ;
        loadCount++ ;
        if (updateCallback) {
          updateCallback (loadCount, loaders.length) ;
        }

        if (loadCount >= loaders.length) {
          console.log ('AssetManager: All ' + loaders.length + ' items loaded') ;
          doneCallback () ;
        }
      };
    } ;

    var loadAsyncText = function (source, onFinished) {
      return function () {
        console.log ('AssetManager: Requesting text: ' + source) ;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', source, true);

        xhr.onload = function(e) {
          if (this.status === 200) {
            onFinished (xhr.response) ;
          } else {
            throw new Error ("Unable to load(sound) " + source) ;
            //task.reject() ;
          }
        };

        xhr.onerror = function() {
          throw new Error ("Unable to load(sound) " + source) ;
        } ;

        xhr.send();
      } ;
    } ;


    var loadAsyncImage = function (source, onFinished) {
      return function () {
        console.log ('AssetManager: Requesting image: ' + source) ;
        var image = new Image();
        image.onload = function () {
          onFinished (image) ;
        } ;
        image.onerror = function () {
          throw new Error ("Unable to load(image) " + source) ;
          //task.reject();
        } ;
        image.src = source ;
      } ;
    } ;

    var loadAsyncSound = function (source, onFinished) {
      return function () {
        console.log ('AssetManager: Requesting sound: ' + source) ;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', source, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function(e) {
          if (this.status === 200) {
            console.log ('AssetManager: Decoding ' + source) ;
            var newSound = SmokingMirror.Sound.makeSound (source, function () {
              onFinished (newSound) ;
            }, false, xhr) ;
          } else {
            throw new Error ("Unable to load(sound) " + source) ;
            //task.reject() ;
          }
        };

        xhr.onerror = function() {
          throw new Error ("OnError for load(sound) " + source) ;
        } ;

        xhr.send();
      } ;
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

      if (itemToLoad.pathToAsset.match("\\.(obj|txt|json|tmx)$")) { // text
        loader = loadAsyncText (itemToLoad.pathToAsset, onDataLoaded(itemToLoad)) ;
      } if (itemToLoad.pathToAsset.match("\\.(png|jpg)$")) { // image
        loader = loadAsyncImage (itemToLoad.pathToAsset, onDataLoaded(itemToLoad)) ;
      } if (itemToLoad.pathToAsset.match("\\.(wav|mp3)$")) { // sound
        loader = loadAsyncSound (itemToLoad.pathToAsset, onDataLoaded(itemToLoad)) ;
      }

      loaders.push (loader) ;
    }

    for (var li = 0; li < loaders.length; li++) {
      loaders[li]() ; // trigger our loaders
    }

    if (updateCallback) {
      updateCallback (0, loaders.length) ;
    }

  },

  getAsset: function (path) {
    if (!this.assetCache.hasOwnProperty (path)) {
      throw "Unable to find cache item " + path ;
    }
    return this.assetCache[path] ;
  },

} ;


module.exports = AssetManager ;
