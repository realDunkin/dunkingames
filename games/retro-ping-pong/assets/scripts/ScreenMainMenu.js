"use strict";

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) ||
    _iterableToArray(arr) ||
    _unsupportedIterableToArray(arr) ||
    _nonIterableSpread()
  );
}

function _nonIterableSpread() {
  throw new TypeError(
    "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(n);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
    return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}

NORD.ScreenMainMenu = function (config) {
  var _this = this;

  config.sizeType = "relative";
  config.widthRelative = 1;
  config.heightRelative = 1;
  NORD.GUI.BasePanel.call(this, config);
  var self = this;
  this.state = "hide";
  this.visible = false;
  this.interactiveChildren = false;
  var logo = Util.createSprite({
    parent: this,
    x: 0,
    y: -150,
    atlas: "texture_atlas",
    texture: "logo.png",
    aX: 0.5,
    aY: 0.5,
    scaleX: 0.666,
    scaleY: 0.666,
  });
  this.containerSwitchers = new PIXI.Container();
  this.addChild(this.containerSwitchers); // this.containerSwitchers.y = - 200;

  this.labelBoards = Util.createSprite({
    parent: this.containerSwitchers,
    x: -150,
    y: 0,
    atlas: "texture_atlas",
    texture: "label_boards.png",
    aX: 1.0,
    aY: 0.5,
    scaleXY: 0.666,
  });
  var startY = -50;
  var gConfig = NORD.game.config;
  this.switcherPlayers = this.createSwitcher(
    0,
    startY + 0,
    "label_players",
    "players",
    gConfig.players == "one" ? "left" : "right",
    function (side) {
      var dataMap = {
        left: "one",
        right: "two",
      };
      var config = NORD.game.config;
      config.players = dataMap[side];
      NORD.game.setConfig(config); // console.log('SSS:', config)
    }
  );
  var ddd = "";
  if (gConfig.dificulty == "easy") ddd = "left";
  else if (gConfig.dificulty == "hard") ddd = "right";
  else if (gConfig.dificulty == "medium") ddd = "center";
  this.switcherDificulty = this.createSwitcher(
    0,
    startY + 100,
    "label_dificulty",
    "dificulty",
    ddd,
    function (side) {
      var dataMap = {
        left: "easy",
        right: "hard",
        center: "medium",
      };
      var config = NORD.game.config;
      config.dificulty = dataMap[side];
      NORD.game.setConfig(config); // console.log('SSS:', config)
    }
  );
  var darkDificulty = new PIXI.Container();
  this.containerSwitchers.addChild(darkDificulty);
  var d1 = Util.createSprite({
    parent: darkDificulty,
    x: -95,
    y: 0,
    atlas: "texture_atlas",
    texture: "d_1.png",
    aX: 0.5,
    aY: 0.5,
  });
  var d2 = Util.createSprite({
    parent: darkDificulty,
    x: 0,
    y: 0,
    atlas: "texture_atlas",
    texture: "d_2.png",
    aX: 0.5,
    aY: 0.5,
  });
  var d3 = Util.createSprite({
    parent: darkDificulty,
    x: 95,
    y: 0,
    atlas: "texture_atlas",
    texture: "d_3.png",
    aX: 0.5,
    aY: 0.5,
  });
  d1.scale = d2.scale = d3.scale = new PIXI.Point(0.79, 0.79);
  darkDificulty.y = this.switcherDificulty.y; // darkDificulty.y = 200;

  darkDificulty.visible = false;
  this.darkDificulty = darkDificulty;
  this.switcherMode = this.createSwitcher(
    0,
    startY + 50,
    "label_mode",
    "mode",
    gConfig.mode == "classic" ? "left" : "right",
    function (side) {
      var dataMap = {
        left: "classic",
        right: "action",
      };
      var config = NORD.game.config;
      config.mode = dataMap[side];
      NORD.game.setConfig(config);
    }
  );
  this.switcherMode.on("switch_start", function (side) {});
  this.switcherPlayers.on("switch_start", function (side) {
    if (side === "right") {
      _this.darkDificulty.visible = true; // this.switcherDificulty.alpha = 0.3;

      _this.switcherDificulty.interactive = false;
      _this.switcherDificulty.interactiveChildren = false;
    } else {
      _this.darkDificulty.visible = false; // this.switcherDificulty.alpha = 1;

      _this.switcherDificulty.interactive = true;
      _this.switcherDificulty.interactiveChildren = true;
    }
  });
  this.boardSelected = "board_2";
  var btn = Util.createButton(
    "btn",
    this,
    null,
    "",
    0,
    160,
    147,
    68,
    NORD.game.tweenClickSimple,
    NORD.assetsManager.getAsset("play_button"),
    {
      atlas: "texture_atlas",
      texture: "button_play.png",
      aX: 0.5,
      aY: 0.5,
      scaleX: 0.5,
      scaleY: 0.5,
    }
  );
  btn.addListener(
    "button_click",
    function (data) {
      // if(!(this.switcherPlayers.switchingState == 'none' && this.switcherDificulty.switchingState == 'none' && this.switcherMode.switchingState == 'none')) return;
      if (
        !(
          _this.switcherPlayers.switchingState == "none" &&
          _this.switcherMode.switchingState == "none"
        )
      )
        return; // console.log('Click!');

      TweenMax.delayedCall(0.07 * 2, function () {
        if (NORD.game.config.mode !== "action") self.toGame("board_2");
        else self.toGame(_this.boardSelected);
      });

      
      showAd();
    },
    this
  );
  alignItems([logo, this.containerSwitchers, btn], 480);

  function alignItems(items, height) {
    var totalHeight = 0;
    items.forEach(function (item) {
      totalHeight += item.height;
    });
    var freeSpace = height - totalHeight;
    var shift = freeSpace / (items.length + 1);
    var posY = -height / 2 + shift;
    items.forEach(function (item) {
      item.y = posY + item.height / 2; // item.posi y = posY + item.height/2;
      // console.log('Q:', item.height,  posY + item.height/2);

      posY += item.height + shift;
    });
    items[1].y -= 4; // console.log('Align:', totalHeight, freeSpace)
  }

  var audioButton = new NORD.GUI.ButtonAudio({
    parentPanel: this,
    x: -320 + 21 + 10,
    y: 240 - 21 - 10,
    width: 42,
    height: 42,
    soundClick: NORD.assetsManager.getAsset("sound_click"),
    skin: {
      on: {
        atlas: "texture_atlas",
        texture: "button_audio_0001.png",
      },
      off: {
        atlas: "texture_atlas",
        texture: "button_audio_0002.png",
      },
    },
  });
  this.audioButton = audioButton;
  this.actionHint = Util.createSprite({
    parent: this,
    x: 195,
    y: 18,
    rotation: -6.7 * Util.TO_RADIANS,
    atlas: "texture_atlas",
    texture: "action_hint.png",
    aX: 0.5,
    aY: 0.5,
    scaleX: 0.41,
    scaleY: 0.41,
  });
  this.actionHint.visible = false;
  this.actionHint2 = Util.createSprite({
    parent: this,
    x: 195 + 25,
    y: 18 - 3,
    rotation: -6.7 * Util.TO_RADIANS,
    atlas: "texture_atlas",
    texture: "action_hint_2.png",
    aX: 0.5,
    aY: 0.5,
    scaleX: 0.41,
    scaleY: 0.41,
  });
  this.actionHint2.visible = false; // this.actionBorder = Util.createSprite({ parent: this.switcherMode.containerRight, atlas: 'texture_atlas', texture: 'action_border.png', aX: 0.5, aY: 0.5, scaleXY: 0.79, alpha: 0.0 });
  // this.actionBorder.alpha = 0.0;
  // this.actionBorder.width = this.switcherPlayers.sideRight.spriteOn.width;
  // this.actionBorder.height = this.switcherPlayers.sideRight.spriteOn.height;
  // this.actionBorder.height -= 2;

  this.actionWhite = Util.createSprite({
    parent: this.switcherMode.containerRight,
    atlas: "texture_atlas",
    texture: "action_white.png",
    aX: 0.5,
    aY: 0.5,
    scaleXY: 0.79,
    alpha: 0.0,
  });
  this.actionWhite.alpha = 0.0; // this.actionHintShows = NORD.game.config.actionHintShows;

  this.actionHintShows = 0; // var audioButton = new NORD.GUI.ButtonAudio({ parentPanel: this, x: 200, y: 0, width: 100, height: 100 });

  NORD.GUIManager.on("app_resize", this.onAppResize, this);
};

NORD.ScreenMainMenu.prototype = Object.create(NORD.GUI.BasePanel.prototype);
NORD.ScreenMainMenu.prototype.constructor = NORD.ScreenMainMenu;

NORD.ScreenMainMenu.prototype.onAppResize = function (data) {
  this.audioButton.x = -data.appWidth / 2 + 32;
};

NORD.ScreenMainMenu.prototype.drawPaddle = function () {
  var paddleView = new PaddleView2(0xffffff, true);
  this.addChild(paddleView);
  paddleView.scale.x = paddleView.scale.y = 2;
  paddleView.on("change", function (data) {
    paddleView2.size = data.size;
    paddleView2.controlPoints = data.controlPoints;
    paddleView2.updatePaddle();
  });
  var paddleView2 = new PaddleView2(0xffffff, false);
  this.addChild(paddleView2); // paddleView2.scale.x = paddleView.scale.y = 1.5;

  paddleView.x = 200;
  paddleView2.y = 200;
  paddleView2.x = 200;
};

NORD.ScreenMainMenu.prototype.toGame = function (board) {
  this.tween(
    {
      name: "hide_anim",
    },
    function () {
      NORD.game.screenGame.toGame(board);
      NORD.app.apiCallback("start");
    }
  );
};

NORD.ScreenMainMenu.prototype.toMainMenu = function () {
  // this.actionHintShows ++;
  // this.actionHint.visible =
  //   this.actionHintShows % 2 == 0 && !NORD.game.config.isActionPlayed;
  // this.actionHint.alpha = 1.0;
  this.actionHint2.visible = !NORD.game.config.isActionPlayed;
  this.actionHint2.alpha = 1.0; // this.actionBorder.alpha = 0.0;
  // console.log('FFFF":', this.actionHint.visible, NORD.game.config.isActionPlayed);

  this.tween(
    {
      name: "show_anim",
    },
    function () {
      // NORD.game.screenGame.toGame(board);
    }
  );
};

NORD.ScreenMainMenu.prototype.clearPulse = function () {
  if (this.tweenActionHint) {
    this.tweenActionHint.kill();
  } // this.actionBorder.alpha = 0.0;

  this.actionWhite.alpha = 0.0;
  this.switcherMode.containerRight.scale.x = this.switcherMode.containerRight.scale.y = 1.0;
  this.switcherMode.containerRight.alpha = 1.0;
};

NORD.ScreenMainMenu.prototype.tweenPulse = function () {};

NORD.ScreenMainMenu.prototype.tween = function (data, callback) {
  var self = this;

  if (data.name == "show_anim" && this.state == "hide") {
    this.state = "show_anim"; // this.visible = true;
    // this.alpha = 0;
    //
    // var time = 20 / 30;
    //
    // TweenMax.to(this, time, {alpha: 1, x: 0, y: 0, ease: Power2.easeOut, onComplete: function()
    // {
    //   self.tween({name: 'show'}, callback);
    // }});

    this.tween(
      {
        name: "show",
      },
      callback
    );
  }

  if (data.name == "show_anim_from_preloader" && this.state == "hide") {
    this.state = "show_anim";
    this.visible = true;
    this.alpha = 0; // this.actionHint.visible =
    // this.actionHintShows % 2 == 0 && !NORD.game.config.isActionPlayed;

    this.actionHint2.visible = !NORD.game.config.isActionPlayed;

    if (NORD.game.config.players !== "one") {
      this.darkDificulty.visible = true; // this.switcherDificulty.alpha = 0.3;

      this.switcherDificulty.interactive = false;
      this.switcherDificulty.interactiveChildren = false;
    } else {
      this.darkDificulty.visible = false; // this.switcherDificulty.alpha = 1;

      this.switcherDificulty.interactive = true;
      this.switcherDificulty.interactiveChildren = true;
    }

    var time = 12 / 30;
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
    }); // this.tween({ name: 'show' }, callback);
  }

  if (data.name == "hide_anim" && this.state == "show") {
    this.state = "hide_anim"; // this.interactiveChildren = false;
    //
    // var time = 20 / 30;
    //
    // TweenMax.to(this, time, {alpha: 0, x: 0, y: 0, ease: Power2.easeOut, onComplete: function()
    // {
    //   self.tween({name: 'hide'}, callback);
    // }});

    this.tween(
      {
        name: "hide",
      },
      callback
    );
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
}; // ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //

