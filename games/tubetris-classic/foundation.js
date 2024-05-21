"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var vec2 = function () {
  function vec2() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;

    _classCallCheck(this, vec2);

    this.x = x;
    this.y = y;
  }

  _createClass(vec2, [{
    key: "add",
    value: function add(vec) {
      var v = this.copy();
      v.x += vec.x;
      v.y += vec.y;
      return v;
    }
  }, {
    key: "multiply",
    value: function multiply(factor) {
      var v = this.copy();
      v.x *= factor;
      v.y *= factor;
      return v;
    }
  }, {
    key: "rounded",
    value: function rounded() {
      var v = this.copy();
      v.x = Math.round(this.x);
      v.y = Math.round(this.y);
      return v;
    }
  }, {
    key: "normalized",
    value: function normalized() {
      var mag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      this.multiply(1 / this.distance());
      this.multiply(mag);
    }
  }, {
    key: "distance",
    value: function distance() {
      var vec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new vec2();

      return Math.sqrt(Math.pow(vec.x - this.x, 2) + Math.pow(vec.y - this.y, 2));
    }
  }, {
    key: "direction",
    value: function direction() {
      var vec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      var v = vec == null ? this.copy() : vec.add(this.multiply(-1));
      return Math.atan2(v.y, v.x);
    }
  }, {
    key: "toTilePos",
    value: function toTilePos() {
      var v = this.copy();
      v.x -= boardLeft;
      v.y -= boardTop;
      v.x /= tilesize;
      v.y /= tilesize;
      v.x = Math.floor(v.x);
      v.y = Math.floor(v.y);
      return v;
    }
  }, {
    key: "toCoordPos",
    value: function toCoordPos() {
      var v = this.copy();
      v.x *= tilesize;
      v.y *= tilesize;
      v.x += boardLeft;
      v.y += boardTop;
      return v;
    }
  }, {
    key: "toExpandedPos",
    value: function toExpandedPos() {
      var v = this.copy();
      v.x *= tilesize;
      v.y *= tilesize;
      return v;
    }
  }, {
    key: "getTile",
    value: function getTile() {
      if (this.x >= boardsize.x || boardsize.y <= this.y || this.x < 0) return tile.closed;
      if (this.y < 0) return null;
      return tiles[this.x][this.y];
    }
  }, {
    key: "equals",
    value: function equals(vec) {
      var leniency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.0001;

      return Math.abs(this.x - vec.x) <= leniency && Math.abs(this.y - vec.y) <= leniency;
    }
  }, {
    key: "copy",
    value: function copy() {
      return new vec2(this.x, this.y);
    }
  }, {
    key: "toString",
    value: function toString() {
      return "<" + this.x + ", " + this.y + ">";
    }
  }], [{
    key: "fromAng",
    value: function fromAng(ang) {
      var mag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      return new vec2(Math.cos(ang), Math.sin(ang)).multiply(mag);
    }
  }, {
    key: "containsVec",
    value: function containsVec(vecarray, vec) {
      for (var i = vecarray.length - 1; i >= 0; i--) {
        if (vecarray[i].equals(vec)) return true;
      }
      return false;
    }
  }, {
    key: "right",
    get: function get() {
      return new vec2(1, 0);
    }
  }, {
    key: "left",
    get: function get() {
      return new vec2(-1, 0);
    }
  }, {
    key: "down",
    get: function get() {
      return new vec2(0, 1);
    }
  }, {
    key: "up",
    get: function get() {
      return new vec2(0, -1);
    }
  }]);

  return vec2;
}();

var effect = function () {
  function effect(spritesheet, pos, width, height, frames, animinterval) {
    _classCallCheck(this, effect);

    this.pos = pos;
    this.spritesheet = spritesheet;
    this.size = new vec2(width, height);
    this.frameCount = frames;
    this.animInterval = animinterval;
    this.tilFrameIncrement = this.animInterval;
    this.curFrame = 0;
  }

  _createClass(effect, [{
    key: "update",
    value: function update(ts, index, ctx) {
      this.draw(ctx);
      this.animate(ts, index);
    }
  }, {
    key: "remove",
    value: function remove(index) {
      effects.splice(index, 1);
    }
  }, {
    key: "animate",
    value: function animate(ts, index) {
      this.tilFrameIncrement += ts;
      if (this.tilFrameIncrement >= this.animInterval) {
        var elapsedframes = Math.floor(this.tilFrameIncrement / this.animInterval);
        this.tilFrameIncrement = this.tilFrameIncrement % this.animInterval;
        this.curFrame += elapsedframes;
        if (this.curFrame >= this.frameCount) this.remove(index);
      }
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      var spos = this.pos.add(this.size.multiply(-0.5)).rounded();
      ctx.drawImage(this.spritesheet, this.size.x * this.curFrame, 0, this.size.x, this.size.y, spos.x, spos.y, this.size.x, this.size.y);
    }
  }], [{
    key: "poof",
    value: function poof(pos) {
      var r = new effect(graphics.smoke, pos, 56, 56, 10, 1);
      return r;
    }
  }, {
    key: "boom",
    value: function boom(pos) {
      var r = new effect(graphics.explosion, pos, 96, 96, 12, 1.5);
      return r;
    }
  }]);

  return effect;
}();

