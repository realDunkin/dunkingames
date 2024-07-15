"use strict";

NORD.PanelSettings = function (config) {
  var _this = this;

  // config.sizeType = 'relative';
  // config.widthRelative = 1;
  // config.heightRelative = 1;
  config.width = 500;
  config.height = 500;
  NORD.GUI.BasePanel.call(this, config);
  var self = this;
  this.state = "hide";
  this.visible = false;
  this.interactiveChildren = false; // this.alpha = 0;

  this.actionModes = [
    "KITTY",
    "GRAVITY_WELL",
    "INVISIBLE_AREA",
    "INVISIBLE_WALL",
    "DOUBLE_BALL",
    "BIG_BALL_LITTLE_PADDLES",
    "SMALL_GRAVITY_WELL",
    "STUN_GUN",
    "FIRE_ZONE",
    "BUMPER",
    "BREAKOUT",
    "SHATTER",
    "ROBO",
    "DODGE",
    "FLAPPY",
  ]; // this.actionModesMap =

  this.actionMode = "ALL";
  this.field = NORD.game.field;
  this.config = this.field.config;
  Object.keys(this.config).forEach(function (key) {
    if (_this.config[key].on) {
      _this.config[key].on("change", _this.updateConfig, _this);
    }
  }); // this.logo = Util.createSprite({ atlas: 'texture_atlas', texture: 'logo.png', parent: this, aX: 0.5, aY: 0.5 });

  this.bg = Util.createSprite({
    atlas: "texture_atlas",
    texture: "Util/black_rect.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
  });
  this.bg.width = this.width;
  this.bg.height = this.height;
  this.bg.alpha = 0.8;
  this.bg.interactive = true;
  this.labelStyle = {
    fontFamily: "Arial",
    fontSize: 14,
    fill: 0xffffff,
    align: "center",
  };
  this.labelH2Style = {
    fontFamily: "Arial",
    fontSize: 20,
    fill: 0xffffff,
    align: "center",
  };
  this.labelSettings = createLabel(this, 0, -200, "Settings");
  this.pages = [];
  this.createPanelAi();
  this.createPanelCore();
  this.createPanelPaddle();
  this.createPanelBall();
  this.createPanelBoards1();
  this.createPanelBonuses1();
  this.createPanelBonuses2();
  this.createPanelBonuses3();
  this.createPanelBonuses4();
  this.createPanelBonuses5();
  this.createPanelBonuses6();
  this.buttonClose = Util.createButton(
    "btn",
    this,
    null,
    "",
    640 / 2 - 32 / 2 - 5,
    -480 / 2 + 32 / 2 + 5,
    32,
    32,
    NORD.game.tweenClickSimple,
    NORD.game.soundClickSimple(),
    {
      atlas: "texture_atlas",
      texture: "button_close.png",
      aX: 0.5,
      aY: 0.5,
    }
  );
  this.buttonClose.on(
    "button_click",
    function (data) {
      NORD.game.panelSettings.tween({
        name: "hide_anim",
      });
    },
    this
  );
  this.buttonSave = Util.createButton(
    "btn",
    this,
    null,
    "",
    200,
    225 - 20,
    85,
    30,
    NORD.game.tweenClickSimple,
    NORD.game.soundClickSimple(),
    {
      atlas: "texture_atlas",
      texture: "button_save.png",
      aX: 0.5,
      aY: 0.5,
    }
  );
  this.buttonSave.on(
    "button_click",
    function (data) {
      // Util.saveJsonFile('xxx', { ccc: 22 })
      this.saveJson();
    },
    this
  );
  this.buttonPrev = Util.createButton(
    "btn",
    this,
    null,
    "",
    -210,
    225 - 20,
    60,
    30,
    NORD.game.tweenClickSimple,
    NORD.game.soundClickSimple(),
    {
      atlas: "texture_atlas",
      texture: "button_prev.png",
      aX: 0.5,
      aY: 0.5,
    }
  );
  this.buttonPrev.on(
    "button_click",
    function (data) {
      var n = this.pages.indexOf(this.page) - 1;
      if (n < 0) n = this.pages.length - 1;
      this.setPage(this.pages[n]);
    },
    this
  );
  this.buttonNext = Util.createButton(
    "btn",
    this,
    null,
    "",
    -140,
    225 - 20,
    60,
    30,
    NORD.game.tweenClickSimple,
    NORD.game.soundClickSimple(),
    {
      atlas: "texture_atlas",
      texture: "button_next.png",
      aX: 0.5,
      aY: 0.5,
    }
  );
  this.buttonNext.on(
    "button_click",
    function (data) {
      var n = this.pages.indexOf(this.page) + 1;
      if (n > this.pages.length - 1) n = 0;
      this.setPage(this.pages[n]);
    },
    this
  );
  this.setPage(this.pages[0]);
  this.updateConfig(); // console.log(Power2.easeOut.getRatio(0.9));
  // console.log(Power2);
  // var btnConfig = { name: 'btn', parentPanel: this, positionType: 'left-bot', xRelative: 10, yRelative: -10, width: 264, height: 96,
  //                   tweenClick: NORD.game.tweenClickSimple, soundClick: NORD.game.soundClickSimple(),
  //                   regularSkin: Util.createSprite({ atlas: 'texture_atlas', texture: 'button_play.png', aX: 0.5, aY: 0.5 }) };
  // var btn = new NORD.GUI.Button(btnConfig);
  // btn.addListener('button_click', function(data)
  // {
  //  console.log('Click!');
  // });
  // var btn = Util.createButton('btn', this, null, 'right-bot', -10, -10, 264, 96, NORD.game.tweenClickSimple, NORD.game.soundClickSimple(), { atlas: 'texture_atlas', texture: 'button_play.png', aX: 0.5, aY: 0.5 });
  // btn.addListener('button_click', function(data)
  // {
  //  console.log('Click!');
  // });

  if (window.localStorage.enable_settings) {
    var keyUp = Util.keyboard({
      code: "Q".charCodeAt(0),
      keyDownHandler: function keyDownHandler() {
        // console.log(self);
        if (self.state == "hide")
          self.tween({
            name: "show_anim",
          });
        if (self.state == "show")
          self.tween({
            name: "hide_anim",
          });
      },
      keyUpHandler: function keyUpHandler() {},
    });
  }
};