NORD.MenuSwitcher = function (config, switcherConfig) {
  var _this2 = this;

  NORD.GUI.BasePanel.call(this, config);
  this.selected = switcherConfig.selected;
  this.isCenter = !!switcherConfig.center;
  this.sideLeft = {
    x: -72,
    y: 0,
    name: "left",
    spriteOn: Util.createSprite(switcherConfig.left.spriteOn),
    spriteOff: Util.createSprite(switcherConfig.left.spriteOff),
  };
  this.sideRight = {
    x: 72,
    y: 0,
    name: "right",
    spriteOn: Util.createSprite(switcherConfig.right.spriteOn),
    spriteOff: Util.createSprite(switcherConfig.right.spriteOff),
  };

  if (this.isCenter) {
    this.sideLeft.x = -95;
    this.sideRight.x = 95;
    this.sideCenter = {
      x: 0,
      y: 0,
      name: "center",
      spriteOn: Util.createSprite(switcherConfig.center.spriteOn),
      spriteOff: Util.createSprite(switcherConfig.center.spriteOff),
    };
  } else this.sideCenter = null;

  this.sides = {
    left: this.sideLeft,
    right: this.sideRight,
    center: this.sideCenter,
  };
  this.addChild(this.sideLeft.spriteOff);
  this.sideLeft.spriteOff.x = this.sideLeft.x;
  this.sideLeft.spriteOff.y = this.sideLeft.y;
  this.addChild(this.sideLeft.spriteOn);
  this.sideLeft.spriteOn.x = this.sideLeft.x;
  this.sideLeft.spriteOn.y = this.sideLeft.y;
  this.containerRight = new PIXI.Container();
  this.addChild(this.containerRight);
  this.containerRight.x = this.sideRight.x;
  this.containerRight.y = this.sideRight.y;
  this.containerRight.addChild(this.sideRight.spriteOff);
  this.containerRight.addChild(this.sideRight.spriteOn); // this.addChild(this.sideRight.spriteOff);
  // this.sideRight.spriteOff.x = this.sideRight.x;
  // this.sideRight.spriteOff.y = this.sideRight.y;
  // this.addChild(this.sideRight.spriteOn);
  // this.sideRight.spriteOn.x = this.sideRight.x;
  // this.sideRight.spriteOn.y = this.sideRight.y;

  this.sideLeft.spriteOn.visible = false;
  this.sideLeft.spriteOff.visible = false;
  this.sideRight.spriteOn.visible = false;
  this.sideRight.spriteOff.visible = false;

  if (this.isCenter) {
    this.addChild(this.sideCenter.spriteOff);
    this.sideCenter.spriteOff.x = this.sideCenter.x;
    this.sideCenter.spriteOff.y = this.sideCenter.y;
    this.addChild(this.sideCenter.spriteOn);
    this.sideCenter.spriteOn.x = this.sideCenter.x;
    this.sideCenter.spriteOn.y = this.sideCenter.y;
    this.sideCenter.spriteOn.visible = false;
    this.sideCenter.spriteOff.visible = false; // this.sideCenter.spriteOn.height = this.sideCenter.spriteOff.height = 50 * 0.79;
    // this.sideLeft.spriteOn.width = this.sideLeft.spriteOff.width = this.sideRight.spriteOn.width = this.sideRight.spriteOff.width = this.sideCenter.spriteOn.width = this.sideCenter.spriteOff.width = 110 * 0.79;
    // this.sideLeft.spriteOn.height = this.sideLeft.spriteOff.height = this.sideRight.spriteOn.height = this.sideRight.spriteOff.height = this.sideCenter.spriteOn.height = this.sideCenter.spriteOff.height = 50 * 0.79;

    this.sideLeft.spriteOn.scale.x = this.sideLeft.spriteOff.scale.x = this.sideRight.spriteOn.scale.x = this.sideRight.spriteOff.scale.x = this.sideCenter.spriteOn.scale.x = this.sideCenter.spriteOff.scale.x = 0.79;
    this.sideLeft.spriteOn.scale.y = this.sideLeft.spriteOff.scale.y = this.sideRight.spriteOn.scale.y = this.sideRight.spriteOff.scale.y = this.sideCenter.spriteOn.scale.y = this.sideCenter.spriteOff.scale.y = 0.79;
  } else {
    // this.sideLeft.spriteOn.width = this.sideLeft.spriteOff.width = this.sideRight.spriteOn.width = this.sideRight.spriteOff.width = 168 * 0.79;
    // this.sideLeft.spriteOn.height = this.sideLeft.spriteOff.height = this.sideRight.spriteOn.height = this.sideRight.spriteOff.height = 50 * 0.79;
    this.sideLeft.spriteOn.scale.x = this.sideLeft.spriteOff.scale.x = this.sideRight.spriteOn.scale.x = this.sideRight.spriteOff.scale.x = 0.79;
    this.sideLeft.spriteOn.scale.y = this.sideLeft.spriteOff.scale.y = this.sideRight.spriteOn.scale.y = this.sideRight.spriteOff.scale.y = 0.79;
  }

  this.switchingState = "none";
  this.soundClick = NORD.game.soundClickSimple();

  var setSideInteractive = function setSideInteractive(side) {
    // const { spriteOn, spriteOff } = side;
    var spriteOn = side.spriteOn;
    var spriteOff = side.spriteOff;
    side.clickState = "off";
    spriteOn.interactive = true;
    spriteOn.buttonMode = true;
    spriteOff.interactive = true;
    spriteOff.buttonMode = true;
    spriteOn.on(
      "pointerdown",
      function () {
        if (side.clickState != "off") return;

        _this2.setSelected(side.name); // side.clickState = 'on';
        // NORD.GUI.Button.tweenClickSimple({ target: spriteOn, time: 0.07, scaleNormal: 0.79, scale:  0.79 * 0.95, completeCallback: () => { side.clickState = 'off'; } });
        // this.soundClick.play();
      },
      _this2
    );
    spriteOff.on(
      "pointerdown",
      function () {
        if (side.clickState != "off") return;

        _this2.setSelected(side.name); // side.clickState = 'on';
        // NORD.GUI.Button.tweenClickSimple({ target: spriteOff, time: 0.07, scaleNormal: 0.79, scale:  0.79 * 0.95, completeCallback: () => { side.clickState = 'off'; } });
        // this.soundClick.play();
      },
      _this2
    );
  }; // function tweenT = (target) => {
  //   NORD.app.tweenClickSimple({ target });
  // }

  setSideInteractive(this.sideLeft);
  setSideInteractive(this.sideRight);
  if (this.isCenter) setSideInteractive(this.sideCenter); // this.spriteBg = Util.createSprite({ atlas: 'texture_atlas', texture: 'Controls/Slider/bg.png', parent: this, aX: 0.5, aY: 0.5 });
  // this.spriteBg.rotation = this.orientation === 'vertical'?0:Math.PI/2;
  //
  // this.spriteSlider = Util.createSprite({ atlas: 'texture_atlas', texture: 'Controls/Slider/thumb.png', parent: this, aX: 0.5, aY: 0.5 });
  // this.spriteSlider.interactive = true;
  //
  // this.spriteSlider.on('click', this.onClickListener, this);
  // this.spriteSlider.on('tap', this.onClickListener, this);
  // this.spriteSlider.on('pointerdown', this.onMouseDownListener, this);
  // this.spriteSlider.on('pointerup', this.onMouseUpListener, this);
  // this.spriteSlider.on('pointerupoutside', this.onMouseUpListener, this);
  // // this.spriteSlider.on('touchdown', this.onMouseDownListener, this);
  // this.spriteSlider.on('mouseover', this.onMouseOverListener, this);
  // this.spriteSlider.on('mouseout', this.onMouseOutListener, this);
  //
  // this.state = new Util.StateStore();
  // this.state.on('state_change', this.onStateChange, this);
  // this.state.setState({ phase: 'wait' });
  // this.state.setState({ value: 0.0 });
  // this.state.setState({ progress: 0.0 });

  this.setSide(switcherConfig.selected); // NORD.app.on('update', this.update, this);
};

