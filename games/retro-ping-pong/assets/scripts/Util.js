"use strict";

function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }
  return _typeof(obj);
}

var Util = function Util() {};

Util.PHY_PIXELS = 30;
Util.P_P = 30;

Util.FrameTimer = function (framesDelay) {
  var curDelay =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
  EventEmitter.call(this);
  this.framesDelay = framesDelay;
  this.curDelay = curDelay === -1 ? framesDelay : curDelay;
  NORD.app.on("update", this.update, this);
};

Util.FrameTimer.prototype = Object.create(EventEmitter.prototype);
Util.FrameTimer.prototype.constructor = Util.FrameTimer;

Util.FrameTimer.prototype.update = function () {
  if (this.curDelay > 0) this.curDelay--;

  if (this.curDelay === 0) {
    this.emit("tick");
    this.curDelay = this.framesDelay;
  }
};

Util.FrameTimer.prototype.destroy = function () {
  NORD.app.removeListener("update", this.update, this);
};

Util.saveJsonFile = function (name, data) {
  if (typeof data !== "string") data = JSON.stringify(data);
  var blob = new Blob([data], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, name + ".json");
};

Util.ObservableValue = function (v) {
  EventEmitter.call(this);
  this._value = v !== undefined ? v : null;
  Object.defineProperty(this, "value", {
    set: function set(value) {
      // if(this._value === value && typeof value !== "object") return;
      var prevValue = this._value;
      this._value = value;
      this.emit("change", {
        prevValue: prevValue,
        value: this._value,
      });
    },
    get: function get() {
      return this._value;
    },
  });
};

Util.ObservableValue.prototype = Object.create(EventEmitter.prototype);
Util.ObservableValue.prototype.constructor = Util.ObservableValue;

Util.StateStore = function () {
  EventEmitter.call(this);
  this.state = {};
};

Util.StateStore.prototype = Object.create(EventEmitter.prototype);
Util.StateStore.prototype.constructor = Util.StateStore;

Util.StateStore.prototype.setState = function (state) {
  var _this = this;

  var prevState = Object.assign({}, this.state);
  this.state = Object.assign({}, this.state, state);
  Object.keys(state).forEach(function (key) {
    _this.emit(key + "_change", {
      prevValue: prevState[key],
      value: state[key],
    });
  });
  this.emit("state_change", {
    prevState: prevState,
    state: this.state,
  });
};

Util.StateStore.prototype.getState = function () {
  return this.state;
};

Util.MatterDebugDraw = function (physics, container) {
  PIXI.Container.call(this);
  this.physics = physics;
  this.container = new PIXI.Container();
  container.addChild(this); // this.graphics = new PIXI.Graphics();
  // this.container.addChild(this.graphics);

  this.mainGraphics = new PIXI.Graphics();
  this.addChild(this.mainGraphics);
};

Util.MatterDebugDraw.prototype = Object.create(PIXI.Container.prototype);
Util.MatterDebugDraw.prototype.constructor = Util.MatterDebugDraw;

Util.MatterDebugDraw.prototype.draw = function () {
  var drawBody = function drawBody(body) {
    if (body.parts && body.parts.length > 1) {
      body.parts.forEach(function (b, i) {
        if (i == 0) return;
        drawBody(b);
      });
    } else {
      mainGraphics.lineStyle(1, 0xe93333);
      var startVert = body.vertices[0];
      mainGraphics.moveTo(startVert.x, startVert.y);
      body.vertices.forEach(function (vert, n) {
        if (n === 0) return;
        mainGraphics.lineTo(vert.x, vert.y);
      });
      mainGraphics.lineTo(startVert.x, startVert.y);
    }
  };

  var mainGraphics = this.mainGraphics;
  mainGraphics.clear();
  this.physics.bodies.forEach(function (body) {
    drawBody(body);
  });
};

