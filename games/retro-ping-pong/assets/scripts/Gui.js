"use strict";

NORD.GUI = function () {};

NORD.GUI.GUIManager = function () {
  EventEmitter.call(this);
  this.rootContainer = new PIXI.Container();
  this.stage = new NORD.GUI.Stage({});
  this.rootContainer.addChild(this.stage);
  this.initViewOver();
  this.orientation = "none";
  this.appWidthMin = 540;
  this.appWidthMax = 720;
  this.appHeightMin = 960;
  this.appHeightMax = 1200;
  this.appWidth = 0;
  this.appHeight = 0;
  this.realAppWidth = 0;
  this.realAppHeight = 0;
  this.screenWidth = 0;
  this.screenHeight = 0;
  this.realScreenWidth = 0;
  this.realScreenHeight = 0;
  this.autoresize(); // NORD.app.addForUpdate(this.update, this);

  NORD.app.on("update", this.update, this);
  this.containerBack = new PIXI.Container();
  this.stage.addChild(this.containerBack);
  this.containerCenter = new PIXI.Container();
  this.stage.addChild(this.containerCenter);
  this.containerOver = new PIXI.Container();
  this.stage.addChild(this.containerOver);
};

NORD.GUI.GUIManager.prototype = Object.create(EventEmitter.prototype);
NORD.GUI.GUIManager.prototype.constructor = NORD.GUI.GUIManager;

NORD.GUI.GUIManager.prototype.initViewOver = function () {
  var self = this;
  var color = 0xffffff;
  this.containerViewOver = new PIXI.Container();
  this.rootContainer.addChild(this.containerViewOver);
  this.overTop = createOver();
  this.overBot = createOver();
  this.overLeft = createOver();
  this.overRight = createOver();

  function createOver() {
    var graphics = new PIXI.Graphics();
    graphics.beginFill(color);
    graphics.drawRect(-5, -5, 10, 10);
    graphics.endFill();
    self.containerViewOver.addChild(graphics);
    return graphics;
  }
};

NORD.GUI.GUIManager.prototype.update = function () {
  var w = window.innerWidth;
  var h = window.innerHeight;
  if (this.realScreenWidth != w || this.realScreenHeight != h)
    this.resize(w, h);
};

NORD.GUI.GUIManager.prototype.setAppSize = function (
  appWidthMin,
  appWidthMax,
  appHeightMin,
  appHeightMax
) {
  this.appWidthMin = appWidthMin;
  this.appWidthMax = appWidthMax;
  this.appHeightMin = appHeightMin;
  this.appHeightMax = appHeightMax;
  this.autoresize();
};

NORD.GUI.GUIManager.prototype.autoresize = function () {
  this.resize(window.innerWidth, window.innerHeight);
};

NORD.GUI.GUIManager.prototype.resize = function (w, h) {
  this.realScreenWidth = w;
  this.realScreenHeight = h;
  this.rootContainer.x = this.realScreenWidth / 2;
  this.rootContainer.y = this.realScreenHeight / 2;
  var wK = this.appWidthMin / this.realScreenWidth;
  var hK = this.appHeightMin / this.realScreenHeight;

  if (wK >= hK) {
    this.appWidth = this.appWidthMin;
    this.appHeight = wK * this.realScreenHeight;
  } else {
    this.appWidth = hK * this.realScreenWidth;
    this.appHeight = this.appHeightMin;
  }

  this.appScale = this.realScreenHeight / this.appHeight;
  this.screenWidth = this.appWidth;
  this.screenHeight = this.appHeight;
  if (this.appWidth > this.appWidthMax) this.appWidth = this.appWidthMax;
  if (this.appHeight > this.appHeightMax) this.appHeight = this.appHeightMax; // var shiftX = (window.innerWidth - Math.ceil(gameWidth * ratio)) / 2;
  // var shiftY = (window.innerHeight - Math.ceil(gameHeight * ratio)) / 2;
  // NORD.renderer.view.style.left = shiftX+"px";
  // NORD.renderer.view.style.top = shiftY+"px";
  // NORD.renderer.view.style.width = this.realScreenWidth + "px";
  // NORD.renderer.view.style.height = this.realScreenHeight + "px";

  NORD.renderer.resize(this.realScreenWidth, this.realScreenHeight);
  this.stage.width = this.appWidth;
  this.stage.height = this.appHeight;
  this.stage.scale.x = this.stage.scale.y = this.appScale;
  this.realAppWidth = this.appWidth * this.appScale;
  this.realAppHeight = this.appHeight * this.appScale;
  this.updateVewOver();
  this.emit("app_resize", {
    realScreenWidth: this.realScreenWidth,
    realScreenHeight: this.realScreenHeight,
    screenWidth: this.screenWidth,
    screenHeight: this.screenHeight,
    realAppWidth: this.realAppWidth,
    realAppHeight: this.realAppHeight,
    appWidth: this.appWidth,
    appHeight: this.appHeight,
    appScale: this.appScale,
  });
  if (this.realScreenWidth > this.realScreenHeight)
    this.setOrientation("landscape");
  else this.setOrientation("portrait");
};