NORD.PanelSettings.prototype = Object.create(NORD.GUI.BasePanel.prototype);
NORD.PanelSettings.prototype.constructor = NORD.PanelSettings;

NORD.PanelSettings.prototype.setPage = function (page) {
  if (this.page) this.page.container.visible = false;
  this.page = page;
  this.page.container.visible = true;
};

NORD.PanelSettings.prototype.saveJson = function () {
  var _this2 = this;

  var settings = {};
  Object.keys(this.config).forEach(function (key) {
    settings[key] = _this2.config[key].value;
  });
  var data = {
    settings: settings,
  };
  Util.saveJsonFile("data", data);
};

NORD.PanelSettings.prototype.updateConfig = function (data) {
  // this.paddleView.setSize(this.config.paddleShape.value, this.config.paddleSize.value, this.config.paddlePlatformSize.value);
  // this.paddleView.setSize(this.config.paddleSize.value, this.config.paddleShape.value);
  this.blockUpdatePaddleView = true;
  if (this.paddleView) this.paddleView.updateSize(this.config.paddleSize.value);
  if (this.ballView) this.ballView.setSize(this.config.ballSize.value);
  this.blockUpdatePaddleView = false;
  var n = Math.floor(this.field.config.actionMode.value);
  this.actionMode = n === 0 ? "ALL" : this.actionModes[n - 1];

  if (this.labelActionMode) {
    this.labelActionMode.text = this.actionMode;
  } // console.log(actionMode);
};

NORD.PanelSettings.prototype.createPanelAi = function () {
  this.panelAi = new PIXI.Container();
  this.addChild(this.panelAi);
  this.panelAi.y = -120;
  this.panelAi.visible = false;
  var startX = -240;
  var startY = 0;
  var padding = 40;
  var labelTitleCore = createLabel(
    this.panelAi,
    -240,
    -30,
    "AI:",
    this.labelH2Style
  );
  labelTitleCore.anchor = {
    x: 0,
    y: 0.5,
  };
  this.createParametr({
    type: "slider",
    container: this.panelAi,
    x: startX,
    sliderShiftX: 60,
    y: 0,
    label: "Rookie:",
    parametr: this.field.config.aiEasyMissK,
    min: 0.0,
    max: 1.0,
  });
  this.createParametr({
    type: "slider",
    container: this.panelAi,
    x: startX,
    sliderShiftX: 60,
    y: 0 + padding * 1,
    label: "Veteran:",
    parametr: this.field.config.aiMediumMissK,
    min: 0.0,
    max: 1.0,
  });
  this.createParametr({
    type: "slider",
    container: this.panelAi,
    x: startX,
    sliderShiftX: 60,
    y: 0 + padding * 2,
    label: "Ace:",
    parametr: this.field.config.aiHardMissK,
    min: 0.0,
    max: 1.0,
  });
  this.createParametr({
    type: "slider",
    container: this.panelAi,
    x: startX,
    sliderShiftX: 60,
    y: 0 + padding * 3,
    label: "Action: Rookie:",
    parametr: this.field.config.aiActionEasyMissK,
    min: 0.0,
    max: 1.0,
  });
  this.createParametr({
    type: "slider",
    container: this.panelAi,
    x: startX,
    sliderShiftX: 60,
    y: 0 + padding * 4,
    label: "Action: Veteran:",
    parametr: this.field.config.aiActionMediumMissK,
    min: 0.0,
    max: 1.0,
  });
  this.createParametr({
    type: "slider",
    container: this.panelAi,
    x: startX,
    sliderShiftX: 60,
    y: 0 + padding * 5,
    label: "Action: Ace:",
    parametr: this.field.config.aiActionHardMissK,
    min: 0.0,
    max: 1.0,
  });
  this.createParametr({
    type: "slider",
    container: this.panelAi,
    x: startX,
    sliderShiftX: 60,
    y: 0 + padding * 6,
    label: "Ball speed K:",
    parametr: this.field.config.speedDificultyK,
    min: 0.0,
    max: 1.0,
  }); // this.createParametr({ type: 'slider', container: this.panelAi, x: startX, sliderShiftX: 60, y: 0 + padding * 4, label: 'Action mul bonus:', parametr: this.field.config.aiActionMul, min: 1.0, max: 2.0 });
  // this.createParametr({ type: 'slider', container: this.panelAi, x: startX, sliderShiftX: 60, y: 0 + padding * 1, label: 'Finger sense:', parametr: this.field.config.fingerSense, min: 0.8, max: 3 });
  // this.createParametr({ type: 'slider', container: this.panelAi, x: startX, sliderShiftX: 60, y: 0 + padding * 2, label: 'AI:', parametr: this.field.config.aiTest, min: 0, max: 10, step: 1, intOnly: true });
  // this.createParametr({ type: 'slider', container: this.panelAi, x: startX, sliderShiftX: 60, y: 0 + padding * 2, label: 'Bonus min delay:', parametr: this.field.config.bonusMinDelay, min: 1, max: 30 });
  // this.createParametr({ type: 'slider', container: this.panelAi, x: startX, sliderShiftX: 60, y: 0 + padding * 3, label: 'Bonus max delay:', parametr: this.field.config.bonusMaxDelay, min: 1, max: 30 });
  // this.createParametr({ type: 'slider', container: this.panelAi, x: startX, sliderShiftX: 60, y: 0 + padding * 4, label: 'End game delay:', parametr: this.field.config.endGamePanelDelay, min: 0, max: 3 });
  // this.createParametr({ type: 'slider', container: this.panelAi, x: startX, sliderShiftX: 60, y: 0 + padding * 5 + 40, label: 'Action mode:', parametr: this.field.config.actionMode, min: 0, max: this.actionModes.length, step: 1, intOnly: true });
  // this.createParametr({ type: 'slider', container: this.panelAi, x: startX, y: -90+padding*3, label: 'AI Hard:', parametr: this.field.config.aiHard, min: 1, max: 10, step: 1, intOnly: true });
  // this.labelActionMode = createLabel(this.panelAi, 0, 0 + padding * 6 + 40, this.actionMode, this.labelH2Style);

  this.pages.push({
    name: "ai",
    container: this.panelAi,
  });
};

