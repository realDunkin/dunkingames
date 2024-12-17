"use strict";

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

NORD.initGameDefinitions = function () {
  NORD.definitionsManager.appSize = {
    widthMin: 640,
    widthMax: 2640,
    heightMin: 480,
    heightMax: Util.isMobile() ? 2500 : 480,
  };
  NORD.definitionsManager.stageColor = 0x00003a;
  NORD.definitionsManager.appName = "Retro-Ping-Pong";
  NORD.definitionsManager.appVersion = "1.0"; // NORD.definitionsManager.colorYellow = 0xC2C200;

  NORD.definitionsManager.colorYellow = 0xded704;
  NORD.definitionsManager.avaiableDomains = [
    "localhost",
    "z-var.ru",
    "coolmath-games.com",
    "coolmathgames.com",
    "edit.coolmath-games.com",
    "stage.coolmath-games.com",
    "edit-stage.coolmath-games.com",
    "dev.coolmath-games.com",
    "m.coolmath-games.com",
    "coolmathgames.com",
    "coolmathgames.com",
    "edit.coolmathgames.com",
    "stage.coolmathgames.com",
    "edit-stage.coolmathgames.com",
    "dev.coolmathgames.com",
    "m.coolmathgames.com",
    "edit.coolmathgames.com", 
    "www.coolmathgames.com",
    "edit.coolmathgames.com",
    "stage.coolmathgames.com",
    "stage-edit.coolmathgames.com"
  ];
  NORD.definitionsManager.assetsGroupBoot = new AssetsGroup("boot", [
    {
      name: "preloader_bar_border",
      url: "assets/preloader/preloader_bar_border.png",
    },
    {
      name: "preloader_bar",
      url: "assets/preloader/preloader_bar.png",
    },
  ]);
  var audioFormats = [".ogg", ".m4a"];
  NORD.definitionsManager.assetsGroupMain = new AssetsGroup("main", [
    {
      name: "texture_atlas",
      url: "assets/texture_atlas.json",
    },
    {
      name: "texture_atlas_robo",
      url: "assets/texture_atlas_robo.json",
    },
    {
      name: "rotate_screen",
      url: "assets/preloader/rotate_screen.png",
    },
    {
      name: "d_line",
      url: "assets/preloader/d_line.png",
    },
    {
      name: "data",
      url: "assets/data.json",
    },
    {
      name: "PH_92",
      url: "assets/fonts/PH_92.fnt",
    },
    {
      name: "PH_46",
      url: "assets/fonts/PH_46.fnt",
    },
    {
      type: "AUDIO",
      name: "sound_click",
      url: "assets/audio/sound_click",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "wall_hit_big_ball",
      url: "assets/audio/wall_hit_big_ball",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "wall_hit_ball",
      url: "assets/audio/wall_hit_ball",
      formats: audioFormats,
      volume: 0.6,
    },
    {
      type: "AUDIO",
      name: "ready",
      url: "assets/audio/ready",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "player2_hit_big_ball",
      url: "assets/audio/player2_hit_big_ball",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "player1_hit_big_ball",
      url: "assets/audio/player1_hit_big_ball",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "player2_hit_ball",
      url: "assets/audio/player2_hit_ball",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "player1_hit_ball",
      url: "assets/audio/player1_hit_ball",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "player_win",
      url: "assets/audio/player_win",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "player_goal",
      url: "assets/audio/player_goal",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "play_button",
      url: "assets/audio/play_button",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "kitty_hit_1",
      url: "assets/audio/kitty_hit_1",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "kitty_hit_2",
      url: "assets/audio/kitty_hit_2",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "go",
      url: "assets/audio/go",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "computer_win",
      url: "assets/audio/computer_win",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "computer_goal",
      url: "assets/audio/computer_goal",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "ball_start",
      url: "assets/audio/ball_start",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "ball_hit_bumper",
      url: "assets/audio/ball_hit_bumper",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "blaster_shoot",
      url: "assets/audio/blaster_shoot",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "shoot_hit",
      url: "assets/audio/shoot_hit",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "gravity_well",
      url: "assets/audio/gravity_well",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "ball_fire_ring",
      url: "assets/audio/ball_fire_ring",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "shatter_hit",
      url: "assets/audio/shatter_hit",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "brick_destroy",
      url: "assets/audio/brick_destroy",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "dodge_hit_paddle_2",
      url: "assets/audio/dodge_hit_paddle_2",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "dodge_hit_paddle",
      url: "assets/audio/dodge_hit_paddle",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "dodge_hit_wall_1",
      url: "assets/audio/dodge_hit_wall_1",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "dodge_hit_wall_2",
      url: "assets/audio/dodge_hit_wall_2",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "flappy_wing",
      url: "assets/audio/flappy_wing",
      formats: audioFormats,
      volume: 0.35,
    },
    {
      type: "AUDIO",
      name: "flappy_wing_left",
      url: "assets/audio/flappy_wing_left",
      formats: audioFormats,
      volume: 0.75,
    },
    {
      type: "AUDIO",
      name: "robo_appear",
      url: "assets/audio/robo_appear",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "robo_arm_destroy",
      url: "assets/audio/robo_arm_destroy",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "robo_regrow_arms",
      url: "assets/audio/robo_regrow_arms",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "robo_shoot",
      url: "assets/audio/robo_shoot",
      formats: audioFormats,
    },
    {
      type: "AUDIO",
      name: "shatter_hit_paddle_z",
      url: "assets/audio/shatter_hit_paddle_z",
      formats: audioFormats,
    },
  ]);
}; //=========================================================================================================================================================================//
//=========================================================================================================================================================================//
//=========================================================================================================================================================================//

