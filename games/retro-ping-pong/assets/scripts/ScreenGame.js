"use strict";

NORD.ScreenGame = function (config) {
  config.sizeType = "relative";
  config.widthRelative = 1;
  config.heightRelative = 1;
  NORD.GUI.BasePanel.call(this, config);
  var self = this;
  this.state = "hide";
  this.visible = false;
  this.interactiveChildren = false;
  this.interactive = false; // this.alpha = 0;

  this.field = NORD.game.field;
  this.addChild(this.field);
  this.panelEndGame = new NORD.PanelEndGame({
    name: "panel_end_game",
    parentPanel: NORD.GUIManager.stage,
    container: this,
  });
  this.panelEndGame.visible = false;
  this.panelPause = new NORD.PanelPause({
    name: "panel_pause",
    parentPanel: NORD.GUIManager.stage,
    container: this,
  });
  this.panelPause.visible = false;
  this.field.on("init_game", function () {
    // self.updateScore();
  });
  this.field.on("goal", function () {
    // self.updateScore();
  });
  this.field.on(
    "round_complete",
    function () {
      setTimeout(function () {
        self.field.initRound();
      }, 1000);
    },
    this
  );
  this.field.on(
    "round_ready",
    function () {
      var _this = this;

      if (this.field.roundN !== 0) {
        TweenMax.delayedCall(1.0, function () {
          _this.field.startRound();
        });
      }
    },
    this
  );
  this.field.on(
    "game_complete",
    function (data) {
      // const { winner, playerLeftScore, playerRightScore } = data;
      var winner = data.winner;
      var playerLeftScore = data.playerLeftScore;
      var playerRightScore = data.playerRightScore;
      this.field.clear(); // this.field.initGame(self.createBoard(self.boardName));

      this.panelEndGame.show({
        winner: winner,
        playerLeftScore: playerLeftScore,
        playerRightScore: playerRightScore,
      }); // setTimeout(function()
      // {
      //   self.field.clear();
      //   self.field.initGame(self.createBoard(self.boardName));
      //   setTimeout(function()
      //   {
      //     self.field.startGame();
      //   }, 1000);
      // }, 1000);
    },
    this
  );

  if (window.localStorage.enable_settings) {
    this.buttonSettings = Util.createButton(
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
        texture: "button_settings.png",
        aX: 0.5,
        aY: 0.5,
      }
    );
    this.buttonSettings.on(
      "button_click",
      function (data) {
        NORD.game.panelSettings.tween({
          name: "show_anim",
        });
      },
      this
    );
  }

  this.buttonPause = Util.createButton(
    "btn",
    this,
    null,
    "xRelative",
    10,
    -480 / 2 + 32 / 2 + 30,
    32,
    32,
    NORD.game.tweenClickSimple,
    NORD.game.soundClickSimple(),
    {
      atlas: "texture_atlas",
      texture: "button_pause.png",
      aX: 0.5,
      aY: 0.5,
    }
  );
  this.buttonPause.on(
    "button_click",
    function (data) {
      var _this2 = this;

      if (this.state !== "show" || this.panelEndGame.state !== "hide") return;
      TweenMax.delayedCall(0.07 * 2, function () {
        _this2.panelPause.show();
      }); // this.toMainMenu();
    },
    this
  ); // this.logo = Util.createSprite({ atlas: 'texture_atlas', texture: 'logo.png', parent: this, aX: 0.5, aY: 0.5 });

  NORD.app.on("update", this.update, this);

  NORD.GUIManager.on("app_resize", this.onAppResize, this);
};

NORD.ScreenGame.prototype = Object.create(NORD.GUI.BasePanel.prototype);
NORD.ScreenGame.prototype.constructor = NORD.ScreenGame;

NORD.ScreenGame.prototype.onAppResize = function (data) {
  this.buttonPause.xRelative = -data.appWidth / 2 + 25;
};

NORD.ScreenGame.prototype.update = function () {
  var paddle = this.field.paddleLeft;
  if (!paddle) return; // console.log(paddle.y);

  if (paddle.y < -125) this.buttonPause.alpha = 0.2;
  else this.buttonPause.alpha = 1.0;
}; // NORD.ScreenGame.prototype.updateScore = function()
// {
//   this.scoreLeft.setScore(this.field.playerLeft.roundScore);
//   this.scoreRight.setScore(this.field.playerRight.roundScore);
// }