NORD.PanelSettings.prototype.createPanelCore = function () {
  this.panelCore = new PIXI.Container();
  this.addChild(this.panelCore);
  this.panelCore.y = -120;
  this.panelCore.visible = false;
  var startX = -240;
  var startY = 0;
  var padding = 40;
  var labelTitleCore = createLabel(
    this.panelCore,
    -240,
    -30,
    "General:",
    this.labelH2Style
  );
  labelTitleCore.anchor = {
    x: 0,
    y: 0.5,
  };
  this.createParametr({
    type: "slider",
    container: this.panelCore,
    x: startX,
    sliderShiftX: 60,
    y: 0,
    label: "Scores to win:",
    parametr: this.field.config.scoresForWin,
    min: 1,
    max: 9,
    step: 1,
    intOnly: true,
  });
  this.createParametr({
    type: "slider",
    container: this.panelCore,
    x: startX,
    sliderShiftX: 60,
    y: 0 + padding * 1,
    label: "Finger sense:",
    parametr: this.field.config.fingerSense,
    min: 0.8,
    max: 3,
  }); // this.createParametr({ type: 'slider', container: this.panelCore, x: startX, sliderShiftX: 60, y: 0 + padding * 2, label: 'AI:', parametr: this.field.config.aiTest, min: 0, max: 10, step: 1, intOnly: true });

  this.createParametr({
    type: "slider",
    container: this.panelCore,
    x: startX,
    sliderShiftX: 60,
    y: 0 + padding * 2,
    label: "Bonus min delay:",
    parametr: this.field.config.bonusMinDelay,
    min: 1,
    max: 30,
  });
  this.createParametr({
    type: "slider",
    container: this.panelCore,
    x: startX,
    sliderShiftX: 60,
    y: 0 + padding * 3,
    label: "Bonus max delay:",
    parametr: this.field.config.bonusMaxDelay,
    min: 1,
    max: 30,
  });
  this.createParametr({
    type: "slider",
    container: this.panelCore,
    x: startX,
    sliderShiftX: 60,
    y: 0 + padding * 4,
    label: "End game delay:",
    parametr: this.field.config.endGamePanelDelay,
    min: 0,
    max: 3,
  });
  this.createParametr({
    type: "slider",
    container: this.panelCore,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 5,
    label: "New modes percent:",
    parametr: this.field.config.newModesChance,
    min: 0,
    max: 100,
  });
  this.createParametr({
    type: "slider",
    container: this.panelCore,
    x: startX,
    sliderShiftX: 60,
    y: 0 + padding * 5 + 40,
    label: "Action mode:",
    parametr: this.field.config.actionMode,
    min: 0,
    max: this.actionModes.length,
    step: 1,
    intOnly: true,
  }); // this.createParametr({ type: 'slider', container: this.panelCore, x: startX, y: -90+padding*3, label: 'AI Hard:', parametr: this.field.config.aiHard, min: 1, max: 10, step: 1, intOnly: true });

  this.labelActionMode = createLabel(
    this.panelCore,
    0,
    0 + padding * 6 + 40,
    this.actionMode,
    this.labelH2Style
  );
  this.pages.push({
    name: "core",
    container: this.panelCore,
  });
};