NORD.App = function () {
  EventEmitter.call(this);
  NORD.App.instance = this;
  this.name = "NoName";
  this.version = "1.0";
  this.platform = "none";
  this.dt = 0;
  this.et = 0;
  this.etTime = performance.now();
  this.fps = 60;
  this.windowFocus = true;
  this.forUpdate = [];
  this.mouse = {
    x: 0,
    y: 0,
  };
  this.touches = []; // this.resizeCounter = 0;
};

NORD.App.prototype = Object.create(EventEmitter.prototype);
NORD.App.prototype.constructor = NORD.App;

NORD.App.prototype.init = function () {
  var self = this;
  NORD.initGameDefinitions();
  this.platform = Util.isMobile() ? "mobile" : "computer";
  this.name = NORD.definitionsManager.appName;
  this.version = NORD.definitionsManager.appVersion;
  NORD.interaction.addListener("mousemove", function (data) {
    NORD.app.mouseGlobal = Object.assign({}, data.data.global);
    NORD.app.mouse = NORD.GUIManager.stage.toLocal(data.data.global);
    NORD.app.touches[data.data.identifier] = Object.assign(
      {},
      NORD.app.mouseGlobal
    );
    self.emit("pointer_move", {
      mouse: NORD.app.mouse,
    });
  });
  NORD.interaction.addListener("touchmove", function (data) {
    NORD.app.mouseGlobal = Object.assign({}, data.data.global);
    NORD.app.mouse = NORD.GUIManager.stage.toLocal(data.data.global);
    NORD.app.touches[data.data.identifier] = Object.assign(
      {},
      NORD.app.mouseGlobal
    ); // console.log(data.data.identifier);

    self.emit("pointer_move", {
      mouse: NORD.app.mouse,
    });
  });
  NORD.interaction.addListener("pointerdown", function (data) {
    NORD.app.mouseGlobal = Object.assign({}, data.data.global);
    NORD.app.mouse = NORD.GUIManager.stage.toLocal(data.data.global); // console.log("F", data);

    NORD.app.touches[data.data.identifier] = Object.assign(
      {},
      NORD.app.mouseGlobal
    );
    self.emit("pointer_down", {
      mouse: NORD.app.mouse,
    }); // if(NORD.app.mouse.x > 0 && NORD.app.mouse.x < 200) self.emit('tap_right')
    // else if(NORD.app.mouse.x < 0 && NORD.app.mouse.x > -200) self.emit('tap_left');

    var side = NORD.app.mouse.x >= 0 ? "RIGHT" : "LEFT";
    if (side === "RIGHT") self.emit("tap_right");
    else self.emit("tap_left");
    self.emit("tap", side);
  });
  NORD.interaction.addListener("pointerup", function (data) {
    NORD.app.mouseGlobal = Object.assign({}, data.data.global);
    NORD.app.mouse = NORD.GUIManager.stage.toLocal(data.data.global);
    NORD.app.touches[data.data.identifier] = Object.assign(
      {},
      NORD.app.mouseGlobal
    );
    self.emit("pointer_up", {
      mouse: NORD.app.mouse,
    });
  });
  NORD.GUIManager.on("app_resize", this.onAppResize, this);
  NORD.GUIManager.setAppSize(
    NORD.definitionsManager.appSize.widthMin,
    NORD.definitionsManager.appSize.widthMax,
    NORD.definitionsManager.appSize.heightMin,
    NORD.definitionsManager.appSize.heightMax
  );

  console.log("App[" +this.name +"], version: " +this.version +", platform: " +this.platform);
};

