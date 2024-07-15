"use strict";

//==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//
NORD.Field.BonusContainer = function (field, config) {
  this.container = field.contaierObstacles;
  NORD.Field.FieldObject.call(this, field);
  this.config = config;
  this.type = "BONUS";
  this.bonusType = config.bonusType;
  this.waitingTime = config.waitingTime || 0;
  this.warningTime = config.warningTime || 1.5;
  this.time = config.time == undefined ? 80 : config.time;
  this.activateCallback = config.activateCallback || null;
  this.state = "NONE";
  this.color = 0xc4ff38;
  this.radius = 17;
  this.warning = Util.createSprite({
    parent: this,
    atlas: "texture_atlas",
    texture: "bonus_0001.png",
    aX: 0.5,
    aY: 0.5,
  });
  this.warning.visible = false;
  this.tween = null;
  this.contacts = [];
  this.contactType = config.contactType || "single";
  if (this.bonusType === "PADDLE_SIZE")
    this.bg = Util.createSprite({
      parent: this,
      atlas: "texture_atlas",
      texture: "bonus_0004.png",
      aX: 0.5,
      aY: 0.5,
    });
  if (this.bonusType === "PADDLE_SPEED")
    this.bg = Util.createSprite({
      parent: this,
      atlas: "texture_atlas",
      texture: "bonus_0005.png",
      aX: 0.5,
      aY: 0.5,
    });
  if (this.bonusType === "NEW_BALL")
    this.bg = Util.createSprite({
      parent: this,
      atlas: "texture_atlas",
      texture: "bonus_0003.png",
      aX: 0.5,
      aY: 0.5,
    });
  if (this.bonusType === "BALL_MAX_SPEED")
    this.bg = Util.createSprite({
      parent: this,
      atlas: "texture_atlas",
      texture: "bonus_0002.png",
      aX: 0.5,
      aY: 0.5,
    });
  if (this.bonusType === "SHOOT")
    this.bg = Util.createSprite({
      parent: this,
      atlas: "texture_atlas",
      texture: "bonus_0006.png",
      aX: 0.5,
      aY: 0.5,
    });

  if (this.bonusType === "KITTY") {
    this.bg = Util.createSprite({
      parent: this,
      atlas: "texture_atlas",
      texture: "kitty.png",
      aX: 0.5,
      aY: 0.5,
    });
    this.bgHit = Util.createSprite({
      parent: this,
      atlas: "texture_atlas",
      texture: "kitty_hit.png",
      aX: 0.5,
      aY: 0.5,
    });
    this.bgHit.visible = false;
    this.radius = 25;
    this.bg.scale.x = this.bg.scale.y = 0.5; // this.radius = 250;

    this.blinkKitty = new Blink(this);
  }

  if (!this.bg) {
    this.bg = new PIXI.Graphics();
    this.addChild(this.bg);
    this.bg.beginFill(this.color, 1.0);
    this.bg.drawCircle(0, 0, this.radius);
  }

  this.visible = false;
  this.x = config.x;
  this.y = config.y;
  if (this.waitingTime) this.phaseWaiting();
  else if (this.warningTime) this.phaseWarning();
  else this.appear();
};

NORD.Field.BonusContainer.prototype = Object.create(
  NORD.Field.FieldObject.prototype
);
NORD.Field.BonusContainer.prototype.constructor = NORD.Field.BonusContainer;

NORD.Field.BonusContainer.prototype.phaseWaiting = function () {
  var _this = this;

  this.state = "WAIT"; // this.visible = true;
  // this.warning.visible = true;
  // this.bg.visible = false;
  // this.bg.alpha = 0.2;

  this.delayedCall = TweenMax.delayedCall(this.waitingTime, function () {
    if (_this.state !== "WAIT") return;

    _this.phaseWarning();
  });
};

