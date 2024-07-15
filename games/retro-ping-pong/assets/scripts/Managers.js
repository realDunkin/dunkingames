"use strict";

var AssetsManager = function AssetsManager(loader) {
  EventEmitter.call(this);
  this.phase = "normal";
  this.loader = loader;
  this.resources = this.loader.resources;
  this.assetsGroups = [];
  this.assets = [];
};

AssetsManager.prototype = Object.create(EventEmitter.prototype);
AssetsManager.prototype.constructor = AssetsManager;

AssetsManager.prototype.addAssetsGroup = function (assetsGroup) {
  var n = this.assetsGroups.indexOf(assetsGroup);
  if (n != -1) return;
  this.assetsGroups.push(assetsGroup);
};

AssetsManager.prototype.getAssetsGroup = function (name) {
  for (var i = 0; i < this.assetsGroups.length; i++) {
    if (this.assetsGroups[i].name == name) return this.assetsGroups[i];
  }

  return null;
};

AssetsManager.prototype.addAsset = function (key, asset) {
  if (this.assets[key] != undefined && this.assets[key] != null)
    console.log(
      "AssetsManager, Warning: Asset[" +
        key +
        "] already exist, asset will rewrited!"
    );
  this.assets[key] = asset;
};

AssetsManager.prototype.loadAssets = function (assetsList, callback) {
  if (!(!this.loader.loading && this.phase == "normal")) return;

  if (assetsList.length == 0) {
    if (callback) callback();
    return;
  }

  var self = this;
  this.phase = "loading";
  var audioAssets = [];
  var audioAssetsCount = 0;
  var regularAssets = [];
  var regularAssetsCount = 0;
  var isAudioAssetsLoaded = false;
  var isRegularAssetsLoaded = false;
  var progress = -1;
  var regularAssetsProgress = 0;
  var audioAssetsProgress = 0;

  for (var i = 0; i < assetsList.length; i++) {
    var assetInfo = assetsList[i];

    if (
      (assetInfo.type != undefined && assetInfo.type == "AUDIO") ||
      assetInfo.url.indexOf(".mp3") != -1 ||
      assetInfo.url.indexOf(".ogg") != -1 ||
      assetInfo.url.indexOf(".m4a") != -1 ||
      assetInfo.url.indexOf(".wav") != -1
    ) {
      audioAssets.push(assetInfo);
      audioAssetsCount++;
    } else {
      this.loader.add(assetInfo);
      regularAssets.push(assetInfo);
      regularAssetsCount++;
    }
  }

  if (regularAssetsCount == 0) {
    isRegularAssetsLoaded = true;
    regularAssetsProgress = 1.0;
  } else {
    this.loader.load(function () {
      for (var i = 0; i < regularAssets.length; i++) {
        self.addAsset(
          regularAssets[i].name,
          self.loader.resources[regularAssets[i].name]
        );
      }

      self.loader.progress -= 100;
      self.loader.removeListener("progress", onRegularAssetsLoadProgress);
      isRegularAssetsLoaded = true;
      loadingComplete();
    });
    this.loader.addListener("progress", onRegularAssetsLoadProgress);
  }

  if (audioAssetsCount == 0) {
    isAudioAssetsLoaded = true;
    audioAssetsProgress = 1.0;
  } else {
    this.loadAudioAssets(
      audioAssets,
      onAudioAssetsLoadProgress,
      function (audios) {
        for (var i = 0; i < audios.length; i++) {
          self.loader.resources[audios[i].name] = audios[i];
          self.addAsset(audios[i].name, audios[i]);
        }

        isAudioAssetsLoaded = true;
        loadingComplete();
      }
    );
  }

  loadingProgress();
  loadingComplete();

  function loadingComplete() {
    if (
      !(isAudioAssetsLoaded && isRegularAssetsLoaded && self.phase == "loading")
    )
      return;
    self.phase = "normal";
    self.removeAllListeners("loading_progress");
    self.emit("loading_complete", {
      assetsList: assetsList,
    });
    if (callback) callback();
  }

  function onRegularAssetsLoadProgress(loader, resource) {
    var p = loader.progress / 100;
    if (regularAssetsProgress == p) return;
    regularAssetsProgress = p;
    loadingProgress();
  }

  function onAudioAssetsLoadProgress(data) {
    if (audioAssetsProgress == data.progress) return;
    audioAssetsProgress = data.progress;
    loadingProgress();
  }

  function loadingProgress() {
    var p = (regularAssetsProgress * audioAssetsProgress) / 1.0;
    if (p == progress) return;
    progress = p;
    self.emit("loading_progress", {
      progress: progress,
    });
  }
};