var flash = function (_effect) {
  _inherits(flash, _effect);

  function flash(pos, size, color, life) {
    _classCallCheck(this, flash);

    var _this = _possibleConstructorReturn(this, (flash.__proto__ || Object.getPrototypeOf(flash)).call(this, null, pos, size.x, size.y, 0, 1));

    _this.color = color;
    _this.life = life;
    _this.maxLife = life;
    return _this;
  }

  _createClass(flash, [{
    key: "update",
    value: function update(ts, index, ctx) {
      this.draw(ctx);

      this.life -= ts;
      if (this.life <= 0) effects.splice(index, 1);
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      ctx.fillStyle = "rgba(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + "," + this.color[3] * (this.life / this.maxLife) + ")";
      ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
  }]);

  return flash;
}(effect);

var splashtxt = function (_flash) {
  _inherits(splashtxt, _flash);

  function splashtxt(pos, txt, life) {
    _classCallCheck(this, splashtxt);

    var _this2 = _possibleConstructorReturn(this, (splashtxt.__proto__ || Object.getPrototypeOf(splashtxt)).call(this, pos, new vec2(), null, life));

    _this2.txt = txt;
    return _this2;
  }

  _createClass(splashtxt, [{
    key: "update",
    value: function update(ts, index, ctx) {
      this.draw(ctx);

      this.life -= ts;
      if (this.life <= 0) effects.splice(index, 1);
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      smallfont.drawTextCentered(ctx, this.pos, this.txt);
    }
  }]);

  return splashtxt;
}(flash);

var notification = function (_splashtxt) {
  _inherits(notification, _splashtxt);

  function notification(txt, life) {
    _classCallCheck(this, notification);

    var _this3 = _possibleConstructorReturn(this, (notification.__proto__ || Object.getPrototypeOf(notification)).call(this, new vec2().add(boardsize.toCoordPos()).multiply(0.5), txt, life));

    var n = 0;
    for (var i in effects) {
      if (effects[i] instanceof notification) n++;
    }_this3.pos.y += n * 40;
    return _this3;
  }

  _createClass(notification, [{
    key: "draw",
    value: function draw(ctx) {
      spritefont.drawTextCentered(ctx, this.pos, this.txt);
    }
  }]);

  return notification;
}(splashtxt);