NORD.Field.BonusContainer.prototype.phaseWarning = function () {
  var _this2 = this;

  this.state = "WARNING";
  this.visible = true;

  if (this.warningTime <= 0) {
    this.appear();
    return;
  } // this.bg.alpha = 0.6;

  this.warning.visible = true;
  this.warning.alpha = 0;
  this.bg.visible = false;
  this.delayedCall = TweenMax.delayedCall(this.warningTime, function () {
    if (_this2.state !== "WARNING") return;

    if (_this2.tween) {
      _this2.tween.kill();

      _this2.tween = null;
    }

    _this2.appear();
  });

  var blinkLoop = function blinkLoop(dir) {
    var targetAlpha = dir === "UP" ? 1 : 0;
    _this2.tween = TweenMax.to(_this2.warning, 10 / 30, {
      alpha: targetAlpha,
      ease: Power2.easeOut,
      onComplete: function onComplete() {
        _this2.tween = null;
        blinkLoop(dir === "UP" ? "DOWN" : "UP");
      },
    });
  };

  blinkLoop("UP");
};

NORD.Field.BonusContainer.prototype.appear = function () {
  var _this3 = this;

  var self = this;
  this.state = "READY";
  this.visible = true;
  this.bg.visible = true;
  this.bg.alpha = 1.0;
  this.warning.visible = false;

  if (this.tween) {
    this.tween.kill();
    this.tween = null;
  }

  if (this.time > 0) {
    this.delayedCall = TweenMax.delayedCall(this.time, function () {
      if (_this3.state !== "READY") return;

      _this3.disappear();
    });
  }

  if (this.bonusType === "KITTY") {
    loopMove("UP");
  }

  function loopMove(dir) {
    var delay =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    if (self.state !== "READY") return;
    var pY = dir === "UP" ? -150 : 150; // let pY = self.y;
    // while(Math.abs(pY - self.y) < 100 || Math.abs(pY - self.y) > 200)
    // {
    //   pY = Util.randomRange(-200, 200);
    // }

    var speed = self.config.speed;
    var time = Math.abs(pY - self.y) / speed;
    self.tween = TweenMax.to(self, time, {
      y: pY,
      ease: Power1.easeInOut,
      delay: delay,
      onComplete: function onComplete() {
        self.tween = null;
        loopMove(dir === "UP" ? "DOWN" : "UP");
      },
    });
  }
};

NORD.Field.BonusContainer.prototype.stopMove = function () {
  if (this.tween) {
    this.tween.kill();
    this.tween = null;
  }
};

NORD.Field.BonusContainer.prototype.disappear = function () {
  this.state = "DISAPPEAR";

  if (this.tween) {
    this.tween.kill();
    this.tween = null;
  }

  this.emit("disappear", this);
  this.destroy();
};

NORD.Field.BonusContainer.prototype.update = function () {
  var _this4 = this;

  NORD.Field.FieldObject.prototype.update.call(this);
  if (!this.isExist) return;
  if (this.state !== "READY") return;
  var balls = this.field.getActiveBalls();
  balls.forEach(function (ball) {
    var n = _this4.contacts.indexOf(ball);

    var distance = Util.distance(_this4.x, _this4.y, ball.x, ball.y);

    if (distance < _this4.radius + ball.radius) {
      var isCollect = _this4.isCollect(ball);

      if (isCollect && n === -1) {
        _this4.contacts.push(ball);

        _this4.activate(ball);

        return;
      }
    } else if (n !== -1) {
      _this4.contacts.splice(n, 1);
    }
  });
};

NORD.Field.BonusContainer.prototype.isCollect = function (ball) {
  if (!ball.playerPaddle) return false; // console.log('Collect:', ball.playerPaddle, this.bonusType);

  return true; // this.destroy();
};

