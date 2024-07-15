"use strict";

NORD.Robo = function (field) {
  this.container = field.contaierObstacles;
  NORD.Field.FieldObject.call(this, field);
  var self = this;
  this.state = "arrive"; // this.bg = Util.createSprite({
  //   atlas: "texture_atlas",
  //   texture: "robo.png",
  //   parent: this,
  //   aX: 0.5,
  //   aY: 0.45
  // });

  this.globalSize = this.field.config.roboSize.value;
  this.containerView = new PIXI.Container();
  this.addChild(this.containerView); // this.containerView.y = 16 * this.globalSize;

  this.containerView.scale.x = this.containerView.scale.y = this.globalSize; // this.gun = new NORD.RoboGun(this);
  // this.containerView.addChild(this.gun);
  // this.gun.y = -22 * this.globalSize;

  this.guns = new NORD.RoboGuns(this);
  this.containerView.addChild(this.guns); // const textureArray = [];
  // const textureArrayOver = [];
  // for (let i = 1; i <= 39; i++) {
  //   const n = i < 10 ? "0" + i : "" + i;
  //   const texture = NORD.assetsManager.getTexture(
  //     "texture_atlas_robo",
  //     "robo_anim_00" + n + ".png"
  //   );
  //   textureArray.push(texture);
  //   const textureOver = NORD.assetsManager.getTexture(
  //     "texture_atlas_robo",
  //     "robo_over_00" + n + ".png"
  //   );
  //   textureArrayOver.push(textureOver);
  // }
  // this.anim = new PIXI.AnimatedSprite(textureArray);
  // this.containerView.addChild(this.anim);
  // this.anim.anchor.set(0.5);
  // // this.anim.y = -200;
  // this.anim.animationSpeed = 0.5;
  // this.anim.play();

  this.spriteBody = Util.createSprite({
    atlas: "texture_atlas",
    texture: "robo.png",
    parent: this.containerView,
    aX: 0.5,
    aY: 0.5,
  });
  this.overWhite = Util.createSprite({
    atlas: "texture_atlas",
    // texture: "robo_over_white.png",
    texture: "robo_over_red.png",
    parent: this.containerView,
    aX: 0.5,
    aY: 0.5,
  });
  this.overWhite.alpha = 0; // this.overWhite.y = -9;
  // this.anim.tint = 0xFF0000 * 0.5;

  this.radius = 84 * this.globalSize;
  this.speed = this.field.config.roboSpeed.value;
  this.shootDelay = this.field.config.roboShootDelay.value;
  this.shootPrepareDelay = 1.0;
  this.collider = {
    width: 160 * this.globalSize,
    height: 120 * this.globalSize,
  }; // this.hitView = new PIXI.Graphics();
  // this.addChild(this.hitView);
  // this.hitView.beginFill(0xe54d4d, 0.3);
  // this.hitView.drawCircle(0, 0, this.radius);

  if (localStorage.show_robo_collider) {
    this.hitView = new PIXI.Graphics();
    this.addChild(this.hitView);
    this.hitView.beginFill(0xe54d4d, 0.3);
    this.hitView.drawRect(
      -this.collider.width / 2,
      -this.collider.height / 2,
      this.collider.width,
      this.collider.height
    );
  } // this.maxHealth = this.field.config.roboHealth.value;
  // this.maxHealth = 1;
  // this.health = this.maxHealth;
  // this.healthView = new NORD.RoboHealth(this);
  // this.addChild(this.healthView);
  // this.healthView.y = -this.radius - 38 * this.globalSize;

  this.isHit = false; // console.log("ROBO CREATED!");

  NORD.app.on("update", this.update, this);
  this.arrive();
  this.field.robo = this;
  this.isDeactivate = false; // TweenMax.delayedCall(
  //   1.0,
  //   function() {
  //     self.gun.shootRegular(self.field.paddleRight, 1.0);
  //   },
  //   this
  // );
};

NORD.Robo.prototype = Object.create(NORD.Field.FieldObject.prototype);
NORD.Robo.prototype.constructor = NORD.Robo;