NORD.GUI.GUIManager.prototype.updateVewOver = function () {
  this.overTop.width = 6000;
  this.overTop.height = 6000;
  this.overTop.y = -this.realAppHeight / 2 - 3000;
  this.overBot.width = 6000;
  this.overBot.height = 6000;
  this.overBot.y = this.realAppHeight / 2 + 3000;
  this.overLeft.width = 6000;
  this.overLeft.height = 6000;
  this.overLeft.x = -this.realAppWidth / 2 - 3000;
  this.overRight.width = 6000;
  this.overRight.height = 6000;
  this.overRight.x = this.realAppWidth / 2 + 3000;
};

NORD.GUI.GUIManager.prototype.setOrientation = function (orientation) {
  if (this.orientation == orientation) return;
  this.orientation = orientation; // console.log('OrientationChange:', this.orientation);

  this.emit("orientation_change", {
    orientation: this.orientation,
  });
}; // ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //

NORD.GUI.BasePanel = function (data) {
  PIXI.Container.call(this);
  var self = this;
  this.parentPanel = null;
  this.container = null;
  this.childPanels = []; // this._enable = true;

  this.interactiveChildren = true;
  this.state = "show";
  this.userData = {};
  this._x = 0;
  this._y = 0;
  this._width = 0;
  this._height = 0;
  this._widthRelative = 0;
  this._heightRelative = 0;
  this._xRelative = 0;
  this._yRelative = 0;
  this._positionType = "absolute";
  if (data == undefined) data = {};
  if (data.panelType == undefined) data.panelType = "normal";
  if (data.positionType == undefined) data.positionType = "absolute";
  if (data.x == undefined) data.x = 0;
  if (data.y == undefined) data.y = 0;
  if (data.xRelative == undefined) data.xRelative = 0;
  if (data.yRelative == undefined) data.yRelative = 0;
  if (data.sizeType == undefined) data.sizeType = "absolute";
  if (data.width == undefined) data.width = 100;
  if (data.height == undefined) data.height = 100;
  if (data.widthRelative == undefined) data.widthRelative = 0.5;
  if (data.heightRelative == undefined) data.heightRelative = 0.5;
  if (data.parentPanel == undefined) data.parentPanel = null;
  if (data.container == undefined) data.container = null;
  if (data.name == undefined) data.name = "none";
  if (data.color == undefined) data.color = null;
  if (data.viewRect == undefined) data.viewRect = false;
  Object.defineProperty(this, "positionType", {
    set: function set(value) {
      self.updatePositionType(value);
    },
    get: function get() {
      return this._positionType;
    },
  });
  Object.defineProperty(this, "x", {
    set: function set(value) {
      self._x = value;
      self.updatePosition();
    },
    get: function get() {
      return this._x;
    },
  });
  Object.defineProperty(this, "y", {
    set: function set(value) {
      self._y = value;
      self.updatePosition();
    },
    get: function get() {
      return this._y;
    },
  });
  Object.defineProperty(this, "xRelative", {
    set: function set(value) {
      self._xRelative = value;
      self.updatePosition();
    },
    get: function get() {
      return this._xRelative;
    },
  });
  Object.defineProperty(this, "yRelative", {
    set: function set(value) {
      self._yRelative = value;
      self.updatePosition();
    },
    get: function get() {
      return this._yRelative;
    },
  });
  Object.defineProperty(this, "width", {
    set: function set(value) {
      self._width = value;
      self.updateSize();
    },
    get: function get() {
      return this._width;
    },
  });
  Object.defineProperty(this, "height", {
    set: function set(value) {
      self._height = value;
      self.updateSize();
    },
    get: function get() {
      return this._height;
    },
  });
  Object.defineProperty(this, "widthRelative", {
    set: function set(value) {
      self._widthRelative = value;
      if (self.sizeType == "relative" || self.sizeType == "relative-width")
        self.updateSize();
    },
    get: function get() {
      return this._widthRelative;
    },
  });
  Object.defineProperty(this, "heightRelative", {
    set: function set(value) {
      self._heightRelative = value;
      if (self.sizeType == "relative" || self.sizeType == "relative-height")
        self.updateSize();
    },
    get: function get() {
      return this._heightRelative;
    },
  });
  this.panelType = data.panelType;
  this.align = data.align;
  this.container = data.container;
  this.sizeType = data.sizeType;
  this.width = data.width;
  this.height = data.height;
  this.widthRelative = data.widthRelative;
  this.heightRelative = data.heightRelative;
  this._positionType = data.positionType;
  this.x = data.x;
  this.y = data.y;
  this.xRelative = data.xRelative;
  this.yRelative = data.yRelative; // this.updateSize();
  // this.updatePosition();
  // console.log('Panel create:', data);

  this.addListener("added", function () {
    self.updateSize();
    self.updatePosition();
  });
  if (data.parentPanel != null) data.parentPanel.addPanel(this); // else console.log('ParentPanel not set!');

  this.isViewRect = data.viewRect;
  this.viewRect = null;
  this.viewRectColor = 0x000000;
  if (this.isViewRect) this.showViewRect(data.color);
};