NORD.ScreenGame.prototype.toGame = function (board) {
  var self = this;
  this.boardName = board;
  this.field.initGame(this.createBoard(this.boardName));
  this.tween(
    {
      name: "show_anim",
    },
    function () {
      TweenMax.delayedCall(0.2, function () {
        self.field.startGame();
      });
    }
  );
  this.panelEndGame.tween({
    name: "hide",
  });
};

NORD.ScreenGame.prototype.toMainMenu = function () {
  var self = this;
  TweenMax.killAll(false, false, true);
  this.tween(
    {
      name: "hide_anim",
    },
    function () {
      self.field.clear();
      NORD.game.screenMainMenu.toMainMenu();
    }
  );
};

NORD.ScreenGame.prototype.restart = function () {
  var self = this;
  this.field.initGame(self.createBoard(self.boardName));
  TweenMax.delayedCall(0.2, function () {
    self.field.startGame();
  });
};

NORD.ScreenGame.prototype.createBoard = function (boardName) {
  return function () {
    // console.log('CreateBoard:', boardName);
    var board = null;
    if (boardName === "board_1")
      board = new NORD.Field.BoardPlanks({
        name: "PLANKS",
      });
    if (boardName === "board_2")
      board = new NORD.Field.BoardClassic({
        name: "CLASSIC",
      });
    if (boardName === "board_3")
      board = new NORD.Field.BoardDiamond({
        name: "DIAMOND",
      });
    return board;
  };
};

NORD.ScreenGame.prototype.tween = function (data, callback) {
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
    this.interactive = false;
    if (callback) callback();
  }
};

NORD.ScreenGame.ScoreText = function () {
  PIXI.Container.call(this);
  this.sprite = Util.createSprite({
    parent: this,
    atlas: "texture_atlas",
    texture: "score_number_0001.png",
    aX: 0.5,
    aY: 0.5,
    scaleXY: 0.5,
  });
};

NORD.ScreenGame.ScoreText.prototype = Object.create(PIXI.Container.prototype);
NORD.ScreenGame.ScoreText.prototype.constructor = NORD.ScreenGame.ScoreText;

NORD.ScreenGame.ScoreText.prototype.setScore = function (score) {
  this.score = score;
  var texture = NORD.assetsManager.getTexture(
    "texture_atlas",
    "score_number_000" + String(this.score + 1) + ".png"
  );
  this.sprite.texture = texture;
};

NORD.PanelEndGame = function (config) {
  config.sizeType = "relative";
  config.width = 300;
  config.height = 300;
  NORD.GUI.BasePanel.call(this, config);
  var self = this;
  this.state = "hide";
  this.visible = false;
  this.interactiveChildren = false; // this.alpha = 0;

  this.bg = Util.createSprite({
    parent: this,
    atlas: "texture_atlas",
    texture: "panel_end_game_bg.png",
    aX: 0.5,
    aY: 0.5,
  });
  this.bg.scale.x = this.bg.scale.y = 0.7;
  this.textWin = Util.createSprite({
    parent: this,
    y: -48,
    atlas: "texture_atlas",
    texture: "text_computer_win.png",
    aX: 0.5,
    aY: 0.5,
  });
  this.textWin.scale.x = this.textWin.scale.y = 0.66;
  this.buttonHome = Util.createButton(
    "btn",
    this,
    null,
    "",
    -52,
    48,
    100,
    100,
    NORD.game.tweenClickSimple,
    NORD.game.soundClickSimple(),
    {
      atlas: "texture_atlas",
      texture: "button_home.png",
      aX: 0.5,
      aY: 0.5,
      scaleXY: 0.5,
    }
  );
  this.buttonHome.on(
    "button_click",
    function (data) {
      showAd();
      
      var _this3 = this;

      if (this.state !== "show") return;
      TweenMax.delayedCall(0.07 * 2, function () {
        _this3.tween(
          {
            name: "hide",
          },
          function () {
            NORD.game.screenGame.buttonPause.regularSkin.alpha = 1.0;
            NORD.game.screenGame.toMainMenu();
          }
        );
      });
    },
    this
  );
  this.buttonRestart = Util.createButton(
    "btn",
    this,
    null,
    "",
    52,
    48,
    100,
    100,
    NORD.game.tweenClickSimple,
    NORD.game.soundClickSimple(),
    {
      atlas: "texture_atlas",
      texture: "button_restart.png",
      aX: 0.5,
      aY: 0.5,
      scaleXY: 0.5,
    }
  );
  this.buttonRestart.on(
    "button_click",
    function (data) {
      showAd();

      var _this4 = this;

      if (this.state !== "show") return;
      TweenMax.delayedCall(0.07 * 2, function () {
        _this4.tween(
          {
            name: "hide_anim",
          },
          function () {
            NORD.game.screenGame.restart();
            NORD.app.apiCallback("replay");
          }
        );
      });
    },
    this
  ); // this.scoreLeft = new NORD.ScreenGame.ScoreText();
  // this.addChild(this.scoreLeft);
  // this.scoreLeft.x = -35;
  // this.scoreLeft.y = -4;
  //
  // this.scoreLine = Util.createSprite({ parent: this, y: -4, atlas: 'texture_atlas', texture: 'score_line.png', aX: 0.5, aY: 0.5 });
  // this.addChild(this.scoreLine);
  //
  // this.scoreRight = new NORD.ScreenGame.ScoreText();
  // this.addChild(this.scoreRight);
  // this.scoreRight.x = 35;
  // this.scoreRight.y = -4;
  //
  // this.scoreLeft.scale.x = this.scoreRight.scale.x = this.scoreLeft.scale.y = this.scoreRight.scale.y = 0.70;
  // this.scoreLine.scale.x = this.scoreLine.scale.y = 0.70;
  // this.scoreLeft.scale = this.scoreRight.scale = { x: 0.8, y: 0.8 };
  // this.scoreLeft.width = this.scoreRight.width = 44;
  // this.scoreLeft.height = this.scoreRight.height = 44;
};