NORD.Robo.prototype.arrive = function () {
  var self = this;
  this.y = -1000;
  this.tweenArrive = TweenMax.to(this, 15 / 30, {
    y: 0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      self.state = "normal";
      self.tweenArrive = null;
      self.delayShootLoop = TweenMax.delayedCall(1.0, function () {
        self.shootLoop();
      });
      self.tweenArrive = TweenMax.delayedCall(0.3, function () {
        self.tweenArrive = null;
        self.moveLoop();
      });
    },
  });
  this.scale.x = 0.2;
  this.scale.y = 1.6;
  this.tweenD = TweenMax.to(this.scale, 10 / 30, {
    delay: 10 / 30,
    x: 1.0,
    y: 1.0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      self.tweenD = null;
    },
  });
  NORD.audioManager.playAudio("robo_appear");
};

NORD.Robo.prototype.moveLoop = function () {
  var self = this;
  var targetY = this.y <= 0 ? 175 : -110;
  var d = Math.abs(this.y - targetY);
  var time = d / this.speed;
  var ease = this.field.config.roboMoveEase.value
    ? Power1.easeInOut
    : Power0.easeNone;
  this.tweenMove = TweenMax.to(this, time, {
    ease: ease,
    y: targetY,
    onComplete: function onComplete() {
      self.moveLoop();
    },
  });
};

NORD.Robo.prototype.shootLoop = function () {
  var self = this;
  if (this.state !== "normal") return; // const paddle = Util.randomElement([
  //   this.field.paddleLeft,
  //   this.field.paddleRight
  // ]);
  // this.gun.addShoot({ paddle: paddle, delay: this.shootPrepareDelay });

  this.guns.shoot();
  var delay = this.shootDelay;
  this.delayShootLoop = TweenMax.delayedCall(delay, function () {
    self.shootLoop();
  });
};

NORD.Robo.prototype.flashLoop = function (obj) {
  var dir =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "up";
  var self = this;
  var targetAlpha = dir === "up" ? 0.6 : 0.0;
  var time = 20 / 30;
  var tween = TweenMax.to(obj, time, {
    alpha: targetAlpha,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      self.flashLoop(obj, dir === "up" ? "down" : "up");
    },
  });
  if (obj === this.overWhite) this.tweenOverWhite = tween;
};

NORD.Robo.prototype.hitBlink = function () {
  var self = this;
  var time = 6 / 30;
  this.overWhite.alpha = 0;
  this.tweenBlink = TweenMax.to(this.overWhite, time, {
    alpha: 0.6,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      self.tweenBlink = TweenMax.to(self.overWhite, time, {
        alpha: 0,
        ease: Power2.easeOut,
        onComplete: function onComplete() {
          self.tweenBlink = null;
        },
      });
    },
  });
};

NORD.Robo.prototype.update = function () {
  NORD.Field.FieldObject.prototype.update.call(this);
  if (!this.isExist || this.isDeactivate) return;
  var ball = this.field.ball;
  var isCollision =
    ball.x > this.x - this.collider.width / 2 &&
    ball.x < this.x + this.collider.width / 2 &&
    ball.y < this.y + this.collider.height / 2 &&
    ball.y > this.y - this.collider.height / 2;

  if (isCollision) {
    if (!this.isHit) {
      this.isHit = true;
      this.hit(ball);
    }
  } else if (this.isHit) {
    this.isHit = false;
  }
};

NORD.Robo.prototype.hit = function (ball) {
  if (!ball.playerPaddle) {
    return;
  }

  var player = this.field.players[ball.playerPaddle.side];
  var enemySide = ball.playerPaddle.side === "LEFT" ? "RIGHT" : "LEFT";
  var enemyPaddle = this.field.paddles[enemySide];
  this.hitBlink();
  this.emit("hit"); // this.health--;
  // if (this.health <= 0) {
  //   ball.clear();
  //   this.die(ball, player);
  // } else {

  this.guns.removeGun(ball.playerPaddle.side); // this.gun.addShoot({ paddle: enemyPaddle, delay: this.shootPrepareDelay });
  // }
};