NORD.Field.BonusContainer.prototype.activate = function (ball) {
  var _this5 = this;

  // console.log('Activate bonus!');
  if (this.delayedCall) {
    this.delayedCall.kill();
    this.delayedCall = null;
  }

  if (this.bonusType === "KITTY") {
    // this.blinkKitty.start(0.25);
    //
    // if(this.hitDelayCall) this.hitDelayCall.kill();
    //
    // this.hitDelayCall = TweenMax.delayedCall(1.0, () =>
    // {
    //   this.blinkKitty.stop();
    //   this.alpha = 1.0;
    // });
    this.hitAnim = TweenMax.to(this, 24 / 30, {
      rotation: 720 * Util.TO_RADIANS,
      ease: Power2.easeOut,
      onComplete: function onComplete() {
        _this5.hitAnim = null;
        _this5.rotation = 0;
      },
    });
  }

  if (this.activateCallback) this.activateCallback(ball);
  this.emit("activate", this);

  if (this.contactType === "single") {
    this.disappear();
  }
};

NORD.Field.BonusContainer.prototype.destroy = function () {
  if (!this.isExist) return; // console.log('Bonus destroy!', this.bonusType);

  this.state = "DESTROY";

  if (this.delayedCall) {
    this.delayedCall.kill();
    this.delayedCall = null;
  }

  if (this.hitDelayCall) {
    this.hitDelayCall.kill();
    this.hitDelayCall = null;
  }

  if (this.tween) {
    this.tween.kill();
    this.tween = null;
  }

  if (this.hitAnim) {
    this.hitAnim.kill();
    this.hitAnim = null;
  }

  this.removeChild(this.bg);
  this.bg.destroy();
  NORD.Field.FieldObject.prototype.destroy.call(this);
};

var Bonus = function Bonus(config) {
  this.isExist = true;
  this.config = config;
  this.time = config.time || -1;
  this.state = "WAIT";
};

Bonus.prototype.activate = function (object) {
  var _this6 = this;

  this.state = "ACTIVATE";
  this.object = object;
  this.object.addBonus(this);

  if (this.time !== -1) {
    this.delayedCall = TweenMax.delayedCall(this.time, function () {
      if (_this6.state !== "ACTIVATE") return;

      _this6.deactivate();
    });
  }
};

Bonus.prototype.deactivate = function () {
  this.state = "DEACTIVATE";
  this.object.removeBonus(this);
  this.destroy();
};

Bonus.prototype.destroy = function () {
  if (!this.isExist) return;

  if (this.delayedCall) {
    this.delayedCall.kill();
    this.delayedCall = null;
  }

  if (this.state === "ACTIVATE") this.deactivate();
  this.isExist = false;
  this.object = null;
};

var BonusPaddleSize = function BonusPaddleSize(config) {
  Bonus.call(this, config);
  this.type = "PADDLE_SIZE";
  this.paddleSize = config.paddleSize;
};

BonusPaddleSize.prototype = Object.create(Bonus.prototype);
BonusPaddleSize.prototype.constructor = BonusPaddleSize;

var BonusPaddleSpeed = function BonusPaddleSpeed(config) {
  Bonus.call(this, config);
  this.type = "PADDLE_SPEED";
  this.speedK = config.speedK;
};

BonusPaddleSpeed.prototype = Object.create(Bonus.prototype);
BonusPaddleSpeed.prototype.constructor = BonusPaddleSpeed; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.Field.GravityWell = function (field, config) {
  this.container = field.containerBack;
  NORD.Field.FieldObject.call(this, field);
  this.config = config;
  this.type = "GRAVITY_WELL";
  this.state = "NONE";
  this.gravityPower = config.gravityPower || 5;
  this.radius = config.radius || 100;
  this.time = config.time != undefined ? config.time : 5;
  this.color = 0xc4ff38;
  this.bg = Util.createSprite({
    atlas: "texture_atlas",
    texture: "area_blue.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
  });
  this.gravityCenter = Util.createSprite({
    x: config.x,
    y: config.y,
    atlas: "texture_atlas",
    texture: "gravity_center.png",
    parent: field.containerGravityHole,
    aX: 0.5,
    aY: 0.5,
  });
  this.gravityCenter.scale.x = this.gravityCenter.scale.y = 0.7;
  this.bgMask = new PIXI.Graphics();
  this.addChild(this.bgMask);
  this.bgMask.beginFill(this.color, 1.0);
  this.bgMask.drawCircle(0, 0, this.radius); // this.bg.width = this.bg.height = this.radius*2;

  this.bg.mask = this.bgMask;
  this.visible = false;
  this.x = config.x;
  this.y = config.y;
  this.balls = []; // this.parent.setChildIndex(this, 0);
  // console
  // if(this.waitingTime) this.phaseWaiting();
  // else if(this.warningTime) this.phaseWarning();
  // else this.appear();
};

