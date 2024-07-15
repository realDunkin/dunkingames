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

NORD.Field.Wall = function (field, config) {
  if (config.type == "BUMPER") this.container = field.contaierObstacles;
  NORD.Field.FieldObject.call(this, field);
  this.color = NORD.definitionsManager.colorYellow;
  this.type = "WALL";
  this.wallType = config.type;
  this.ballNoCorrectVelocity = config.ballNoCorrectVelocity || false;
  if (this.wallType == "BORDER") this.initBorderWall(config);
  if (this.wallType == "RECT") this.initRectWall(config);
  if (this.wallType == "DIAMOND") this.initDiamondWall(config);

  if (this.wallType == "BUMPER") {
    this.color = 0xffffff;
    this.initBumperWall(config);
  } // console.log(this.bg);

  this.updatePosition();
};

NORD.Field.Wall.prototype = Object.create(NORD.Field.FieldObject.prototype);
NORD.Field.Wall.prototype.constructor = NORD.Field.Wall;

NORD.Field.Wall.prototype.initBorderWall = function (config) {
  //const { x, y, width, height } = config;
  var x = config.x;
  var y = config.y;
  var width = config.width;
  var height = config.height; // console.log('Wall height:', height)

  this.wallWidth = width;
  this.wallHeight = height;

  this.body = Matter.Bodies.rectangle(x, y, width, height, {
    restitution: 1.0,
    friction: 0.0,
    frictionStatic: 0.0,
    frictionAir: 0.0,
    isStatic: true,
    collisionFilter: {
      category: this.field.collisionDefaultCategory,
    },
  });
  this.body.fieldObject = this;
  Matter.World.add(this.field.physics, [this.body]);
  this.bg = new PIXI.Graphics();
  this.addChild(this.bg);
  this.bg.beginFill(this.color, 1.0);
  this.bg.drawRect(0, 0, 10, 10);
  this.bg.width = width;
  this.bg.height = height;
  this.bg.x = -width / 2;
  this.bg.y = -height / 2;
};

NORD.Field.Wall.prototype.initRectWall = function (config) {
  // const { x, y, width, height } = config;
  var x = config.x;
  var y = config.y;
  var width = config.width;
  var height = config.height;
  this.wallWidth = width;
  this.wallHeight = height;
  this.body = Matter.Bodies.rectangle(x, y, width, height, {
    restitution: 1.0,
    friction: 0.0,
    frictionStatic: 0.0,
    frictionAir: 0.0,
    isStatic: true,
    collisionFilter: {
      category: this.field.collisionDefaultCategory,
    },
  });
  this.body.fieldObject = this;
  Matter.World.add(this.field.physics, [this.body]);
  this.bg = new PIXI.Graphics();
  this.addChild(this.bg);
  this.bg.beginFill(this.color, 1.0);
  this.bg.drawRect(-10, -10, 20, 20);
  this.bg.width = width;
  this.bg.height = height;
};

NORD.Field.Wall.prototype.initDiamondWall = function (config) {
  // const { x, y, width, height } = config;
  var x = config.x;
  var y = config.y;
  var width = config.width;
  var height = config.height;
  this.wallWidth = width;
  this.wallHeight = height;
  this.body = Matter.Bodies.rectangle(x, y, width, height, {
    restitution: 1.0,
    friction: 0.0,
    frictionStatic: 0.0,
    frictionAir: 0.0,
    isStatic: true,
    collisionFilter: {
      category: this.field.collisionDefaultCategory,
    },
  });
  this.body.fieldObject = this;
  Matter.World.add(this.field.physics, [this.body]);
  Matter.Body.setAngle(this.body, Math.PI / 4);
  this.bg = new PIXI.Graphics();
  this.addChild(this.bg);
  this.bg.beginFill(this.color, 1.0);
  this.bg.drawRect(-10, -10, 20, 20);
  this.bg.width = width;
  this.bg.height = height; // this.bg.x = -width/2;
  // this.bg.y = -height/2;

  this.bg.rotation = this.body.angle; // console.log('Diamond created!');
};

NORD.Field.Wall.prototype.initBumperWall = function (config) {
  // const { x, y, radius } = config;
  var x = config.x;
  var y = config.y;
  var radius = config.radius; // this.wallWidth = width;
  // this.wallHeight = height;

  this.body = Matter.Bodies.circle(x, y, radius, {
    restitution: 1.0,
    friction: 0.0,
    frictionStatic: 0.0,
    frictionAir: 0.0,
    isStatic: true,
    collisionFilter: {
      category: this.field.collisionDefaultCategory,
    },
  });
  this.body.fieldObject = this;
  Matter.World.add(this.field.physics, [this.body]);
  this.bg = Util.createSprite({
    atlas: "texture_atlas",
    texture: "bumper.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
  });
  this.bg.width = this.bg.height = radius * 2; // this.bg = new PIXI.Graphics();
  // this.addChild(this.bg);
  // this.bg.beginFill(this.color, 1.0);
  // this.bg.drawCircle(0, 0, radius);
};

NORD.Field.Wall.prototype.tweenBumperHit = function () {
  var _this = this;

  TweenMax.to(this.scale, 2 / 30, {
    x: 0.9,
    y: 0.9,
    ease: Power1.easeOut,
    onComplete: function onComplete() {
      TweenMax.to(_this.scale, 2 / 30, {
        x: 1,
        y: 1,
        ease: Power1.easeOut,
        onComplete: function onComplete() {},
      });
    },
  });
};

NORD.Field.Wall.prototype.setSize = function (data) {
  if (this.wallType === "DIAMOND") {
    // console.log('AAA:', data);
    var x = data.x || this.x;
    var y = data.y || this.y;
    var width = data.size || this.wallWidth;
    var height = data.size || this.wallHeight; // console.log('AAA:', x, y, width, height);

    this.destroyBody();
    this.initDiamondWall({
      x: x,
      y: y,
      width: width,
      height: height,
    });
  } else if (this.wallType === "RECT") {
    var _x = data.x || this.x;

    var _y = data.y || this.y;

    var _width = data.width || this.wallWidth;

    var _height = data.height || this.wallHeight;

    this.destroyBody();
    this.initRectWall({
      x: _x,
      y: _y,
      width: _width,
      height: _height,
    });
  } else if (this.wallType === "BORDER") {
    var _x = data.x || this.x;

    var _y = data.y || this.y;

    var _width = data.width || this.wallWidth;

    var _height = data.height || this.wallHeight;

    this.destroyBody();
    this.initRectWall({
      x: _x,
      y: _y,
      width: _width,
      height: _height,
    });
  }
};

NORD.Field.Wall.prototype.destroyBody = function () {
  if (this.body) {
    this.body.fieldObject = null;
    Matter.World.remove(this.field.physics, this.body);
    this.body = null;
    this.bg.clear();
    this.removeChild(this.bg);
  }
};