NORD.PanelSettings.prototype.createPanelPaddle = function () {
  var _this3 = this;

  this.panelPaddle = new PIXI.Container();
  this.addChild(this.panelPaddle);
  this.panelPaddle.y = -120;
  this.panelPaddle.visible = false;
  this.paddleView = new PaddleView2(0xffffff, true);
  this.panelPaddle.addChild(this.paddleView);
  this.paddleView.x = 0;
  this.paddleView.y = 250;
  this.paddleView.scale.x = this.paddleView.scale.y = 2; // this.paddleView.on('shape_change', (data)=>
  // {
  //   this.field.config.paddleSize.value = data.size;
  //   this.field.config.paddleShape.value = data.controlPoint;
  // }, this);

  this.paddleView.on(
    "change",
    function (data) {
      if (_this3.blockUpdatePaddleView) return;
      _this3.field.config.paddleSize.value = data.size;
      _this3.field.config.paddleShape.value = data.controlPoints; // console.log('GGG')
      // this.paddleViewSmall.size = data.size;
      // this.paddleViewSmall.controlPoints = data.controlPoints;
      // this.paddleViewSmall.updatePaddle();
    },
    this
  ); // this.paddleViewSmall = new PaddleView2();
  // this.panelPaddle.addChild(this.paddleViewSmall);
  // this.paddleViewSmall.x = 100;
  // this.paddleViewSmall.y = 220;

  this.paddleView.size = this.field.config.paddleSize.value;
  this.paddleView.controlPoints = this.field.config.paddleShape.value;
  this.paddleView.updatePaddle(); // this.paddleView.setSize(this.field.config.paddleSize.value, this.field.config.paddleShape.value);
  // this.paddleView.rotation = Math.PI / 2;
  // this.paddleView.setSize(0.5, 60);

  var labelTitle = createLabel(
    this.panelPaddle,
    -240,
    -30,
    "Paddle:",
    this.labelH2Style
  );
  labelTitle.anchor = {
    x: 0,
    y: 0.5,
  };
  var startX = -240;
  var startY = 0;
  var padding = 40; // this.createParametr({ type: 'slider', container: this.panelPaddle, x: startX, y: startY, label: 'Shape:', parametr: this.field.config.paddleShape, min: 0.0, max: 2.0 });

  this.createParametr({
    type: "slider",
    container: this.panelPaddle,
    x: startX,
    y: startY + padding * 0,
    label: "Size:",
    parametr: this.field.config.paddleSize,
    min: 0,
    max: 100,
  }); // this.createParametr({ type: 'slider', container: this.panelPaddle, x: startX, y: startY+padding*2, label: 'Platform Size:', parametr: this.field.config.paddlePlatformSize, min: 1, max: 40 });

  this.createParametr({
    type: "slider",
    container: this.panelPaddle,
    x: startX,
    y: startY + padding * 1,
    label: "Speed:",
    parametr: this.field.config.paddleSpeed,
    min: 1,
    max: 20,
  });
  this.createParametr({
    type: "slider",
    container: this.panelPaddle,
    x: startX,
    y: startY + padding * 2,
    label: "Acceleration:",
    parametr: this.field.config.paddleAcceleration,
    min: 0.05,
    max: 2,
  });
  this.createParametr({
    type: "slider",
    container: this.panelPaddle,
    x: startX,
    y: startY + padding * 3,
    label: "Decceleration:",
    parametr: this.field.config.paddleDeceleration,
    min: 0.05,
    max: 2,
  }); // this.createParametr({ type: 'slider', container: this.panelPaddle, x: startX, y: startY + padding * 4.3, label: 'Easy Slow K:', parametr: this.field.config.easyBallSlowK, min: 0.1, max: 1 });
  // this.createParametr({ type: 'slider', container: this.panelPaddle, x: startX, y: startY + padding * 5.3, label: 'Dificulty Spd K:', parametr: this.field.config.speedDificultyK, min: 0.0, max: 1 });

  this.pages.push({
    name: "paddle",
    container: this.panelPaddle,
  });
};

NORD.PanelSettings.prototype.createPanelBall = function () {
  this.panelBall = new PIXI.Container();
  this.addChild(this.panelBall);
  this.panelBall.y = -120;
  this.panelBall.visible = false;
  this.ballView = new BallView();
  this.panelBall.addChild(this.ballView);
  this.ballView.y = 300;
  var labelTitle = createLabel(
    this.panelBall,
    -240,
    -30,
    "Ball:",
    this.labelH2Style
  );
  labelTitle.anchor = {
    x: 0,
    y: 0.5,
  };
  var startX = -240;
  var startY = 0;
  var padding = 40;
  this.createParametr({
    type: "slider",
    container: this.panelBall,
    x: startX,
    y: startY,
    label: "Size:",
    parametr: this.field.config.ballSize,
    min: 3,
    max: 20,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBall,
    x: startX,
    y: startY + padding * 1,
    label: "Min Speed:",
    parametr: this.field.config.ballMinSpeed,
    min: 1,
    max: 15,
    step: 1,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBall,
    x: startX,
    y: startY + padding * 2,
    label: "Max Speed:",
    parametr: this.field.config.ballMaxSpeed,
    min: 1,
    max: 15,
    step: 1,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBall,
    x: startX,
    y: startY + padding * 3,
    label: "Action: Min Speed:",
    parametr: this.field.config.ballMinSpeedAction,
    min: 1,
    max: 15,
    step: 1,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBall,
    x: startX,
    y: startY + padding * 4,
    label: "Action: Max Speed:",
    parametr: this.field.config.ballMaxSpeedAction,
    min: 1,
    max: 15,
    step: 1,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBall,
    x: startX,
    y: startY + padding * 5,
    label: "Spd Up F Hits:",
    parametr: this.field.config.ballSpeedUpFirstHits,
    min: 1,
    max: 15,
    intOnly: true,
    step: 1,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBall,
    x: startX,
    y: startY + padding * 6,
    label: "Spd Up Hits:",
    parametr: this.field.config.ballSpeedUpHits,
    min: 1,
    max: 15,
    intOnly: true,
    step: 1,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBall,
    x: startX,
    y: startY + padding * 7,
    label: "Spd Up K:",
    parametr: this.field.config.ballSpeedUpK,
    min: 1.01,
    max: 2,
  });
  this.pages.push({
    name: "ball",
    container: this.panelBall,
  });
};