var tile = function () {
  function tile() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new vec2();

    _classCallCheck(this, tile);

    this.type = type;
    this.pos = pos;
    this.openEnds = tile.typeOpenEnds(this.type);
    this.tagged = false;
    this.powered = false;
  }

  _createClass(tile, [{
    key: "renew",
    value: function renew() {
      this.openEnds = tile.typeOpenEnds(this.type);
    }
  }, {
    key: "tag",
    value: function tag() {
      if (!this.tagged) {
        taggedTiles.push(this);
        this.tagged = true;
      }
    }
  }, {
    key: "set",
    value: function set() {
      switch (this.type) {
        case tile.type_Quad:
          var ut = this.pos.add(vec2.up).getTile();
          var bt = this.pos.add(vec2.down).getTile();
          var lt = this.pos.add(vec2.left).getTile();
          var rt = this.pos.add(vec2.right).getTile();
          if (ut) ut.forceOpen(vec2.down);
          if (bt) bt.forceOpen(vec2.up);
          if (lt) lt.forceOpen(vec2.right);
          if (rt) rt.forceOpen(vec2.left);
          break;
        case tile.type_Ball:
          this.destroy();
          ballfall = false;
          spawnBall(this.pos);
          break;
        case tile.type_Bomb:
          this.detonate();
          break;
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      effects.push(effect.poof(this.pos.toCoordPos().add(tilecenter)));
      tiles[this.pos.x][this.pos.y] = null;
      if (this.type != 17) tileFallHeight[this.pos.x] = Math.max(this.pos.y, tileFallHeight[this.pos.x]);
    }
  }, {
    key: "startFall",
    value: function startFall() {
      fallingTiles.push(this);
      tiles[this.pos.x][this.pos.y] = null;
    }
  }, {
    key: "checkEndFall",
    value: function checkEndFall(index) {
      var donefalling = false;
      var bpos = this.pos.add(vec2.down);
      if (bpos.getTile()) donefalling = true;
      if (bpos.y >= boardsize.y) donefalling = true;
      if (donefalling) {
        fallingTiles.splice(index, 1);
        tiles[this.pos.x][this.pos.y] = this;
        this.set();
      }
      return donefalling;
    }
  }, {
    key: "isAlone",
    value: function isAlone() {
      return (new vec2(this.pos.x, this.pos.y - 1).getTile() === null || new vec2(this.pos.x, this.pos.y - 1).getTile().type <= -1) && (new vec2(this.pos.x, this.pos.y + 1).getTile() === null || new vec2(this.pos.x, this.pos.y + 1).getTile().type <= -1) && (new vec2(this.pos.x + 1, this.pos.y).getTile() === null || new vec2(this.pos.x + 1, this.pos.y).getTile().type <= -1) && (new vec2(this.pos.x - 1, this.pos.y).getTile() === null || new vec2(this.pos.x - 1, this.pos.y).getTile().type <= -1);
    }
  }, {
    key: "getSpriteRect",
    value: function getSpriteRect() {
      return tile.typeSpriteRect(this.type);
    }
  }, {
    key: "getRotatedType",
    value: function getRotatedType() {
      return tile.typeRotate(this.type);
    }
  }, {
    key: "forceOpen",
    value: function forceOpen(dir) {
      this.type = tile.typeForceOpen(this.type, dir);
      if (!vec2.containsVec(this.openEnds, dir)) this.openEnds.push(dir);
    }
  }, {
    key: "explode",
    value: function explode() {
      effects.push(effect.boom(this.pos.toCoordPos().add(tilecenter)));
      game.playSound(sfx.explosion);

      var tt = [];
      tt.push(this.pos.add(new vec2(-1, -1)).getTile());
      tt.push(this.pos.add(new vec2(0, -1)).getTile());
      tt.push(this.pos.add(new vec2(1, -1)).getTile());
      tt.push(this.pos.add(new vec2(-1, 0)).getTile());
      tt.push(this.pos.add(new vec2(1, 0)).getTile());
      tt.push(this.pos.add(new vec2(-1, 1)).getTile());
      tt.push(this.pos.add(new vec2(0, 1)).getTile());
      tt.push(this.pos.add(new vec2(1, 1)).getTile());
      for (var i in tt) {
        if (tt[i]) {
          if (tt[i].type === tile.type_Bomb) tt[i].detonate();else if (tt[i].type >= 0) tt[i].tag();
        }
      }
    }
  }, {
    key: "detonate",
    value: function detonate() {
      effects.push(effect.boom(this.pos.toCoordPos().add(tilecenter)));
      game.playSound(sfx.explosion);

      this.destroy();
      var bt = [this.pos.add(new vec2(-1, -1)).getTile(), this.pos.add(new vec2(0, -1)).getTile(), this.pos.add(new vec2(1, -1)).getTile(), this.pos.add(new vec2(-1, 0)).getTile(), this.pos.add(new vec2(1, 0)).getTile(), this.pos.add(new vec2(-1, 1)).getTile(), this.pos.add(new vec2(0, 1)).getTile(), this.pos.add(new vec2(1, 1)).getTile()];
      for (var i in bt) {
        if (bt[i]) {
          if (bt[i].type === tile.type_Bomb) bt[i].detonate();else if (bt[i].type >= 0) bt[i].destroy();
        }
      }

      if (this.powered) detonateBombs();

      if (balls.length <= 0) checkFallingTiles();
    }
  }, {
    key: "interactBall",
    value: function interactBall(balltarget) {
      balltarget.interacted.push(this.pos);
      switch (this.type) {
        default:
          break;
        case 16:
          balltarget.moveDir = new vec2();
          balltarget.speed = 5.25;
          balltarget.pause();
          addScore(250, this.pos);
          break;
        case tile.type_Bomb:
          balltarget.setToDestroy();
          this.detonate();
          addScore(50, this.pos);
          break;
      }
      if (this.powered) {
        this.explode();
        addScore(100, this.pos);
        this.powered = false;
      }
    }
  }, {
    key: "draw",
    value: function draw(ctx, pos) {
      var sprt = this.getSpriteRect();
      var spos = pos.toCoordPos().rounded();
      if (this.powered) ctx.fillStyle = 'rgba(75, 75, 0, 0.5)';else ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(spos.x, spos.y, tilesize, tilesize);
      ctx.drawImage(this.drawimg, sprt.x, sprt.y, 32, 32, spos.x, spos.y, tilesize, tilesize);
    }
  }, {
    key: "drawActual",
    value: function drawActual(ctx, pos) {
      var background = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      var sprt = this.getSpriteRect();
      var spos = pos.rounded();
      if (background) {
        if (this.powered) ctx.fillStyle = 'rgba(75, 75, 0, 0.5)';else ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(spos.x, spos.y, tilesize, tilesize);
      }
      ctx.drawImage(this.drawimg, sprt.x, sprt.y, 32, 32, spos.x, spos.y, tilesize, tilesize);
    }
  }, {
    key: "drawimg",
    get: function get() {
      if (!this.tagged) return graphics.tubes;
      return graphics.tubes_black;
    }
  }], [{
    key: "declareStatic",
    value: function declareStatic() {
      tile.fallProgress = 0;
    }
  }, {
    key: "drawTileBG",
    value: function drawTileBG(ctx) {
      for (var x = tiles.length - 1; x >= 0; x--) {
        for (var y = tiles[x].length - 1; y >= 0; y--) {
          var cpos = new vec2(x, y).toCoordPos();
          ctx.drawImage(graphics.tile, cpos.x, cpos.y);
        }
      }
    }
  }, {
    key: "typeOpenEnds",
    value: function typeOpenEnds() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      switch (type) {
        // straight pieces
        case 0:
          return [vec2.right, vec2.left];
        case 1:
          return [vec2.down, vec2.up];
        case 2:
          return [vec2.right, vec2.left];
        case 3:
          return [vec2.down, vec2.up];
        case 4:
          return [vec2.right, vec2.left];
        case 5:
          return [vec2.down, vec2.up];
        case 6:
          return [vec2.right, vec2.left];
        case 7:
          return [vec2.down, vec2.up];
        // elbow peices
        case 8:
          return [vec2.left, vec2.down];
        case 9:
          return [vec2.right, vec2.down];
        case 10:
          return [vec2.left, vec2.up];
        case 11:
          return [vec2.right, vec2.up];
        // T-junction peices
        case 12:
          return [vec2.right, vec2.left, vec2.down];
        case 13:
          return [vec2.right, vec2.left, vec2.up];
        case 14:
          return [vec2.down, vec2.up, vec2.left];
        case 15:
          return [vec2.down, vec2.up, vec2.right];
        // quad
        case 16:
          return [vec2.down, vec2.up, vec2.left, vec2.right];
        // bomb
        case 18:
          return [vec2.down, vec2.up, vec2.left, vec2.right];
      }
      return [];
    }
  }, {
    key: "typeSpriteRect",
    value: function typeSpriteRect() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      switch (type) {
        // straight pieces
        case 0:
          return new vec2(0, 0);
        case 1:
          return new vec2(32, 0);
        case 2:
          return new vec2(64, 0);
        case 3:
          return new vec2(96, 0);
        case 4:
          return new vec2(0, 32);
        case 5:
          return new vec2(32, 32);
        case 6:
          return new vec2(64, 32);
        case 7:
          return new vec2(96, 32);
        // elbow peices
        case 8:
          return new vec2(0, 64);
        case 9:
          return new vec2(32, 64);
        case 10:
          return new vec2(64, 64);
        case 11:
          return new vec2(96, 64);
        // T-junction peices
        case 12:
          return new vec2(0, 96);
        case 13:
          return new vec2(32, 96);
        case 14:
          return new vec2(64, 96);
        case 15:
          return new vec2(96, 96);
        // quad
        case 16:
          return new vec2(0, 128);
        // ball
        case 17:
          return new vec2(32, 128);
        // bomb
        case 18:
          return new vec2(64, 128);
      }
    }
  }, {
    key: "typeRotate",
    value: function typeRotate() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      switch (type) {
        // straight pieces
        case 0:
          return 1;
        case 1:
          return 0;
        case 2:
          return 3;
        case 3:
          return 2;
        case 4:
          return 7;
        case 5:
          return 6;
        case 6:
          return 4;
        case 7:
          return 5;
        // elbow peices
        case 8:
          return 9;
        case 9:
          return 11;
        case 10:
          return 8;
        case 11:
          return 10;
        // T-junction
        case 12:
          return 15;
        case 13:
          return 14;
        case 14:
          return 12;
        case 15:
          return 13;
        // quad
        case 16:
          return 16;
        // ball
        case 17:
          return 17;
        // bomb
        case 18:
          return 18;
      }
    }
  }, {
    key: "typeForceOpen",
    value: function typeForceOpen() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var dir = arguments[1];

      if (dir.equals(vec2.up)) switch (type) {
        // straight pieces
        case 0:
          return 13;
        case 1:
          return 1;
        case 2:
          return 13;
        case 3:
          return 3;
        case 4:
          return 13;
        case 5:
          return 13;
        case 6:
          return 6;
        case 7:
          return 7;
        // elbow peices
        case 8:
          return 14;
        case 9:
          return 15;
        case 10:
          return 10;
        case 11:
          return 11;
        // T-junction
        case 12:
          return 16;
        case 13:
          return 13;
        case 14:
          return 14;
        case 15:
          return 15;
      }
      if (dir.equals(vec2.down)) switch (type) {
        // straight pieces
        case 0:
          return 12;
        case 1:
          return 1;
        case 2:
          return 12;
        case 3:
          return 3;
        case 4:
          return 12;
        case 5:
          return 12;
        case 6:
          return 6;
        case 7:
          return 7;
        // elbow peices
        case 8:
          return 8;
        case 9:
          return 9;
        case 10:
          return 14;
        case 11:
          return 15;
        // T-junction
        case 12:
          return 12;
        case 13:
          return 16;
        case 14:
          return 14;
        case 15:
          return 15;
      }
      if (dir.equals(vec2.left)) switch (type) {
        // straight pieces
        case 0:
          return 0;
        case 1:
          return 14;
        case 2:
          return 2;
        case 3:
          return 14;
        case 4:
          return 4;
        case 5:
          return 5;
        case 6:
          return 14;
        case 7:
          return 14;
        // elbow peices
        case 8:
          return 8;
        case 9:
          return 12;
        case 10:
          return 10;
        case 11:
          return 13;
        // T-junction
        case 12:
          return 12;
        case 13:
          return 13;
        case 14:
          return 14;
        case 15:
          return 16;
      }
      if (dir.equals(vec2.right)) switch (type) {
        // straight pieces
        case 0:
          return 0;
        case 1:
          return 15;
        case 2:
          return 2;
        case 3:
          return 15;
        case 4:
          return 4;
        case 5:
          return 5;
        case 6:
          return 15;
        case 7:
          return 15;
        // elbow peices
        case 8:
          return 12;
        case 9:
          return 9;
        case 10:
          return 13;
        case 11:
          return 11;
        // T-junction
        case 12:
          return 12;
        case 13:
          return 13;
        case 14:
          return 16;
        case 15:
          return 15;
      }
      return type;
    }
  }, {
    key: "closed",
    get: function get() {
      var r = new tile();
      r.openEnds = [];
      r.type = -1;
      return r;
    }
  }, {
    key: "tube_Horizontal",
    get: function get() {
      return new tile(0);
    }
  }, {
    key: "tube_Vertical",
    get: function get() {
      return new tile(1);
    }
  }, {
    key: "type_Horizontal",
    get: function get() {
      return 0;
    }
  }, {
    key: "type_Vertical",
    get: function get() {
      return 1;
    }
  }, {
    key: "type_Elbow_bl",
    get: function get() {
      return 8;
    }
  }, {
    key: "type_Elbow_br",
    get: function get() {
      return 9;
    }
  }, {
    key: "type_Elbow_tl",
    get: function get() {
      return 10;
    }
  }, {
    key: "type_Elbow_tr",
    get: function get() {
      return 11;
    }
  }, {
    key: "type_T_hb",
    get: function get() {
      return 12;
    }
  }, {
    key: "type_T_ht",
    get: function get() {
      return 13;
    }
  }, {
    key: "type_T_vl",
    get: function get() {
      return 14;
    }
  }, {
    key: "type_T_vr",
    get: function get() {
      return 15;
    }
  }, {
    key: "type_Quad",
    get: function get() {
      return 16;
    }
  }, {
    key: "type_Ball",
    get: function get() {
      return 17;
    }
  }, {
    key: "type_Bomb",
    get: function get() {
      return 18;
    }
  }]);

  return tile;
}();