Util.P2DebugDraw = function (physics, container) {
  this.physics = physics;
  this.container = new PIXI.Container();
  container.addChild(this.container); // this.graphics = new PIXI.Graphics();
  // this.container.addChild(this.graphics);

  this.mainGraphics = new PIXI.Graphics();
  this.container.addChild(this.mainGraphics);
  this.elements = [];
  this.usedElements = [];

  for (var i = 0; i < 20; i++) {
    this.createElement();
  }
};

Util.P2DebugDraw.prototype.createElement = function () {
  var graphics = new PIXI.Graphics();
  this.container.addChild(graphics);
  graphics.visible = false;
  this.elements.push(graphics);
  return graphics;
};

Util.P2DebugDraw.prototype.getFreeElement = function () {
  if (this.elements.length == 0) {
    this.createElement();
  }

  var graphics = this.elements[0];
  this.elements.splice(0, 1);
  this.usedElements.push(graphics);
  graphics.visible = true;
  return graphics;
};

Util.P2DebugDraw.prototype.clearElement = function (graphics) {
  graphics.clear();
  graphics.visible = false;
  this.usedElements.splice(this.usedElements.indexOf(graphics), 1);
  this.elements.push(graphics);
  return graphics;
};

Util.P2DebugDraw.prototype.draw = function () {
  var self = this;

  while (this.usedElements.length) {
    this.clearElement(this.usedElements[0]);
  }

  this.mainGraphics.clear(); // console.log('Draw:', container)
  // console.log(p2.Shape.RE)
  // this.graphics.clear();
  // const graphics = this.graphics;

  this.physics.bodies.forEach(function (body) {
    body.shapes.forEach(function (shape) {
      var position = {
        x: body.interpolatedPosition[0] + shape.position[0],
        y: body.interpolatedPosition[1] + shape.position[1],
      };

      if (shape.type == p2.Shape.CIRCLE) {
        // console.log(body.interpolatedPosition[0] - body.position[0])
        var radius = shape.radius;
        drawCircle(position, radius);
      } else if (shape.type == 8) {
        drawBox(position, shape.width, shape.height);
      }
    });
  });

  function drawCircle(position, radius) {
    var color =
      arguments.length > 2 && arguments[2] !== undefined
        ? arguments[2]
        : 0xffffff;
    // var graphics = self.getFreeElement();
    var graphics = self.mainGraphics;
    graphics.lineStyle(2, 0xaafbba, 0.8);
    graphics.beginFill(color, 0.3);
    graphics.drawCircle(position.x, position.y, radius);
    graphics.endFill();
  }

  function drawBox(position, width, height) {
    var color =
      arguments.length > 3 && arguments[3] !== undefined
        ? arguments[3]
        : 0xffffff;
    // var graphics = self.getFreeElement();
    var graphics = self.mainGraphics;
    graphics.lineStyle(2, 0xaafbba, 0.8);
    graphics.beginFill(color, 0.3);
    graphics.drawRect(
      position.x - width / 2,
      position.y - height / 2,
      width,
      height
    );
    graphics.endFill();
  }
};

Util.isMobile = function () {
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4)
    )
  ) {
    return true;
  } else if (
    navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 2 &&
    /MacIntel|iPad/.test(navigator.platform)
  ) {
    return true;
  } else {
    return false;
  }
};

Util.isDomainAvaiable = function (avaiableDomains) {
  var isPlayAvaiable = false;
  var domain = document.domain;

  for (var i = 0; i < avaiableDomains.length; i++) {
    if (domain.indexOf(avaiableDomains[i]) != -1) {
      isPlayAvaiable = true;
      break;
    }
  }

  return isPlayAvaiable;
};

Util.coolmathApiCallback = function (name, data) {
  /* if (parent && parent.cmgGameEvent) {
    // console.log('cmgEvent: ' + name + ',', data);
    if (data != null && data != undefined) parent.cmgGameEvent(name, data);
    else parent.cmgGameEvent(name);
  } */
};

function bind(func, context) {
  return function () {
    return func.apply(context, arguments);
  };
}

String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substr(0, index) +
    replacement +
    this.substr(index + replacement.length)
  );
};