NORD.Field.GravityWell.prototype = Object.create(
  NORD.Field.FieldObject.prototype
);
NORD.Field.GravityWell.prototype.constructor = NORD.Field.GravityWell;

NORD.Field.GravityWell.prototype.appear = function () {
  var _this7 = this;

  this.state = "APPEAR";
  this.visible = true;
  this.alpha = 0;
  this.tween = TweenMax.to(this, 2 / 30, {
    alpha: 1.0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      if (_this7.state !== "APPEAR") return;

      _this7.ready();
    },
  });
};

NORD.Field.GravityWell.prototype.ready = function () {
  var _this8 = this;

  this.state = "READY";

  if (this.time > 0) {
    this.delayedCall = TweenMax.delayedCall(this.time, function () {
      if (_this8.state !== "READY") return;

      _this8.disappear();
    });
  }
};

NORD.Field.GravityWell.prototype.disappear = function () {
  var _this9 = this;

  this.state = "DISAPPEAR";
  this.tween = TweenMax.to(this, 2 / 30, {
    alpha: 0.0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      if (_this9.state !== "DISAPPEAR") return;

      _this9.destroy();
    },
  });
};

NORD.Field.GravityWell.prototype.update = function () {
  var _this10 = this;

  NORD.Field.FieldObject.prototype.update.call(this);
  if (!this.isExist) return;
  if (this.state !== "READY") return;
  var balls = this.field.getActiveBalls();
  balls.forEach(function (ball) {
    var distance = Util.distance(_this10.x, _this10.y, ball.x, ball.y);
    var maxDistance = _this10.radius - ball.radius;

    if (distance < maxDistance) {
      var t = 1 - distance / maxDistance;
      var gravityK = Power2.easeOut.getRatio(t);
      var moveAngle = ball.getMoveAnge();
      var rotAngle = Util.getRotAngle(
        ball.body.position.x,
        ball.body.position.y,
        _this10.x,
        _this10.y,
        moveAngle,
        _this10.gravityPower * gravityK
      );
      ball.setMoveAnge(moveAngle + rotAngle); // console.log('Gravity:', gravityK, ball);
    }

    if (distance < maxDistance * 1.1) {
      if (_this10.balls.indexOf(ball) == -1) {
        NORD.audioManager.playAudio("gravity_well");

        _this10.balls.push(ball);
      }
    } else {
      var n = _this10.balls.indexOf(ball);

      if (n !== -1) _this10.balls.splice(n, 1);
    }
  }); // console.log(Power2.easeOut.getRatio(0.5));
};

NORD.Field.GravityWell.prototype.destroy = function () {
  if (!this.isExist) return;
  this.state = "DESTROY";

  if (this.tween) {
    this.tween.kill();
    this.tween = null;
  }

  if (this.delayedCall) {
    this.delayedCall.kill();
    this.delayedCall = null;
  }

  this.gravityCenter.destroy();
  this.gravityCenter = null; // this.removeChild(this.bg);
  // this.bg = null;

  NORD.Field.FieldObject.prototype.destroy.call(this);
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.Field.InvisibleArea = function (field, config) {
  this.container = field.containerBack;
  NORD.Field.FieldObject.call(this, field);
  this.config = config;
  this.type = "INVISIBLE_AREA";
  this.state = "NONE";
  this.areaWidth = config.areaWidth || 200;
  this.time = config.time != undefined ? config.time : 5;
  this.color = 0xc4ff38;
  this.bg = Util.createSprite({
    atlas: "texture_atlas",
    texture: "area_blue.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
  });
  this.bgMask = new PIXI.Graphics();
  this.addChild(this.bgMask);
  this.bgMask.beginFill(this.color, 1.0);
  this.bgMask.drawRect(-this.areaWidth / 2, -400, this.areaWidth, 800);
  this.bg.mask = this.bgMask;
  this.visible = false;
  this.x = config.x;
  this.y = config.y;
  this.parent.setChildIndex(this, 0); // if(this.waitingTime) this.phaseWaiting();
  // else if(this.warningTime) this.phaseWarning();
  // else this.appear();
};

NORD.Field.InvisibleArea.prototype = Object.create(
  NORD.Field.FieldObject.prototype
);
NORD.Field.InvisibleArea.prototype.constructor = NORD.Field.InvisibleArea;

NORD.Field.InvisibleArea.prototype.appear = function () {
  var _this11 = this;

  this.state = "APPEAR";
  this.visible = true;
  this.alpha = 0;
  this.tween = TweenMax.to(this, 2 / 30, {
    alpha: 1.0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      if (_this11.state !== "APPEAR") return;

      _this11.ready();
    },
  });
};