NORD.App.prototype.boot = function () {
  /* if (
    NORD.definitionsManager.avaiableDomains.length &&
    !Util.isDomainAvaiable(NORD.definitionsManager.avaiableDomains)
  )
    return; */
  var self = this;
  NORD.definitionsManager.assetsGroupBoot.once("loading_complete", function () {
    self.emit("boot_loaded");
  });
  NORD.definitionsManager.assetsGroupBoot.load();
};

NORD.App.prototype.onAppResize = function (data) {};

NORD.App.prototype.windowFocusChange = function (focus) {
  if (this.windowFocus == focus) return;
  this.windowFocus = focus;

  if (this.windowFocus) {
  } else {
  }
}; // NORD.App.prototype.addForUpdate = function(f, context)
// {
// 	if(context == undefined) context = null;
// 	this.forUpdate.push({f: f, context: context});
// }
// NORD.App.prototype.removeForUpdate = function(f)
// {
// 	var n = this.forUpdate.indexOf(f);
// 	if(n == -1) return;
// 	this.forUpdate.splice(n, 1);
// }
// NORD.App.prototype.update = function()
// {
// 	for(var i = 0; i < this.forUpdate.length; i++)
// 	{
// 		if(this.forUpdate[i].context != null) this.forUpdate[i].f.call(this.forUpdate[i].context);
// 		else this.forUpdate[i].f();
// 	}
//   // console.log(interaction.mouse.global);
// };

NORD.App.prototype.update = function () {
  this.emit("update_before");
  this.emit("update");
  this.emit("update_after");
};

var normalEt = 1000 / 1000 / 60;
var maxDif = normalEt * 0.3;
var shift = 0;

NORD.App.prototype.loop = function (time) {
  requestAnimationFrame(NORD.app.loop); // Emulate low FPS

  if (isAdBreakActive) return;

  // setTimeout(() => {
  //   NORD.app.loop(Date.now());
  // }, (1000 / 1000 / 20) * 1000);

  var tt = (time - NORD.app.etTime) * 0.001;

  if (tt < normalEt * 0.9) {
    // console.log("skip frame");
    return;
  } // console.log("do frame", tt);

  NORD.app.et = tt;
  NORD.app.etTime = time;
  var dif = NORD.app.et - normalEt; // console.log(dif);

  if (dif > maxDif) {
    var count = Math.floor(NORD.app.et / normalEt);
    shift += NORD.app.et - count * normalEt;
    var fb = Math.floor(shift / normalEt);
    shift -= fb * normalEt;
    count += fb;

    if (count > 10) {
      count = 10;
    } // console.log(count);

    for (var i = 0; i < count; i++) {
      NORD.app.update();
    }
  } else NORD.app.update();

  NORD.renderer.render(NORD.GUIManager.rootContainer);
};