NORD.PanelSettings.prototype.createPanelBonuses1 = function () {
  this.panelBonuses1 = new PIXI.Container();
  this.addChild(this.panelBonuses1);
  this.panelBonuses1.y = -120;
  this.panelBonuses1.visible = false; // const labelTitle = createLabel(this.panelBonuses1, -240, -30, 'Small Gravity Well:', this.labelH2Style);
  // labelTitle.anchor = { x:0, y: 0.5 };
  //

  var startX = -240;
  var startY = 0;
  var padding = 40; // this.createParametr({ type: 'slider', container: this.panelBonuses1, x: startX, sliderShiftX: 60, y: startY, label: 'Radius:', parametr: this.field.config.smallGravityWellRadius, min: 20, max: 150 });
  // this.createParametr({ type: 'slider', container: this.panelBonuses1, x: startX, sliderShiftX: 60, y: startY + padding * 1, label: 'Power:', parametr: this.field.config.smallGravityWellPower, min: 1, max: 8 });

  var labelTitle = createLabel(
    this.panelBonuses1,
    -240,
    -30,
    "Big Ball Little Paddles:",
    this.labelH2Style
  );
  labelTitle.anchor = {
    x: 0,
    y: 0.5,
  }; // startY = startY + padding + 30 + 30;

  this.createParametr({
    type: "slider",
    container: this.panelBonuses1,
    x: startX,
    sliderShiftX: 0,
    y: startY,
    label: "Ball Size:",
    parametr: this.field.config.bblpModeBallSize,
    min: 10,
    max: 50,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses1,
    x: startX,
    y: startY + padding * 1,
    label: "Ball min Speed:",
    parametr: this.field.config.bblpModeBallMinSpeed,
    min: 1,
    max: 15,
    step: 1,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses1,
    x: startX,
    y: startY + padding * 2,
    label: "Ball max Speed:",
    parametr: this.field.config.bblpModeBallMaxSpeed,
    min: 1,
    max: 15,
    step: 1,
  });
  var labelTitle2 = createLabel(
    this.panelBonuses1,
    -240,
    startY + padding * 3 + 30,
    "Bumper:",
    this.labelH2Style
  );
  labelTitle2.anchor = {
    x: 0,
    y: 0.5,
  };
  startY = startY + padding * 3 + 30 + 30;
  this.createParametr({
    type: "slider",
    container: this.panelBonuses1,
    x: startX,
    sliderShiftX: 60,
    y: startY,
    label: "Radius:",
    parametr: this.field.config.bumperModeRadius,
    min: 10,
    max: 100,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses1,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 1,
    label: "Speed UP:",
    parametr: this.field.config.bumperModeSpeedUp,
    min: 1.0,
    max: 2,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses1,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 2,
    label: "Form:",
    parametr: this.field.config.bumperModeCount,
    min: 1,
    max: 2,
    step: 1,
    intOnly: true,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses1,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 3,
    label: "Form FIVE shift:",
    parametr: this.field.config.bumperModeFiveShift,
    min: 50,
    max: 200,
  });
  this.pages.push({
    name: "bonuses1",
    container: this.panelBonuses1,
  });
};

NORD.PanelSettings.prototype.createPanelBonuses2 = function () {
  this.panelBonuses2 = new PIXI.Container();
  this.addChild(this.panelBonuses2);
  this.panelBonuses2.y = -120;
  this.panelBonuses2.visible = false;
  var labelTitle = createLabel(
    this.panelBonuses2,
    -240,
    -30,
    "Stun Gun:",
    this.labelH2Style
  );
  labelTitle.anchor = {
    x: 0,
    y: 0.5,
  };
  var startX = -240;
  var startY = 0;
  var padding = 40;
  this.createParametr({
    type: "slider",
    container: this.panelBonuses2,
    x: startX,
    sliderShiftX: 60,
    y: startY,
    label: "Reload:",
    parametr: this.field.config.gunModeReload,
    min: 0.5,
    max: 10,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses2,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 1,
    label: "Stun Duration:",
    parametr: this.field.config.gunModeStun,
    min: 0.5,
    max: 5,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses2,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 2,
    label: "Bullet speed:",
    parametr: this.field.config.bonusShootBulletSpeed,
    min: 5,
    max: 20,
  });
  this.pages.push({
    name: "bonuses2",
    container: this.panelBonuses2,
  });
};

NORD.PanelSettings.prototype.createPanelBonuses3 = function () {
  this.panelBonuses3 = new PIXI.Container();
  this.addChild(this.panelBonuses3);
  this.panelBonuses3.y = -120;
  this.panelBonuses3.visible = false;
  var labelTitle = createLabel(
    this.panelBonuses3,
    -240,
    -30,
    "Kitty:",
    this.labelH2Style
  );
  labelTitle.anchor = {
    x: 0,
    y: 0.5,
  };
  var startX = -240;
  var startY = 0;
  var padding = 40; // this.createParametr({ type: 'slider', container: this.panelBonuses3, x: startX, sliderShiftX: 60, y: startY, label: 'Duration:', parametr: this.field.config.bonusKittyDuration, min: 0, max: 30 });

  this.createParametr({
    type: "slider",
    container: this.panelBonuses3,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 0,
    label: "Kitty speed:",
    parametr: this.field.config.bonusKittySpeed,
    min: 0,
    max: 300,
  });
  var labelTitle2 = createLabel(
    this.panelBonuses3,
    -240,
    startY + padding * 1 + 30,
    "Gravity Well:",
    this.labelH2Style
  );
  labelTitle2.anchor = {
    x: 0,
    y: 0.5,
  };
  startY = startY + padding * 1 + 30 + 30; // this.createParametr({ type: 'slider', container: this.panelBonuses3, x: startX, sliderShiftX: 60, y: startY, label: 'Duration:', parametr: this.field.config.bonusGravityWellDuration, min: 0, max: 30 });

  this.createParametr({
    type: "slider",
    container: this.panelBonuses3,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 0,
    label: "Radius:",
    parametr: this.field.config.bonusGravityWellRadius,
    min: 10,
    max: 200,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses3,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 1,
    label: "Power:",
    parametr: this.field.config.bonusGravityWellPower,
    min: 1,
    max: 10,
  });
  var labelTitle3 = createLabel(
    this.panelBonuses3,
    -240,
    startY + padding * 2 + 30,
    "Dodge Sounds:",
    this.labelH2Style
  );
  labelTitle3.anchor = {
    x: 0,
    y: 0.5,
  };
  startY = startY + padding * 2 + 30 + 30; // this.createParametr({ type: 'slider', container: this.panelBonuses3, x: startX, sliderShiftX: 60, y: startY, label: 'Duration:', parametr: this.field.config.bonusGravityWellDuration, min: 0, max: 30 });

  this.createParametr({
    type: "slider",
    container: this.panelBonuses3,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 0,
    label: "Sound Hit Paddle:",
    parametr: this.field.config.dodgeHitPaddleSound,
    min: 0,
    max: 1,
    step: 1,
    intOnly: true,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses3,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 1,
    label: "Sound Hit Wall:",
    parametr: this.field.config.dodgeHitWallSound,
    min: 0,
    max: 1,
    step: 1,
    intOnly: true,
  });
  this.pages.push({
    name: "bonuses3",
    container: this.panelBonuses3,
  });
};