Util.sign = function (value) {
  if (value >= 0) return 1;
  else if (value < 0) return -1;
};

Util.traceErrorStack = function () {
  var err = new Error();
  console.log(err.stack);
  return err.stack;
};

Util.rotatePointDeg = function (x, y, pivotX, pivotY, angle) {
  var p =
    arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  if (p == null)
    p = {
      x: 0,
      y: 0,
    };
  var radians = angle;
  var dx = x - pivotX;
  var dy = pivotY - y;
  p.x = pivotX + Math.cos(radians) * dx - Math.sin(radians) * dy;
  p.y = pivotY - (Math.sin(radians) * dx + Math.cos(radians) * dy);
  return p;
};

Util.TO_DEGREES = 57.295779513082320876798154814105;
Util.TO_RADIANS = 0.01745329251994329576923;

Util.randomRangeInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

Util.randomRange = function (min, max) {
  return Math.random() * (max - min) + min;
};

Util.randomElement = function (elements) {
  return elements[Util.randomRangeInt(0, elements.length - 1)];
};

Util.shuffleElements = function (elements) {
  var l = elements.length;
  if (l <= 1) return elements;

  for (var i = 0; i < l; i++) {
    if (i == 0 || (i > 0 && Util.randomRangeInt(1, 100) <= 50)) {
      var n = Util.randomRangeInt(0, l - 1 - 1);
      if (n >= i) n++;
      var t = elements[n];
      elements[n] = elements[i];
      elements[i] = t;
    }
  }

  return elements;
};

Util.randomSequenceInt = function (min, max, count, isUnique) {
  var result = [];

  for (var i = 0; i < count; i++) {
    var number = Util.randomRangeInt(min, max);
    if (!isUnique) result.push(number);
    else {
      if (result.indexOf(number) == -1) result.push(number);
      else i--;
    }
  }

  return result;
};

Util.getRandomVariant = function (
  variants // [{e: element, c: chance}, {e: element, c: chance}, ...]
) {
  var total = 0;

  for (var i = 0; i < variants.length; i++) {
    total += variants[i].c;
  }

  var n = Util.randomRange(0, total);
  var shift = 0; // var e = null;

  for (var i = 0; i < variants.length; i++) {
    var chance = variants[i].c + shift;
    if (n <= chance) return variants[i].e; // console.log(chance, shift);

    shift += variants[i].c;
  } // console.log('E: ', e);

  return null;
};

Util.getSpriteN = function (n) {
  if (n < 10) return "000" + n;
  if (n < 100) return "00" + n;
  if (n < 1000) return "0" + n;
  return n;
};

Util.colorToHex = function (color) {
  // colot = String(color);
  if (color.substr(0, 1) === "#") {
    return color;
  }

  var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
  var red = parseInt(digits[2]);
  var green = parseInt(digits[3]);
  var blue = parseInt(digits[4]);
  var rgb = blue | (green << 8) | (red << 16); //return digits[1] + '#' + rgb.toString(16);

  return digits[1] + rgb;
};