tile.declareStatic();

var ball = function () {
  function ball() {
    _classCallCheck(this, ball);

    this.speed = 1;
    this.pos = new vec2();
    this.nextPos = null;
    this.moveDir = vec2.down;
    this.prefHDir = 0;
    this.rollback = true;
    this.paused = false;
    this.firstMove = true;
    this.interacted = [];
  }

  _createClass(ball, [{
    key: "getOpenDirections",
    value: function getOpenDirections() {
      var r = [];
      var ct = this.colPos.toTilePos().getTile();

      var ut = this.colPos.toTilePos().add(vec2.up).getTile();
      if (ut != null) {
        if (vec2.containsVec(ut.openEnds, vec2.down)) if (ct) {
          if (vec2.containsVec(ct.openEnds, vec2.up)) r.push(vec2.up);
        } else r.push(vec2.up);
      } else if (ct) {
        if (vec2.containsVec(ct.openEnds, vec2.up)) r.push(vec2.up);
      } else r.push(vec2.up);

      var lt = this.colPos.toTilePos().add(vec2.left).getTile();
      if (lt != null) {
        if (vec2.containsVec(lt.openEnds, vec2.right)) if (ct) {
          if (vec2.containsVec(ct.openEnds, vec2.left)) r.push(vec2.left);
        } else r.push(vec2.left);
      } else if (ct) {
        if (vec2.containsVec(ct.openEnds, vec2.left)) r.push(vec2.left);
      } else r.push(vec2.left);

      var rt = this.colPos.toTilePos().add(vec2.right).getTile();
      if (rt != null) {
        if (vec2.containsVec(rt.openEnds, vec2.left)) if (ct) {
          if (vec2.containsVec(ct.openEnds, vec2.right)) r.push(vec2.right);
        } else r.push(vec2.right);
      } else if (ct) {
        if (vec2.containsVec(ct.openEnds, vec2.right)) r.push(vec2.right);
      } else r.push(vec2.right);

      var bt = this.colPos.toTilePos().add(vec2.down).getTile();
      if (bt != null) {
        if (vec2.containsVec(bt.openEnds, vec2.up)) if (ct) {
          if (vec2.containsVec(ct.openEnds, vec2.down)) r.push(vec2.down);
        } else r.push(vec2.down);
      } else if (ct) {
        if (vec2.containsVec(ct.openEnds, vec2.down)) r.push(vec2.down);
      } else r.push(vec2.down);

      return r;
    }
  }, {
    key: "getPossibleDirections",
    value: function getPossibleDirections() {
      var pm = this.getOpenDirections();
      for (var i = pm.length - 1; i >= 0; i--) {
        if (pm[i].equals(this.moveDir.multiply(-1))) {
          pm.splice(i, 1);
          continue;
        }
        if (pm[i].equals(vec2.up)) if (this.speed <= 1) {
          pm.splice(i, 1);
          continue;
        }
      }
      return pm;
    }
  }, {
    key: "outOfBounds",
    value: function outOfBounds() {
      var p = this.colPos.toTilePos();
      return p.x < 0 || p.y < 0 || p.x >= boardsize.x || p.y >= boardsize.y;
    }
  }, {
    key: "destroy",
    value: function destroy(index) {
      balls.splice(index, 1);
      checkDestroyTagged();
    }
  }, {
    key: "destroyCheck",
    value: function destroyCheck(index) {
      if (this.outOfBounds()) this.destroy(index);
    }
  }, {
    key: "setToDestroy",
    value: function setToDestroy() {
      if (this.pos.equals(new vec2(-tilesize))) return;
      effects.push(effect.poof(this.colPos));
      this.pos = new vec2(-tilesize);
    }
  }, {
    key: "roll",
    value: function roll(ts) {
      if (this.paused) {
        return;
      }

      if (!this.nextPos) this.chooseNextPos();else this.moveToNextPos(ts);

      var curtile = this.colPos.toTilePos().getTile();
      if (curtile) if (curtile.type >= 0) curtile.tag();
    }
  }, {
    key: "chooseNextPos",
    value: function chooseNextPos() {
      if (!this.firstMove) if (this.colPos.toTilePos().getTile() == null) this.setToDestroy();

      var pm = this.getOpenDirections();
      var rbc = false;
      var pd = this.getPossibleDirections();
      this.firstMove = false;

      if (vec2.containsVec(pd, vec2.down)) {
        if (this.moveDir.equals(vec2.up)) {
          if (this.speed <= 1) this.direct(vec2.down);else this.direct(vec2.up);
        } else this.direct(vec2.down);
      } else if (vec2.containsVec(pd, this.moveDir)) this.direct(this.moveDir);else if (pd.length > 1) {
        this.pause();
        return;
      } else if (pd.length === 1) this.direct(pd[0]);else {
        if (this.moveDir.equals(vec2.down)) this.speed -= .5;
        if (this.speed < 1) this.setToDestroy();else this.direct(this.moveDir.multiply(-1));
      }

      if (this.speed < 0.25) this.speed = 0.25;
      if (!rbc) this.rollback = true;
      game.playSound(sfx.roll);
    }
  }, {
    key: "moveToNextPos",
    value: function moveToNextPos(ts) {
      var mdist = 100 / Math.max(game.settings.animStepRate, 1) * (2 * ts * Math.max(Math.min(this.speed, 5.25), 1));
      if (this.colPos.distance(this.nextPos.toCoordPos().add(tilecenter)) <= mdist) {
        this.pos = this.nextPos.toCoordPos();
        this.nextPos = null;

        var curtile = this.colPos.toTilePos().getTile();
        if (curtile) if (!vec2.containsVec(this.interacted, curtile.pos)) curtile.interactBall(this);
      } else {
        var mdir = this.colPos.direction(this.nextPos.toCoordPos().add(tilecenter));
        var pchng = vec2.fromAng(mdir, mdist);
        this.pos = this.pos.add(pchng);
      }
    }
  }, {
    key: "direct",
    value: function direct(dir) {
      this.moveDir = dir;
      this.nextPos = this.colPos.toTilePos().add(dir);
      if (dir.equals(vec2.right) || dir.equals(vec2.left)) this.speed -= 0.25;else if (dir.equals(vec2.down)) this.speed += 1;else this.speed -= 1.25;
    }
  }, {
    key: "pause",
    value: function pause() {
      this.paused = true;
      game.playSound(sfx.ballPause);
    }
  }, {
    key: "drawDirectionChoice",
    value: function drawDirectionChoice(ctx) {
      var pd = this.getPossibleDirections();
      for (var i in pd) {
        var spos = this.colPos.add(pd[i].multiply(16));
        new arrow(pd[i]).draw(ctx, spos);
      }
    }
  }, {
    key: "notifyDirection",
    value: function notifyDirection(dir) {
      if (this.paused) {
        if (vec2.containsVec(this.getPossibleDirections(), dir)) {
          this.paused = false;
          this.direct(dir);
          game.playSound(sfx.ballDirect);
        }
      } else this.controlDir = null;
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      var spos = this.pos.rounded();
      ctx.drawImage(graphics.tubes, 32, 128, 32, 32, spos.x, spos.y, 32, 32);
      if (this.paused) this.drawDirectionChoice(ctx);
    }
  }, {
    key: "colPos",
    get: function get() {
      return this.pos.add(tilecenter);
    }
  }]);

  return ball;
}();