NORD.MenuSwitcher.prototype = Object.create(NORD.GUI.BasePanel.prototype);
NORD.MenuSwitcher.prototype.constructor = NORD.MenuSwitcher;

NORD.MenuSwitcher.prototype.setSelected = function (side) {
  var _this3 = this;

  if (this.selected == side || this.switchingState !== "none") return;
  this.tween(
    {
      name: "switch",
      side: side,
    },
    function () {
      _this3.setSide(side);
    }
  );
  this.emit("switch_start", side);
};

NORD.MenuSwitcher.prototype.setSide = function (side) {
  var _this4 = this;

  this.selected = side; // const onSide = this.sides[side];
  // const offSide = this.sides[(side == 'left'?'right':'left')];
  //
  // onSide.spriteOff.visible = false;
  // onSide.spriteOn.visible = true;
  // onSide.spriteOn.aplha = 1.0;
  //
  // offSide.spriteOn.visible = false;
  // offSide.spriteOff.visible = true;
  // offSide.spriteOff.aplha = 1.0;

  var offSides = [];
  Object.keys(this.sides).forEach(function (s) {
    var object = _this4.sides[s];
    if (!object) return;

    if (s == side) {
      object.spriteOff.visible = false;
      object.spriteOn.visible = true;
      object.spriteOn.aplha = 1.0;
    } else {
      object.spriteOn.visible = false;
      object.spriteOff.visible = true;
      object.spriteOff.aplha = 1.0;
    }
  });
  this.emit("side_change", side);
};