NORD.Field.InvisibleArea.prototype.ready = function () {
  var _this12 = this;

  this.state = "READY";

  if (this.time > 0) {
    this.delayedCall = TweenMax.delayedCall(this.time, function () {
      if (_this12.state !== "READY") return;

      _this12.disappear();
    });
  }
};

NORD.Field.InvisibleArea.prototype.disappear = function () {
  var _this13 = this;

  this.state = "DISAPPEAR";
  var balls = this.field.getActiveBalls();
  balls.forEach(function (ball) {
    ball.setInvisible(false);
  });
  this.tween = TweenMax.to(this, 2 / 30, {
    alpha: 0.0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      if (_this13.state !== "DISAPPEAR") return;

      _this13.destroy();
    },
  });
};

NORD.Field.InvisibleArea.prototype.update = function () {
  var _this14 = this;

  NORD.Field.FieldObject.prototype.update.call(this);
  if (!this.isExist) return;
  if (this.state !== "READY") return;
  var balls = this.field.getActiveBalls();
  balls.forEach(function (ball) {
    if (
      ball.body.position.x - ball.radius <= _this14.x + _this14.areaWidth / 2 &&
      ball.body.position.x + ball.radius > _this14.x - _this14.areaWidth / 2
    ) {
      ball.setInvisible(true);
    } else {
      ball.setInvisible(false);
    }
  }); // console.log(Power2.easeOut.getRatio(0.5));
};

NORD.Field.InvisibleArea.prototype.destroy = function () {
  if (!this.isExist) return;
  this.state = "DESTROY";

  if (this.tween) {
    this.tween.kill();
    this.tween = null;
  }

  if (this.delayedCall) {
    this.delayedCall.kill();
    this.delayedCall = null;
  } // this.removeChild(this.bg);
  // this.bg = null;

  NORD.Field.FieldObject.prototype.destroy.call(this);
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.Field.FireZone = function (field, config) {
  this.container = field.containerGravityHole;
  NORD.Field.FieldObject.call(this, field);
  this.config = config;
  this.type = "FIRE_ZONE";
  this.state = "NONE"; // this.gravityPower = config.gravityPower || 5;

  this.radius = config.radius || 100;
  this.time = config.time != undefined ? config.time : 5;
  this.speedUp = config.speedUp;
  this.color = 0xc4ff38;
  this.bg = Util.createSprite({
    atlas: "texture_atlas",
    texture: "fire_ring.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
  }); // this.gravityCenter = Util.createSprite({ atlas: 'texture_atlas', texture: 'gravity_center.png', parent: this, aX: 0.5, aY: 0.5 });

  this.bg.width = this.bg.height = this.radius * 2; // this.bgMask = new PIXI.Graphics();
  // this.addChild(this.bgMask);
  // this.bgMask.beginFill(this.color, 1.0);
  // this.bgMask.drawCircle(0, 0, this.radius);
  //
  // this.bg.mask = this.bgMask;

  this.visible = false;
  this.x = config.x;
  this.y = config.y; // this.parent.setChildIndex(this, 0);

  this.contacts = []; // console
  // if(this.waitingTime) this.phaseWaiting();
  // else if(this.warningTime) this.phaseWarning();
  // else this.appear();
};

NORD.Field.FireZone.prototype = Object.create(NORD.Field.FieldObject.prototype);
NORD.Field.FireZone.prototype.constructor = NORD.Field.FireZone;

NORD.Field.FireZone.prototype.appear = function () {
  var _this15 = this;

  this.state = "APPEAR";
  this.visible = true;
  this.alpha = 0;
  this.tween = TweenMax.to(this, 2 / 30, {
    alpha: 1.0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      if (_this15.state !== "APPEAR") return;

      _this15.ready();
    },
  });
};