var fallpiece = function () {
  function fallpiece() {
    _classCallCheck(this, fallpiece);

    this.tiles = [];
    this.realPos = new vec2(Math.floor(boardsize.x / 2), -1);
    this.visualPos = this.realPos.toCoordPos();
    this.modularRotation = false;
    this.bumpDown();
  }

  _createClass(fallpiece, [{
    key: "bumpDown",
    value: function bumpDown() {
      if (this.onGround()) {
        this.set();
        return;
      }
      this.realPos.y += 1;
      if (!this.empty()) game.playSound(sfx.move);
    }
  }, {
    key: "drop",
    value: function drop() {
      while (!this.empty()) {
        this.bumpDown();
      }
    }
  }, {
    key: "bumpLeft",
    value: function bumpLeft() {
      var lp = this.realPos.copy();
      this.realPos.x -= 1;
      this.moveCheck(lp);
      if (!this.empty()) game.playSound(sfx.move);
    }
  }, {
    key: "bumpRight",
    value: function bumpRight() {
      var lp = this.realPos.copy();
      this.realPos.x += 1;
      this.moveCheck(lp);
      if (!this.empty()) game.playSound(sfx.move);
    }
  }, {
    key: "moveCheck",
    value: function moveCheck(lastpos) {
      for (var i = this.tiles.length - 1; i >= 0; i--) {
        var rp = this.realPos.add(this.tiles[i].pos);
        if (rp.x < 0) {
          this.realPos = lastpos;
          return;
        }
        if (rp.x >= boardsize.x) {
          this.realPos = lastpos;
          return;
        }
        if (rp.getTile()) this.realPos = lastpos;
      }
    }
  }, {
    key: "rotate",
    value: function rotate() {
      var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var check = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (dir === -1) {
        for (var i = 3; i > 0; i--) {
          this.rotate(1, false);
        }if (check) this.rotCheck(-1);
        return;
      }
      var stl = new vec2(-1);
      var tl = new vec2();
      for (var i = this.tiles.length - 1; i >= 0; i--) {
        this.tiles[i].pos = new vec2(this.tiles[i].pos.y, -this.tiles[i].pos.x);
        this.tiles[i].type = this.tiles[i].getRotatedType();
        this.tiles[i].renew();
        tl.x = Math.min(this.tiles[i].pos.x, tl.x);
        tl.y = Math.min(this.tiles[i].pos.y, tl.y);
      }
      if (this.modularRotation) {
        for (var i in this.tiles) {
          this.tiles[i].pos = this.tiles[i].pos.add(stl.add(tl.multiply(-1)));
        }
      }
      if (check) {
        this.rotCheck(1);
        if (!this.empty()) game.playSound(sfx.move);
      }
    }
  }, {
    key: "rotCheck",
    value: function rotCheck() {
      var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      for (var i = this.tiles.length - 1; i >= 0; i--) {
        var rp = this.realPos.add(this.tiles[i].pos);
        if (rp.x < 0) {
          this.rotate(dir * -1, false);
          return;
        }
        if (rp.x >= boardsize.x) {
          this.rotate(dir * -1, false);
          return;
        }
        if (rp.getTile()) this.rotate(dir * -1, false);
      }
    }
  }, {
    key: "overlapsTile",
    value: function overlapsTile() {
      for (var i = this.tiles.length - 1; i >= 0; i--) {
        var rp = this.realPos.add(this.tiles[i].pos);
        if (rp.getTile()) return true;
      }
      return false;
    }
  }, {
    key: "containsType",
    value: function containsType(type) {
      for (var i in this.tiles) {
        if (this.tiles[i].type === type) return true;
      }return false;
    }
  }, {
    key: "set",
    value: function set() {
      for (var i = this.tiles.length - 1; i >= 0; i--) {
        var rp = this.tiles[i].pos.add(this.realPos);
        tiles[rp.x][rp.y] = this.tiles[i];
        tiles[rp.x][rp.y].pos = rp;
        tiles[rp.x][rp.y].set();
        if (checkColumnFull(rp.y)) pierceColumn(rp.y);
      }
      game.playSound(sfx.snap);
      this.tiles = [];
    }
  }, {
    key: "empty",
    value: function empty() {
      return this.tiles.length <= 0;
    }
  }, {
    key: "onGround",
    value: function onGround() {
      for (var i = this.tiles.length - 1; i >= 0; i--) {
        var rp = this.tiles[i].pos.add(this.realPos);
        if (rp.y >= boardsize.y - 1) return true;
        if (tiles[rp.x][rp.y + 1]) return true;
      }
      return false;
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      this.visualPos = this.visualPos.add(this.realPos.toCoordPos()).multiply(0.5);
      for (var i = this.tiles.length - 1; i >= 0; i--) {
        var p = this.visualPos.add(this.tiles[i].pos.toExpandedPos()).rounded();
        this.tiles[i].drawActual(ctx, p);
      }
    }
  }, {
    key: "drawCentered",
    value: function drawCentered(ctx, pos) {
      var bg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      var spos = new vec2();
      var l = 0;
      var r = 32;
      var t = 0;
      var b = 32;
      for (var i in this.tiles) {
        l = Math.min(l, this.tiles[i].pos.x * tilesize);
        r = Math.max(r, this.tiles[i].pos.x * tilesize + tilesize);
        t = Math.min(t, this.tiles[i].pos.y * tilesize);
        b = Math.max(b, this.tiles[i].pos.y * tilesize + tilesize);
      }
      spos = new vec2(r - l, b - t).multiply(.5).add(new vec2(l, t));
      spos = pos.add(spos.multiply(-1));
      for (var i in this.tiles) {
        var p = spos.add(this.tiles[i].pos.toExpandedPos()).rounded();
        this.tiles[i].drawActual(ctx, p, bg);
      }
    }
  }]);

  return fallpiece;
}();