NORD.MenuSwitcher.prototype.tween = function (data, callback) {
  var _this5 = this;

  if (data.name == "switch") {
    var ttt = function ttt(target) {
      target.scale.x = target.scale.y = 0.79;
      TweenMax.to(target.scale, 0.07, {
        x: 0.79 * 0.95,
        y: 0.79 * 0.95,
        ease: Power2.easeOut,
        onComplete: function onComplete() {
          TweenMax.to(target.scale, 0.07, {
            x: 0.79,
            y: 0.79,
            ease: Power2.easeOut,
            onComplete: function onComplete() {},
          });
        },
      });
    };

    var side = data.side;
    this.switchingState = "switching_" + side; // const onSide = this.sides[side];
    // const offSide = this.sides[(side == 'left'?'right':'left')];
    // onSide.spriteOn.visible = true;
    // offSide.spriteOff.visible = true;

    var offSides = [];
    Object.keys(this.sides).forEach(function (s) {
      var object = _this5.sides[s];
      if (!object) return;

      if (s == side) {
        object.spriteOn.visible = true;
        TweenMax.to(object.spriteOn, 12 / 30, {
          alpha: 1.0,
          ease: Power2.easeOut,
          onComplete: function onComplete() {
            _this5.switchingState = "none";
            if (callback) callback();
          },
        });
        ttt(object.spriteOn);
        ttt(object.spriteOff);

        _this5.soundClick.play();
      } else {
        object.spriteOff.visible = true;
        TweenMax.to(object.spriteOn, 12 / 30, {
          alpha: 0.0,
          ease: Power2.easeOut,
          onComplete: function onComplete() {},
        });
      }
    });
  }
}; // ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //

NORD.BoardsCarousel = function (config, carouselConfig) {
  var _this6 = this;

  NORD.GUI.BasePanel.call(this, config);
  this.positionsMap = {
    "-2": {
      x: -102,
      y: 0,
      scale: 0.6,
      alpha: 0.0,
    },
    "-1": {
      x: -74,
      y: 0,
      scale: 0.85,
      alpha: 1.0,
    },
    0: {
      x: 0,
      y: 0,
      scale: 0.86,
      alpha: 1.0,
    },
    1: {
      x: 74,
      y: 0,
      scale: 0.85,
      alpha: 1.0,
    },
    2: {
      x: 102,
      y: 0,
      scale: 0.6,
      alpha: 0.0,
    },
    hide: {
      x: 0,
      y: 0,
      scale: 1.0,
      alpha: 0.0,
      visible: false,
    },
  };
  this.centerIndex = 1;
  this.board = null;
  this.boards = [];
  carouselConfig.boards.forEach(function (boardData) {
    var boardName = boardData.name;
    var container = new PIXI.Container();

    _this6.addChild(container);

    var spriteOff = Util.createSprite({
      parent: container,
      atlas: "texture_atlas",
      texture: boardName + "_off.png",
      aX: 0.5,
      aY: 0.5,
    });
    var spriteOn = Util.createSprite({
      parent: container,
      atlas: "texture_atlas",
      texture: boardName + "_on.png",
      aX: 0.5,
      aY: 0.5,
    });
    spriteOn.alpha = 0; // container.visible = false;

    var board = {
      container: container,
      name: boardName,
      spriteOff: spriteOff,
      spriteOn: spriteOn,
    };
    container.interactive = true;
    container.buttonMode = true;
    container.on(
      "pointerdown",
      function () {
        _this6.switchBoard(board.name);
      },
      _this6
    );

    board.setToPosition = function (position) {
      board.container.alpha = position.alpha;
      board.container.x = position.x;
      board.container.y = position.y;
      board.container.scale.x = board.container.scale.y = position.scale;
      if (position.visible !== undefined)
        board.container.visible = position.visible;
      else board.container.visible = true;
    };

    board.tweenToPosition = function (position, callback) {
      TweenMax.to(board.container.scale, 10 / 30, {
        x: position.scale,
        y: position.scale,
        ease: Power2.easeOut,
      });
      TweenMax.to(board.container, 10 / 30, {
        x: position.x,
        y: position.y,
        alpha: position.alpha,
        ease: Power2.easeOut,
        onComplete: callback,
      });
    };

    _this6.boards.push(board);
  });
  this.boards.forEach(function (board, i) {
    var prevN = i - 1;
    if (_this6.boards.length > 3 && prevN < 0) prevN = _this6.boards.length - 1;
    var nextN = i + 1;
    if (_this6.boards.length > 3 && nextN > _this6.boards.length - 1) nextN = 0;
    board.prev = _this6.boards[prevN] || null;
    board.next = _this6.boards[nextN] || null;
  });
  this.state = "normal"; // console.log('Boards:', this.boards);

  this.setBoard(carouselConfig.selected);
};