NORD.Field.FireZone.prototype.ready = function () {
  var _this16 = this;

  this.state = "READY";

  if (this.time > 0) {
    this.delayedCall = TweenMax.delayedCall(this.time, function () {
      if (_this16.state !== "READY") return;

      _this16.disappear();
    });
  }
};

NORD.Field.FireZone.prototype.disappear = function () {
  var _this17 = this;

  this.state = "DISAPPEAR";
  this.tween = TweenMax.to(this, 2 / 30, {
    alpha: 0.0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      if (_this17.state !== "DISAPPEAR") return;

      _this17.destroy();
    },
  });
};

NORD.Field.FireZone.prototype.update = function () {
  var _this18 = this;

  NORD.Field.FieldObject.prototype.update.call(this);
  if (!this.isExist) return;
  if (this.state !== "READY") return; // for(let i = 0; i < 10; i++)
  // {
  //   const angle = Util.randomRange(0, 360);
  //   const p = Util.getMoveVector(this.radius-15, angle);
  //   createParticle({ x: p.x, y: p.y, container: this, angle: angle });
  // }

  var balls = this.field.getActiveBalls();
  balls.forEach(function (ball) {
    var distance = Util.distance(_this18.x, _this18.y, ball.x, ball.y);
    var maxDistance = _this18.radius - ball.radius;

    var n = _this18.contacts.indexOf(ball);

    if (distance < maxDistance) {
      if (n === -1) {
        _this18.contacts.push(ball);

        ball.fireZoneSpeedUp(_this18.field.getBallSpeedUpK("FIRE_ZONE"));
        NORD.audioManager.playAudio("ball_fire_ring"); // console.log('Q:',this.field.config.fireZoneModeSpeedUp.value)
      } // ball.setFireZoneSpeedUp(true);
    } else {
      if (n !== -1) {
        _this18.contacts.splice(n, 1);
      }
    }
  });
};