NORD.GUI.BasePanel.prototype = Object.create(PIXI.Container.prototype);
NORD.GUI.BasePanel.prototype.constructor = NORD.GUI.BasePanel;

NORD.GUI.BasePanel.prototype.showViewRect = function (color) {
  this.isViewRect = true;
  this.viewRectColor = color;
  this.updateViewRect();
};

NORD.GUI.BasePanel.prototype.updateViewRect = function () {
  if (!this.isViewRect) return;

  if (this.viewRect != null) {
    this.removeChild(this.viewRect);
    this.viewRect.destroy();
    this.viewRect = null;
  }

  this.viewRect = new PIXI.Graphics();
  this.viewRect.beginFill(this.viewRectColor);
  this.viewRect.drawRect(
    -this.width / 2,
    -this.height / 2,
    this.width,
    this.height
  );
  this.viewRect.endFill();
  this.addChildAt(this.viewRect, 0);
};

NORD.GUI.BasePanel.prototype.updatePositionType = function (type) {
  if (this._positionType == type) return;

  if (
    this._positionType == "absolute" ||
    this.positionType == "center-center"
  ) {
    var x = 0;
    var y = 0;
    if (type == "center-top")
      y = -this.parentPanel.height / 2 + this.height / 2;
    else if (type == "center-bot")
      y = this.parentPanel.height / 2 - this.height / 2;
    else if (type == "left-center")
      x = -this.parentPanel.width / 2 + this.width / 2;
    else if (type == "right-center")
      x = this.parentPanel.width / 2 - this.width / 2;
    else if (type == "right-top") {
      x = this.parentPanel.width / 2 - this.width / 2;
      y = -this.parentPanel.height / 2 + this.height / 2;
    } else if (type == "right-bot") {
      x = this.parentPanel.width / 2 - this.width / 2;
      y = this.parentPanel.height / 2 - this.height / 2;
    } else if (type == "left-top") {
      x = -this.parentPanel.width / 2 + this.width / 2;
      y = -this.parentPanel.height / 2 + this.height / 2;
    } else if (type == "left-bot") {
      x = -this.parentPanel.width / 2 + this.width / 2;
      y = this.parentPanel.height / 2 - this.height / 2;
    }
    this._xRelative = this._x - x;
    this._yRelative = this._y - y;
  }

  this._positionType = type;
  this.updatePosition();
};