NORD.App.prototype.apiCallback = function (name, data) {
  // console.log('Api:', name, data);
  if (name == "statistics") {
    var statistics = "";
    if (NORD.game.config.mode == "classic") statistics += "1";
    else statistics += "2";
    if (NORD.game.config.players != "one") statistics += "0";
    else if (NORD.game.config.dificulty == "easy") statistics += "1";
    else if (NORD.game.config.dificulty == "medium") statistics += "2";
    else if (NORD.game.config.dificulty == "hard") statistics += "3";
    if (NORD.game.config.players != "one") statistics += "0";
    else if (data == "player") statistics += "1";
    else if (data == "computer") statistics += "2";
    else if (data == "exit") statistics += "3";
    statistics += NORD.game.config.gamesCount; // console.log('Statistics: ', statistics);

    /* if (parent && parent.cmgGameEvent) {
      parent.cmgDataEvent("data", statistics);
    } */

    return;
  }

  if (name == "statistics_point") {
    var _modesMap;

    var _statistics = "9";
    var modesMap =
      ((_modesMap = {}),
      _defineProperty(_modesMap, "KITTY", "01"),
      _defineProperty(_modesMap, "GRAVITY_WELL", "02"),
      _defineProperty(_modesMap, "SMALL_GRAVITY_WELL", "02"),
      _defineProperty(_modesMap, "INVISIBLE_AREA", "03"),
      _defineProperty(_modesMap, "INVISIBLE_WALL", "04"),
      _defineProperty(_modesMap, "DOUBLE_BALL", "05"),
      _defineProperty(_modesMap, "BIG_BALL_LITTLE_PADDLES", "06"),
      _defineProperty(_modesMap, "STUN_GUN", "07"),
      _defineProperty(_modesMap, "FIRE_ZONE", "08"),
      _defineProperty(_modesMap, "BUMPER", "09"),
      _defineProperty(_modesMap, "BREAKOUT", "10"),
      _defineProperty(_modesMap, "SHATTER", "11"),
      _defineProperty(_modesMap, "ROBO", "12"),
      _defineProperty(_modesMap, "DODGE", "13"),
      _defineProperty(_modesMap, "FLAPPY", "14"),
      _modesMap);
    if (NORD.game.config.dificulty == "easy") _statistics += "1";
    else if (NORD.game.config.dificulty == "medium") _statistics += "2";
    else if (NORD.game.config.dificulty == "hard") _statistics += "3";
    _statistics += modesMap[data.roundMode];
    if (data.win == "computer") _statistics += "2";
    else _statistics += "1"; // console.log('StatisticsPoint: ', data, statistics);

    /* if (parent && parent.cmgGameEvent) {
      parent.cmgDataEvent("data", _statistics);
    } */

    return;
  }

  /* if (parent && parent.cmgGameEvent) {
    // console.log('cmgEvent: ' + name + ',', data);
    if (data != null && data != undefined) parent.cmgGameEvent(name, data);
    else parent.cmgGameEvent(name);
  } */
}; // var fixedTimeStep = 1 / 60, maxSubSteps = 10, lastTimeMilliseconds;
// requestAnimationFrame(function animloop(timeMilliseconds){
//     requestAnimationFrame(animloop);
//     var timeSinceLastCall = 0;
//     if(timeMilliseconds !== undefined && lastTimeMilliseconds !== undefined){
//         timeSinceLastCall = (timeMilliseconds - lastTimeMilliseconds) / 1000;
//     }
//     // world.step(fixedTimeStep, timeSinceLastCall, maxSubSteps);
//     lastTimeMilliseconds = timeMilliseconds;
//     console.log(timeMilliseconds);
// }

NORD.App.instance = null;

NORD.App.getInstance = function () {
  return NORD.App.instance;
}; //=========================================================================================================================================================================//
//=========================================================================================================================================================================//
//=========================================================================================================================================================================//

NORD.Game = function () {
  EventEmitter.call(this);
  var self = this;
  this.screenPreloader = null;
  this.config = {
    players: "one",
    dificulty: "easy",
    mode: "action",
    gamesCount: 0,
    actionHintShows: 0,
    isActionPlayed: false, // isControlVSCompTutorial: false
  };
  this.isControlVSCompTutorial = false;
  this.isShootTutorial = false;
  this.isControlTutorial = false;
  this.isFlapTutorial = false;
  this.loadConfig();
  NORD.app.once("boot_loaded", function () {
    self.screenPreloader = new NORD.ScreenPreloader({
      name: "screen_preloader",
      parentPanel: NORD.GUIManager.stage,
      container: NORD.GUIManager.containerCenter,
    });
    self.screenPreloader.load(function () {
      self.screenPreloader.tween(
        {
          name: "hide_anim",
        },
        function () {
          self.init();
        }
      );
    });
  });
};

NORD.Game.prototype = Object.create(EventEmitter.prototype);
NORD.Game.prototype.constructor = NORD.Game;

