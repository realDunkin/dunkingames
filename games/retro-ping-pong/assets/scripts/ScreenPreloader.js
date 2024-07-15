"use strict";

NORD.ScreenPreloader = function (config) {
  config.sizeType = "relative";
  config.widthRelative = 1;
  config.heightRelative = 1;
  NORD.GUI.BasePanel.call(this, config);
  var self = this; // this.state = 'hide';
  // this.visible = false;
  // this.interactiveChildren = false;

  this.loadingCompleteCallback = null;
  this.bar = new PIXI.Sprite(NORD.assetsManager.getTexture("preloader_bar"));
  this.addChild(this.bar);
  this.bar.anchor.set(0.0, 0.5);
  this.bar.width = 0;
  this.bar.x = -250; // this.barBorder = new PIXI.Sprite(NORD.assetsManager.getTexture('preloader_bar_border'));
  // this.addChild(this.barBorder);
  // this.barBorder.anchor.set(0.5, 0.5);
  // this.alpha = 0;
};

NORD.ScreenPreloader.prototype = Object.create(NORD.GUI.BasePanel.prototype);
NORD.ScreenPreloader.prototype.constructor = NORD.ScreenPreloader;

NORD.ScreenPreloader.prototype.load = function (callback) {
  this.loadingCompleteCallback = callback;
  NORD.definitionsManager.assetsGroupMain.once(
    "loading_complete",
    this.onLoadingComplete,
    this
  );
  NORD.definitionsManager.assetsGroupMain.on(
    "loading_progress",
    this.onLoadingProgress,
    this
  );
  NORD.definitionsManager.assetsGroupMain.load();
};

NORD.ScreenPreloader.prototype.onLoadingComplete = function () {
  var self = this;
  if (this.loadingCompleteCallback != null) this.loadingCompleteCallback();
};

NORD.ScreenPreloader.prototype.onLoadingProgress = function (data) {
  this.bar.width = 500 * data.progress;
};

NORD.ScreenPreloader.prototype.tween = function (data, callback) {
  var self = this;

  if (data.name == "show_anim" && this.state == "hide") {
    this.state = "show_anim";
    this.visible = true;
    var time = 8 / 30;
    TweenMax.to(this, time, {
      alpha: 1,
      x: 0,
      y: 0,
      ease: Power2.easeOut,
      onComplete: function onComplete() {
        self.tween(
          {
            name: "show",
          },
          callback
        );
      },
    });
  }

  if (data.name == "hide_anim" && this.state == "show") {
    this.state = "hide_anim";
    this.interactiveChildren = false;
    var time = 8 / 30;
    TweenMax.to(this, time, {
      alpha: 0,
      x: 0,
      y: 0,
      ease: Power2.easeOut,
      onComplete: function onComplete() {
        self.tween(
          {
            name: "hide",
          },
          callback
        );
      },
    });
  }

  if (data.name == "show" && this.state != "show") {
    this.state = "show";
    this.visible = true;
    this.interactiveChildren = true;
    if (callback) callback();
  }

  if (data.name == "hide" && this.state != "hide") {
    this.state = "hide";
    this.visible = false;
    this.interactiveChildren = false;
    if (callback) callback();
  }
};