NORD.Field.FireZone.prototype.destroy = function () {
  if (!this.isExist) return;
  this.state = "DESTROY";
  this.contacts = [];

  if (this.tween) {
    this.tween.kill();
    this.tween = null;
  }

  if (this.delayedCall) {
    this.delayedCall.kill();
    this.delayedCall = null;
  } // this.removeChild(this.bg);
  // this.bg = null;

  NORD.Field.FieldObject.prototype.destroy.call(this);
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

var GameStartText = function GameStartText() {
  PIXI.Container.call(this);
  this.textReady = Util.createSprite({
    atlas: "texture_atlas",
    texture: "text_ready.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
    scaleXY: 0.5,
  });
  this.textGo = Util.createSprite({
    atlas: "texture_atlas",
    texture: "text_go.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
    scaleXY: 0.5,
  });
  this.visible = false;
  this.tween1 = null;
  this.tween2 = null;
};

GameStartText.prototype = Object.create(PIXI.Container.prototype);
GameStartText.prototype.constructor = GameStartText;

GameStartText.prototype.clear = function () {
  this.visible = false;
  if (this.tween1) this.tween1.kill();
  if (this.tween2) this.tween2.kill();
  this.tween1 = null;
  this.tween2 = null;
};

GameStartText.prototype.play = function (callback) {
  var _this19 = this;

  this.clear();
  this.visible = true;
  this.textReady.y = this.textGo.y = -30;
  this.textReady.alpha = this.textGo.alpha = 0.0;
  this.textReady.scale.x = this.textReady.scale.y = 0.5; // this.textGo.scale.x = this.textGo.scale.y = 0.5;

  var time = 6 / 30; // this.textReady.scale.x = this.textReady.scale.y = 0.7;

  this.tween1 = TweenMax.to(this.textReady, 6 / 30, {
    y: 0,
    alpha: 1.0,
    ease: Power4.easeOut,
    onComplete: function onComplete() {
      // TweenMax.delayedCall(1.0, () => {
      // this.textReady.alpha = 0;
      // this.textGo.visible = true;
      // this.textGo.alpha = 1.0;
      // this.textGo.y = 0;
      // this.textReady.y = 0;
      NORD.audioManager.playAudio("ready");
      _this19.tween1 = TweenMax.to(_this19.textReady, 6 / 30, {
        y: 30,
        alpha: 0.0,
        delay: 1.0,
        ease: Power2.easeInOut,
        onComplete: function onComplete() {
          // this.tween1 = TweenMax.to(this.textGo, 2/30, { y: 0, alpha: 1.0, delay: 0.2, ease: Power2.easeOut, onComplete: () =>
          // {
          // this.tween2 = TweenMax.to(this.textGo.scale, 2/30, { x: 0.8, y: 0.8, delay: 0.1, ease: Power2.easeInOut });
          // }});
        },
      });
      _this19.tween1 = TweenMax.to(_this19.textGo, 6 / 30, {
        y: 0,
        alpha: 1.0,
        delay: 1.0 + 3 / 30,
        ease: Power4.easeInOut,
        onComplete: function onComplete() {
          NORD.audioManager.playAudio("go");
          _this19.tween1 = TweenMax.to(_this19.textGo, 6 / 30, {
            y: 30,
            alpha: 0.0,
            delay: 0.5,
            ease: Power2.easeInOut,
            onComplete: function onComplete() {
              _this19.visible = false;
              _this19.tween1 = null;
              _this19.tween2 = null;
              callback();
            },
          });
        },
      }); // });
    },
  }); // this.tween2 = TweenMax.to(this.textReady.scale, 2/30, { x: 0.5, y: 0.5, ease: Power2.easeOut });
}; // GameStartText.prototype.play = function(callback)
// {
//   this.clear();
//   this.visible = true;
//
//   this.textReady.y = this.textGo.y = -200;
//   this.textReady.alpha = this.textGo.alpha = 0.0;
//
//   this.textReady.scale.x = this.textReady.scale.y = 0.5;
//   this.textGo.scale.x = this.textGo.scale.y = 0.5;
//
//   const time = 6/30;
//
//   this.textReady.scale.x = this.textReady.scale.y = 0.7;
//   this.tween1 = TweenMax.to(this.textReady, 6/30, { y: 0, alpha: 1.0, ease: Power2.easeOut, onComplete: () =>
//   {
//     this.tween1 = TweenMax.to(this.textReady, 6/30, { y: 100, alpha: 0.0, delay: 0.5, ease: Power2.easeInOut, onComplete: () =>
//     {
//       this.tween1 = TweenMax.to(this.textGo, 8/30, { y: 0, alpha: 1.0, delay: 0.1, ease: Power2.easeOut, onComplete: () =>
//       {
//         this.tween1 = TweenMax.to(this.textGo, 8/30, { y: 0, alpha: 0.0, delay: 0.1, ease: Power2.easeInOut, onComplete: () =>
//         {
//           this.visible = false;
//           this.tween1 = null;
//           this.tween2 = null;
//
//           callback();
//         }});
//         this.tween2 = TweenMax.to(this.textGo.scale, 8/30, { x: 0.8, y: 0.8, delay: 0.1, ease: Power2.easeInOut });
//       }});
//     }});
//   }});
//   this.tween2 = TweenMax.to(this.textReady.scale, 12/30, { x: 0.5, y: 0.5, ease: Power2.easeOut });
// }
//==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//