NORD.GUI.BasePanel.prototype.updatePosition = function () {
  if (!this.parent) return;
  var x = 0;
  var y = 0;

  if (this.positionType == "absolute" || this.positionType == "center-center") {
    x = this._x;
    y = this._y;
  } else if (this.parentPanel != null) {
    if (this.positionType == "center-top")
      y = -this.parentPanel.height / 2 + this.height / 2;
    else if (this.positionType == "center-bot")
      y = this.parentPanel.height / 2 - this.height / 2;
    else if (this.positionType == "left-center")
      x = -this.parentPanel.width / 2 + this.width / 2;
    else if (this.positionType == "right-center")
      x = this.parentPanel.width / 2 - this.width / 2;
    else if (this.positionType == "right-top") {
      x = this.parentPanel.width / 2 - this.width / 2;
      y = -this.parentPanel.height / 2 + this.height / 2;
    } else if (this.positionType == "right-bot") {
      x = this.parentPanel.width / 2 - this.width / 2;
      y = this.parentPanel.height / 2 - this.height / 2;
    } else if (this.positionType == "left-top") {
      x = -this.parentPanel.width / 2 + this.width / 2;
      y = -this.parentPanel.height / 2 + this.height / 2;
    } else if (this.positionType == "left-bot") {
      x = -this.parentPanel.width / 2 + this.width / 2;
      y = this.parentPanel.height / 2 - this.height / 2;
    }
    x += this._xRelative;
    y += this._yRelative;
  }

  this._x = x;
  this._y = y;
  this.transform.position.x = x;
  this.transform.position.y = y;
};

NORD.GUI.BasePanel.prototype.initBlockInputBg = function (
  width,
  height,
  onClick
) {
  this.invisibleBg = new PIXI.Sprite(
    NORD.assetsManager.getTexture("texture_atlas", "Util/rect_white.png")
  );
  this.addChildAt(this.invisibleBg, 0);
  this.invisibleBg.width = width;
  this.invisibleBg.height = height;
  this.invisibleBg.anchor.set(0.5, 0.5);
  this.invisibleBg.alpha = 0;
  this.invisibleBg.interactive = true;
  this.invisibleBg.on("click", onClick, this);
  this.invisibleBg.on("tap", onClick, this);
};

NORD.GUI.BasePanel.prototype.updateSize = function () {
  if (!this.parent) return;
  var width = this.width;
  var height = this.height;

  if (this.parentPanel != null) {
    if (this.sizeType == "relative-height")
      height = this.parentPanel.height * this.heightRelative;
    else if (this.sizeType == "relative-width")
      width = this.parentPanel.width * this.widthRelative;
    else if (this.sizeType == "relative") {
      height = this.parentPanel.height * this.heightRelative;
      width = this.parentPanel.width * this.widthRelative;
    }
  }

  this._width = width;
  this._height = height;
  if (this.isViewRect) this.updateViewRect();
  this.updatePosition();

  for (var i = 0; i < this.childPanels.length; i++) {
    var childPanel = this.childPanels[i];
    if (childPanel.visible) childPanel.updateSize();
    else childPanel.updateSize();
  }
};

NORD.GUI.BasePanel.prototype.addPanel = function (panel) {
  var n = this.childPanels.indexOf(panel);

  if (n == -1) {
    this.childPanels.push(panel);
    panel.parentPanel = this;
    var container = panel.container;
    if (container == null) container = this;
    container.addChild(panel);
  }
};

NORD.GUI.BasePanel.prototype.tween = function (name, callback) {
  // if(callback == undefined) callback = null;
}; // ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //

NORD.GUI.Stage = function (config) {
  config.sizeType = "absolute";
  config.width = 100;
  config.height = 100;
  config.name = "stage";
  config.parentPanel = null;
  NORD.GUI.BasePanel.call(this, config);
  var self = this;
};

NORD.GUI.Stage.prototype = Object.create(NORD.GUI.BasePanel.prototype);
NORD.GUI.Stage.prototype.constructor = NORD.GUI.Stage; // ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //

NORD.GUI.Button = function (config) {
  if (!config.regularSkin && config.regularSkinData)
    config.regularSkin = Util.createSprite(config.regularSkinData);
  config.width = config.width || config.regularSkin.width || 100;
  config.height = config.height || config.regularSkin.height || 100;
  NORD.GUI.BasePanel.call(this, config);
  var self = this;
  this.phase = "regular";
  this.interactive = true;
  this.buttonMode = true;
  this.on("click", this.onClickListener, this);
  this.on("tap", this.onClickListener, this);
  this.on("mouseover", this.onMouseOverListener, this);
  this.on("mouseout", this.onMouseOutListener, this);
  this.regularSkin = null;
  this.hoverSkin = null;
  this.tweenClick = config.tweenClick || NORD.GUI.Button.tweenClickSimple;
  this.soundClick = config.soundClick || null;

  if (config.regularSkin != undefined) {
    this.regularSkin = config.regularSkin;
    this.addChild(this.regularSkin);
  }

  if (config.hoverSkin != undefined) {
    this.hoverSkin = config.hoverSkin;
    this.addChild(this.hoverSkin);
    this.hoverSkin.visible = false;
  }
};

NORD.GUI.Button.prototype = Object.create(NORD.GUI.BasePanel.prototype);
NORD.GUI.Button.prototype.constructor = NORD.GUI.Button;

NORD.GUI.Button.prototype.onClickListener = function (event) {
  if (!(this.phase == "regular")) return;
  var self = this;
  this.phase = "clicking";

  if (this.tweenClick == null) {
    TweenMax.delayedCall(0.2, function () {
      self.phase = "regular";
    });
    if (this.soundClick != null) this.soundClick.play();
    this.emit("button_click", {
      button: this,
    });
  } else {
    this.tweenClick({
      target: this,
      completeCallback: function completeCallback() {
        self.phase = "regular";
      },
    });
    if (this.soundClick != null) this.soundClick.play();
    this.emit("button_click", {
      button: this,
    });
  }
};

NORD.GUI.Button.prototype.onMouseOverListener = function (event) {};

NORD.GUI.Button.prototype.onMouseOutListener = function (event) {};

NORD.GUI.Button.tweenClickSimple = function (data) {
  // if(!data.time) {
  //   if(data.completeCallback != undefined) data.completeCallback();
  //   return;
  // }
  var scale = data.scale != undefined ? data.scale : 0.9;
  var scaleNormal = data.scaleNormal || 1.0;
  var time = data.time != undefined ? data.time : 0.1;
  TweenMax.to(data.target.scale, time, {
    x: scale,
    y: scale,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      TweenMax.to(data.target.scale, time, {
        x: scaleNormal,
        y: scaleNormal,
        ease: Power2.easeOut,
        onComplete: function onComplete() {
          if (data.completeCallback != undefined) data.completeCallback();
        },
      });
    },
  });
}; // ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //

NORD.GUI.TextBmp = function (text, style) {
  PIXI.BitmapText.call(this, text, style);
};

NORD.GUI.TextBmp.prototype = Object.create(PIXI.BitmapText.prototype);
NORD.GUI.TextBmp.prototype.constructor = NORD.GUI.TextBmp; // ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //

NORD.GUI.ButtonAudio = function (config) {
  NORD.GUI.Button.call(this, config);
  this.state = "off"; // var buttonOverBg = new PIXI.Sprite(assetsManager.getTexture('texture_atlas', 'button_regular_over_bg.png'));
  // this.addChildAt(buttonOverBg, 0);
  // buttonOverBg.anchor.set(0.5, 0.5);
  // buttonOverBg.alpha = 0;
  // this.on('mouse_over', function(e)
  // {
  //   buttonOverBg.alpha = 1;
  // }, this);
  // this.on('mouse_out', function(e)
  // {
  //   buttonOverBg.alpha = 0;
  // }, this);
  // this.mouseOverBg = buttonOverBg;
  // this.textureOn = NORD.assetsManager.getTexture(config.skin.on.atlas, config.skin.on.texture);

  this.textureOn = NORD.assetsManager.getTexture(
    config.skin.on.atlas,
    config.skin.on.texture
  );
  this.textureOff = NORD.assetsManager.getTexture(
    config.skin.off.atlas,
    config.skin.off.texture
  );
  this.regularSkin = new PIXI.Sprite(this.textureOff);
  this.addChild(this.regularSkin);
  this.regularSkin.anchor.set(0.5, 0.5);
  this.regularSkin.scale.x = this.regularSkin.scale.y = 0.5;
  this.on("button_click", this.onClick, this);
  NORD.audioManager.on(
    "audio_mute_change",
    function (data) {
      this.setState(data.isMute);
    },
    this
  );
  this.setState(NORD.audioManager.isMute);
};