NORD.PanelSettings.prototype.createPanelBoards1 = function () {
  this.panelBoards1 = new PIXI.Container();
  this.addChild(this.panelBoards1);
  this.panelBoards1.y = -120;
  this.panelBoards1.visible = false;
  var labelTitle = createLabel(
    this.panelBoards1,
    -240,
    -30,
    "Multiball:",
    this.labelH2Style
  );
  labelTitle.anchor = {
    x: 0,
    y: 0.5,
  };
  var startX = -240;
  var startY = 0;
  var padding = 40;
  this.createParametr({
    type: "slider",
    container: this.panelBoards1,
    x: startX,
    sliderShiftX: 60,
    y: startY,
    label: "Ball speed:",
    parametr: this.field.config.multiballModeBallMaxSpeed,
    min: 1,
    max: 15,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBoards1,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding,
    label: "New ball delay:",
    parametr: this.field.config.multiballModeNewBallDelay,
    min: 0,
    max: 2,
  }); // const labelTitle2 = createLabel(this.panelBoards1, -240, startY + padding + 30, 'Big Ball Little Paddles:', this.labelH2Style);
  // labelTitle2.anchor = { x:0, y: 0.5 };
  //
  // startY = startY + padding + 30 + 30;
  //
  // this.createParametr({ type: 'slider', container: this.panelBoards1, x: startX, sliderShiftX: 60, y: startY, label: 'Ball Size:', parametr: this.field.config.bblpModeBallSize, min: 10, max: 50 });

  var labelTitle3 = createLabel(
    this.panelBoards1,
    -240,
    startY + padding * 2 + 30,
    "Fire Zone:",
    this.labelH2Style
  );
  labelTitle3.anchor = {
    x: 0,
    y: 0.5,
  };
  startY = startY + padding * 2 + 30 + 30;
  this.createParametr({
    type: "slider",
    container: this.panelBoards1,
    x: startX,
    sliderShiftX: 60,
    y: startY,
    label: "Speed UP:",
    parametr: this.field.config.fireZoneModeSpeedUp,
    min: 1.0,
    max: 2,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBoards1,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 1,
    label: "Radius:",
    parametr: this.field.config.fireZoneModeRadius,
    min: 20.0,
    max: 150,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBoards1,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 2,
    label: "Ball min speed:",
    parametr: this.field.config.fireZoneModeBallMinSpeed,
    min: 2,
    max: 15,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBoards1,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 3,
    label: "Ball max speed:",
    parametr: this.field.config.fireZoneModeBallMaxSpeed,
    min: 2,
    max: 15,
  });
  this.pages.push({
    name: "boards1",
    container: this.panelBoards1,
  });
};

NORD.PanelSettings.prototype.createPanelBonuses4 = function () {
  this.panelBonuses4 = new PIXI.Container();
  this.addChild(this.panelBonuses4);
  this.panelBonuses4.y = -120;
  this.panelBonuses4.visible = false;
  var labelTitle = createLabel(
    this.panelBonuses4,
    -240,
    -30,
    "Breakout:",
    this.labelH2Style
  );
  labelTitle.anchor = {
    x: 0,
    y: 0.5,
  };
  var startX = -240;
  var startY = 0;
  var padding = 40;
  this.createParametr({
    type: "slider",
    container: this.panelBonuses4,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 0,
    label: "Columns:",
    parametr: this.field.config.breakoutColumns,
    min: 1,
    max: 7,
    step: 1,
    intOnly: true,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses4,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 1,
    label: "Breaks Count:",
    parametr: this.field.config.breakoutBreaksAtColumn,
    min: 3,
    max: 25,
    step: 1,
    intOnly: true,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses4,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 2,
    label: "Break Width:",
    parametr: this.field.config.breakoutBreakWidth,
    min: 5,
    max: 60,
    step: 1,
    intOnly: true,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses4,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 3,
    label: "Padding:",
    parametr: this.field.config.breakoutPadding,
    min: 0,
    max: 10,
    step: 1,
    intOnly: true,
  });
  var labelTitle2 = createLabel(
    this.panelBonuses4,
    -240,
    startY + padding * 4 + 30,
    "Shatter Paddle:",
    this.labelH2Style
  );
  labelTitle2.anchor = {
    x: 0,
    y: 0.5,
  };
  startY = startY + padding * 4 + 30 + 30;
  this.createParametr({
    type: "slider",
    container: this.panelBonuses4,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 0,
    label: "Max size:",
    parametr: this.field.config.shatterMaxSize,
    min: 2,
    max: 200,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses4,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 1,
    label: "Min size:",
    parametr: this.field.config.shatterMinSize,
    min: 2,
    max: 100,
  }); // const labelTitle2 = createLabel(
  //   this.panelBonuses4,
  //   -240,
  //   startY + padding * 1 + 30,
  //   "Invisible Wall:",
  //   this.labelH2Style
  // );
  // labelTitle2.anchor = { x: 0, y: 0.5 };
  // startY = startY + padding * 1 + 30 + 30;
  // // this.createParametr({ type: 'slider', container: this.panelBonuses3, x: startX, sliderShiftX: 60, y: startY, label: 'Duration:', parametr: this.field.config.bonusGravityWellDuration, min: 0, max: 30 });
  // this.createParametr({
  //   type: "slider",
  //   container: this.panelBonuses4,
  //   x: startX,
  //   sliderShiftX: 60,
  //   y: startY + padding * 0,
  //   label: "Width:",
  //   parametr: this.field.config.obstacleInvisibleWallWidth,
  //   min: 10,
  //   max: 200
  // });
  // this.createParametr({
  //   type: "slider",
  //   container: this.panelBonuses4,
  //   x: startX,
  //   sliderShiftX: 60,
  //   y: startY + padding * 1,
  //   label: "Height:",
  //   parametr: this.field.config.obstacleInvisibleWallHeight,
  //   min: 10,
  //   max: 200
  // });
  // this.createParametr({
  //   type: "slider",
  //   container: this.panelBonuses4,
  //   x: startX,
  //   sliderShiftX: 60,
  //   y: startY + padding * 2,
  //   label: "Blink duration:",
  //   parametr: this.field.config.obstacleInvisibleWallBlinkDuration,
  //   min: 1,
  //   max: 5
  // });
  // this.createParametr({
  //   type: "slider",
  //   container: this.panelBonuses4,
  //   x: startX,
  //   sliderShiftX: 60,
  //   y: startY + padding * 3,
  //   label: "SpeedUp:",
  //   parametr: this.field.config.obstacleInvisibleWallSpeedUpK,
  //   min: 1.0,
  //   max: 2.0
  // });

  this.pages.push({
    name: "bonuses4",
    container: this.panelBonuses4,
  });
};