NORD.BoardsCarousel.prototype = Object.create(NORD.GUI.BasePanel.prototype);
NORD.BoardsCarousel.prototype.constructor = NORD.BoardsCarousel;

NORD.BoardsCarousel.prototype.switchBoard = function (name) {
  var _this7 = this;

  if (this.board.name == name || this.state !== "normal") return;
  var board = this.boards.find(function (b) {
    return b.name === name;
  }); // const shiftIndex = this.centerIndex - this.boards.indexOf(board);

  var turnSide = board.next == this.board ? "right" : "left";
  var positionPrev = this.positionsMap["-1"];
  var positionPrev2 = this.positionsMap["-2"];
  var positionNext = this.positionsMap["1"];
  var positionNext2 = this.positionsMap["2"];
  var position = this.positionsMap["0"];

  if (turnSide == "right") {
    this.state = "turning_" + turnSide;
    this.board.tweenToPosition(positionNext);
    TweenMax.to(this.board.spriteOn, 10 / 30, {
      alpha: 0,
      ease: Power2.easeOut,
    });
    if (this.board.next) this.board.next.tweenToPosition(positionNext2);

    if (this.board.prev) {
      this.board.prev.tweenToPosition(position, function () {
        _this7.state = "normal";

        _this7.setBoard(_this7.board.prev.name);
      });
      TweenMax.to(this.board.prev.spriteOn, 10 / 30, {
        alpha: 1,
        ease: Power2.easeOut,
      });

      if (this.board.prev.prev) {
        this.board.prev.prev.setToPosition(positionPrev2);
        this.board.prev.prev.tweenToPosition(positionPrev);
      }
    }
  } else if (turnSide == "left") {
    this.state = "turning_" + turnSide;
    this.board.tweenToPosition(positionPrev);
    TweenMax.to(this.board.spriteOn, 10 / 30, {
      alpha: 0,
      ease: Power2.easeOut,
    });
    if (this.board.prev) this.board.prev.tweenToPosition(positionPrev2);

    if (this.board.next) {
      this.board.next.tweenToPosition(position, function () {
        _this7.state = "normal";

        _this7.setBoard(_this7.board.next.name);
      });
      TweenMax.to(this.board.next.spriteOn, 10 / 30, {
        alpha: 1,
        ease: Power2.easeOut,
      });

      if (this.board.next.next) {
        this.board.next.next.setToPosition(positionNext2);
        this.board.next.next.tweenToPosition(positionNext);
      }
    }
  } // console.log('Switch board:', turnSide);
};

NORD.BoardsCarousel.prototype.setBoard = function (name) {
  var _this8 = this;

  var board = this.boards.find(function (b) {
    return b.name === name;
  });
  if (!board) return;
  var boardPrev = board.prev;
  var boardNext = board.next;
  var positionPrev = this.positionsMap["-1"];
  var positionNext = this.positionsMap["1"];
  var position = this.positionsMap["0"];
  if (boardPrev) boardPrev.setToPosition(positionPrev);
  if (boardNext) boardNext.setToPosition(positionNext);
  board.setToPosition(position);
  board.spriteOn.alpha = 1.0;
  this.boards.forEach(function (b) {
    if (b == board) return;
    b.spriteOn.alpha = 0;
    if (b == boardPrev || b == boardNext) return;
    b.setToPosition(_this8.positionsMap["hide"]);
  });
  this.board = board; // console.log('Set board:', board);

  this.emit("board_change", board.name);
};

NORD.BoardsCarousel.prototype.tween = function (data, callback) {
  if (data.name == "switch") {
  }
};

var drawBezier = function drawBezier(graphics, curve) {
  // console.log('Draw bezier:', curve);
  var LUT = curve.getLUT(16);
  graphics.lineStyle(1.0, 0xffffff);
  graphics.moveTo(LUT[0].x, LUT[0].y);
  LUT.forEach(function (point, i) {
    if (i == 0) return;
    graphics.lineTo(point.x, point.y); // console.log('P:', point);
    // drawPoint(point.x, point.y);
  });
  graphics.lineTo(LUT[0].x, LUT[0].y);

  function drawPoint(x, y) {
    graphics.drawCircle(x, y, 5);
  }
};

var DragablePoint = function DragablePoint(color, radius, checkPosition) {
  PIXI.Graphics.call(this);
  this.checkPosition = checkPosition;
  this.color = color;
  this.radius = radius;
  this.lineStyle(0.0, this.color);
  this.beginFill(this.color, 1);
  this.drawCircle(0, 0, this.radius);
  this.interactive = true;
  this.on("pointerdown", this.onDragStart, this);
  this.on("pointerup", this.onDragEnd, this);
  this.on("pointerupoutside", this.onDragEnd, this);
  this.isDrag = false;
  NORD.app.on("update", this.update, this);
};