NORD.GUI.ButtonAudio.prototype = Object.create(NORD.GUI.Button.prototype);
NORD.GUI.ButtonAudio.prototype.constructor = NORD.GUI.ButtonAudio;

NORD.GUI.ButtonAudio.prototype.setState = function (v) {
  if (this.state == v) return;
  this.state = v;
  this.regularSkin.texture = !v ? this.textureOn : this.textureOff; // app.setAudioState(this.state);
}; // NORD.GUI.ButtonAudio.prototype.switchState = function()
// {
//   var state = (this.state == 'off')?'on':'off';
//   this.setState(state);
// }

NORD.GUI.ButtonAudio.prototype.onClick = function (e) {
  NORD.audioManager.switchMute();
}; // ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //

NORD.Controls = function () {};

NORD.Controls.NumberStepper = function (config) {
  PIXI.Container.call(this);
  if (!config) config = {};
  this.min = config.min || 0;
  this.max = config.max || 1;
  this.step = config.step || (this.max - this.min) / 100;
  Object.defineProperty(this, "value", {
    set: function set(value) {
      if (value > this.max) value = this.max;
      else if (value < this.min) value = this.min;
      if (this.state.getState().value === value) return;
      var progress = (value - this.min) / (this.max - this.min);
      this.state.setState({
        value: value,
        progress: progress,
      });
    },
    get: function get() {
      return this.state.getState().value;
    },
  });
  Object.defineProperty(this, "progress", {
    set: function set(progress) {
      if (progress > 1.0) progress = 1.0;
      else if (progress < 0) progress = 0;
      if (this.state.getState().progress === progress) return;
      var value = this.min + (this.max - this.min) * progress;
      this.state.setState({
        value: value,
        progress: progress,
      });
    },
    get: function get() {
      return this.state.getState().progress;
    },
  }); // this.spriteBg = Util.createSprite({ atlas: 'texture_atlas', texture: 'Controls/Slider/bg.png', parent: this, aX: 0.5, aY: 0.5 });

  this.textValue = new PIXI.Text("xxx", {
    fontFamily: "Arial",
    fontSize: 14,
    fill: 0xffffff,
    align: "center",
  });
  this.textValue.anchor = {
    x: 0.5,
    y: 0.5,
  };
  this.addChild(this.textValue); // text.interactive = false;

  this.buttonPlus = Util.createButton(
    "btn",
    config.panel,
    this,
    "",
    38,
    0,
    16,
    16,
    NORD.game.tweenClickSimple,
    NORD.game.soundClickSimple(),
    {
      atlas: "texture_atlas",
      texture: "button_stepper_plus.png",
      aX: 0.5,
      aY: 0.5,
    }
  );
  this.buttonPlus.addListener(
    "button_click",
    function (data) {
      this.value += this.step;
    },
    this
  );
  this.buttonMinus = Util.createButton(
    "btn",
    config.panel,
    this,
    "",
    -38,
    0,
    16,
    16,
    NORD.game.tweenClickSimple,
    NORD.game.soundClickSimple(),
    {
      atlas: "texture_atlas",
      texture: "button_stepper_minus.png",
      aX: 0.5,
      aY: 0.5,
    }
  );
  this.buttonMinus.addListener(
    "button_click",
    function (data) {
      this.value -= this.step;
    },
    this
  );
  this.state = new Util.StateStore();
  this.state.on("state_change", this.onStateChange, this);
  this.state.setState({
    phase: "wait",
  });
  this.state.setState({
    value: 0.0,
  });
  this.state.setState({
    progress: 0.0,
  });
};

NORD.Controls.NumberStepper.prototype = Object.create(PIXI.Container.prototype);
NORD.Controls.NumberStepper.prototype.constructor = NORD.Controls.NumberStepper;

NORD.Controls.NumberStepper.prototype.onStateChange = function (data) {
  var number = Math.round(data.state.value * 100) / 100;
  this.textValue.text = number;
}; // ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //

NORD.Controls.Slider = function (config, sliderConfig) {
  NORD.GUI.BasePanel.call(this, config);
  this.orientation = sliderConfig.orientation;
  this.sliderLength = sliderConfig.sliderLength;
  this.min = sliderConfig.min || 0;
  this.max = sliderConfig.max || 1;
  this.intOnly = sliderConfig.intOnly || false;
  Object.defineProperty(this, "value", {
    set: function set(value) {
      if (this.intOnly) value = Math.round(value);
      if (this.state.getState().value === value) return;
      var progress = (value - this.min) / (this.max - this.min);
      this.state.setState({
        value: value,
        progress: progress,
      });
    },
    get: function get() {
      return this.state.getState().value;
    },
  });
  Object.defineProperty(this, "progress", {
    set: function set(progress) {
      if (this.state.getState().progress === progress) return;
      var value = this.min + (this.max - this.min) * progress;
      this.state.setState({
        value: value,
        progress: progress,
      });
    },
    get: function get() {
      return this.state.getState().progress;
    },
  });
  this.spriteBg = Util.createSprite({
    atlas: "texture_atlas",
    texture: "Controls/Slider/bg.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
  });
  this.spriteBg.rotation = this.orientation === "vertical" ? 0 : Math.PI / 2;
  this.spriteSlider = Util.createSprite({
    atlas: "texture_atlas",
    texture: "Controls/Slider/thumb.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
  });
  this.spriteSlider.interactive = true;
  this.spriteSlider.on("click", this.onClickListener, this);
  this.spriteSlider.on("tap", this.onClickListener, this);
  this.spriteSlider.on("pointerdown", this.onMouseDownListener, this);
  this.spriteSlider.on("pointerup", this.onMouseUpListener, this);
  this.spriteSlider.on("pointerupoutside", this.onMouseUpListener, this); // this.spriteSlider.on('touchdown', this.onMouseDownListener, this);

  this.spriteSlider.on("mouseover", this.onMouseOverListener, this);
  this.spriteSlider.on("mouseout", this.onMouseOutListener, this);
  this.state = new Util.StateStore();
  this.state.on("state_change", this.onStateChange, this);
  this.state.setState({
    phase: "wait",
  });
  this.state.setState({
    value: 0.0,
  });
  this.state.setState({
    progress: 0.0,
  });
  NORD.app.on("update", this.update, this);
};

NORD.Controls.Slider.prototype = Object.create(NORD.GUI.BasePanel.prototype);
NORD.Controls.Slider.prototype.constructor = NORD.Controls.Slider;

NORD.Controls.Slider.prototype.onStateChange = function (data) {
  if (this.state.getState().phase === "wait") {
  } else if (this.state.getState().phase === "slide") {
  }

  if (this.orientation === "horizontal")
    this.spriteSlider.x =
      -this.sliderLength / 2 + this.sliderLength * data.state.progress;
  else if (this.orientation === "vertical")
    this.spriteSlider.y =
      this.sliderLength / 2 - this.sliderLength * data.state.progress;
};

NORD.Controls.Slider.prototype.onMouseDownListener = function (event) {
  if (this.state.getState().phase === "wait")
    this.state.setState({
      phase: "slide",
    });
};

NORD.Controls.Slider.prototype.onMouseUpListener = function (event) {
  if (this.state.getState().phase === "slide")
    this.state.setState({
      phase: "wait",
    });
};

NORD.Controls.Slider.prototype.onClickListener = function (event) {};

NORD.Controls.Slider.prototype.onMouseOverListener = function (event) {};

NORD.Controls.Slider.prototype.onMouseOutListener = function (event) {};