NORD.PanelEndGame.prototype = Object.create(NORD.GUI.BasePanel.prototype);
NORD.PanelEndGame.prototype.constructor = NORD.PanelEndGame;

NORD.PanelEndGame.prototype.setText = function (winner) {
  var texture = null;
  if (winner === "AI")
    texture = NORD.assetsManager.getTexture(
      "texture_atlas",
      "text_computer_win.png"
    );
  if (winner === "PLAYER")
    texture = NORD.assetsManager.getTexture(
      "texture_atlas",
      "text_player_win.png"
    );
  if (winner === "PLAYER_LEFT")
    texture = NORD.assetsManager.getTexture(
      "texture_atlas",
      "text_player_1_win.png"
    );
  if (winner === "PLAYER_RIGHT")
    texture = NORD.assetsManager.getTexture(
      "texture_atlas",
      "text_player_2_win.png"
    );
  this.textWin.texture = texture;
};

NORD.PanelEndGame.prototype.show = function (data) {
  //const { winner, playerLeftScore, playerRightScore } = data;
  var winner = data.winner;
  var playerLeftScore = data.playerLeftScore;
  var playerRightScore = data.playerRightScore; // this.scoreLeft.setScore(playerLeftScore);
  // this.scoreRight.setScore(playerRightScore);

  this.setText(winner);
  this.tween({
    name: "show_anim",
  }); // console.log(this.visible, this.alpha, this.state);
};

NORD.PanelEndGame.prototype.tween = function (data, callback) {
  var self = this;

  if (data.name == "show_anim" && this.state == "hide") {
    this.state = "show_anim";
    this.visible = true;
    this.alpha = 0;
    this.y = -30;
    TweenMax.to(NORD.game.screenGame.buttonPause.regularSkin, 6 / 30, {
      alpha: 0,
      ease: Power2.easeOut,
    });
    var time = 6 / 30;
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
    this.state = "hide_anim";
    this.interactiveChildren = false;
    TweenMax.to(NORD.game.screenGame.buttonPause.regularSkin, 6 / 30, {
      alpha: 1,
      ease: Power2.easeOut,
    });
    var time = 6 / 30;
    TweenMax.to(this, time, {
      alpha: 0,
      x: 0,
      y: -30,
      ease: Power2.easeOut,
      onComplete: function onComplete() {
        self.tween(
          {
            name: "hide",
          },
          callback
        );
      },
    }); // this.tween({ name: 'hide' }, callback);
  }

  if (data.name == "show" && this.state != "show") {
    this.state = "show";
    this.visible = true;
    this.interactiveChildren = true;
    this.alpha = 1.0;
    if (callback) callback();
  }

  if (data.name == "hide") {
    this.state = "hide";
    this.visible = false;
    this.interactiveChildren = false;
    if (callback) callback();
  }
};