NORD.PanelSettings.prototype.createPanelBonuses5 = function () {
  this.panelBonuses5 = new PIXI.Container();
  this.addChild(this.panelBonuses5);
  this.panelBonuses5.y = -120;
  this.panelBonuses5.visible = false; // const labelTitle = createLabel(
  //   this.panelBonuses5,
  //   -240,
  //   -30,
  //   "Breakout:",
  //   this.labelH2Style
  // );
  // labelTitle.anchor = { x: 0, y: 0.5 };

  var startX = -240;
  var startY = 0;
  var padding = 40;
  var labelTitle2 = createLabel(
    this.panelBonuses5,
    -240,
    -30,
    "Robo:",
    this.labelH2Style
  );
  labelTitle2.anchor = {
    x: 0,
    y: 0.5,
  }; // this.createParametr({ type: 'slider', container: this.panelBonuses3, x: startX, sliderShiftX: 60, y: startY, label: 'Duration:', parametr: this.field.config.bonusGravityWellDuration, min: 0, max: 30 });

  this.createParametr({
    type: "slider",
    container: this.panelBonuses5,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 0,
    label: "Speed:",
    parametr: this.field.config.roboSpeed,
    min: 10,
    max: 200,
    step: 1,
    intOnly: true,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses5,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 1,
    label: "Shoot Delay:",
    parametr: this.field.config.roboShootDelay,
    min: 1,
    max: 20,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses5,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 2,
    label: "Health:",
    parametr: this.field.config.roboHealth,
    min: 1,
    max: 10,
    step: 1,
    intOnly: true,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses5,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 3,
    label: "Bullet Speed:",
    parametr: this.field.config.roboBulletSpeed,
    min: 1,
    max: 10,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses5,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 4,
    label: "Robo Size:",
    parametr: this.field.config.roboSize,
    min: 0.2,
    max: 1,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses5,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 5,
    label: "Guns Angle:",
    parametr: this.field.config.roboGunsAngle,
    min: 30,
    max: 180,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses5,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 6,
    label: "Move easing:",
    parametr: this.field.config.roboMoveEase,
    min: 0,
    max: 1,
    step: 1,
    intOnly: true,
  });
  this.pages.push({
    name: "bonuses5",
    container: this.panelBonuses5,
  });
};

NORD.PanelSettings.prototype.createPanelBonuses6 = function () {
  this.panelBonuses6 = new PIXI.Container();
  this.addChild(this.panelBonuses6);
  this.panelBonuses6.y = -120;
  this.panelBonuses6.visible = false;
  var labelTitle = createLabel(
    this.panelBonuses6,
    -240,
    -30,
    "Dodge balls:",
    this.labelH2Style
  );
  labelTitle.anchor = {
    x: 0,
    y: 0.5,
  };
  var startX = -240;
  var startY = 0;
  var padding = 40;
  this.createParametr({
    type: "slider",
    container: this.panelBonuses6,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 0,
    label: "Balls Count:",
    parametr: this.field.config.dodgeBallsCount,
    min: 2,
    max: 10,
    step: 1,
    intOnly: true,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses6,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 1,
    label: "Immunity Time:",
    parametr: this.field.config.dodgeImmortalTime,
    min: 0.5,
    max: 5,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses6,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 2,
    label: "Speed Up:",
    parametr: this.field.config.dodgeModeSpeedUp,
    min: 1.0,
    max: 1.5,
  });
  var labelTitle2 = createLabel(
    this.panelBonuses6,
    -240,
    startY + padding * 3 + 30,
    "Flappy pong:",
    this.labelH2Style
  );
  labelTitle2.anchor = {
    x: 0,
    y: 0.5,
  };
  startY = startY + padding * 3 + 30 + 30;
  this.createParametr({
    type: "slider",
    container: this.panelBonuses6,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 0,
    label: "Jumps per second:",
    parametr: this.field.config.flappyJumpsPerSecond,
    min: 1,
    max: 10,
    step: 1,
    intOnly: true,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses6,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 1,
    label: "Fall SpeedUp:",
    parametr: this.field.config.flappyFallSpeedUp,
    min: 0,
    max: 2,
  });
  this.createParametr({
    type: "slider",
    container: this.panelBonuses6,
    x: startX,
    sliderShiftX: 60,
    y: startY + padding * 2,
    label: "Jump SpeedUp:",
    parametr: this.field.config.flappyJumpSpeedUp,
    min: 5,
    max: 30,
  });
  this.pages.push({
    name: "bonuses6",
    container: this.panelBonuses6,
  });
};