DragablePoint.prototype = Object.create(PIXI.Graphics.prototype);
DragablePoint.prototype.constructor = DragablePoint;

DragablePoint.prototype.onDragStart = function (e) {
  if (this.isDrag) return;
  this.isDrag = true;
};

DragablePoint.prototype.onDragEnd = function (e) {
  if (!this.isDrag) return;
  this.isDrag = false;
};

DragablePoint.prototype.update = function () {
  if (!this.isDrag) return;
  var p = this.parent.toLocal(NORD.app.mouseGlobal);
  p = this.checkPosition(p);
  this.x = p.x;
  this.y = p.y;
  this.emit("change", {
    x: this.x,
    y: this.y,
  });
};

var PaddleView2 = function PaddleView2() {
  var _this9 = this;

  var color =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : 0xffffff;
  var isEditable =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  PIXI.Container.call(this);
  this.isEditable = isEditable;

  var createDragablePoint = function createDragablePoint(
    name,
    color,
    radius,
    ddd
  ) {
    var dragablePoint = new DragablePoint(
      color,
      radius,
      ddd
        ? ddd
        : function (p) {
            if (p.x > 0) p.x = 0; // if(p.y > 0) p.y = 0;

            return p;
          }
    );

    _this9.addChild(dragablePoint); // this.dragablePoint1.x = this.pointStart.x + this.controlPoint.x;
    // this.dragablePoint1.y = this.pointStart.y + this.controlPoint.y;

    var controlPoint = _this9.controlPoints[name]; // dragablePoint.x = controlPoint.x;
    // dragablePoint.y = controlPoint.y;
    // this.controlPoints[name] = { x, y };

    dragablePoint.on(
      "change",
      function (data) {
        data.x -= _this9.pointStart.x;
        data.y -= _this9.pointStart.y;
        _this9.controlPoints[name] = data;

        _this9.updatePaddle(); // const p = { x: data.x - this.pointStart.x, y: data.y - this.pointStart.y }
        // const p = data
        // this.updateShape(p);
        // this.emit('shape_change', { size: this.size, controlPoint: this.controlPoint });
      },
      _this9
    );
    return dragablePoint;
  };

  this.color = color;
  this.graphics = new PIXI.Graphics();
  this.addChild(this.graphics);
  this.controlPoints = {
    point_1: {
      x: 0,
      y: 0,
    },
    point_2: {
      x: -15,
      y: 0,
    },
    point_3: {
      x: -15,
      y: 5,
    },
    point_4: {
      x: 0,
      y: 5,
    },
  };
  this.dragablePoints = {}; // this.updatePaddle();

  if (isEditable) {
    // createDragablePoint('point_1', 0xBDFF00, 3, (p) =>
    // {
    //   if(p.y !== 0) p.y = 0;
    //
    //   return p;
    // });
    this.dragablePoints["point_2"] = createDragablePoint(
      "point_2",
      0xff7000,
      3
    );
    this.dragablePoints["point_3"] = createDragablePoint(
      "point_3",
      0xff7000,
      3
    );
    this.dragablePoints["point_4"] = createDragablePoint(
      "point_4",
      0xbdff00,
      3,
      function (p) {
        if (p.x > 0) p.x = 0;
        if (p.y < 3) p.y = 3;
        return p;
      }
    );
  }

  this.updateSize(20);
};

PaddleView2.prototype = Object.create(PIXI.Container.prototype);
PaddleView2.prototype.constructor = PaddleView2;

PaddleView2.prototype.updateSize = function (size) {
  this.size = size;
  this.updatePaddle();
};

PaddleView2.prototype.updateControlPoints = function (controlPoints) {
  this.controlPoints = controlPoints;
  this.updatePaddle();
};