NORD.Game.prototype.init = function () {
  // this.physics = new p2.World({ gravity: [0, 0] });
  // this.bgGradient = NORD.assetsManager.getSprite('texture_atlas', 'bg_gradient.png');
  // NORD.GUIManager.containerBack.addChild(this.bgGradient);
  // this.bgGradient.anchor.set(0.5, 0.5);
  this.config.actionHintShows++;
  this.saveConfig();
  this.field = new NORD.Field();
  this.screenMainMenu = new NORD.ScreenMainMenu({
    name: "screen_main_menu",
    parentPanel: NORD.GUIManager.stage,
    container: NORD.GUIManager.containerCenter,
  });
  this.screenGame = new NORD.ScreenGame({
    name: "screen_game",
    parentPanel: NORD.GUIManager.stage,
    container: NORD.GUIManager.containerCenter,
  }); // this.panelEndGame = new NORD.PanelEndGame({ name: 'panel_end_game', parentPanel: NORD.GUIManager.stage, container: NORD.GUIManager.containerCenter });

  this.panelSettings = new NORD.PanelSettings({
    name: "panel_settings",
    parentPanel: NORD.GUIManager.stage,
    container: NORD.GUIManager.containerCenter,
  });
  this.screenMainMenu.tween({
    name: "show_anim_from_preloader",
  }); // this.panelSettings.tween({ name: 'show_anim' });

  createLockScreenOver(NORD.GUIManager.stage);

  NORD.GUIManager.on("app_resize", this.onAppResize, this);
  NORD.GUIManager.autoresize();
  NORD.app.on("update", this.update, this);
  NORD.app.on("update_after", this.updateAfter, this);
};

NORD.Game.prototype.setConfig = function (config) {
  this.config = config; // console.log("Set config:", config);

  this.saveConfig();
};

NORD.Game.prototype.saveConfig = function () {
  var data = this.config;
  var jsonString = JSON.stringify(data);
  localStorage.setItem("pong_save", jsonString);
};

NORD.Game.prototype.loadConfig = function () {
  var jsonString = localStorage.getItem("pong_save");
  var data = JSON.parse(jsonString);
  if (!data) return;
  this.config = data;
};

NORD.Game.prototype.update = function () {};

NORD.Game.prototype.updateAfter = function () {
  // const fixedTimeStep = 1/60;
  // const maxSubSteps = 10;
  // this.physics.step(fixedTimeStep, NORD.app.et, maxSubSteps);
};

NORD.Game.prototype.onAppResize = function (data) {
  // this.bgGradient.width = data.appWidth;
  // this.bgGradient.height = data.appHeight;
  // console.log('RR')
  window.scrollTo(0, 0);
};

NORD.Game.prototype.soundClickSimple = function () {
  return NORD.assetsManager.getAsset("sound_click");
};

NORD.Game.prototype.tweenClickSimple = function (data) {
  data.scale = 0.95;
  data.time = 0.07; // data.time = 0.0;

  NORD.GUI.Button.tweenClickSimple(data);
};

NORD.Game.prototype.tweenClickSimpleB = function (data) {
  data.scale = 0.5 * 0.95;
  data.time = 0.07; // data.time = 0.0;

  NORD.GUI.Button.tweenClickSimple(data);
};

var createPaddle = function createPaddle() {
  var size =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 80;
  var shape =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.3;
  var backSize =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 20;
  var angle =
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  angle = angle * Util.TO_RADIANS;
  var radius = (0.5 + shape) * size;
  var shift = Math.sqrt(radius * radius - (size / 2) * (size / 2));
  var pX = 0;
  pX = radius - (radius - shift);
  var startAngle = Util.angle(0, 0, pX, -size / 2);
  var endAngle = Util.angle(0, 0, pX, size / 2);
  var vertices = [];
  vertices.push({
    x: -backSize + shift,
    y: -size / 2,
  });
  var arc = createArc(radius, startAngle, endAngle, 30); // const pUp = createP(arc[0], Math.PI/4, backSize, 1);
  // const pDown = createP(arc[arc.length-1], -Math.PI/4, backSize, -1);
  // vertices.push(...pUp);

  vertices.push(Object.assign({}, arc)); // vertices.push(...pDown);

  vertices.push({
    x: -backSize + shift,
    y: size / 2,
  }); // let startWVert = null;
  // let endWVert = null;
  // vertices.forEach(vert => {
  //  if(!startWVert || vert.x < startWVert.x) startWVert = vert;
  //  if(!endWVert || vert.x > endWVert.x) endWVert = vert;
  // });
  // const width = Math.abs(startWVert.x - endWVert.x);

  vertices.forEach(function (vert) {
    var vX = vert.x;
    var vY = vert.y;
    vert.x = vX * Math.cos(angle) - vY * Math.sin(angle);
    vert.y = vX * Math.sin(angle) + vY * Math.cos(angle);
  });
  return vertices;
};