NORD.PanelSettings.prototype.createParametr = function (data) {
  var type = data.type || "slider";
  var parametr = data.parametr;
  var container = data.container;

  if (type === "slider") {
    var updateParametr = function updateParametr() {
      slider.value = parametr.value;
      stepper.value = parametr.value;
    };

    var label = createLabel(
      container,
      data.x,
      data.y,
      data.label,
      this.labelStyle
    );
    label.anchor = {
      x: 0,
      y: 0.5,
    };
    var slider = new NORD.Controls.Slider(
      {
        parentPanel: this,
        container: container,
        x: data.x + 150 + (data.sliderShiftX || 0),
        y: data.y,
      },
      {
        intOnly: data.intOnly || false,
        min: data.min,
        max: data.max,
        orientation: "horizontal",
        sliderLength: 100,
      }
    );
    slider.state.on(
      "value_change",
      function (data) {
        parametr.value = data.value;
      },
      this
    );
    var stepper = new NORD.Controls.NumberStepper({
      panel: this,
      step: data.step,
      min: data.min,
      max: data.max,
    });
    container.addChild(stepper);
    stepper.x = data.x + 260 + (data.sliderShiftX || 0);
    stepper.y = data.y;
    stepper.state.on(
      "value_change",
      function (data) {
        parametr.value = data.value;
      },
      this
    );
    parametr.on(
      "change",
      function () {
        updateParametr();
      },
      this
    );
    updateParametr();
  }
};

NORD.PanelSettings.prototype.tween = function (data, callback) {
  var self = this;

  if (data.name == "show_anim" && this.state == "hide") {
    this.state = "show_anim";
    this.visible = true;
    this.alpha = 0;
    var time = 20 / 30;
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
    this.field.setPause(true);
  }

  if (data.name == "hide_anim" && this.state == "show") {
    this.state = "hide_anim";
    this.interactiveChildren = false;
    var time = 20 / 30;
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
        self.field.setPause(false);
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

var createLabel = function createLabel(parent, x, y, s) {
  var style =
    arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var defaultStyle = {
    fontFamily: "Arial",
    fontSize: 24,
    fill: 0xffffff,
    align: "center",
  };
  var text = new PIXI.Text(s, style || defaultStyle);
  text.anchor = {
    x: 0.5,
    y: 0.5,
  };
  parent.addChild(text);
  text.interactive = false;
  text.x = x;
  text.y = y;
  return text;
};

var Label = function Label() {};

var PaddleView = function PaddleView() {
  PIXI.Container.call(this);
  this.radius = 0;
  this.paddleHeight = 0; // this.graphics = new PIXI.Graphics();
  // this.addChild(this.graphics);
  //
  // this.graphics.lineStyle(1, 0xFFFFFF);
  // this.graphics.drawCircle(0, 0, 50);
  //
  // this.maskGraphics = new PIXI.Graphics();
  // this.addChild(this.maskGraphics);
  // this.maskGraphics.beginFill(0xFFFFFF);
  // this.maskGraphics.drawRect(-200, -400, 200, 800);
  //
  // this.graphics.mask = this.maskGraphics;

  this.setSize(0.5, 60);
};

PaddleView.prototype = Object.create(PIXI.Container.prototype);
PaddleView.prototype.constructor = PaddleView;

PaddleView.prototype.setSize = function (radiusP, height) {
  var platformSize =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
  // if(radiusP > 1) radiusP = 1;
  this.radiusP = radiusP;
  this.radius = (0.5 + radiusP) * height;
  this.paddleHeight = height;
  this.shift = Math.sqrt(
    this.radius * this.radius -
      (this.paddleHeight / 2) * (this.paddleHeight / 2)
  );

  if (this.graphics) {
    this.graphics.clear();
    this.removeChild(this.graphics);
    this.graphics = null;
  }

  var vertices = createPaddle(height, radiusP, platformSize, 180);
  this.graphics = drawVertices(vertices);
  this.addChild(this.graphics);
  this.graphics.x = this.shift; // this.graphics.clear();
  // this.graphics.lineStyle(1, 0xFFFFFF);
  // this.graphics.drawCircle(this.shift, 0, this.radius);
  // this.graphics.moveTo(0, -this.paddleHeight/2);
  // this.graphics.lineTo(0, this.paddleHeight/2);
};

var BallView = function BallView() {
  PIXI.Container.call(this);
  this.radius = 0;
  this.graphics = new PIXI.Graphics();
  this.addChild(this.graphics);
  this.setSize(10);
};

BallView.prototype = Object.create(PIXI.Container.prototype);
BallView.prototype.constructor = BallView;

BallView.prototype.setSize = function (radius) {
  this.radius = radius;
  this.graphics.clear();
  this.graphics.lineStyle(1, 0xffffff);
  this.graphics.drawCircle(0, 0, this.radius);
};