PaddleView2.prototype.updatePaddle = function () {
  var _this10 = this;

  // this.size = size;
  this.pointStart = {
    x: -this.size / 2,
    y: 0,
  };
  this.pointEnd = {
    x: this.size / 2,
    y: 0,
  }; // console.log('S:', this.pointStart);
  // const { point_1, point_2, point_3, point_4 } = this.controlPoints;

  var point_1 = this.controlPoints.point_1;
  var point_2 = this.controlPoints.point_2;
  var point_3 = this.controlPoints.point_3;
  var point_4 = this.controlPoints.point_4;
  this.curveLeft = new Bezier(
    point_1.x + this.pointStart.x,
    point_1.y + this.pointStart.y,
    point_2.x + this.pointStart.x,
    point_2.y + this.pointStart.y,
    point_3.x + this.pointStart.x,
    point_3.y + this.pointStart.y,
    point_4.x + this.pointStart.x,
    point_4.y + this.pointStart.y
  );
  this.curveRight = new Bezier(
    -point_4.x + this.pointEnd.x,
    point_4.y + this.pointEnd.y,
    -point_3.x + this.pointEnd.x,
    point_3.y + this.pointEnd.y,
    -point_2.x + this.pointEnd.x,
    point_2.y + this.pointEnd.y,
    -point_1.x + this.pointEnd.x,
    point_1.y + this.pointEnd.y
  );
  this.points = [].concat(
    _toConsumableArray(this.curveLeft.getLUT(20)),
    _toConsumableArray(this.curveRight.getLUT(20))
  );
  var minX = null;
  var maxX = null;
  var minY = null;
  var maxY = null;
  this.points.forEach(function (p) {
    if (minX == null || p.x < minX) minX = p.x;
    if (maxX == null || p.x > maxX) maxX = p.x;
    if (minY == null || p.y < minY) minY = p.y;
    if (maxY == null || p.y > maxY) maxY = p.y;
  });
  this.paddleWidth = Math.abs(minX - maxX);
  this.paddleHeight = Math.abs(minY - maxY);
  this.graphics.clear();
  this.drawPaddle(this.graphics, this.color, this.points);

  if (this.isEditable) {
    this.graphics.lineStyle(0.34, 0xff7000);
    this.graphics.moveTo(
      point_1.x + this.pointStart.x,
      point_1.y + this.pointStart.y
    );
    this.graphics.lineTo(
      point_2.x + this.pointStart.x,
      point_2.y + this.pointStart.y
    );
    this.graphics.moveTo(
      point_3.x + this.pointStart.x,
      point_3.y + this.pointStart.y
    );
    this.graphics.lineTo(
      point_4.x + this.pointStart.x,
      point_4.y + this.pointStart.y
    );
    Object.keys(this.dragablePoints).forEach(function (key) {
      var dragablePoint = _this10.dragablePoints[key];
      var point = _this10.controlPoints[key]; // console.log('K:', key, dragablePoint, point)

      dragablePoint.x = point.x + _this10.pointStart.x;
      dragablePoint.y = point.y + _this10.pointStart.y;
    });
  }

  this.emit("change", {
    size: this.size,
    controlPoints: this.controlPoints,
    paddleWidth: this.paddleWidth,
    paddleHeight: this.paddleHeight,
  });
};

PaddleView2.prototype.getPoints = function () {
  var angle =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return this.points.map(function (point) {
    return Util.rotatePointDeg(point.x, point.y, 0, 0, angle);
  });
};

PaddleView2.prototype.drawPaddle = function (graphics, color, vertices) {
  graphics.beginFill(color, 1);
  graphics.lineStyle(1, color, 1.0);
  var startVertice = vertices[0];
  graphics.moveTo(startVertice.x, startVertice.y);

  for (var i = 1; i < vertices.length; i++) {
    graphics.lineTo(vertices[i].x, vertices[i].y);
  }

  graphics.lineTo(startVertice.x, startVertice.y);
};

NORD.ScreenMainMenu.prototype.createSwitcher = function (
  x,
  y,
  labelName,
  switcherName,
  selected,
  onChange
) {
  // const label = Util.createSprite({ parent: this, x: -112, y: y, atlas: 'texture_atlas', texture: labelName+'.png', aX: 1.0, aY: 0.5 });
  var config = null;

  if (switcherName == "dificulty") {
    config = {
      selected: selected,
      left: {
        spriteOn: {
          atlas: "texture_atlas",
          texture: "switcher_" + switcherName + "_1_on.png",
          aX: 0.5,
          aY: 0.5,
        },
        spriteOff: {
          atlas: "texture_atlas",
          texture: "switcher_" + switcherName + "_1_off.png",
          aX: 0.5,
          aY: 0.5,
        },
      },
      center: {
        spriteOn: {
          atlas: "texture_atlas",
          texture: "switcher_" + switcherName + "_2_on.png",
          aX: 0.5,
          aY: 0.5,
        },
        spriteOff: {
          atlas: "texture_atlas",
          texture: "switcher_" + switcherName + "_2_off.png",
          aX: 0.5,
          aY: 0.5,
        },
      },
      right: {
        spriteOn: {
          atlas: "texture_atlas",
          texture: "switcher_" + switcherName + "_3_on.png",
          aX: 0.5,
          aY: 0.5,
        },
        spriteOff: {
          atlas: "texture_atlas",
          texture: "switcher_" + switcherName + "_3_off.png",
          aX: 0.5,
          aY: 0.5,
        },
      },
    };
  } else {
    config = {
      selected: selected,
      left: {
        spriteOn: {
          atlas: "texture_atlas",
          texture: "switcher_" + switcherName + "_1_on.png",
          aX: 0.5,
          aY: 0.5,
        },
        spriteOff: {
          atlas: "texture_atlas",
          texture: "switcher_" + switcherName + "_1_off.png",
          aX: 0.5,
          aY: 0.5,
        },
      },
      right: {
        spriteOn: {
          atlas: "texture_atlas",
          texture: "switcher_" + switcherName + "_2_on.png",
          aX: 0.5,
          aY: 0.5,
        },
        spriteOff: {
          atlas: "texture_atlas",
          texture: "switcher_" + switcherName + "_2_off.png",
          aX: 0.5,
          aY: 0.5,
        },
      },
    };
  }

  var switcher = new NORD.MenuSwitcher(
    {
      parentPanel: this,
      container: this.containerSwitchers,
      x: 0,
      y: y,
    },
    config
  );
  switcher.on("side_change", function (side) {
    // console.log('Side change:', side);
    onChange(side);
  });
  return switcher; // switcher.scale.x = switcher.scale.y = Util.randomRange(1.0, 1.1);
};