NORD.PanelPause = function (config) {
  config.sizeType = "relative";
  config.width = 300;
  config.height = 300;
  NORD.GUI.BasePanel.call(this, config);
  var self = this;
  this.state = "hide";
  this.visible = false;
  this.interactiveChildren = false; // this.alpha = 0;

  this.bg = Util.createSprite({
    parent: this,
    atlas: "texture_atlas",
    texture: "panel_pause_bg.png",
    aX: 0.5,
    aY: 0.5,
  });
  this.buttonHome = Util.createButton(
    "btn",
    this,
    null,
    "",
    0,
    -19,
    234,
    84,
    NORD.game.tweenClickSimple,
    NORD.game.soundClickSimple(),
    {
      atlas: "texture_atlas",
      texture: "button_resume.png",
      aX: 0.5,
      aY: 0.5,
      scaleXY: 0.5,
    }
  );
  this.buttonHome.on(
    "button_click",
    function (data) {
      var _this5 = this;

      if (this.state !== "show") return;
      TweenMax.delayedCall(0.07 * 2, function () {
        _this5.hide();
      });
    },
    this
  );
  this.buttonMenu = Util.createButton(
    "btn",
    this,
    null,
    "",
    47,
    63,
    100,
    100,
    NORD.game.tweenClickSimple,
    NORD.game.soundClickSimple(),
    {
      atlas: "texture_atlas",
      texture: "button_home.png",
      aX: 0.5,
      aY: 0.5,
      scaleXY: 0.5,
    }
  );
  this.buttonMenu.on(
    "button_click",
    function (data) {
      var _this6 = this;

      if (this.state !== "show") return;
      TweenMax.delayedCall(0.07 * 2, function () {
        // this.hide({}, () =>
        // {
        //   NORD.game.screenGame.toMainMenu();
        // });
        _this6.tween(
          {
            name: "hide",
          },
          function () {
            NORD.app.apiCallback("statistics", "exit");
            NORD.game.screenGame.buttonPause.regularSkin.alpha = 1.0;
            NORD.game.field.setPause(false);
            NORD.game.screenGame.toMainMenu();
          }
        );
      });
    },
    this
  );
  var audioButton = new NORD.GUI.ButtonAudio({
    parentPanel: this,
    x: -47,
    y: 63,
    width: 100,
    height: 100,
    soundClick: NORD.assetsManager.getAsset("sound_click"),
    skin: {
      on: {
        atlas: "texture_atlas",
        texture: "button_audio_big_0001.png",
      },
      off: {
        atlas: "texture_atlas",
        texture: "button_audio_big_0002.png",
      },
    },
  });
};

NORD.PanelPause.prototype = Object.create(NORD.GUI.BasePanel.prototype);
NORD.PanelPause.prototype.constructor = NORD.PanelPause;

NORD.PanelPause.prototype.show = function (data) {
  NORD.game.field.setPause(true);
  TweenMax.pauseAll();
  this.tween({
    name: "show_anim",
  });
};

NORD.PanelPause.prototype.hide = function (data, callback) {
  this.tween(
    {
      name: "hide_anim",
    },
    function () {
      NORD.game.field.setPause(false);
      TweenMax.resumeAll();
      if (callback) callback();
    }
  );
};

NORD.PanelPause.prototype.tween = function (data, callback) {
  var self = this;

  if (data.name == "show_anim" && this.state == "hide") {
    this.state = "show_anim";
    this.visible = true;
    this.alpha = 0;
    this.y = -30;
    var time = 6 / 30;
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
    this.state = "hide_anim";
    this.interactiveChildren = false;
    TweenMax.to(NORD.game.screenGame.buttonPause.regularSkin, 6 / 30, {
      alpha: 1,
      ease: Power2.easeOut,
    });
    var time = 6 / 30;
    TweenMax.to(this, time, {
      alpha: 0,
      x: 0,
      y: -30,
      ease: Power2.easeOut,
      onComplete: function onComplete() {
        self.tween(
          {
            name: "hide",
          },
          callback
        );
      },
    }); // this.tween({ name: 'hide' }, callback);
  }

  if (data.name == "show" && this.state != "show") {
    this.state = "show";
    this.visible = true;
    this.interactiveChildren = true;
    this.alpha = 1.0;
    if (callback) callback();
  }

  if (data.name == "hide") {
    this.state = "hide";
    this.visible = false;
    this.interactiveChildren = false;
    if (callback) callback();
  }
};