Util.distance = function (x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

Util.angle = function (x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
};

Util.getMoveVector = function (speed, angle) {
  angle = angle * Util.TO_RADIANS;
  return new PIXI.Point(speed * Math.cos(angle), speed * Math.sin(angle));
};

Util.getRotAngle = function (aX, aY, bX, bY, aR, rS) {
  var mAngle = Math.atan2(bY - aY, bX - aX) * Util.TO_DEGREES;
  var dAngle = aR - mAngle;
  if (dAngle > 180) dAngle = -360 + dAngle;
  else if (dAngle < -180) dAngle = 360 + dAngle;

  if (Math.abs(dAngle) < rS) {
    return -dAngle;
  } else if (dAngle > 0) {
    return -rS;
  } else {
    return rS;
  }
};

Util.normalizeAngle = function (angle) {
  while (angle >= 360) {
    angle -= 360;
  }

  while (angle < 0) {
    angle += 360;
  }

  return angle;
};

Util.getAngleBetween = function (angle1, angle2) {
  var v1 =
    (angle1 * Util.TO_RADIANS - angle2 * Util.TO_RADIANS) * Util.TO_DEGREES;
  var v2 =
    (angle2 * Util.TO_RADIANS - angle1 * Util.TO_RADIANS) * Util.TO_DEGREES;
  return Util.normalizeAngle(Math.min(v1, v2)); // angle1 = Util.normalizeAngle(angle1);
  // angle2 = Util.normalizeAngle(angle1);
};

Util.clone = function (obj) {
  var copy; // Handle the 3 simple types, and null or undefined

  if (null == obj || "object" != _typeof(obj)) return obj; // Handle Date

  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  } // Handle Array

  if (obj instanceof Array) {
    copy = [];

    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = Util.clone(obj[i]);
    }

    return copy;
  } // Handle Object

  if (obj instanceof Object) {
    copy = {};

    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = Util.clone(obj[attr]);
    }

    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
};

Util.lengthInUtf8Bytes = function (str) {
  // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
};

Util.keyboard = function (key) {
  key.isDown = false;
  key.isUp = true;

  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.keyDownHandler) key.keyDownHandler(event);
      key.isDown = true;
      key.isUp = false;
    }

    event.preventDefault();
  }; //The `upHandler`

  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.keyUpHandler) key.keyUpHandler(event);
      key.isDown = false;
      key.isUp = true;
    }

    event.preventDefault();
  };

  var kD = key.downHandler.bind(key);
  var kU = key.upHandler.bind(key);
  var w = document; // console.log('KKK:', key)
  //Attach event listeners

  w.addEventListener("keydown", kD, false);
  w.addEventListener("keyup", kU, false);

  key.destroy = function () {
    window.focus();
    w.removeEventListener("keydown", kD, false);
    w.removeEventListener("keyup", kU, false);
  };

  window.focus();
  return key;
};

Util.getAntiDirection = function (dir) {
  if (dir == "right") return "left";
  if (dir == "left") return "right";
  if (dir == "down") return "up";
  if (dir == "up") return "down";
  if (dir == "up_left") return "down_right";
  if (dir == "up_right") return "down_left";
  if (dir == "down_left") return "up_right";
  if (dir == "down_right") return "up_left";
  return "none";
};

Util.getDirectionBetweenHexs = function (hex1, hex2) {
  var i = hex2.i - hex1.i;
  var j = hex2.j - hex1.j;
  if (i == 1 && j == 1) return "down_right";
  if (i == 2 && j == 0) return "right";
  if (i == 1 && j == -1) return "up_right";
  if (i == -1 && j == -1) return "up_left";
  if (i == -2 && j == 0) return "left";
  if (i == -1 && j == 1) return "down_left";
  return "none";
};

Util.getDistanceBetweenHexs = function (hex1, hex2) {
  var sY = Math.abs(hex1.j - hex2.j);
  var sX = Math.floor(Math.abs(hex1.i - hex2.i));
  var d = sY + (sX - Math.floor(sY / 2));
  d = (sX + sY) / 2;
  var ssX = sY - sX;
  if (ssX < 0) ssX = 0;
  d += ssX / 2;
  return d;
};

Util.getDirectionVector = function (dir) {
  if (dir == "left")
    return {
      x: -1,
      y: 0,
    };
  else if (dir == "right")
    return {
      x: 1,
      y: 0,
    };
  else if (dir == "up_right")
    return {
      x: 1,
      y: -1,
    };
  else if (dir == "up_left")
    return {
      x: -1,
      y: -1,
    };
  else if (dir == "down_left")
    return {
      x: -1,
      y: 1,
    };
  else if (dir == "down_right")
    return {
      x: 1,
      y: 1,
    };
  return null;
};