NORD.Robo.prototype.deactivate = function () {
  this.isDeactivate = true;

  if (this.delayShootLoop) {
    this.delayShootLoop.kill();
    this.delayShootLoop = null;
  }
};

NORD.Robo.prototype.die = function (ball, winnerPlayer) {
  this.state = "die";
  this.deactivate();
  var self = this;

  if (this.tweenMove) {
    this.tweenMove.kill();
    this.tweenMove = null;
  }

  TweenMax.to(this, 12 / 30, {
    y: this.y - 200,
    alpha: 0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      // self.field.emit('robo_die', { winnerPlayer: winnerPlayer })
      self.field.goal(winnerPlayer, ball, true, {
        muteGoal: true,
      });
    },
  });
};

NORD.Robo.prototype.destroy = function () {
  if (!this.isExist) return;
  this.state = "DESTROY";

  if (this.delayShootLoop) {
    this.delayShootLoop.kill();
    this.delayShootLoop = null;
  }

  if (this.tweenMove) {
    this.tweenMove.kill();
    this.tweenMove = null;
  }

  if (this.tweenOverWhite) {
    this.tweenOverWhite.kill();
    this.tweenOverWhite = null;
  }

  if (this.tweenArrive) {
    this.tweenArrive.kill();
    this.tweenArrive = null;
  }

  if (this.tweenD) {
    this.tweenD.kill();
    this.tweenD = null;
  }

  if (this.tweenBlink) {
    this.tweenBlink.kill();
    this.tweenBlink = null;
  } // this.anim.destroy();

  this.overWhite.destroy(); // this.healthView.destroy();

  this.containerView.destroy();
  this.containerView = null;
  this.guns.destroy();
  this.guns = null;
  this.field.robo = null;
  NORD.Field.FieldObject.prototype.destroy.call(this);
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.RoboBullet = function (field, config) {
  this.container = field.containerBack;
  NORD.Field.FieldObject.call(this, field);
  this.type = "ROBO_BULLET";
  var x = config.x;
  var y = config.y;
  this.radius = 15;
  this.speed = field.config.roboBulletSpeed.value;
  var angle = config.angle;
  this.moveVector = Util.getMoveVector(this.speed, angle * Util.TO_DEGREES);
  this.rotation = angle;
  this.body = Matter.Bodies.circle(x, y, this.radius, {
    restitution: 1.0,
    friction: 0.0,
    frictionStatic: 0.0,
    frictionAir: 0.0,
    density: 0.01,
    inertia: Infinity,
    slop: 0.00001,
    collisionFilter: {
      category: this.field.collisionBulletCategory,
      mask: this.field.collisionDefaultCategory,
    },
  });
  this.body.isSensor = true;
  this.body.fieldObject = this;
  Matter.World.add(this.field.physics, [this.body]);
  this.bg = Util.createSprite({
    parent: this,
    atlas: "texture_atlas",
    texture: "bullet.png",
    aX: 0.5,
    aY: 0.5,
  });
  this.bg.scale.x = this.bg.scale.y = 0.75;
  this.updatePosition();
};

NORD.RoboBullet.prototype = Object.create(NORD.Field.FieldObject.prototype);
NORD.RoboBullet.prototype.constructor = NORD.RoboBullet;

NORD.RoboBullet.prototype.hitPaddle = function (paddle) {
  paddle.stun();
  NORD.audioManager.playAudio("shoot_hit");
  this.field.emit("bullet_hit_paddle", paddle);
  this.destroy();
};

NORD.RoboBullet.prototype.update = function () {
  NORD.Field.FieldObject.prototype.update.call(this);
  if (!this.isExist || this.isStop || !this.field.isGame()) return;
  Matter.Body.setPosition(this.body, {
    x: this.body.position.x + this.moveVector.x,
    y: this.body.position.y + this.moveVector.y,
  });
  if (
    this.body.position.x < -this.field.getFieldWidth() / 2 - 50 ||
    this.body.position.x > this.field.getFieldWidth() / 2 + 50
  ) {
    this.destroy();
  }
};

NORD.RoboBullet.prototype.destroy = function () {
  if (!this.isExist) return;
  this.state = "DESTROY";

  if (this.body) {
    this.body.fieldObject = null;
    Matter.World.remove(this.field.physics, this.body);
  }

  this.removeChild(this.bg);
  NORD.Field.FieldObject.prototype.destroy.call(this);
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.RoboHealth = function (robo) {
  PIXI.Container.call(this);
  console.log(this);
  var self = this;
  this.robo = robo;
  this.maxHealth = robo.maxHealth;
  this.health = this.maxHealth;
  this.points = [];
  var POINT_WIDTH = 18;
  var MARGIN = 3;
  var totalWidth = this.maxHealth * POINT_WIDTH + (this.maxHealth - 1) * MARGIN;
  var x = -totalWidth / 2 + POINT_WIDTH / 2;

  for (var i = 0; i < this.maxHealth; i++) {
    var point = Util.createSprite({
      atlas: "texture_atlas",
      texture: "robo_health_point.png",
      parent: this,
      aX: 0.5,
      aY: 0.5,
    });
    point.scale.x = point.scale.y = 0.6;
    point.x = x;
    x += POINT_WIDTH + MARGIN;
    this.points.push(point);
  }

  this.robo.addListener("hit", this.onRoboHit, this);
};

NORD.RoboHealth.prototype = Object.create(PIXI.Container.prototype);
NORD.RoboHealth.prototype.constructor = NORD.RoboHealth;

NORD.RoboHealth.prototype.onRoboHit = function () {
  var lastPoint = this.points[this.health - 1];
  lastPoint.tint = 0xe54d4d;
  this.health--;
};

NORD.RoboHealth.prototype.destroy = function () {
  this.robo.removeListener("hit", this.onRoboHit, this);
  this.points.forEach(function (point) {
    point.destroy();
  });
  this.points = [];
  PIXI.Container.prototype.destroy.call(this);
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.RoboGuns = function (robo) {
  PIXI.Container.call(this);
  var self = this;
  this.robo = robo;
  this.state = "none";
  this.guns = {
    LEFT: [],
    RIGHT: [],
  };
  this.allGuns = [];
  var spread = this.robo.field.config.roboGunsAngle.value;
  var gunsCount = 3;
  var gunsCountD = gunsCount - 1;

  for (var i = 0; i < gunsCount; i++) {
    var gunRight = new NORD.RoboGun(
      robo,
      i,
      "right" // (-spread / gunsCountD + (spread / gunsCountD) * i) * Util.TO_RADIANS
    );
    this.addChild(gunRight);
    var gunLeft = new NORD.RoboGun(
      robo,
      i,
      "left" // (180 + spread / gunsCountD - (spread / gunsCountD) * i) * Util.TO_RADIANS
    );
    this.addChild(gunLeft);
    this.guns["LEFT"].push(gunLeft);
    this.guns["RIGHT"].push(gunRight);
    this.allGuns.push(gunRight);
    this.allGuns.push(gunLeft);
  }

  this.tweensDDD = [];
  this.lastGun = null;
};

NORD.RoboGuns.prototype = Object.create(PIXI.Container.prototype);
NORD.RoboGuns.prototype.constructor = NORD.RoboGuns;

NORD.RoboGuns.prototype.shoot = function () {
  var side =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "none";

  if (side === "none") {
    side = Util.randomElement(["LEFT", "RIGHT"]);
  }

  var freeGuns = this.guns[side].filter(function (gun) {
    return gun.state === "normal";
  });

  if (!freeGuns.length) {
    var oppositeSide = side === "LEFT" ? "RIGHT" : "LEFT";
    var freeGunsOpposite = this.guns[oppositeSide].filter(function (gun) {
      return gun.state === "normal";
    });

    if (freeGunsOpposite.length) {
      this.shoot(oppositeSide);
    }

    return;
  }

  if (freeGuns.length > 1 && this.lastGun != null) {
    var n = freeGuns.indexOf(this.lastGun);

    if (n !== -1) {
      freeGuns.splice(n, 1);
    }
  } // console.log("GUNS:", freeGuns, this.guns[side], side);

  var gun = Util.randomElement(freeGuns);
  gun.shoot();
  this.lastGun = gun;
};

NORD.RoboGuns.prototype.getActiveGuns = function (side) {
  return this.guns[side].filter(function (gun) {
    return gun.state === "normal" || gun.state === "shoot";
  });
};

NORD.RoboGuns.prototype.removeGun = function (side) {
  var guns = this.getActiveGuns(side);

  if (!guns.length) {
    return;
  }

  var gun = Util.randomElement(guns);
  gun.deactivate();
  NORD.audioManager.playAudio("robo_arm_destroy");

  if (
    !this.getActiveGuns("LEFT").length &&
    !this.getActiveGuns("RIGHT").length
  ) {
    this.activateGuns();
  }
};

NORD.RoboGuns.prototype.activateGuns = function () {
  var self = this;

  var act = function act(gun, i) {
    self.tweensDDD[i] = TweenMax.delayedCall(i * 0.1, function () {
      gun.activate();
    });
  };

  this.delayActivate = TweenMax.delayedCall(15 / 30, function () {
    self.delayActivate = null;
    self.allGuns.forEach(act);
    NORD.audioManager.playAudio("robo_regrow_arms"); // self.guns["LEFT"].forEach(function(gun) {
    //   gun.activate();
    // });
    // self.guns["RIGHT"].forEach(function(gun) {
    //   gun.activate();
    // });
  });
};

NORD.RoboGuns.prototype.destroy = function () {
  if (this.delayActivate) {
    this.delayActivate.kill();
    this.delayActivate = null;
  }

  this.guns["LEFT"].forEach(function (gun) {
    gun.destroy();
  });
  this.guns["RIGHT"].forEach(function (gun) {
    gun.destroy();
  });
  this.tweensDDD.forEach(function (t) {
    if (t) {
      t.kill();
    }
  });
  this.tweensDDD = [];
  this.guns = null;
  this.robo = null;
  PIXI.Container.prototype.destroy.call(this);
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.RoboGun = function (robo, gunN, side) {
  PIXI.Container.call(this);
  var self = this;
  this.robo = robo;
  this.gunN = gunN;
  this.side = side;
  this.state = "normal";
  this.config = {
    positions: [
      {
        x: 44,
        y: -4.4,
      },
      {
        x: 52,
        y: 19,
      },
      {
        x: 45,
        y: 41,
      },
    ],
    stickPositions: [
      {
        x: -24,
        y: -2,
      },
      {
        x: -35,
        y: -2,
      },
      {
        x: -34,
        y: -19,
      },
    ],
    angles: {
      right: [-45, 0, 45],
      left: [225, 180, 135],
    },
  };
  this.gunWidth = 80;
  var aimAngle = 40 * Util.TO_RADIANS;
  this.baseAngle = this.config.angles[this.side][this.gunN] * Util.TO_RADIANS;
  this.minAngle = this.baseAngle - aimAngle / 2;
  this.maxAngle = this.baseAngle + aimAngle / 2;
  this.stickDefaultScaleX = this.side === "left" ? -1 : 1;
  this.stick = Util.createSprite({
    atlas: "texture_atlas",
    texture: "gun_holder_" + (this.gunN + 1) + ".png",
    parent: this,
    aX: 0.0,
    aY: 0.0,
  });
  this.stick.x =
    this.config.stickPositions[this.gunN].x * (this.side === "left" ? -1 : 1);
  this.stick.y = this.config.stickPositions[this.gunN].y;
  this.stick.scale.x = this.stickDefaultScaleX;
  this.stick.anchor.set(0.0, 0.0);
  this.gunContainer = new PIXI.Container();
  this.addChild(this.gunContainer); // this.gun = Util.createSprite({
  //   atlas: "texture_atlas",
  //   texture: "gun.png",
  //   parent: this.gunContainer,
  //   aX: 6 / 52,
  //   aY: 0.5
  // });
  // this.ggg = new PIXI.Graphics();
  // this.addChild(this.ggg);
  // this.ggg.beginFill(0x000000, 1.0);
  // this.ggg.drawCircle(0, 0, 5);

  var textureArray = [];

  for (var i = 1; i <= 19; i++) {
    var n = i < 10 ? "0" + i : "" + i;
    var texture = NORD.assetsManager.getTexture(
      "texture_atlas",
      "robo_gun_anim_00" + n + ".png"
    );
    textureArray.push(texture);
  }

  this.gun = new PIXI.AnimatedSprite(textureArray);
  this.gunContainer.addChild(this.gun);
  this.gun.anchor.set(14 / 68, 0.5);
  this.gun.animationSpeed = 0.5;
  this.gun.loop = false; // this.gun.visible = false;

  this.gunOver = Util.createSprite({
    atlas: "texture_atlas",
    texture: "robo_gun_over.png",
    parent: this.gunContainer,
    aX: 6 / 52,
    aY: 0.5,
  });
  this.gunOver.anchor.set(14 / 68, 0.5);
  this.gunContainer.rotation = this.baseAngle;
  this.gunOver.alpha = 0;
  var pos = this.config.positions[this.gunN];
  this.defaultX = pos.x * (this.side === "left" ? -1 : 1);
  this.x = this.defaultX;
  this.y = pos.y;
  this.tweenStick = null;
  this.tweenOver = null; // console.log("Q:", this.x, this.y);

  this.idle();
  NORD.app.on("update", this.update, this);
};

NORD.RoboGun.prototype = Object.create(PIXI.Container.prototype);
NORD.RoboGun.prototype.constructor = NORD.RoboGun;

NORD.RoboGun.prototype.update = function () {
  // console.log("Arm update");
  if (this.isAim) {
    var targetPaddle =
      this.side === "left"
        ? this.robo.field.paddleLeft
        : this.robo.field.paddleRight;
    var myPos = this.getMyPosition();
    var rS = Util.getRotAngle(
      myPos.x,
      myPos.y,
      targetPaddle.body.position.x,
      targetPaddle.body.position.y,
      this.gunContainer.rotation * Util.TO_DEGREES,
      1.0
    );
    this.gunContainer.rotation += rS * Util.TO_RADIANS;
  }
};

NORD.RoboGun.prototype.getMyPosition = function () {
  // return { x: this.robo.x + this.x, y: this.robo.y + this.y };
  return this.robo.parent.toLocal(
    this.gunContainer.toGlobal(new PIXI.Point(0, 0))
  );
};

NORD.RoboGun.prototype.getShootPosition = function () {
  var p = this.getMyPosition();
  var pS = Util.getMoveVector(
    this.gunWidth * this.robo.containerView.scale.x,
    this.gunContainer.rotation * Util.TO_DEGREES
  );
  return {
    x: p.x + pS.x,
    y: p.y + pS.y,
  };
};

NORD.RoboGun.prototype.idle = function () {
  var dir =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "none";
  var self = this;

  if (dir === "none") {
    dir = Util.randomElement(["up", "down"]);
  }

  var targetAngle = dir === "up" ? this.maxAngle : this.minAngle;
  var speed = 10 * Util.TO_RADIANS * Util.randomRange(0.6, 2.0);
  var d = Math.abs(targetAngle - this.gunContainer.rotation);
  this.tweenIdle = TweenMax.to(this.gunContainer, d / speed, {
    rotation: targetAngle,
    ease: Power0.easeNone,
    onComplete: function onComplete() {
      self.tweenIdle = null;
      self.idle(dir === "up" ? "down" : "up");
    },
  });
};

NORD.RoboGun.prototype.shoot = function () {
  var self = this;
  this.state = "shoot";

  var doShoot = function doShoot() {
    var p = self.getShootPosition();
    var bullet = new NORD.RoboBullet(self.robo.field, {
      x: p.x,
      y: p.y,
      angle: self.gunContainer.rotation,
    });
    NORD.audioManager.playAudio("robo_shoot");
  };

  if (this.tweenIdle) {
    this.tweenIdle.kill();
    this.tweenIdle = null;
  }

  if (this.tweenScale) {
    this.tweenScale.kill();
    this.tweenScale = null;
  }

  if (this.tweenOver) {
    this.tweenOver.kill();
    this.tweenOver = null;
  }

  this.isAim = true;
  this.tweenScale = TweenMax.to(this.gunContainer.scale, 30 / 30, {
    x: 1.8,
    y: 1.8,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      doShoot();
      self.tweenScale = TweenMax.to(self.gunContainer.scale, 8 / 30, {
        x: 1.0,
        y: 1.0,
        ease: Power2.easeOut,
        onComplete: function onComplete() {
          self.tweenScale = null;
          self.state = "normal";
          self.isAim = false;
          self.idle();
        },
      });
    },
  });
  this.gunOver.alpha = 0;
  this.tweenOver = TweenMax.to(this.gunOver, 30 / 30, {
    alpha: 0.8,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      self.tweenOver = TweenMax.to(self.gunOver, 8 / 30, {
        alpha: 0.0,
        ease: Power2.easeOut,
        onComplete: function onComplete() {
          self.tweenOver = null;
        },
      });
    },
  });
};

NORD.RoboGun.prototype.deactivate = function () {
  var self = this;

  if (this.tweenScale) {
    this.tweenScale.kill();
    this.tweenScale = null;
  }

  if (this.tweenOver) {
    this.tweenOver.kill();
    this.tweenOver = null;
  }

  if (this.tweenIdle) {
    this.tweenIdle.kill();
    this.tweenIdle = null;
  }

  this.isAim = false;
  this.state = "deactivate";
  this.gun.gotoAndPlay(1);

  this.gun.onComplete = function () {};

  self.tweenStick = TweenMax.to(self.stick.scale, 12 / 30, {
    x: 0.05 * (self.side === "left" ? -1 : 1),
    y: 0.6,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      self.tweenStick = null;
      self.visible = false;
      self.state = "hide";
      self.gunOver.alpha = 0;
    },
  });
};

NORD.RoboGun.prototype.activate = function () {
  var self = this;

  if (this.tweenScale) {
    this.tweenScale.kill();
    this.tweenScale = null;
  }

  this.state = "activate";
  this.visible = true;
  this.gun.gotoAndStop(0);
  var time = 10 / 30;
  this.tweenStick = TweenMax.to(this.stick.scale, time, {
    x: this.stickDefaultScaleX,
    y: 1.0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      self.tweenStick = null;
      self.state = "normal";
      self.idle();
    },
  });
  this.gunContainer.x = -50 * (this.side === "left" ? -1 : 1);
  this.gunContainer.scale.x = this.gunContainer.scale.y = 1.0;
  this.tweenGunContainer = TweenMax.to(this.gunContainer, time, {
    x: 0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      self.tweenGunContainer = null;
    },
  });
  this.gunContainer.rotation = this.baseAngle;
};

NORD.RoboGun.prototype.destroy = function () {
  this.isAim = false;

  if (this.tweenScale) {
    this.tweenScale.kill();
    this.tweenScale = null;
  }

  if (this.tweenOver) {
    this.tweenOver.kill();
    this.tweenOver = null;
  }

  if (this.tweenIdle) {
    this.tweenIdle.kill();
    this.tweenIdle = null;
  }

  if (this.tweenStick) {
    this.tweenStick.kill();
    this.tweenStick = null;
  }

  if (this.tweenGunContainer) {
    this.tweenGunContainer.kill();
    this.tweenGunContainer = null;
  }

  this.gun.destroy();
  this.gunOver.destroy();
  this.gunContainer.destroy();
  this.gun = null;
  this.gunOver = null;
  this.robo = null;
  NORD.app.removeListener("update", this.update);
  PIXI.Container.prototype.destroy.call(this);
};