NORD.Field.Wall.prototype.destroy = function () {
  if (!this.isExist) return; // console.log('Wall destroy!', this.wallType);

  this.state = "DESTROY";

  if (this.body) {
    this.body.fieldObject = null;
    Matter.World.remove(this.field.physics, this.body);
  }

  if (this.bg.clear) this.bg.clear();
  this.removeChild(this.bg);
  NORD.Field.FieldObject.prototype.destroy.call(this);
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.Field.Ball = function (field, x, y) {
  NORD.Field.FieldObject.call(this, field);
  this.type = "BALL";
  this.state = "NONE";
  this.invisibleState = "VISIBLE";
  this.invisibleTween = null;
  this.playerPaddle = null;
  this.color = 0xffffff;
  this.radius = 0;
  this.normalSpeed = 0;
  this.delayCallImpulse = null;
  this.isFirstHit = false;
  this.speedUpCounter = this.field.config.ballSpeedUpFirstHits.value;
  this.setSize(this.field.config.ballSize.value);
  this.fireTail = new FireTail(this.parent, this);
  this.updatePosition();
  this.blink = new Blink(this);
  this.clear();
};

NORD.Field.Ball.prototype = Object.create(NORD.Field.FieldObject.prototype);
NORD.Field.Ball.prototype.constructor = NORD.Field.Ball;

NORD.Field.Ball.prototype.init = function (x, y) {
  this.state = "IN_GAME";
  this.isBig = this.field.ballSize == this.field.config.bblpModeBallSize.value;
  this.setSize(this.field.ballSize);
  this.setColor(0xffffff);
  this.body.isSensor = true;
  this.fireSpeedUpCount = 0;
  this.speedUpCounter = this.field.config.ballSpeedUpFirstHits.value;
  this.normalSpeed = this.field.ballMinSpeed;
  this.speed = this.normalSpeed; // this.speed = 1;

  this.playerPaddle = null;
  this.isFirstHit = false;

  if (this.invisibleTween) {
    this.invisibleTween.kill();
    this.invisibleTween = null;
  }

  this.alpha = 1.0;
  this.invisibleState = "VISIBLE";
  this.setTo(x, y);
};

NORD.Field.Ball.prototype.clear = function (x, y) {
  if (this.state === "WAIT") return;
  this.state = "WAIT";
  this.playerPaddle = null;
  this.isFirstHit = false;

  if (this.invisibleTween) {
    this.invisibleTween.kill();
    this.invisibleTween = null;
  }

  this.fireTail.setEnable(false);
  this.alpha = 1.0;
  this.invisibleState = "VISIBLE";
  this.body.isSensor = true;
  this.setTo(0, 1000);
  Matter.Body.setVelocity(this.body, {
    x: 0,
    y: 0,
  });

  if (this.delayCallImpulse) {
    this.delayCallImpulse.kill();
    this.delayCallImpulse = null;
  }

  this.blink.stop();
  this.alpha = 1.0;
};

NORD.Field.Ball.prototype.setSize = function (radius) {
  this.radius = radius;
  var x = 0;
  var y = 0;
  var velocity = {
    x: 0,
    y: 0,
  };

  if (this.body) {
    x = this.body.position.x;
    y = this.body.position.y;
    velocity = Object.assign({}, this.body.velocity);
    this.body.fieldObject = null;
    Matter.World.remove(this.field.physics, this.body);
  }

  this.body = Matter.Bodies.circle(x, y, this.radius, {
    restitution: 1.0,
    friction: 0.0,
    frictionStatic: 0.0,
    frictionAir: 0.0,
    density: 0.01,
    inertia: Infinity,
    slop: 0.0001,
    collisionFilter: {
      category: this.field.collisionDefaultCategory,
      mask: this.field.collisionDefaultCategory,
    },
  }); // collisionFilter: { category: this.field.collisionBallCategory, mask: this.field.collisionDefaultCategory } });

  this.body.fieldObject = this;
  Matter.World.add(this.field.physics, [this.body]);
  Matter.Body.setVelocity(this.body, {
    x: velocity.x,
    y: velocity.y,
  });
  this.updateGraphics();
  this.fireZoneSpeedUpCounter = 0; // this.bg.width = this.bg.height = this.radius*2 * 0.95;
  // console.log('FFFFFF:', Util.getAngleBetween(-10, 340));
  // console.log('FFFFFF:', Util.getAngleBetween(180+180, 180));
};

NORD.Field.Ball.prototype.setColor = function (color) {
  this.color = color;
  this.updateGraphics();
};

NORD.Field.Ball.prototype.updateGraphics = function () {
  if (this.bg) {
    this.bg.clear();
  } else {
    this.bg = new PIXI.Graphics();
    this.addChild(this.bg);
  }

  this.bg.beginFill(this.color, 1.0);
  this.bg.drawCircle(0, 0, this.radius * 0.95);
};

NORD.Field.Ball.prototype.startImpulse = function (dir) {
  var _this2 = this;

  var speed =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var k = 60;
  var side = dir || Util.randomElement(["LEFT", "RIGHT"]);
  this.attackSide = side;
  speed = speed || this.speed;
  if (this.field.roundMode == "BIG_BALL_LITTLE_PADDLES")
    speed = this.field.ballMinSpeed * 0.7; // speed = 2;

  var angle =
    side === "LEFT"
      ? Util.randomRange(90 + k, 90 + 180 - k)
      : Util.randomRange(90 + 180 + k, 90 + 360 - k);
  var impulse = Util.getMoveVector(speed, angle);
  Matter.Body.setVelocity(this.body, {
    x: impulse.x,
    y: impulse.y,
  }); // console.log('Start impulse:', dir, speed, angle, impulse);

  TweenMax.delayedCall(0.5, function () {
    if (_this2.body) _this2.body.isSensor = false;
  }); // Matter.Body.applyForce(this.body, this.body.position, { x: impulse.x, y: impulse.y });
};

NORD.Field.Ball.prototype.delayImpulse = function (time, dir) {
  var _this3 = this;

  var speed =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  this.blink.start(0.25);
  this.delayCallImpulse = TweenMax.delayedCall(time, function () {
    _this3.delayCallImpulse = null;

    _this3.blink.stop();

    _this3.startImpulse(dir, speed || 0);
  });
};

NORD.Field.Ball.prototype.setTo = function (x, y) {
  Matter.Body.setPosition(this.body, {
    x: x,
    y: y,
  });
};

NORD.Field.Ball.prototype.getMoveAnge = function () {
  return Util.normalizeAngle(
    Util.angle(0, 0, this.body.velocity.x, this.body.velocity.y) *
      Util.TO_DEGREES
  );
};

NORD.Field.Ball.prototype.setMoveAnge = function (angle) {
  var speed = Util.distance(0, 0, this.body.velocity.x, this.body.velocity.y);
  var v = Util.getMoveVector(speed, angle);
  Matter.Body.setVelocity(this.body, {
    x: v.x,
    y: v.y,
  });
};

NORD.Field.Ball.prototype.setInvisible = function (v) {
  var _this4 = this;

  if (v && (this.invisibleState === "VISIBLE" || this.state === "TO_VISIBLE")) {
    if (this.invisibleTween) this.invisibleTween.kill();
    this.invisibleState = "TO_INVISIBLE";
    this.invisibleTween = TweenMax.to(this, 4 / 30, {
      alpha: 0,
      ease: Power2.easeOut,
      onComplete: function onComplete() {
        _this4.invisibleState = "INVISIBLE";
        _this4.invisibleTween = null;
      },
    }); // NORD.audioManager.playAudio('ball_fire_ring');
    // console.log('INV');
  } else if (
    !v &&
    (this.invisibleState === "INVISIBLE" || this.state === "TO_INVISIBLE")
  ) {
    if (this.invisibleTween) this.invisibleTween.kill();
    this.invisibleState = "TO_VISIBLE";
    this.invisibleTween = TweenMax.to(this, 4 / 30, {
      alpha: 1,
      ease: Power2.easeOut,
      onComplete: function onComplete() {
        _this4.invisibleState = "VISIBLE";
        _this4.invisibleTween = null;
      },
    }); // console.log('VIS');
  }
};

NORD.Field.Ball.prototype.update = function () {
  // if (this.body) {
  //   if (this.prevPosition) {
  //     const aaa = Util.normalizeAngle(Util.angle(this.prevPosition.x, this.prevPosition.y, this.body.position.x, this.body.position.y) * Util.TO_DEGREES);
  //     this.attackSide2 = aaa > 90 && aaa <= 90 + 180 ? "LEFT" : "RIGHT";
  //     console.log("AAA:", this.attackSide2, aaa);
  //   }
  //   else {
  //     this.attackSide2 = "none";
  //   }
  //   this.prevPosition = { x: this.body.position.x, y: this.body.position.y };
  // }
  NORD.Field.FieldObject.prototype.update.call(this);
  if (!this.field.isGame() || this.state !== "IN_GAME") return;
  var self = this;
  if (
    this.speed > this.field.ballMaxSpeed &&
    this.field.roundMode !== "FIRE_ZONE"
  )
    this.setSpeed(this.speed * 0.95);
  this.moveAngle = this.getMoveAnge();
  this.side = this.body.position.x > 0 ? "RIGHT" : "LEFT";
  this.attackSide = getAttackSide(this.moveAngle);

  function getAttackSide(angle) {
    return angle >= 90 && angle < 90 + 180 ? "LEFT" : "RIGHT";
  }

  this.checkGoal();

  if (
    this.field.roundGenerator.roundMode === "DOUBLE_BALL" &&
    this.field.getActiveBalls().length === 1
  ) {
    if (Math.abs(this.x) < 5) {
      var delay = this.field.config.multiballModeNewBallDelay.value;
      var ball;
      if (delay)
        ball = this.field.placeNewBall(
          this.attackSide === "LEFT" ? "RIGHT" : "LEFT",
          {
            delayBlinkTime: delay,
            speed: this.speed,
          }
        );
      else
        ball = this.field.placeNewBall(
          this.attackSide === "LEFT" ? "RIGHT" : "LEFT",
          {
            speed: this.speed,
          }
        ); // ball.setSpeed(this.speed);
      // console.log('CCC:', ball.speed, this.speed);
    }
  }
};

NORD.Field.Ball.prototype.correctVelocity = function () {
  if (!(this.state === "IN_GAME")) return;
  var currentAngle = Util.normalizeAngle(
    Util.angle(0, 0, this.body.velocity.x, this.body.velocity.y) *
      Util.TO_DEGREES
  );
  var shiftAngle = 55;
  var angle = null;
  var dif = null;
  var avaiableAngles = [
    360 - shiftAngle,
    0 + shiftAngle,
    180 - shiftAngle,
    180 + shiftAngle,
  ];

  if (
    currentAngle >= avaiableAngles[0] ||
    currentAngle < avaiableAngles[1] ||
    (currentAngle >= avaiableAngles[2] && currentAngle < avaiableAngles[3])
  ) {
    return;
  }

  for (var i = 0; i < avaiableAngles.length; i++) {
    var d = getAngleDif(currentAngle, avaiableAngles[i]);

    if (dif == null || d < dif) {
      angle = avaiableAngles[i];
      dif = d;
    }
  }

  var impulse = Util.getMoveVector(
    Util.distance(0, 0, this.body.velocity.x, this.body.velocity.y),
    angle
  );
  Matter.Body.setVelocity(this.body, {
    x: impulse.x,
    y: impulse.y,
  }); // Matter.Body.setVelocity(this.body, { x: this.body.velocity.x + signX*d, y: this.body.velocity.y-signY*d });

  function getAngleDif(a1, a2) {
    return Math.min(Math.abs(a2 - a1), Math.abs(a2 - a1 + 360));
  } // const corK = 2;
  // if(Math.abs(this.body.velocity.y) > Math.abs(this.body.velocity.x * corK))
  // {
  //   const signX = Util.sign(this.body.velocity.x);
  //   const signY = Util.sign(this.body.velocity.y);
  //   const d = Math.abs(this.body.velocity.y) - Math.abs(this.body.velocity.x * corK);
  //   Matter.Body.setVelocity(this.body, { x: this.body.velocity.x + signX*d, y: this.body.velocity.y-signY*d });
  // }
};

NORD.Field.Ball.prototype.checkGoal = function () {
  var goalShift = NORD.app.platform == "mobile" ? 0 : 100;
  var isGoal =
    this.body.position.x <
      -this.field.getActiveFieldWidth() / 2 - this.radius - goalShift ||
    this.body.position.x >
      this.field.getActiveFieldWidth() / 2 + this.radius + goalShift ||
    this.body.position.y <
      -this.field.config.FIELD_HEIGHT / 2 -
        this.field.config.WALLS_HEIGHT -
        goalShift ||
    this.body.position.y >
      this.field.config.FIELD_HEIGHT / 2 +
        this.field.config.WALLS_HEIGHT +
        goalShift;

  if (isGoal) {
    var goalPlayer = this.field.players[
      this.side === "LEFT" ? "RIGHT" : "LEFT"
    ];
    if (this.field.roundGenerator.roundMode !== "DOUBLE_BALL")
      this.field.goal(goalPlayer, this);
    else
      this.field.emit("multiball_goal", {
        ball: this,
        player: goalPlayer,
      });
  }
};

NORD.Field.Ball.prototype.setSpeed = function (speed) {
  this.normalSpeed = speed;
  this.speed = this.normalSpeed;
  var angle =
    Util.angle(0, 0, this.body.velocity.x, this.body.velocity.y) *
    Util.TO_DEGREES;
  var impulse = Util.getMoveVector(this.speed, angle);
  Matter.Body.setVelocity(this.body, {
    x: impulse.x,
    y: impulse.y,
  });
};

NORD.Field.Ball.prototype.speedUp = function (speedK) {
  if (this.field.ballSpeedUpDisable) return;
  this.speedUpCounter--;
  if (this.speedUpCounter > 0) return;
  this.speedUpCounter = this.field.config.ballSpeedUpHits.value;
  this.normalSpeed *= speedK;
  this.normalSpeed = Math.min(this.normalSpeed, this.field.ballMaxSpeed);
  this.speed = this.normalSpeed;
  var angle =
    Util.angle(0, 0, this.body.velocity.x, this.body.velocity.y) *
    Util.TO_DEGREES;
  var impulse = Util.getMoveVector(this.speed, angle);
  Matter.Body.setVelocity(this.body, {
    x: impulse.x,
    y: impulse.y,
  }); // console.log('Ball speed up!', this.field.ballMaxSpeed);
};

NORD.Field.Ball.prototype.bumperSpeedUp = function (speedK) {
  this.normalSpeed *= speedK;
  this.normalSpeed = Math.min(this.normalSpeed, this.field.ballMaxSpeed);
  this.speed = this.normalSpeed;
  var angle =
    Util.angle(0, 0, this.body.velocity.x, this.body.velocity.y) *
    Util.TO_DEGREES;
  var impulse = Util.getMoveVector(this.speed, angle);
  Matter.Body.setVelocity(this.body, {
    x: impulse.x,
    y: impulse.y,
  });
};

NORD.Field.Ball.prototype.fireZoneSpeedUp = function (speedK) {
  var _fireColors;

  this.bumperSpeedUp(speedK);

  if (!this.fireTail.isEnable) {
    this.fireTail.setEnable(true);
    this.fireTail.power = 0.2;
  } else this.fireTail.power = Math.min(1.0, this.fireTail.power + 0.15);

  this.fireSpeedUpCount++;
  if (this.fireSpeedUpCount > 4) this.fireSpeedUpCount = 4;
  var fireColors =
    ((_fireColors = {}),
    _defineProperty(_fireColors, "1", 0xfcd8b7),
    _defineProperty(_fireColors, "2", 0xfabe86),
    _defineProperty(_fireColors, "3", 0xf89d46),
    _defineProperty(_fireColors, "4", 0xf67903),
    _fireColors);
  this.setColor(fireColors[this.fireSpeedUpCount]);
};

NORD.Field.Ball.prototype.distortionVelocity = function (paddle) {
  var k = paddle.speed / this.field.config.paddleSpeed.value; // console.log('K:', k, this.field.config.paddleSpeed.value, paddle.speed);

  if (k > 1) k = 1;
  if (k < -1) k = -1;
  var maxDistortion = 30;
  var distortion = maxDistortion * k * (paddle.side === "RIGHT" ? -1 : 1);
  var angle = Util.normalizeAngle(
    Util.angle(0, 0, this.body.velocity.x, this.body.velocity.y) *
      Util.TO_DEGREES +
      distortion
  );
  var impulse = Util.getMoveVector(
    Util.distance(0, 0, this.body.velocity.x, this.body.velocity.y),
    angle
  );
  Matter.Body.setVelocity(this.body, {
    x: impulse.x,
    y: impulse.y,
  });
};

NORD.Field.Ball.prototype.ballHitBall = function (ball) {
  if (this.body.isSensor) {
    return;
  } // console.log('Ball', ball);

  this.setSpeed(this.speed);
  this.correctVelocity();

  if (this.field.roundMode == "DODGE") {
    if (this.field.config.dodgeHitWallSound.value === 0) {
      NORD.audioManager.playAudio("dodge_hit_wall_1");
    } else {
      NORD.audioManager.playAudio("dodge_hit_wall_2");
    }
  } else NORD.audioManager.playAudio("wall_hit_ball");
};

NORD.Field.Ball.prototype.hitWall = function (wall) {
  var self = this;

  if (
    this.field.roundGenerator &&
    this.field.roundGenerator.roundMode === "DODGE"
  ) {
    this.bumperSpeedUp(this.field.getBallSpeedUpK("DODGE_WALL"));
  } else if (wall.wallType === "INVISIBLE_WALL") {
    wall.blink();
    this.bumperSpeedUp(this.field.getBallSpeedUpK("INVISIBLE_WALL"));
    this.correctVelocity();
  }

  if (wall.wallType === "BUMPER") {
    wall.tweenBumperHit();
    this.bumperSpeedUp(this.field.getBallSpeedUpK("BUMPER"));
    NORD.audioManager.playAudio("ball_hit_bumper");
    this.correctVelocity();
  } else if (this.invisibleState !== "INVISIBLE") {
    if (this.field.roundMode == "DODGE") {
      if (this.field.config.dodgeHitWallSound.value === 0) {
        NORD.audioManager.playAudio("dodge_hit_wall_1");
      } else {
        NORD.audioManager.playAudio("dodge_hit_wall_2");
      }
    } else if (this.isBig) NORD.audioManager.playAudio("wall_hit_big_ball");
    else NORD.audioManager.playAudio("wall_hit_ball");
  } // console.log('Hit Wall:', wall, wall.wallType);
  // if(wall && !wall.ballNoCorrectVelocity) this.correctVelocity();
};

NORD.Field.Ball.prototype.hitPaddle = function (paddle) {
  var self = this;
  this.speedUp(this.field.getBallSpeedUpK("PADDLE")); // this.fireZoneSlowdown();
  // console.log('Paddle hit:', paddle.speed);
  // if((paddle.side === 'LEFT' && this.body.velocity.x < 0 && this.body.position.x > paddle.body.position.x) ||
  //    (paddle.side === 'RIGHT' && this.body.velocity.x > 0 && this.body.position.x < paddle.body.position.x))

  var checkBounce = function () {
    var leftSidePosition = self.body.position.x + self.radius + 5;
    var rightSidePosition = self.body.position.x - self.radius - 5;

    if (self.field.roundMode == "BIG_BALL_LITTLE_PADDLES") {
      leftSidePosition = self.body.position.x;
      rightSidePosition = self.body.position.x;
    }

    if (
      (paddle.side === "LEFT" &&
        self.body.velocity.x < 0 &&
        leftSidePosition > paddle.body.position.x) ||
      (paddle.side === "RIGHT" &&
        self.body.velocity.x > 0 &&
        rightSidePosition < paddle.body.position.x)
    ) {
      Matter.Body.setVelocity(self.body, {
        x: self.body.velocity.x * -1,
        y: self.body.velocity.y,
      });
    }
  };

  checkBounce();

  this.distortionVelocity(paddle);
  this.correctVelocity();

  checkBounce();

  if (!this.isFirstHit && this.field.roundMode == "BIG_BALL_LITTLE_PADDLES") {
    this.setSpeed(this.field.ballMinSpeed);
  }

  this.playerPaddle = paddle;

  if (
    this.field.roundGenerator &&
    this.field.roundGenerator.roundMode !== "SHATTER" &&
    this.field.roundGenerator.roundMode !== "DODGE"
  ) {
    var p = paddle.side === "LEFT" ? "player1" : "player2";
    if (this.isBig) NORD.audioManager.playAudio(p + "_hit_big_ball");
    else NORD.audioManager.playAudio(p + "_hit_ball");
  }

  this.isFirstHit = true;

  if (this.field.roundMode == "DODGE") {
    paddle.dodgeHit();
  }
};

NORD.Field.Ball.prototype.hitBreak = function (wallBreak) {
  var self = this;
  wallBreak.hit();
  NORD.audioManager.playAudio("brick_destroy");
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

var FireTail = function FireTail(container, ball) {
  this.isExist = true;
  this.isEnable = false;
  this.ball = ball;
  this.container = container;
  this.power = 0.6;
  this.powerCounter = 5;
  this.counter = 0; // TweenMax.to(this, 5.0, { power: 1.0 });

  NORD.app.on("update", this.update, this);
};

FireTail.prototype.setEnable = function (isEnable) {
  if (this.isEnable === isEnable) return;
  this.isEnable = isEnable;
};

FireTail.prototype.update = function () {
  if (
    !this.isExist ||
    !this.isEnable ||
    !this.ball ||
    this.ball.moveAngle == undefined ||
    NORD.game.field.state.getState().pause === "TRUE"
  )
    return;
  this.counter++;

  if (this.counter >= 1 + this.powerCounter * (1 - this.power)) {
    this.counter = 0;
    createParticle({
      x: this.ball.x,
      y: this.ball.y,
      container: this.container,
      angle: this.ball.moveAngle + 180 + Util.randomRange(-50, 50),
    });
  }
};

var createParticle = function createParticle(data) {
  var particle = {
    isExist: true,
  };
  particle.sprite = Util.createSprite({
    atlas: "texture_atlas",
    texture: "fire_tail_p_1.png",
    parent: data.container,
    aX: 0.5,
    aY: 0.5,
  });
  var p2 = Util.getMoveVector(10, data.angle);
  particle.sprite.x = data.x + p2.x;
  particle.sprite.y = data.y + p2.y;
  var distance = Util.randomRange(10, 40);
  var time = Util.randomRange(0.9, 1.9);
  var p = Util.getMoveVector(distance, data.angle);
  particle.sprite.scale.x = particle.sprite.scale.y = Util.randomRange(
    0.8,
    1.4
  );
  particle.tween2 = TweenMax.to(particle.sprite.scale, time, {
    alpha: 0.0,
    x: 0.4,
    y: 0.4,
    ease: Power2.easeOut,
  });
  particle.tween = TweenMax.to(particle.sprite, time, {
    alpha: 0.0,
    x: particle.sprite.x + p.x,
    y: particle.sprite.y + p.y,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      particle.tween2 = null;
      particle.tween = null;
      particle.destroy();
    },
  });

  particle.destroy = function () {
    if (!particle.isExist) return;
    particle.isExist = false;
    particle.sprite.visible = false;
    particle.sprite.parent.removeChild(particle.sprite);
    particle.sprite.destroy();
    particle.sprite = null;

    if (particle.tween) {
      particle.tween.kill();
      particle.tween = null;
    }

    if (particle.tween2) {
      particle.tween2.kill();
      particle.tween2 = null;
    }
  };
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

var Blink = function Blink(object) {
  var _this5 = this;

  this.object = object;
  this.time = 0;
  this.period = 0;
  this.delayedCall = null;
  this.stopDelayCall = null;
  this.isBlink = false;

  this.start = function (period) {
    var time =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
    _this5.isBlink = true;

    if (_this5.stopDelayCall) {
      _this5.stopDelayCall.kill();

      _this5.stopDelayCall = null;
    }

    loop("UP", period);

    if (time > 0) {
      _this5.stopDelayCall = TweenMax.delayedCall(time, function () {
        _this5.stopDelayCall = null;

        _this5.stop();
      });
    }
  };

  this.stop = function () {
    var isVisible =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    _this5.isBlink = false;

    if (_this5.delayedCall) {
      _this5.delayedCall.kill();

      _this5.delayedCall = null;
    }

    if (_this5.stopDelayCall) {
      _this5.stopDelayCall.kill();

      _this5.stopDelayCall = null;
    }

    if (isVisible) _this5.object.alpha = 1.0;
    else _this5.object.alpha = 0.0;
  };

  var loop = function loop(dir, period) {
    if (dir == "UP") {
      _this5.object.alpha = 1.0;
    }

    if (dir == "DOWN") {
      _this5.object.alpha = 0.0;
    }

    _this5.delayedCall = TweenMax.delayedCall(period, function () {
      _this5.delayedCall = null;
      loop(dir == "UP" ? "DOWN" : "UP", period);
    });
  };
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.Field.Paddle = function (field, side) {
  NORD.Field.FieldObject.call(this, field);
  var self = this;
  this.type = "PADDLE";
  this.color = 0xffffff;
  this.bonuses = [];
  this.side = side;
  this.shootsCount = 0;
  this.shootsMode = "OFF";
  this.isStun = false;
  this.stunDelay = null;
  this.isDodgeImmortal = false; // this.speed = this.field.config.paddleSpeed.value;

  this.speed = 0;
  this.maxSpeed = this.field.config.paddleSpeed.value;
  this.tweenSpeed = null;
  this.moveState = "STOP";
  this.field.config.paddleDeceleration.on(
    "change",
    function (data) {
      this.updateDeccelerationRation();
    },
    this
  );
  this.updateDeccelerationRation();
  this.tutUp = Util.createSprite({
    atlas: "texture_atlas",
    texture: "tut_p" + (side === "LEFT" ? 2 : 1) + "_up.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
    y: 0,
    scaleXY: 0.7,
  });
  this.tutDown = Util.createSprite({
    atlas: "texture_atlas",
    texture: "tut_p" + (side === "LEFT" ? 2 : 1) + "_down.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
    y: 0,
    scaleXY: 0.7,
  });
  this.tutUp.visible = this.tutDown.visible = false; // this.shootViewTexture1 = NORD.assetsManager.getTexture('texture_atlas', 'gun_1.png');
  // this.shootViewTexture2 = NORD.assetsManager.getTexture('texture_atlas', 'gun_2.png');

  this.shootView = Util.createSprite({
    atlas: "texture_atlas",
    texture: "gun.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
    scaleXY: 0.7,
  });
  var shootShift = 34;

  if (this.side === "LEFT") {
    this.shootView.scale.x = -0.7;
    this.shootView.x = shootShift;
  } else {
    this.shootView.scale.x = 0.7;
    this.shootView.x = -shootShift;
  }

  this.shootView.visible = false;
  this.shootViewTween = null; // this.shootsTotalDefault = 2;
  // this.shootsTotal = this.shootsTotalDefault;

  this.blinkShootView = new Blink(this.shootView);
  this.blinkPaddle = new Blink(this);
  this.isFlappy = false;
  this.currentVerticies = null; // this.body = Matter.Bodies.circle(0, 0, 3, { isStatic: true, inertia: Infinity, restitution: 1.0, friction: 0.0, frictionStatic: 0.0, frictionAir: 0.0, inertia: Infinity, slop: 0.00001 }, 100);
  // Matter.World.add(this.field.physics, [this.body]);
  // this.bg = Util.createSprite({ atlas: 'texture_atlas', texture: 'paddle.png', parent: this, aX: 0.5, aY: 0.5 });
  // this.paddleMask = new PIXI.Graphics();
  // this.addChild(this.paddleMask);
  // this.paddleMask.beginFill(0xFFFFFF);
  // this.paddleMask.drawRect(0, -400, 200, 800);
  // this.bg.mask = this.paddleMask;
  // this.paddleMask.interactive = true;

  this.touchArea = Util.createSprite({
    atlas: "texture_atlas",
    texture: "paddle.png",
    parent: this,
    aX: 0.5,
    aY: 0.5,
  });
  this.touchArea.interactive = true;
  this.touchArea.width = 400;
  this.touchArea.height = 1200;
  this.touchArea.alpha = 0;
  this.interactive = true;
  this.paddleView = new PaddleView2();
  this.addChild(this.paddleView);
  this.paddleView.on(
    "change",
    function (data) {
      // this.updatePaddle();
    },
    this
  );
  this.setSize(
    this.field.config.paddleSize.value,
    this.field.config.paddleShape.value
  );
  this.field.config.paddleShape.on(
    "change",
    function (data) {
      this.setSize(
        this.field.config.paddleSize.value,
        this.field.config.paddleShape.value
      );
    },
    this
  );
  this.field.config.paddleSize.on(
    "change",
    function (data) {
      this.setSize(
        this.field.config.paddleSize.value,
        this.field.config.paddleShape.value
      );
    },
    this
  );
  this.normalWingScale = 0.5;
  this.wing = Util.createSprite({
    atlas: "texture_atlas",
    texture: "wing.png",
    parent: this,
    aX: 0.5,
    aY: 1.0,
    scaleXY: this.normalWingScale,
  });
  this.wing.visible = false;
  this.tweenWing = null;

  if (this.side === "LEFT") {
    this.wing.scale.x *= -1;
  }

  this.createShatterEffect();

  if (this.side === "RIGHT") {
  } // NORD.app.on("pointer_down", function(data) {
  //   const p = self.parent.toLocal(data.mouse);
  // console.log(data.mouse.y, p.y, self.y);
  // self.chop(data.mouse.y);
  // self.chop2(data.mouse.y);
  // });
  // this.field.config.paddlePlatformSize.on('change', function(data)
  // {
  //   this.setSize(this.field.config.paddleShape.value, this.field.config.paddleSize.value);
  // }, this);
  // console.log('F:', this);
  // this.updatePosition();
};

NORD.Field.Paddle.prototype = Object.create(NORD.Field.FieldObject.prototype);
NORD.Field.Paddle.prototype.constructor = NORD.Field.Paddle;

NORD.Field.Paddle.prototype.setTut = function (v) {
  var size = this.paddleView.paddleWidth / 2 + 20;
  this.tutUp.y = -size;
  this.tutDown.y = size;
  this.tutUp.visible = this.tutDown.visible = v; // console.log('Set tut:', v, size);
};

NORD.Field.Paddle.prototype.createShatterEffect = function () {
  var textureArray = [];
  var textureDownArray = []; // const textureArrayOver = [];

  for (var i = 1; i <= 18; i++) {
    var n = i < 10 ? "0" + i : "" + i;
    var texture = NORD.assetsManager.getTexture(
      "texture_atlas",
      "shatter_effect_00" + n + ".png"
    );
    textureArray.push(texture);
    var textureDown = NORD.assetsManager.getTexture(
      "texture_atlas",
      "shatter_effect_down_00" + n + ".png"
    );
    textureDownArray.push(textureDown);
  }

  var anim = new PIXI.AnimatedSprite(textureArray);
  this.parent.addChild(anim);
  var animDown = new PIXI.AnimatedSprite(textureDownArray);
  this.parent.addChild(animDown);
  anim.anchor.set(0.5, 0.8);
  anim.animationSpeed = 0.5;
  anim.loop = false;
  anim.visible = false;
  animDown.anchor.set(0.5, 0.4);
  animDown.animationSpeed = 0.5;
  animDown.loop = false;
  animDown.visible = false;
  this.shatterEffect = anim;
  this.shatterEffectDown = animDown;
};

NORD.Field.Paddle.prototype.setShootView = function (isShow) {
  if (isShow && !this.shootView.visible) {
    this.shootView.visible = true;
    this.shootView.alpha = 1.0; // this.blinkShootView.start(0.25, 1.0);
  } else if (!isShow && this.shootView.visible) {
    this.shootView.visible = false;
    this.blinkShootView.stop();
  }
};

NORD.Field.Paddle.prototype.addShoots = function () {
  var count =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  this.shootsCount += count;
  this.setShootsMode("ON");
  this.field.emit("gun_ready", this);
};

NORD.Field.Paddle.prototype.setShootsMode = function (mode) {
  if (this.shootsMode === mode) return;
  this.shootsMode = mode;
  if (this.shootsMode == "ON") this.setShootView(true);
  else this.setShootView(false);
};

NORD.Field.Paddle.prototype.shoot = function () {
  var _this6 = this;

  if (this.shootsCount <= 0) return;
  this.shootsCount--;
  if (this.shootsCount === 0) this.setShootsMode("OFF");
  var bullet = new NORD.Field.PaddleBullet(this.field, {
    paddle: this,
  });
  NORD.audioManager.playAudio("blaster_shoot");

  if (this.shootsCount === 0) {
    this.shootReload = TweenMax.delayedCall(
      this.field.config.gunModeReload.value,
      function () {
        _this6.shootReload = null; // this.shootsTotal --;

        _this6.addShoots(1);
      }
    );
  }

  this.field.emit("gun_shoot", this);
};

NORD.Field.Paddle.prototype.stun = function () {
  var _this7 = this;

  // this.stopMove();
  // this.isStun = true;
  // return;
  if (this.stunDelay !== null) this.stunDelay.kill();
  this.stunDelay = TweenMax.delayedCall(0.7, function () {
    _this7.stunDelay = null; // this.isStun = false;

    _this7.blinkPaddle.stop();

    _this7.alpha = 1.0;
  });
  this.blinkPaddle.start(0.1);
};

NORD.Field.Paddle.prototype.dodgeHit = function () {
  var _this8 = this;

  if (this.isDodgeImmortal) {
    return;
  }

  this.isDodgeImmortal = true;
  var immortalTime = this.field.config.dodgeImmortalTime.value;
  if (this.stunDelay !== null) this.stunDelay.kill();
  this.stunDelay = TweenMax.delayedCall(immortalTime, function () {
    _this8.stunDelay = null;
    _this8.isDodgeImmortal = false;

    _this8.blinkPaddle.stop();

    _this8.alpha = 1.0;
  });
  this.blinkPaddle.start(0.2);
  this.field.emit("bullet_hit_paddle", this);

  if (this.field.config.dodgeHitPaddleSound.value === 0) {
    NORD.audioManager.playAudio("dodge_hit_paddle");
  } else {
    NORD.audioManager.playAudio("dodge_hit_paddle_2");
  }
};

NORD.Field.Paddle.prototype.updateDeccelerationRation = function () {
  this.deccelerationEase = Power2.easeOut;
  this.deccelerationSpeedRation = 0;

  for (var i = 0; i < this.field.config.paddleDeceleration.value * 60; i++) {
    this.deccelerationSpeedRation +=
      1 -
      Power2.easeOut.getRatio(
        i / (this.field.config.paddleDeceleration.value * 60)
      );
  }
};

NORD.Field.Paddle.prototype.init = function (player) {
  this.clear();
  this.player = player;
  if (this.player.type === "AI")
    this.controller = new NORD.Field.PaddleControllerAI(this.field, this);
  else if (this.player.type === "HUMAN")
    this.controller = new NORD.Field.PaddleControllerHuman(this.field, this); // this.controller = new NORD.Field.PaddleControllerHuman(this.field, this);

  this.setTo(this.sidePosition, 0);
  this.visible = true;
  this.isFlappyTutorial = false;
};

NORD.Field.Paddle.prototype.clear = function () {
  this.setSize(
    this.field.config.paddleSize.value,
    this.field.config.paddleShape.value
  );
  this.player = null;
  if (this.controller) this.controller.destroy();
  this.controller = null; // this.shootsTotal = this.shootsTotalDefault;

  this.isDodgeImmortal = false;
  this.isFlappyTutorial = false;
  this.speed = 0;
  this.moveState = "STOP";

  if (this.tweenSpeed !== null) {
    this.tweenSpeed.kill();
    this.tweenSpeed = null;
  }

  if (this.shootReload) {
    this.shootReload.kill();
    this.shootReload = null;
  }

  if (this.shootViewTween) {
    this.shootViewTween.kill();
    this.shootViewTween = null;
  }

  this.shootView.visible = false;

  while (this.bonuses.length) {
    this.bonuses[0].destroy();
  }

  this.shootsCount = 0;
  this.shootsMode = "OFF";
  this.blinkPaddle.stop();
  this.alpha = 1.0;
  this.blinkShootView.stop();
  this.shootView.visible = false;
  this.isStun = false;
  if (this.stunDelay !== null) this.stunDelay.kill();
  this.stunDelay = null;
  this.isFlappy = false;
  this.flappyJumpDelay = 0;
  this.flappyJumpDelayDefault = Math.round(
    60 / this.field.config.flappyJumpsPerSecond.value
  );
  this.flappySpeed = 0;
  this.flappyFallSpeedUp = this.field.config.flappyFallSpeedUp.value;
  this.flappyJumpSpeedUp = this.field.config.flappyJumpSpeedUp.value;

  if (this.tweenWing) {
    this.tweenWing.kill();
    this.tweenWing = null;
  }

  this.wing.scale.x = this.wing.scale.y = this.normalWingScale;

  if (this.side === "LEFT") {
    this.wing.scale.x *= -1;
  }

  this.wing.alpha = 1.0;
  this.wing.visible = false;
  this.isChoping = false;

  if (this.tweenChop) {
    this.tweenChop.kill();
    this.tweenChop = null;
  }

  this.shatterEffect.gotoAndStop(0);
  this.shatterEffect.visible = false;
  this.shatterEffectDown.gotoAndStop(0);
  this.shatterEffectDown.visible = false;
};

NORD.Field.Paddle.prototype.addBonus = function (bonus) {
  this.bonuses.push(bonus);
  this.applyBonuses();
};

NORD.Field.Paddle.prototype.removeBonus = function (bonus) {
  var n = this.bonuses.indexOf(bonus);
  this.bonuses.splice(n, 1);
  this.applyBonuses();
};

NORD.Field.Paddle.prototype.applyBonuses = function () {
  var _this9 = this;

  // this.setSize(this.field.config.paddleSize.value, this.field.config.paddleShape.value);
  var size = this.field.config.paddleSize.value;
  var controlPoints = this.field.config.paddleShape.value;
  var maxSpeed = this.field.config.paddleSpeed.value;
  this.bonuses.forEach(function (bonus) {
    if (bonus.type === "PADDLE_SIZE") size = bonus.paddleSize;
    else if (bonus.type === "PADDLE_SPEED")
      maxSpeed = _this9.field.config.paddleSpeed.value * bonus.speedK;
  });
  if (this.paddleView.size !== size) this.setSize(size, controlPoints);
  if (this.maxSpeed !== maxSpeed) this.maxSpeed = maxSpeed;
};

NORD.Field.Paddle.prototype.setSize = function (size, controlPoints) {
  this.paddleView.size = size;
  this.paddleView.controlPoints = controlPoints;
  this.paddleView.updatePaddle();
  this.size = this.paddleView.paddleWidth;
  this.sizeConfig = size;
  this.sidePosition = this.getSidePosition();

  this.updatePaddle();
};

NORD.Field.Paddle.prototype.getSidePosition = function () {
  return (
    (this.field.getActiveFieldWidth() / 2 - 20) *
    (this.side === "LEFT" ? -1 : 1)
  );
};

NORD.Field.Paddle.prototype.updateSidePosition = function () {
  this.sidePosition = this.getSidePosition();

  this.setTo(this.sidePosition, this.body.position.y);

  // if (this.body) {
  //   this.setTo(this.sidePosition, this.body.y);
  // }

  // console.log(this.sidePosition);
};

NORD.Field.Paddle.prototype.updatePaddle = function () {
  var _Matter$Bodies$fromVe;

  var vertices =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var y = 0;

  if (this.body) {
    y = this.body.position.y;
    this.body.fieldObject = null;
    Matter.World.remove(this.field.physics, this.body);
  }

  if (!vertices) {
    vertices = this.paddleView.getPoints(
      this.side == "LEFT" ? -Math.PI / 2 : Math.PI / 2
    );
  }

  this.body = Matter.Bodies.fromVertices(
    this.sidePosition,
    y,
    vertices,
    ((_Matter$Bodies$fromVe = {
      isStatic: true,
      inertia: Infinity,
      restitution: 1.0,
      friction: 0.0,
      frictionStatic: 0.0,
      frictionAir: 0.0,
    }),
    _defineProperty(_Matter$Bodies$fromVe, "inertia", Infinity),
    _defineProperty(_Matter$Bodies$fromVe, "slop", 0.00001),
    _defineProperty(_Matter$Bodies$fromVe, "collisionFilter", {
      category: this.field.collisionDefaultCategory,
      mask:
        this.field.collisionBallCategory | this.field.collisionBulletCategory,
    }),
    _Matter$Bodies$fromVe)
  );
  this.body.fieldObject = this;
  Matter.World.add(this.field.physics, [this.body]); // console.log('AAA:', this.body, this);

  this.paddleView.rotation = this.side == "LEFT" ? Math.PI / 2 : -Math.PI / 2;
  this.paddleView.visible = false;

  if (!this.graphics) {
    this.graphics = new PIXI.Graphics();
    this.addChild(this.graphics);
  }

  this.graphics.clear();
  this.drawPaddle();
  this.checkBounds(); // this.paddleView.x = -this.paddleView.paddleHeight/2 * (this.side == 'LEFT'?-1:1);
  // console.log(this.paddleView.paddleHeight);
};

NORD.Field.Paddle.prototype.drawPaddle = function () {
  var bbb = this.body;

  var drawBody = function drawBody(body) {
    if (body.parts && body.parts.length > 1) {
      body.parts.forEach(function (b, i) {
        if (i == 0) return;
        drawBody(b);
      });
    } else {
      mainGraphics.lineStyle(1, 0xffffff);
      mainGraphics.beginFill(0xffffff, 1.0);
      var vertices = body.vertices.map(function (p) {
        return {
          x: p.x - bbb.position.x,
          y: p.y - bbb.position.y,
        };
      });
      var startVert = vertices[0];
      mainGraphics.moveTo(startVert.x, startVert.y);
      vertices.forEach(function (vert, n) {
        if (n === 0) return;
        mainGraphics.lineTo(vert.x, vert.y);
      });
      mainGraphics.lineTo(startVert.x, startVert.y);
    }
  };

  var mainGraphics = this.graphics;
  mainGraphics.clear();
  drawBody(this.body);
};

NORD.Field.Paddle.prototype.drawPaddle2 = function () {
  var _this10 = this;

  var mainGraphics = this.graphics;
  mainGraphics.clear(); // const bbb = this.body;
  // console.log(this.body.parts);
  // const vertices = [...this.currentVerticies];

  var vertices = _toConsumableArray(this.currentVerticies).map(function (p) {
    return {
      x: p.x - _this10.body.position.x,
      y: p.y - _this10.body.position.y,
    };
  }); // console.log("DRAW!!!!");

  mainGraphics.lineStyle(1, 0xffffff);
  mainGraphics.beginFill(0xffffff, 1.0); // const vertices = vertices.map(p => {
  //   return { x: p.x - bbb.position.x, y: p.y - bbb.position.y };
  // });

  var startVert = vertices[0];
  mainGraphics.moveTo(startVert.x, startVert.y);
  vertices.forEach(function (vert, n) {
    if (n === 0) return;
    mainGraphics.lineTo(vert.x, vert.y);
  });
  mainGraphics.lineTo(startVert.x, startVert.y);
};

NORD.Field.Paddle.prototype.setTo = function (x, y) {
  Matter.Body.setPosition(this.body, {
    x: x,
    y: y,
  });
};

NORD.Field.Paddle.prototype.moveToSoft = function (y) {
  if (this.isStun || this.isChoping) return;
  var side = y > this.body.position.y ? "DOWN" : "UP";
  var distance = Math.abs(y - this.body.position.y);
  var isRightMove = Util.sign(this.speed) === (side === "UP" ? -1 : 1);
  var acceleration = this.field.config.paddleAcceleration.value;
  var decceleration = this.field.config.paddleDeceleration.value;
  var absSpeed = Math.abs(this.speed);

  if (distance < 5) {
    this.stopMove();
    return;
  }

  if (isRightMove) {
    var stopDistance = absSpeed * this.deccelerationSpeedRation * 0.7;

    if (distance <= stopDistance) {
      // if(this === this.field.paddleRight) console.log('StopDistance:', stopDistance, 'Distance:', distance);
      this.stopMove();
      return;
    }
  } // if(this === this.field.paddleRight) console.log('Side:', side);

  this.moveTo(side);
};

NORD.Field.Paddle.prototype.moveTo = function (p) {
  if (!this.field.isGame()) return;
  if (this.isStun || this.isChoping) return;
  var self = this;
  var side = "NONE";
  if (typeof p !== "string") side = p > this.body.position.y ? "DOWN" : "UP";
  else side = p;
  if (side === "NONE") return;
  if (this.moveState === side) return;

  if (this.tweenSpeed !== null) {
    this.tweenSpeed.kill();
    this.tweenSpeed = null;
  }

  var targetSpeed = this.maxSpeed * (side === "UP" ? -1 : 1);
  var acceleration = this.field.config.paddleAcceleration.value; // if(this.moveState === 'STOP' || this.moveState === 'STOPING')
  // {

  this.moveState = side;
  this.tweenSpeed = TweenMax.to(this, acceleration, {
    speed: targetSpeed,
    ease: Power4.easeOut,
    onComplete: function onComplete() {
      self.tweenSpeed = null;
    },
  }); // if(this === this.field.paddleRight) console.log(targetSpeed);
  // }
};

NORD.Field.Paddle.prototype.stopMove = function () {
  if (this.moveState === "STOP" || this.moveState === "STOPING") return;
  var self = this;
  this.moveState = "STOPING";
  if (this.tweenSpeed !== null) this.tweenSpeed.kill();
  var decceleration = this.field.config.paddleDeceleration.value; // const ty = this.body.position.y;

  this.tweenSpeed = TweenMax.to(this, decceleration, {
    speed: 0,
    ease: this.deccelerationEase,
    onComplete: function onComplete() {
      self.moveState = "STOP";
      self.tweenSpeed = null; // console.log('SSS:', Math.abs(self.body.position.y - ty));
    },
  });
};

NORD.Field.Paddle.prototype.checkBounds = function () {
  var topBorder = -this.field.config.FIELD_HEIGHT / 2 + this.size / 2 + 10;
  var botBorder = this.field.config.FIELD_HEIGHT / 2 - this.size / 2 - 10;
  var pos = this.body.position.y + this.speed;

  if (pos < topBorder) {
    this.speed = 0;
    this.flappySpeed = 0;
    pos = topBorder;

    if (this.tweenSpeed !== null) {
      this.tweenSpeed.kill();
      this.tweenSpeed = null;
    }

    this.moveState = "STOP";
  } else if (pos > botBorder) {
    this.speed = 0;

    if (this.flappySpeed > 0) {
      this.flappySpeed = 0;
    }

    pos = botBorder;

    if (this.tweenSpeed !== null) {
      this.tweenSpeed.kill();
      this.tweenSpeed = null;
    }

    this.moveState = "STOP";
  }

  this.setTo(this.body.position.x, pos);
};

NORD.Field.Paddle.prototype.showWing = function () {
  var self = this;
  this.wing.visible = true;
  this.wing.alpha = 0;
  this.wing.y = 5;
  this.tweenWing = TweenMax.to(this.wing, 12 / 30, {
    y: 0,
    alpha: 1.0,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      self.tweenWing = null;
    },
  });
};

NORD.Field.Paddle.prototype.flappyMove = function () {
  // console.log("FLAPPY!!!!");
  if (this.flappyJumpDelay > 0) {
    this.flappyJumpDelay--;
  }

  if (this.isFlappyTutorial) {
    return;
  }

  var currentY = this.body.position.y;
  this.flappySpeed += this.flappyFallSpeedUp;
  var nextY = currentY + this.flappySpeed;
  this.setTo(this.body.position.x, nextY);
};

NORD.Field.Paddle.prototype.flappyJump = function () {
  var self = this;

  if (
    !(
      this.field.roundGenerator &&
      this.field.roundGenerator.roundMode === "FLAPPY"
    )
  ) {
    return;
  }

  if (this.flappyJumpDelay !== 0) {
    return;
  }

  this.flappyJumpDelay = this.flappyJumpDelayDefault;
  this.flappySpeed = -this.flappyJumpSpeedUp;

  if (this.side === "RIGHT") {
    NORD.audioManager.playAudio("flappy_wing");
  } else {
    NORD.audioManager.playAudio("flappy_wing_left");
  }

  if (this.tweenWing) {
    this.tweenWing.kill();
    this.tweenWing = null;
  }

  this.wing.scale.y = this.normalWingScale;
  var time = 5 / 30;
  this.tweenWing = TweenMax.to(this.wing.scale, 3 / 30, {
    y: -this.normalWingScale,
    ease: Power2.easeOut,
    onComplete: function onComplete() {
      self.tweenWing = TweenMax.to(self.wing.scale, 8 / 30, {
        y: self.normalWingScale,
        ease: Power2.easeOut,
        onComplete: function onComplete() {
          self.tweenWing = null;
        },
      });
    },
  });
  this.isFlappyTutorial = false;
  this.field.emit("paddle_flap", this);
};

NORD.Field.Paddle.prototype.chop2 = function (chopY) {
  if (!this.isExist || !this.field.isGame()) return;
  var graphics = this.field.testGraphics;
  graphics.clear();
  var self = this;
  var vertices = null;
  vertices = this.body.vertices.map(function (v) {
    return {
      x: v.x - self.body.position.x,
      y: v.y,
    };
  });
  var maxY = vertices.reduce(function (y, v) {
    return y == null ? v.y : Math.max(y, v.y);
  }, null);
  var minY = vertices.reduce(function (y, v) {
    return y == null ? v.y : Math.min(y, v.y);
  }, null);

  if (chopY > maxY - 2 || chopY < minY + 2) {
    NORD.audioManager.playAudio("shatter_hit_paddle_z");
    return;
  } // this.field.testGraphics.beginFill(0xf5428a);
  // this.field.testGraphics.lineStyle(1, 0xf5428a);
  // this.field.testGraphics.moveTo(-400, chopY);
  // this.field.testGraphics.lineTo(400, chopY);
  // this.field.testGraphics.moveTo(200, this.body.position.y - this.size / 2);
  // this.field.testGraphics.lineTo(200, this.body.position.y + this.size / 2);

  var upChopSize = chopY - minY;
  var downChopSize = maxY - chopY;
  var chopSize = Math.min(upChopSize, downChopSize);

  if (chopSize < 5) {
    NORD.audioManager.playAudio("shatter_hit_paddle_z");
    return;
  }

  var chopDir = upChopSize == chopSize ? "down" : "up";
  chopSize += 5;
  var minSize = 2;
  var nextSize = Math.max(minSize, this.sizeConfig - chopSize);

  if (nextSize === this.sizeConfig) {
    NORD.audioManager.playAudio("shatter_hit_paddle_z");
    return;
  }

  var shatterMaxSize = this.field.config.shatterMaxSize.value;
  var shatterMinSize = this.field.config.shatterMinSize.value;
  var choppedSize = shatterMaxSize - nextSize;
  var choppedPercent = choppedSize / (shatterMaxSize - shatterMinSize);
  var shapes = this.field.shatterPaddleData.shapes;
  var shapeBorderPercent = 1 / shapes.length;
  var shapeN = Math.ceil(choppedPercent / shapeBorderPercent) - 1; // console.log(choppedPercent, shapes, shapeN);

  this.shatterShape = shapes[shapeN];

  if (chopSize > 10 && this.sizeConfig > 15) {
    var chopPower = Math.min(1, chopSize / 55);
    var chopScale = 0.5 + 0.5 * chopPower; // console.log("CCC:", chopSize, chopScale, chopPower);

    var effect =
      chopDir === "down" ? this.shatterEffect : this.shatterEffectDown;
    effect.visible = true;
    effect.x = this.body.position.x;
    effect.y = chopY;
    effect.gotoAndPlay(0); // effect.scale.y = chopDir === "up" ? -1 : 1;

    effect.scale.y = chopScale;
    effect.scale.x = (this.side === "RIGHT" ? 1 : -1) * chopScale;
  }

  this.setChopSize(nextSize, chopDir);
  NORD.audioManager.playAudio("shatter_hit");
};

NORD.Field.Paddle.prototype.setChopSize = function (nextSize, dir) {
  if (this.isChoping) {
    return;
  }

  var self = this;
  this.isChoping = true;
  var curY = this.body.position.y;
  var dirSign = dir === "up" ? -1 : 1;
  var curSize = this.sizeConfig;
  var difSize = curSize - nextSize;
  var ppp = 0;
  var o = {
    value: 0,
  };
  this.tweenChop = TweenMax.to(o, 8 / 30, {
    value: 1.0,
    ease: Power2.easeOut,
    onUpdate: function onUpdate() {
      var v = o.value;
      self.setSize(curSize - difSize * v, self.shatterShape);
      var ddd = difSize * v * dirSign * 0.5 - ppp; // self.body.position.y = curY + difSize * v * dirSign * 0.5;

      self.body.position.y += ddd;
      ppp += ddd;
    },
    onComplete: function onComplete() {
      self.isChoping = false;
      self.tweenChop = null;
    },
  });
};

NORD.Field.Paddle.prototype.updateChopBody = function (verticiesOld, data) {
  var self = this;
  var currentY = this.body.position.y;
  var nextY = data.centerY;
  var vertices = data.vertices; // const vertices = data.vertices.map(v => {
  //   return { x: v.x - self.body.position.x, y: v.y - self.body.position.y };
  // });

  this.currentVerticies = _toConsumableArray(vertices); // .map(v => {
  //   return { x: v.x, y: v.y - self.body.position.y };
  // });

  this.body.position.y = nextY;
  Matter.Body.setVertices(this.body, _toConsumableArray(vertices));
  this.drawPaddle2(); // this.updatePaddle(data.vertices);
  // this.body.position.y = nextY;
};

NORD.Field.Paddle.prototype.chop = function (chopY) {
  if (!this.isExist || !this.field.isGame()) return;
  var graphics = this.field.testGraphics;
  graphics.clear();
  var self = this;
  console.log("CCC", this.body.vertices);
  var vertices = null; // if (!this.currentVerticies) {
  //   vertices = this.body.vertices;
  // } else
  //   vertices = this.currentVerticies.map(function(v) {
  //     return { x: v.x, y: v.y + self.body.position.y };
  //   });

  vertices = this.body.vertices.map(function (v) {
    return {
      x: v.x - self.body.position.x,
      y: v.y,
    };
  }); // drawConvex(vertices, graphics, 0x000000);

  var maxY = vertices.reduce(function (y, v) {
    return y == null ? v.y : Math.max(y, v.y);
  }, null);
  var minY = vertices.reduce(function (y, v) {
    return y == null ? v.y : Math.min(y, v.y);
  }, null);
  console.log(vertices);

  if (chopY > maxY - 5 || chopY < minY + 5) {
    return;
  }

  this.field.testGraphics.beginFill(0xf5428a);
  this.field.testGraphics.lineStyle(1, 0xf5428a);
  this.field.testGraphics.moveTo(-400, chopY);
  this.field.testGraphics.lineTo(400, chopY); // vertices.forEach(function(v) {
  //   graphics.drawCircle(v.x, v.y, 1);
  // });

  var result = devideVerticies(vertices, chopY, graphics);
  var big = result.big;
  big.vertices = big.vertices.map(function (v) {
    return {
      x: v.x + self.body.position.x,
      y: v.y,
    };
  }); // console.log(this.body.position.y);
  // console.log("Chop:", chopY, result);

  this.updateChopBody(vertices, big);
};

var devideVerticies = function devideVerticies(vertices, devideY, graphics) {
  var verticesUp = vertices.filter(function (v) {
    return v.y <= devideY;
  });
  var verticesDown = vertices.filter(function (v) {
    return v.y > devideY;
  });
  var nearestUpY = nearestVtoY(verticesUp, devideY);
  var nearestDownY = nearestVtoY(verticesDown, devideY);
  var maxX = vertices.reduce(function (x, v) {
    return x == null ? v.x : Math.max(x, v.x);
  }, null);
  var devideV1 = {
    x: (nearestUpY.x + nearestDownY.x) / 2,
    y: devideY,
  };
  var devideV2 = {
    x: maxX,
    y: devideY,
  };
  var n1 = verticesUp.indexOf(nearestUpY);
  verticesUp.splice(n1 + 1, 0, devideV1);
  verticesUp.splice(n1 + 2, 0, devideV2);
  var n2 = verticesDown.indexOf(nearestDownY);
  verticesDown.splice(n2, 0, devideV1);
  verticesDown.splice(n2, 0, devideV2);
  verticesUp = sortVertices(verticesUp);
  verticesDown = sortVertices(verticesDown);
  var upYMinMax = getConvexYMinMax(verticesUp);
  var downYMinMax = getConvexYMinMax(verticesDown);
  var upSize = Math.abs(upYMinMax.minY - upYMinMax.maxY);
  var downSize = Math.abs(downYMinMax.minY - downYMinMax.maxY);
  var upResult = {
    vertices: verticesUp,
    minY: upYMinMax.minY,
    maxY: upYMinMax.maxY,
    centerY: upYMinMax.minY + upSize / 2,
    size: upSize,
  };
  var downResult = {
    vertices: verticesDown,
    minY: downYMinMax.minY,
    maxY: downYMinMax.maxY,
    centerY: downYMinMax.minY + downSize / 2,
    size: downSize,
  };
  drawConvex(verticesUp, graphics, 0xffffff);
  drawConvex(verticesDown, graphics, 0x000000); // verticesUp.forEach(function(v, i) {
  //   drawVertex(v, graphics, 0xffffff, (i + 1) * 0.5);
  // });
  // verticesDown.forEach(function(v) {
  //   drawVertex(d, graphics, 0xffffff);
  // });
  // drawVertex(nearestUpY, graphics);
  // drawVertex(nearestDownY, graphics, 0x000000);
  // drawVertex(devideV1, graphics, 0xeb1b0c);
  // drawVertex(devideV2, graphics, 0xeb1b0c);

  var small = upSize < downSize ? upResult : downResult;
  var big = small === upResult ? downResult : upResult;
  return {
    small: small,
    big: big,
  };
};

var nearestVtoY = function nearestVtoY(verticies, devideY) {
  return verticies.reduce(function (cur, v) {
    var d = Math.abs(v.y - devideY);

    if (cur == null) {
      return {
        d: d,
        v: v,
      };
    }

    if (Math.abs(cur.v.y - v.y) < 0.01) {
      return v.x < cur.v.x
        ? {
            d: d,
            v: v,
          }
        : cur;
    }

    return d < cur.d
      ? {
          d: d,
          v: v,
        }
      : cur;
  }, null).v;
};

var getConvexYMinMax = function getConvexYMinMax(vertices) {
  var maxY = vertices.reduce(function (y, v) {
    return y == null ? v.y : Math.max(y, v.y);
  }, null);
  var minY = vertices.reduce(function (y, v) {
    return y == null ? v.y : Math.min(y, v.y);
  }, null);
  return {
    minY: minY,
    maxY: maxY,
  };
};

var sortVertices = function sortVertices(vertices) {
  var maxY = vertices.reduce(function (y, v) {
    return y == null ? v.y : Math.max(y, v.y);
  }, null);
  var minY = vertices.reduce(function (y, v) {
    return y == null ? v.y : Math.min(y, v.y);
  }, null);
  var maxX = vertices.reduce(function (x, v) {
    return x == null ? v.x : Math.max(x, v.x);
  }, null);
  var minX = vertices.reduce(function (x, v) {
    return x == null ? v.x : Math.min(x, v.x);
  }, null);
  var centerX = Math.abs(minX - maxX) / 2 + minX;
  var centerY = Math.abs(minY - maxY) / 2 + minY;

  var v = _toConsumableArray(vertices);

  v.sort(function (v1, v2) {
    var a1 = Util.angle(centerX, centerY, v1.x, v1.y);
    var a2 = Util.angle(centerX, centerY, v2.x, v2.y);
    return a1 - a2;
  });
  return v;
};

var drawVertex = function drawVertex(v, graphics) {
  var color =
    arguments.length > 2 && arguments[2] !== undefined
      ? arguments[2]
      : 0xffffff;
  var delay =
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var ddd = function ddd() {
    graphics.lineStyle(0);
    graphics.beginFill(color);
    graphics.drawCircle(v.x, v.y, 2);
  };

  if (!delay) ddd();
  else TweenMax.delayedCall(delay, ddd);
};

var drawConvex = function drawConvex(vertices, mainGraphics) {
  var color =
    arguments.length > 2 && arguments[2] !== undefined
      ? arguments[2]
      : 0xffffff;
  mainGraphics.lineStyle(0, color);
  mainGraphics.beginFill(color, 1.0);
  var startVert = vertices[0];
  mainGraphics.moveTo(startVert.x, startVert.y);
  vertices.forEach(function (vert, n) {
    if (n === 0) return;
    mainGraphics.lineTo(vert.x, vert.y);
  });
  mainGraphics.lineTo(startVert.x, startVert.y);
};

NORD.Field.Paddle.prototype.update = function () {
  NORD.Field.FieldObject.prototype.update.call(this);
  if (!this.isExist || !this.field.isGame()) return;
  var self = this;
  this.checkBounds();
  this.isFlappy =
    this.field.roundGenerator &&
    this.field.roundGenerator.roundMode === "FLAPPY";

  if (this.isFlappy) {
    this.flappyMove();
    return;
  }

  var decceleration = this.field.config.paddleDeceleration.value;

  if (this.moveState !== "STOP" && this.moveState !== "STOPING") {
    if (this.speed > this.maxSpeed) this.speed *= 0.95;
  }

  if (this.moveCounter === 0) {
    // this.speed *= 0.95;
    // if(Math.abs(this.speed) <= decceleration) this.speed = 0;
    // else this.speed += -1*Util.sign(this.speed)*decceleration;
    if (Math.abs(this.speed) <= 0.05) this.speed = 0;
    else this.speed *= decceleration;
  } else if (this.moveCounter > 0) this.moveCounter--;
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.Field.PaddleBullet = function (field, config) {
  NORD.Field.FieldObject.call(this, field);
  this.isExist = true;
  this.type = "PADDLE_BULLET";
  this.radius = 20;
  this.paddle = config.paddle;
  if (this.paddle.side === "LEFT") this.rotation = 180 * Util.TO_RADIANS;
  var _this$paddle$body$pos = this.paddle.body.position,
    x = _this$paddle$body$pos.x,
    y = _this$paddle$body$pos.y;
  var moveK = this.paddle.side === "LEFT" ? 1 : -1;
  this.speed =
    field.config.bonusShootBulletSpeed.value *
    (this.paddle.side === "LEFT" ? 1 : -1); // this.speed = -3;

  x += 60 * moveK;
  this.body = Matter.Bodies.circle(x, y, this.radius, {
    restitution: 1.0,
    friction: 0.0,
    frictionStatic: 0.0,
    frictionAir: 0.0,
    density: 0.01,
    inertia: Infinity,
    slop: 0.00001,
    // collisionFilter: { category: this.field.collisionBallCategory, mask: this.field.collisionDefaultCategory } });
    collisionFilter: {
      category: this.field.collisionBulletCategory,
      mask: this.field.collisionDefaultCategory,
    },
  });
  this.body.isSensor = true; // Matter.Body.setSensor(this.body, true);

  this.body.fieldObject = this;
  Matter.World.add(this.field.physics, [this.body]); // this.bg = new PIXI.Graphics();
  // this.addChild(this.bg);
  // this.bg.beginFill(0xFFFFFF, 1.0);
  // this.bg.drawCircle(0, 0, this.radius * 0.7);

  this.bg = Util.createSprite({
    parent: this,
    atlas: "texture_atlas",
    texture: "bullet.png",
    aX: 0.5,
    aY: 0.5,
  });
  this.updatePosition();
};

NORD.Field.PaddleBullet.prototype = Object.create(
  NORD.Field.FieldObject.prototype
);
NORD.Field.PaddleBullet.prototype.constructor = NORD.Field.PaddleBullet;

NORD.Field.PaddleBullet.prototype.hitPaddle = function (paddle) {
  // console.log('hit!!!', this.paddle.side + ' => ' + paddle.side);
  if (paddle.side !== this.paddle.side) {
    paddle.stun();
    NORD.audioManager.playAudio("shoot_hit");
    this.field.emit("bullet_hit_paddle", paddle);
    this.destroy();
  }
};

NORD.Field.PaddleBullet.prototype.update = function () {
  NORD.Field.FieldObject.prototype.update.call(this);
  if (!this.isExist || this.isStop || !this.field.isGame()) return;
  Matter.Body.setPosition(this.body, {
    x: this.body.position.x + this.speed,
    y: this.body.position.y,
  });
  if (
    this.body.position.x < -this.field.getFieldWidth() / 2 - 50 ||
    this.body.position.x > this.field.getFieldWidth() / 2 + 50
  ) {
    this.destroy();
  }
};

NORD.Field.PaddleBullet.prototype.destroy = function () {
  if (!this.isExist) return; // console.log('Bullet destroy!');

  this.state = "DESTROY";

  if (this.body) {
    this.body.fieldObject = null;
    Matter.World.remove(this.field.physics, this.body);
  } // this.bg.clear();

  this.removeChild(this.bg);
  NORD.Field.FieldObject.prototype.destroy.call(this);
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.Field.InvisibleWall = function (field, config) {
  NORD.Field.FieldObject.call(this, field);
  this.isExist = true;
  this.type = "WALL";
  this.wallType = "INVISIBLE_WALL";
  this.blinkTime = config.blinkTime;
  this.color = 0xffffff;
  this.stateVisible = "hide";
  this.visibleDelay = null;
  this.setSize(config);
  this.updatePosition();
};

NORD.Field.InvisibleWall.prototype = Object.create(
  NORD.Field.FieldObject.prototype
);
NORD.Field.InvisibleWall.prototype.constructor = NORD.Field.InvisibleWall;

NORD.Field.InvisibleWall.prototype.setSize = function (config) {
  // const { x, y, width, height } = config;
  var x = config.x;
  var y = config.y;
  var width = config.width;
  var height = config.height;
  this.wallWidth = width;
  this.wallHeight = height;
  this.body = Matter.Bodies.rectangle(x, y, width, height, {
    restitution: 1.0,
    friction: 0.0,
    frictionStatic: 0.0,
    frictionAir: 0.0,
    isStatic: true,
    collisionFilter: {
      category: this.field.collisionDefaultCategory,
    },
  });
  this.body.fieldObject = this;
  Matter.World.add(this.field.physics, [this.body]);
  this.bg = new PIXI.Graphics();
  this.addChild(this.bg); // this.bg.beginFill(this.color, 1.0);

  this.bg.lineStyle(5.0, 0xffffff);
  this.bg.drawRect(
    -this.wallWidth / 2 + 2.5,
    -this.wallHeight / 2 + 2.5,
    this.wallWidth - 5,
    this.wallHeight - 5
  ); // this.bg.width = width;
  // this.bg.height = height;

  this.bg.visible = this.stateVisible === "show" ? true : false;
};

NORD.Field.InvisibleWall.prototype.blink = function () {
  var _this11 = this;

  this.stateVisible = "show";
  if (this.visibleDelay) this.visibleDelay.kill();
  this.bg.visible = true;
  this.visibleDelay = TweenMax.delayedCall(this.blinkTime, function () {
    _this11.visibleDelay = null;
    _this11.stateVisible = "hide";
    _this11.bg.visible = false;
  }); // console.log('Blink!');
};

NORD.Field.InvisibleWall.prototype.update = function () {
  NORD.Field.FieldObject.prototype.update.call(this);
};

NORD.Field.InvisibleWall.prototype.destroy = function () {
  if (!this.isExist) return;
  this.state = "DESTROY";

  if (this.visibleDelay) {
    this.visibleDelay.kill();
    this.visibleDelay = null;
  }

  this.stateVisible = "hide";

  if (this.body) {
    this.body.fieldObject = null;
    Matter.World.remove(this.field.physics, this.body);
  }

  this.bg.clear();
  this.removeChild(this.bg);
  NORD.Field.FieldObject.prototype.destroy.call(this);
}; //==========================================================================================================================================//
//==========================================================================================================================================//
//==========================================================================================================================================//

NORD.Field.Break = function (field, config) {
  this.container = field.contaierObstacles;
  NORD.Field.FieldObject.call(this, field);
  this.type = "BREAK";
  var color1 = 0xffffff;
  var color2 = 0x80d2f5;
  this.color = config.colorN % 2 === 0 ? color1 : color2;
  this.initBody(config);
  this.updatePosition();
};

NORD.Field.Break.prototype = Object.create(NORD.Field.FieldObject.prototype);
NORD.Field.Break.prototype.constructor = NORD.Field.Break;

NORD.Field.Break.prototype.initBody = function (config) {
  var x = config.x;
  var y = config.y;
  var width = config.width;
  var height = config.height;
  this.wallWidth = width;
  this.wallHeight = height;
  this.body = Matter.Bodies.rectangle(x, y, width, height, {
    restitution: 1.0,
    friction: 0.0,
    frictionStatic: 0.0,
    frictionAir: 0.0,
    isStatic: true,
    collisionFilter: {
      category: this.field.collisionDefaultCategory,
    },
  });
  this.body.fieldObject = this;
  Matter.World.add(this.field.physics, [this.body]);
  this.bg = new PIXI.Graphics();
  this.addChild(this.bg);
  this.bg.beginFill(this.color, 1.0);
  this.bg.drawRect(-10, -10, 20, 20);
  this.bg.width = width;
  this.bg.height = height;
};

NORD.Field.Break.prototype.hit = function () {
  this.destroy();
};

NORD.Field.Break.prototype.destroyBody = function () {
  if (this.body) {
    this.body.fieldObject = null;
    Matter.World.remove(this.field.physics, this.body);
    this.body = null;

    if (this.bg) {
      if (this.bg.clear) this.bg.clear();
      this.removeChild(this.bg);
    }
  }
};

NORD.Field.Break.prototype.destroy = function () {
  if (!this.isExist) return;
  this.state = "DESTROY";

  if (this.body) {
    this.body.fieldObject = null;
    Matter.World.remove(this.field.physics, this.body);
  }

  if (this.bg) {
    if (this.bg.clear) this.bg.clear();
    this.removeChild(this.bg);
  }

  NORD.Field.FieldObject.prototype.destroy.call(this);
};