Util.createBgRect = function (width, height, radius, color, alpha) {
  if (radius == undefined) radius = 10;
  if (color == undefined) color = 0x000000;
  if (alpha == undefined) alpha = 1;
  var rect = new PIXI.Graphics();
  rect.beginFill(color, alpha);
  rect.drawRoundedRect(-width / 2, -height / 2, width, height, radius);
  rect.endFill(); // rect.anchor.set(0.5, 0.5);

  return rect;
};

Util.createBgRects = function (data, parent) {
  var result = [];
  if (parent == undefined) parent = null;

  for (var i = 0; i < data.length; i++) {
    var info = data[i];
    if (info.x == undefined) info.x = 0;
    if (info.y == undefined) info.y = 0;
    if (info.radius == undefined) info.radius = 5;
    if (info.color == undefined) info.color = 0x000000;
    if (info.alpha == undefined) info.alpha = 1;
    var x = info.x;
    var y = info.y;
    var width = info.width;
    var height = info.height;
    var radius = info.radius;
    var color = info.color;
    var alpha = info.alpha;
    var rect = Util.createBgRect(width, height, radius, color, alpha);
    rect.x = x;
    rect.y = y;
    if (parent != null) parent.addChild(rect);
    result.push(rect);
  }

  return result;
};

Util.createSprite = function (config) {
  var texture = null;
  if (config.atlas != undefined)
    texture = NORD.assetsManager.getTexture(config.atlas, config.texture);
  else texture = NORD.assetsManager.getTexture(config.texture);
  var sprite = new PIXI.Sprite(texture);
  if (config.parent != undefined) config.parent.addChild(sprite);
  if (config.aX != undefined && config.aY != undefined)
    sprite.anchor.set(config.aX, config.aY);
  else if (config.aX != undefined) sprite.anchor.set(config.aX, 0);
  else if (config.aY != undefined) sprite.anchor.set(0, config.aY);
  if (config.x != undefined) sprite.x = config.x;
  if (config.y != undefined) sprite.y = config.y;
  if (config.scaleX != undefined) sprite.scale.x = config.scaleX;
  if (config.scaleY != undefined) sprite.scale.y = config.scaleY;
  if (config.scaleXY != undefined)
    sprite.scale.y = sprite.scale.x = config.scaleXY;
  if (config.rotation != undefined) sprite.rotation = config.rotation;
  if (config.visible != undefined) sprite.visible = config.visible;
  if (config.alpha != undefined) sprite.alpha = config.alpha;
  return sprite;
};

Util.createButton = function (
  name,
  parentPanel,
  container,
  positionType,
  x,
  y,
  width,
  height,
  tweenClick,
  soundClick,
  regularSkinData
) {
  var btnConfig = null;

  if (positionType == "absolute") {
    btnConfig = {
      name: name,
      parentPanel: parentPanel,
      container: container,
      positionType: positionType,
      x: x,
      y: y,
      width: width,
      height: height,
      tweenClick: tweenClick,
      soundClick: soundClick,
      regularSkin: Util.createSprite(regularSkinData),
    };
  } else {
    btnConfig = {
      name: name,
      parentPanel: parentPanel,
      container: container,
      positionType: positionType,
      xRelative: x,
      yRelative: y,
      width: width,
      height: height,
      tweenClick: tweenClick,
      soundClick: soundClick,
      regularSkin: Util.createSprite(regularSkinData),
    };
  }

  var btn = new NORD.GUI.Button(btnConfig);
  return btn;
};

Util.setParams = function (object, config) {
  if (config.parent) config.parent.addChild(object);
  if (config.aX != undefined && object.anchor) object.anchor.x = config.aX;
  if (config.aY != undefined && object.anchor) object.anchor.y = config.aY; // if(object.anchor) object.anchor.set(config.aX, config.aY);

  if (config.x != undefined) object.x = config.x;
  if (config.y != undefined) object.y = config.y;
  if (config.alpha != undefined) object.alpha = config.alpha;
  if (config.width != undefined) object.width = config.width;
  if (config.height != undefined) object.height = config.height;
  if (config.xRelative != undefined) object.xRelative = config.xRelative;
  if (config.yRelative != undefined) object.yRelative = config.yRelative;
  if (config.scaleX != undefined && object.scale)
    object.scale.x = config.scaleX;
  if (config.scaleY != undefined && object.scale)
    object.scale.y = config.scaleY;
  if (config.scaleXY != undefined && object.scale)
    object.scale.x = object.scale.y = config.scaleXY;
  if (config.visible != undefined && object.visible != undefined)
    object.visible = config.visible;
  return object;
};