function createP(startPoint, endAngle, size, side) {
  // console.log("CCC:", startPoint, endAngle, size, side);
  size = 20;
  var vertices = [];
  var p = {
    x: startPoint.x - size,
    y: startPoint.y + 10 * side,
  };
  var angle = Util.angle(p.x, p.y, startPoint.x, startPoint.y);
  var sign = Util.sign(endAngle - angle);
  var step = (endAngle - angle) / 10;

  for (var i = 0; i < 10; i++) {
    angle += step;
    if (i < 3) continue; // console.log('angle:', angle * Util.TO_DEGREES);
    // const ppp = Util.rotatePointDeg(startPoint.x, startPoint.y, p.x, p.y, Util.normalizeDegAngle(angle*Util.TO_DEGREES)*Util.TO_RADIANS);

    var ppp = Util.rotatePointDeg(startPoint.x, startPoint.y, p.x, p.y, angle); // vertices.unshift(ppp);

    if (step > 0) vertices.unshift(ppp);
    else vertices.push(ppp);
  } // console.log("F:", sign, step, step < 0, vertices);

  return vertices;
}

function rotatePoint(p, angle) {
  var vX = p.x;
  var vY = p.y;
  p.x = vX * Math.cos(angle) - vY * Math.sin(angle);
  p.y = vX * Math.sin(angle) + vY * Math.cos(angle);
  return p;
}

function createArc(radius) {
  var startAngle =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var endAngle =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var steps =
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;
  var vertices = [];
  var arcAngle = endAngle - startAngle;
  addVertice(startAngle);

  while (
    Math.abs(endAngle - startAngle) >
    (arcAngle / (steps - 1)) * 0.999999
  ) {
    startAngle += arcAngle / (steps - 1);
    addVertice(startAngle);
  }

  return vertices;

  function addVertice(angle) {
    var vert = {
      x: 0,
      y: 0,
    };
    var vX = radius;
    var vY = 0;
    vert.x = vX * Math.cos(angle) - vY * Math.sin(angle);
    vert.y = vX * Math.sin(angle) + vY * Math.cos(angle); // console.log('AAA:', angle*Util.TO_DEGREES, vert)

    vertices.push(vert);
  }
}

function createPaddleSide() {
  var h =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
  // const h = 10;
  var radius = h / 2; // const w = 40;

  var vertices = createArc(
    radius,
    Util.angle(0, 0, radius, -h / 2),
    Util.angle(0, 0, radius, h / 2),
    10
  );
  return vertices;
}

var drawVertices = function drawVertices(vertices) {
  var graphics = new PIXI.Graphics();
  graphics.beginFill(0x0000000, 0.2);
  graphics.lineStyle(1, 0xffffff, 1.0);
  var startVertice = vertices[0];
  graphics.moveTo(startVertice.x, startVertice.y);

  for (var i = 1; i < vertices.length; i++) {
    graphics.lineTo(vertices[i].x, vertices[i].y);
  }

  graphics.lineTo(startVertice.x, startVertice.y);
  return graphics;
};

var createLockScreenOver = function (parent) {
  var overGraphics = new PIXI.Graphics();
  parent.addChild(overGraphics);
  overGraphics.beginFill(0xffffff);
  overGraphics.drawRect(-2000, -2000, 4000, 4000);

  var icon = new PIXI.Sprite(NORD.assetsManager.getTexture("rotate_screen"));
  parent.addChild(icon);
  icon.anchor.set(0.5, 0.5);
  icon.scale.x = icon.scale.y = 0.8;

  NORD.GUIManager.on("app_resize", function (data) {
    var isRotate =
      NORD.app.platform == "mobile" &&
      data.realScreenWidth / data.realScreenHeight < 1.32;
    overGraphics.visible = icon.visible = isRotate;
  });
};