NORD.Controls.Slider.prototype.update = function () {
  if (this.state.getState().phase === "slide") {
    var p = this.toLocal(NORD.app.mouseGlobal);
    var pos = 0;
    if (this.orientation === "horizontal") pos = p.x;
    else if (this.orientation === "vertical") pos = p.y;
    pos = Math.max(
      Math.min(pos, this.sliderLength / 2),
      -this.sliderLength / 2
    );
    var progress = Math.abs(this.sliderLength / 2 - pos) / this.sliderLength;
    if (this.orientation === "horizontal") progress = 1 - progress;
    progress = Math.max(Math.min(progress, 1.0), progress);
    this.progress = progress;
  }
};
/*
var Switcher = function(config, sliderSize, isSwitchByClick, bg, sliderBg, iconLeft, iconRight)
{
  Gui.BasePanel.call(this, config);


  var self = this;

  this.state = 'none';

  this.sliderSize = sliderSize;
  this.isSwitchByClick = isSwitchByClick;

  this.bg = new PIXI.Sprite(bg);
  this.addChild(this.bg);
  this.bg.anchor.set(0.5, 0.5);

  this.bg.interactive = true;
  this.bg.buttonMode = true;

  this.bg.on('click', this.onSwitcherClick, this);
  this.bg.on('tap', this.onSwitcherClick, this);


  this.slider = new Gui.BaseButton({name: 'slider', parentPanel: this}, false);
  this.slider.addClickListener(this.onSwitcherClick, this);
  this.slider.isClickSound = false;
  this.sliderBg = new PIXI.Sprite(sliderBg);
  this.slider.addChild(this.sliderBg);
  this.sliderBg.anchor.set(0.5, 0.5);

  this.sliderIcons = {left: new PIXI.Sprite(iconLeft), right: new PIXI.Sprite(iconRight)};
  this.slider.addChild(this.sliderIcons.left);
  this.sliderIcons.left.anchor.set(0.5, 0.5);
  this.slider.addChild(this.sliderIcons.right);
  this.sliderIcons.right.anchor.set(0.5, 0.5);

  this.sliderIcons.left.visible = this.sliderIcons.right.visible = false;

  this.setTo('left');
}
Switcher.prototype = Object.create(Gui.BasePanel.prototype);
Switcher.prototype.constructor = Switcher;

Switcher.prototype.onSwitcherClick = function()
{
    if(this.isSwitchByClick) this.switch();

    app.playAudio('sounds', 'sound_click');

    this.emit('switcher_click');
}

Switcher.prototype.setTo = function(position)
{
  if(this.state == position) return;

  this.state = position;

  var pos = this.getSliderPosition(this.state);

  this.slider.x = pos.x;
  this.slider.y = pos.y;

  var curSliderIcon = this.sliderIcons[this.state];
  curSliderIcon.visible = true;
  curSliderIcon.alpha = 1;

  var prevSliderIcon = this.sliderIcons[(this.state == 'left')?'right':'left'];
  prevSliderIcon.visible = false;
}

Switcher.prototype.getSliderPosition = function(state)
{
  var pos = {x: 0, y: 0};
  if(state == 'left') pos.x = -this.sliderSize/2;
  if(state == 'right') pos.x = this.sliderSize/2;

  return pos;
}

Switcher.prototype.switch = function()
{
  if(!(this.state == 'left' || this.state == 'right')) return;

  var self = this;

  var nextState = (this.state == 'left')?'right':'left';

  var curSliderIcon = this.sliderIcons[this.state];
  var nextSliderIcon = this.sliderIcons[nextState];

  var pos = this.getSliderPosition(nextState);

  this.state = 'switch_to_'+nextState;

  var tweenTime = 12/30;

  TweenMax.to(curSliderIcon, tweenTime*0.5, {alpha: 0, ease: Power2.easeOut, onComplete: function()
  {
    curSliderIcon.visible = false;
    nextSliderIcon.visible = true;
    nextSliderIcon.alpha = 0;
    TweenMax.to(nextSliderIcon, tweenTime*0.5, {alpha: 1, ease: Power2.easeOut});
  }});
  TweenMax.to(curSliderIcon.scale, tweenTime*0.5, {x: 0.8, y: 0.8, ease: Power2.easeOut, onComplete: function()
  {
    nextSliderIcon.scale.x = nextSliderIcon.scale.y = 0.8;
    TweenMax.to(nextSliderIcon.scale, tweenTime*0.5, {x: 1, y: 1, ease: Power2.easeOut});
  }});

  TweenMax.to(this.slider, tweenTime, {x: pos.x, y: pos.y, ease: Power2.easeOut, onComplete: function()
  {
    self.setTo(nextState);
  }});

  this.emit('switched', nextState);
}
*/
// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