AssetsManager.prototype.loadAudioAssets = function (
  audioAssets,
  progressCallback,
  completeCallback
) {
  var assetsLoaded = 0;
  var audios = [];

  for (var i = 0; i < audioAssets.length; i++) {
    var assetInfo = audioAssets[i];
    var src = [];

    for (var j = 0; j < assetInfo.formats.length; j++) {
      src.push(assetInfo.url + assetInfo.formats[j]);
    }

    var audio = new Howl({
      src: src,
      autoplay: assetInfo.autoplay == undefined ? false : assetInfo.autoplay,
      loop: assetInfo.loop == undefined ? false : assetInfo.loop,
      volume: assetInfo.volume == undefined ? 1.0 : assetInfo.volume,
    });
    audio.name = assetInfo.name;
    audio.assetType = "AUDIO";
    audios.push(audio);
    audio.once("load", audioLoaded); // console.log(audio);
  }

  function audioLoaded() {
    assetsLoaded++;
    if (progressCallback)
      progressCallback({
        progress: assetsLoaded / audioAssets.length,
      });
    if (assetsLoaded < audioAssets.length) return;
    if (completeCallback) completeCallback(audios);
  } // console.log(audioAssets)
}; //==========================================================================================================================================//

AssetsManager.prototype.getAsset = function (key) {
  var asset = this.assets[key];

  if (asset == undefined || asset == null) {
    asset = null;
    console.log("AssetsManager, Error: Asset[" + key + "] not found!");
  }

  return asset;
};

AssetsManager.prototype.getTexture = function (name, subName) {
  var texture = null;
  var asset = this.getAsset(name);
  if (asset == null) return null;
  if (subName == undefined) texture = asset.texture;
  else texture = asset.textures[subName];
  if (texture == null)
    console.log(
      "AssetsManager, Error: Texture[" +
        name +
        (subName == undefined ? "" : "|-->|" + subName) +
        "] not found!"
    );
  return texture;
};

AssetsManager.prototype.getSprite = function (name, subName) {
  var texture = this.getTexture(name, subName);
  var sprite = new PIXI.Sprite(texture);
  return sprite;
};

AssetsManager.prototype.getJson = function (name) {
  var asset = this.getAsset(name);
  return asset.data;
};

AssetsManager.prototype.getAllAudios = function () {
  var self = this;
  var audios = Object.keys(this.assets)
    .map(function (key) {
      return self.assets[key];
    })
    .filter(function (asset) {
      return asset.assetType === "AUDIO";
    });
  return audios;
}; //==========================================================================================================================================//

var AssetsGroup = function AssetsGroup(name, assets) {
  EventEmitter.call(this);
  this.name = name;
  this.assets = [];
  this.phase = "waiting";
  this.assetsManager = NORD.assetsManager;
  this.loader = this.assetsManager.loader;
  this.assetsManager.addAssetsGroup(this);

  if (assets != undefined) {
    for (var i = 0; i < assets.length; i++) {
      this.addAsset(assets[i]);
    }
  }
};

AssetsGroup.prototype = Object.create(EventEmitter.prototype);
AssetsGroup.prototype.constructor = AssetsGroup;

AssetsGroup.prototype.addAsset = function (assetInfo) {
  if (!(this.phase == "waiting")) {
    console.log(
      "AssetsGroup, Error: Cant add asset[" +
        assetInfo +
        "], phase is not [waiting]"
    );
    return;
  }

  this.assets.push(assetInfo);
};

AssetsGroup.prototype.load = function (callback) {
  if (!(this.phase == "waiting")) return;

  if (this.loader.loading) {
    console.log("AssetsGroup Error: Cant load assets - loader is busy!");
    return;
  }

  var self = this;
  this.phase = "loading";
  this.emit("loading_start");

  if (this.assets.length == 0) {
    setTimeout(function () {
      self.loadingComplete();
      if (callback) callback();
    }, 200);
    return;
  }

  this.assetsManager.addListener("loading_progress", function (data) {
    self.emit("loading_progress", data);
  });
  this.assetsManager.loadAssets(this.assets, function () {
    self.loadingComplete();
    if (callback) callback();
  }); // console.log(this.loader);
};

AssetsGroup.prototype.loadingComplete = function () {
  if (!(this.phase == "loading")) return;
  this.phase = "loaded";
  this.removeAllListeners("loading_progress");
  this.emit("loading_complete");
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.AudioManager = function () {
  EventEmitter.call(this);
  this.isMute = false;
  this.assetsManager = NORD.assetsManager;
};

NORD.AudioManager.prototype = Object.create(EventEmitter.prototype);
NORD.AudioManager.prototype.constructor = NORD.AudioManager;

NORD.AudioManager.prototype.setMute = function (v) {
  var _this = this;

  if (this.isMute === v) return;
  this.isMute = v;
  var audios = NORD.assetsManager.getAllAudios();
  audios.forEach(function (audio) {
    audio.mute(_this.isMute);
  });
  this.emit("audio_mute_change", {
    isMute: this.isMute,
  });
};

NORD.AudioManager.prototype.switchMute = function () {
  this.setMute(!this.isMute);
};

NORD.AudioManager.prototype.playAudio = function (name) {
  var audio = this.assetsManager.getAsset(name);
  var id = audio.play();
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.DefinitionsManager = function () {
  this.avaiableDomains = [];
  this.assetsGroupBoot = null;
  this.assetsGroupMain = null;
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//