var fallpiece_preset = function () {
  function fallpiece_preset() {
    _classCallCheck(this, fallpiece_preset);

    this.tileRolls = [];
    this.modularRotation = false;
  }

  _createClass(fallpiece_preset, [{
    key: "createPiece",
    value: function createPiece() {
      var p = new fallpiece();
      for (var t = this.tileRolls.length - 1; t >= 0; t--) {
        var rl = this.tileRolls[t].length;
        var tt = new tile(weightedRandomSelection(this.tileRolls[t][0]), this.tileRolls[t][1]);
        p.tiles.push(tt);
      }
      p.modularRotation = this.modularRotation;
      return p;
    }
  }], [{
    key: "getRandomPiece",
    value: function getRandomPiece(presetlist) {
      return weightedRandomSelection(presetlist).createPiece();
    }
  }, {
    key: "piece_tut1",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_Horizontal, 1]], new vec2(0, 0)], [[[tile.type_Horizontal, 2]], new vec2(-1, 0)], [[[tile.type_Elbow_tl, 2]], new vec2(1, 0)], [[[tile.type_Vertical, 1]], new vec2(1, -1)]];
      return r;
    }
  }, {
    key: "piece_tut2",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_Elbow_br, 1]], new vec2(-1, -1)], [[[tile.type_Elbow_bl, 3]], new vec2(0, -1)], [[[tile.type_Elbow_tr, 3]], new vec2(0, 0)], [[[tile.type_Elbow_tl, 1]], new vec2(1, 0)]];
      return r;
    }
  }, {
    key: "piece_L",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_Horizontal, 1]], new vec2(0, 0)], [[[tile.type_Horizontal, 2], [tile.type_Elbow_br, 1], [tile.type_Elbow_tr, 1]], new vec2(-1, 0)], [[[tile.type_Elbow_tl, 2], [tile.type_T_ht, 1], [tile.type_T_vl, 1]], new vec2(1, 0)], [[[tile.type_Vertical, 1], [tile.type_T_hb, 1]], new vec2(1, -1)]];
      return r;
    }
  }, {
    key: "piece_L2",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_Horizontal, 1]], new vec2(0, 0)], [[[tile.type_Horizontal, 2], [tile.type_Elbow_bl, 1], [tile.type_Elbow_tl, 1]], new vec2(1, 0)], [[[tile.type_Elbow_tr, 2], [tile.type_T_ht, 1], [tile.type_T_vr, 1]], new vec2(-1, 0)], [[[tile.type_Vertical, 1], [tile.type_T_hb, 1]], new vec2(-1, -1)]];
      return r;
    }
  }, {
    key: "piece_T",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_T_ht, 1], [tile.type_Quad, 0.2]], new vec2(0, 0)], [[[tile.type_Horizontal, 2], [tile.type_Elbow_br, 1], [tile.type_T_ht, 1], [tile.type_T_hb, 1]], new vec2(-1, 0)], [[[tile.type_Horizontal, 2], [tile.type_Elbow_bl, 1], [tile.type_T_ht, 1], [tile.type_T_hb, 1]], new vec2(1, 0)], [[[tile.type_Vertical, 1], [tile.type_T_hb, 1]], new vec2(0, -1)]];
      return r;
    }
  }, {
    key: "piece_Z",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_Horizontal, 1], [tile.type_Elbow_br, 1], [tile.type_Elbow_tr, 1]], new vec2(-1, -1)], [[[tile.type_Elbow_bl, 3], [tile.type_T_hb, 1], [tile.type_T_vl, 1]], new vec2(0, -1)], [[[tile.type_Elbow_tr, 3], [tile.type_T_ht, 1], [tile.type_T_vr, 1]], new vec2(0, 0)], [[[tile.type_Horizontal, 1], [tile.type_Elbow_bl, 1], [tile.type_Elbow_tl, 1]], new vec2(1, 0)]];
      return r;
    }
  }, {
    key: "piece_Z2",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_Horizontal, 1], [tile.type_Elbow_br, 1], [tile.type_Elbow_tr, 1]], new vec2(-1, 0)], [[[tile.type_Elbow_tl, 3], [tile.type_T_ht, 1], [tile.type_T_vl, 1]], new vec2(0, 0)], [[[tile.type_Elbow_br, 3], [tile.type_T_hb, 1], [tile.type_T_vr, 1]], new vec2(0, -1)], [[[tile.type_Horizontal, 1], [tile.type_Elbow_bl, 1], [tile.type_Elbow_tl, 1]], new vec2(1, -1)]];
      return r;
    }
  }, {
    key: "piece_square",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_Elbow_br, 1], [tile.type_T_hb, 1], [tile.type_T_vr, 1]], new vec2(-1, -1)], [[[tile.type_Elbow_bl, 1], [tile.type_Quad, 0.5]], new vec2(0, -1)], [[[tile.type_Elbow_tr, 1], [tile.type_Quad, 0.5]], new vec2(-1, 0)], [[[tile.type_Elbow_tl, 1], [tile.type_T_ht, 1], [tile.type_T_vl, 1]], new vec2(0, 0)]];
      r.modularRotation = true;
      return r;
    }
  }, {
    key: "piece_long",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_Horizontal, 5], [tile.type_T_vr, 2], [tile.type_Elbow_br, 1], [tile.type_Elbow_tr, 1]], new vec2(-2, 0)], [[[tile.type_Horizontal, 3], [tile.type_T_hr, 1], [tile.type_T_hl, 1]], new vec2(-1, 0)], [[[tile.type_Horizontal, 3], [tile.type_T_hr, 1], [tile.type_T_hl, 1]], new vec2(0, 0)], [[[tile.type_T_vl, 1], [tile.type_Elbow_bl, 1], [tile.type_Elbow_tl, 1], [tile.type_Quad, 0.2]], new vec2(1, 0)]];
      return r;
    }
  }, {
    key: "piece_bonus",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_Quad, 1]], new vec2(0)]];
      return r;
    }
  }, {
    key: "piece_ball",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_Ball, 1]], new vec2(0, 0)]];
      return r;
    }
  }, {
    key: "piece_bomb",
    get: function get() {
      var r = new fallpiece_preset();
      r.tileRolls = [[[[tile.type_Bomb, 1]], new vec2(0, 0)]];
      return r;
    }
  }]);

  return fallpiece_preset;
}();

function weightedRandomSelection(weightedlist) {
  var totalweight = 0;
  var cdf = [0];
  for (var i = 0; i < weightedlist.length; i++) {
    totalweight += weightedlist[i][1];
    cdf.push(cdf[cdf.length - 1] + weightedlist[i][1]);
  }
  cdf.splice(0, 1);
  cdf.push(totalweight);
  var randsel = Math.random() * totalweight;
  var i = 0;
  while (cdf[i] < randsel) {
    i++;
  }return weightedlist[i][0];
}