Util.tweenElements = function (tweenData, onComplete) {
  var count = 0;
  var config = tweenData.config;
  var elements = tweenData.elements;

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var paramsStart = element.start;
    var paramsEnd = element.end;
    Util.setParams(element.obj, paramsStart);
    var tweenParams = {};
    var tweenScaleParams = null;

    for (var key in paramsEnd) {
      if (
        key == "x" ||
        key == "y" ||
        key == "xRelative" ||
        key == "yRelative" ||
        key == "alpha" ||
        key == "width" ||
        key == "height" ||
        key == "ease"
      )
        tweenParams[key] = paramsEnd[key];
      else if (key == "scaleX" || key == "scaleY" || key == "scaleXY") {
        if (tweenScaleParams == null) tweenScaleParams = {};
        if (key == "scaleX") tweenScaleParams["x"] = paramsEnd[key];
        else if (key == "scaleY") tweenScaleParams["y"] = paramsEnd[key];
        else if (key == "scaleXY") {
          tweenScaleParams["x"] = paramsEnd[key];
          tweenScaleParams["y"] = paramsEnd[key];
        }
      }
    }

    if (tweenScaleParams != null && tweenParams["ease"] != undefined)
      tweenScaleParams["ease"] = tweenParams["ease"];
    tweenParams.onComplete = tweenComplete;
    if (tweenScaleParams != null) tweenScaleParams.onComplete = tweenComplete;
    count++;
    if (tweenScaleParams != null) count++;
    var delay = element.delay;
    if (delay == undefined) delay = 0;
    tweenParams.delay = delay;
    if (tweenScaleParams != null) tweenScaleParams.delay = delay;
    var ease = element.ease;

    if (ease != undefined) {
      tweenParams.ease = ease;
      if (tweenScaleParams != null) tweenScaleParams.ease = ease;
    }

    TweenMax.to(element.obj, element.time, tweenParams);
    if (tweenScaleParams != null)
      TweenMax.to(element.obj.scale, element.time, tweenScaleParams);
  }

  function tweenComplete() {
    count--;
    if (count == 0 && onComplete) onComplete();
    if (count < 0) console.log("TweenElements: Error!");
  }
}; //==========================================================================================================================================//

Util.Id = function (tags) {
  this.num = Util.Id.num;
  Util.Id.num++;
  this.tags = {};
  if (tags != undefined) this.addTags(tags);
};

Util.Id.num = 0;

Util.Id.prototype.addTag = function (tag) {
  var t = this.tags[tag];
  if (t == undefined) this.tags[tag] = 1;
};

Util.Id.prototype.addTags = function (tags) {
  for (var i = 0; i < tags.length; i++) {
    this.addTag(tags[i]);
  }
};

Util.Id.prototype.removeTag = function (tag) {
  var t = this.tags[tag];
  if (t != undefined) t--;
  if (t == 0) t = undefined;
  this.tags[tag] = t;
};

Util.Id.prototype.check = function (filter) {
  if (filter == null) return false;

  if (filter.type == "OR") {
    for (var i = 0; i < filter.tags.length; i++) {
      var tag = filter.tags[i];
      if (this.tags[tag] != undefined) return true;
    }

    return false;
  } else if (filter.type == "AND") {
    for (var i = 0; i < filter.tags.length; i++) {
      var tag = filter.tags[i];
      if (this.tags[tag] == undefined) return false;
    }

    return true;
  }

  return false;
}; //==========================================================================================================================================//
// type: 'AND', 'OR'

Util.IdFilter = function (type, tags) {
  this.type = type;
  this.tags = tags;
};
