"use strict";

//prevent key scrolling
window.addEventListener("keydown", function (e) {
    // space and arrow keys
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);
//

//console.clear();
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;
var lastTime = 0;
var dt = 0;
// game:
var tiles;
var tileFallHeight;
var taggedTiles = [];
var fallingTiles = [];
var boardTop = 10;
var boardLeft = 10;
var boardsize = new vec2(10, 20);
var fallingpiece = new fallpiece();
var nextpiece = new fallpiece();
var curlvl = new level();
var score = 0;
var seshScore = -1;
var seshScoreV = null;
var seshScoreVB = null;
var consTiles = 0;
var fpPresets;
var tilesize = 32;
var tilecenter = new vec2(tilesize / 2);
var boardBottom = boardTop + boardsize.y * tilesize;
var boardRight = boardLeft + boardsize.x * tilesize;
var balls = [];
var effects = [];
var timetilDrop = curlvl.dropInterval;
var playerhud = new hud();
var graphics = {
  tubes: new Image(),
  tubes_black: new Image(),
  tile: new Image(),
  tile_front: new Image(),
  smoke: new Image(),
  explosion: new Image(),
  arrows: new Image()
};
var sfx = {
  poof: new Audio("sfx/poof.wav"),
  explosion: new Audio("sfx/explosion.wav"),
  move: new Audio("sfx/move.wav"),
  snap: new Audio("sfx/snap.wav"),
  ballPause: new Audio("sfx/ballPause.wav"),
  ballDirect: new Audio("sfx/ballDirect.wav"),
  roll: new Audio("sfx/roll.wav"),
  rollHit: new Audio("sfx/rollHit.wav"),
  levelUp: new Audio("sfx/levelUp.wav"),
  notify: new Audio("sfx/notify.wav"),
  lose: new Audio("sfx/lose.wav"),
  music: new Audio("sfx/music.mp3")
};
var controlEnum = {
  mUp: 0,
  mDown: 1,
  mLeft: 2,
  mRight: 3,
  bLeft: 4,
  bRight: 5,
  bDown: 6,
  quickDrop: 7,
  rotate: 8,
  rotateCC: 9,
  pauseSelect: 10
};
var tutorial;
var spritefont = font.loadGameFont();
var smallfont = font.loadSmallFont();
var smallfontUC = font.loadSmallFont(false);
var game;
var indicators = [];
var ballfall = false;
var clistening = -1;
var dragstart = null;

function clrCanvas() {
  context.fillStyle = "#444";
  context.fillRect(0, 0, width, height);
}
function getTimescale() {
  return dt / 16.6667;
}
function init() {
  game = gameController.game;
  scoreboard.load();
  game.loadSettings();
  game.loadKeybindings();
  game.loadScreens();
  loadGraphics();
  hookControls();
  clrCanvas();
  initFallpiecePresets();
  requestAnimationFrame(step);
}
function step() {
  update(dt / 16.6667);
  requestAnimationFrame(step);
  dt = performance.now() - lastTime;
  lastTime = performance.now();
}
function update(timescale) {
  game.mode_update(timescale);
}

function initTiles() {
  tiles = [];
  fallingTiles = [];
  taggedTiles = [];
  tileFallHeight = [];
  for (var x = boardsize.x; x > 0; x--) {
    var a = [];
    tileFallHeight.push(-1);
    for (var y = boardsize.y; y > 0; y--) {
      a.push(null);
    }tiles.push(a);
  }
}
function initFallpiecePresets() {
  fpPresets = [];
  fpPresets.push([fallpiece_preset.piece_L, 2]);
  fpPresets.push([fallpiece_preset.piece_L2, 2]);
  fpPresets.push([fallpiece_preset.piece_T, 2]);
  fpPresets.push([fallpiece_preset.piece_Z, 1.5]);
  fpPresets.push([fallpiece_preset.piece_Z2, 1.5]);
  fpPresets.push([fallpiece_preset.piece_square, 2]);
  fpPresets.push([fallpiece_preset.piece_long, 2]);
}
function loadGraphics() {
  context.imageSmoothingEnabled = false;
  graphics.tubes.src = "tubes.png";
  graphics.tubes_black.src = "tubes_black.png";
  graphics.tile.src = "tile.png";
  graphics.tile_front.src = "tile_front.png";
  graphics.smoke.src = "smoke.png";
  graphics.explosion.src = "explosion.png";
  graphics.arrows.src = "arrows.png";
}

function keyCodeToName(code) {
  if (code >= 65 && code <= 90) return String.fromCharCode(code);
  if (code >= 48 && code <= 57) return (code - 48).toString();
  if (code >= 96 && code <= 105) return "kp " + (code - 96).toString();
  switch (code) {
    case -1:
      return ":::";
    case 0:
      return "none";
    case 8:
      return "backspc";
    case 13:
      return "enter";
    case 37:
      return "left arw";
    case 39:
      return "right arw";
    case 40:
      return "down arw";
    case 38:
      return "up arw";
    case 17:
      return "ctrl";
    case 16:
      return "shift";
    case 32:
      return "space";
    case 219:
      return "l brckt";
    case 221:
      return "r brckt";
    case 191:
      return "backslsh";
    case 220:
      return "fwdslsh";
    case 190:
      return "period";
    case 186:
      return "semicolon";
    case 222:
      return "apstrphe";
    case 188:
      return "comma";
  }
  return "key" + code.toString();
}
function setControlToKey(controlEnum, key) {
  switch (controlEnum) {
    case 0:
      game.settings.controls.mUp = key;break;
    case 1:
      game.settings.controls.mDown = key;break;
    case 2:
      game.settings.controls.mLeft = key;break;
    case 3:
      game.settings.controls.mRight = key;break;
    case 4:
      game.settings.controls.bLeft = key;break;
    case 5:
      game.settings.controls.bRight = key;break;
    case 6:
      game.settings.controls.bDown = key;break;
    case 7:
      game.settings.controls.quickDrop = key;break;
    case 8:
      game.settings.controls.rotate = key;break;
    case 9:
      game.settings.controls.rotateCC = key;break;
    case 10:
      game.settings.controls.pauseSelect = key;break;
  }
}
function setControl(controlEnum) {
  setControlToKey(controlEnum, -1);

  clistening = controlEnum;
  setTimeout(function () {
    addEventListener('keydown', listenForControl);
  }, 0);
}
function listenForControl(event) {
  setControlToKey(clistening, event.keyCode);

  removeEventListener('keydown', listenForControl);
  clistening = -1;
}

function resetGame() {
  initTiles();
  curlvl = new level();

  dragstart = null;
  effects = [];
  balls = [];
  score = 0;
  fallingpiece = null;
  nextpiece = fallpiece_preset.getRandomPiece(fpPresets);
}
function startGame() {
  resetGame();
  initTiles();
  fallingpiece = new fallpiece();
  game.switchMode(gameController.mode_gameplay);
  game.startMusic();
  indicators = [];
  ballfall = false;
}
function startTutorial() {
  resetGame();
  game.settings.animStepRate = 100;
  tutorial = new tutorialSequence();
  initTiles();
  fallingpiece = new fallpiece();
  game.switchMode(gameController.mode_tutorial);
  //game.startMusic();
  indicators = [];
  ballfall = false;
  tutorial.init();
}
function loseGame() {
  game.gameoverScreen = menuScreen.screen_gameover;
  game.switchMode(gameController.mode_gameover);
  game.stopMusic();
  game.playSound(sfx.lose);
}

function exportTiles() {
  var s = "";
  for (var x in tiles) {
    s += "[";
    for (var y in tiles[x]) {
      if (tiles[x][y]) {
        s += "new tile(" + tiles[x][y].type + "),";
      } else s += "null,";
    }
    s += "],\n";
  }
  return s;
}
function setTilePositions() {
  for (var x = tiles.length - 1; x >= 0; x--) {
    for (var y = tiles[x].length - 1; y >= 0; y--) {
      if (tiles[x][y]) tiles[x][y].pos = new vec2(x, y);
    }
  }
}
function poofTiles() {
  game.playSound(sfx.poof);
  for (var x = tiles.length - 1; x >= 0; x--) {
    for (var y = tiles[x].length - 1; y >= 0; y--) {
      if (tiles[x][y]) effects.push(effect.poof(new vec2(x, y).toCoordPos().add(tilecenter)));
    }
  }
}
function handleTiles(ts, ctx) {
  tile.drawTileBG(ctx);
  handleFallingTiles(ts, ctx);
  drawTiles(ctx);
}
function drawTiles(ctx) {
  for (var x = tiles.length - 1; x >= 0; x--) {
    for (var y = tiles[x].length - 1; y >= 0; y--) {
      if (tiles[x][y]) tiles[x][y].draw(ctx, new vec2(x, y));
    }
  }
}
function handleFallingTiles(ts, ctx) {
  if (fallingTiles.length <= 0) {
    tile.fallProgress = 0;
    return;
  }

  if (tile.fallProgress == 0) for (var i = fallingTiles.length - 1; i >= 0; i--) {
    if (fallingTiles[i].checkEndFall(i)) i = fallingTiles.length;
  }

  var mstep = game.settings.animStepRate / 16.6667;
  tile.fallProgress += ts / mstep;
  for (var i in fallingTiles) {
    var spos = new vec2();
    if (tile.fallProgress >= 1) fallingTiles[i].pos.y += 1;else spos.y += tile.fallProgress * tilesize;
    spos = spos.add(fallingTiles[i].pos.toCoordPos());
    spos = spos.rounded();
    fallingTiles[i].drawActual(ctx, spos);
  }

  if (tile.fallProgress >= 1) tile.fallProgress = 0;

  if (fallingTiles.length <= 0) seshScore = -1;
}
function handleEffects(ts, ctx) {
  for (var i = effects.length - 1; i >= 0; i--) {
    effects[i].update(ts, i, ctx);
  }
}
function handleFallingPiece(timescale) {
  timetilDrop -= timescale;
  if (timetilDrop <= 0) {
    fallingpiece.bumpDown();
    timetilDrop = curlvl.dropInterval;
  }
  if (turnIsOver()) finishTurn();
  handleSeshScore();
}
function handleSeshScore() {
  if (seshScore > 0) {
    var ss = seshScore;
    if (!seshScoreV) {
      seshScoreV = new notification(ss.toString() + " pts", 100);
      effects.push(seshScoreV);
    } else {
      if (ss > Number.parseInt(seshScoreV.txt)) {
        seshScoreV.txt = ss.toString() + " pts";
        seshScoreV.life = 60;
        if (!effects.includes(seshScoreV)) {
          effects.push(seshScoreV);
        }
      }
    }
    if (ss >= 750) {
      if (!seshScoreVB) {
        seshScoreVB = new notification("bonus ball", 60);
        effects.push(seshScoreVB);
        game.playSound(sfx.notify);
      }
      return;
    }
  }
}
function giveBonusBall() {
  if (turnAlmostOver()) {
    if (seshScoreVB) {
      fallingpiece = fallpiece_preset.piece_ball.createPiece();
      indicators = [];
      ballfall = true;
      findIndicators();
    }
    seshScore = -1;
    seshScoreV = null;
    seshScoreVB = null;
  }
}
function turnAlmostOver() {
  return (fallingpiece.empty() || fallingpiece == null) && balls.length <= 0 && fallingTiles.length <= 0 && taggedTiles.length <= 0;
}
function turnIsOver() {
  return (fallingpiece.empty() || fallingpiece == null) && balls.length <= 0 && fallingTiles.length <= 0 && taggedTiles.length <= 0 && effects.length <= 0;
}
function spawnPiece() {
  fallingpiece = nextpiece;
  nextpiece = curlvl.getNextPiece();

  if (fallingpiece.overlapsTile()) loseGame();

  if (fallingpiece.containsType(tile.type_Ball)) {
    ballfall = true;
    findIndicators();
  } else {
    ballfall = false;
    indicators = [];
  }

  timetilDrop = 0;
}
function finishTurn() {
  giveBonusBall();
  if (fallingpiece.empty() || fallingpiece == null) spawnPiece();
}
function spawnBall(pos) {
  var b = new ball();
  b.pos = pos.toCoordPos();
  balls.push(b);

  seshScore = Math.max(0, seshScore);
}

function checkFullRows() {

  for (var y in tiles[0]) {
    for (var x in tiles) {
      if (tiles[x][y]) if (checkColumnFull(y)) pierceColumn(y);
    }
  }
}
function checkColumnFull(y) {
  for (var i in tiles) {
    if (!tiles[i][y]) return false;
  }
  return true;
}
function pierceColumn(y) {
  for (var i in tiles) {
    if (tiles[i][y]) {
      //tiles[i][y].forceOpen(vec2.left);
      //tiles[i][y].forceOpen(vec2.right);
      tiles[i][y].powered = true;
    }
    var spos = new vec2(i, y).toCoordPos();
    effects.push(new flash(spos, new vec2(tilesize), [255, 255, 0, 0.3], 10));
  }
}
function detonateBombs() {
  var bc = 1;
  for (var x in tiles) {
    for (var y in tiles[x]) {
      if (tiles[x][y]) if (tiles[x][y].type === tile.type_Bomb) {
        tiles[x][y].detonate();
        addScore(Math.pow(2, Math.min(bc, 6)) * 100, new vec2(x, y));
        bc++;
      }
    }
  }
}
function findIndicators() {
  for (var x = tiles.length - 1; x >= 0; x--) {
    for (var y = tiles[x].length - 1; y >= 0; y--) {
      if (tiles[x][y]) {
        for (var i in tiles[x][y].openEnds) {
          var oend = tiles[x][y].openEnds[i];
          if (oend.equals(vec2.up)) if (!new vec2(x, y - 1).getTile()) indicators.push({ pos: new vec2(x, y - 1), dir: vec2.down });
          if (oend.equals(vec2.left)) {
            if (!new vec2(x - 1, y).getTile()) {
              var mt = new vec2(x - 1, y + 1).getTile();
              if (mt) if (!vec2.containsVec(mt.openEnds, vec2.up)) indicators.push({ pos: new vec2(x - 1, y), dir: vec2.right });
            }
          }
          if (oend.equals(vec2.right)) {
            if (!new vec2(x + 1, y).getTile()) {
              var mt = new vec2(x + 1, y + 1).getTile();
              if (mt) if (!vec2.containsVec(mt.openEnds, vec2.up)) indicators.push({ pos: new vec2(x + 1, y), dir: vec2.left });
            }
          }
        }
      }
    }
  }
}
function drawIndicators(ctx) {
  for (var i in indicators) {
    new arrow(indicators[i].dir).draw(ctx, indicators[i].pos.toCoordPos().add(tilecenter).add(indicators[i].dir.multiply(tilesize / 4)));
  }
}

function checkFallingTiles() {
  for (var x in tileFallHeight) {
    for (var y = tileFallHeight[x]; y >= 0; y--) {
      if (tiles[x][y]) tiles[x][y].startFall();
    }tileFallHeight[x] = -1;
  }
  for (var x in tiles) {
    for (var y in tiles[x]) {
      if (tiles[x][y]) if (tiles[x][y].isAlone()) tiles[x][y].startFall();
    }
  }
}
function checkDestroyTagged() {
  if (balls.length <= 0) destroyTagged();
}
function destroyTagged() {
  if (taggedTiles.length <= 0) return;
  var sc = consTiles * 10 + 10;
  addScore(sc, taggedTiles[0].pos);

  taggedTiles[0].destroy();
  fallWave(taggedTiles[0].pos.x, taggedTiles[0].pos.y);
  taggedTiles.splice(0, 1);
  game.playSound(sfx.poof);
  consTiles++;
  if (taggedTiles.length > 0) setTimeout(destroyTagged, game.settings.animStepRate);else {
    console.log("mawr");
    consTiles = 0;
    checkFallingTiles();
  }
}
function fallWave(x, y) {
  var col = [255, 255, 255, 0.3];
  var spos = new vec2(x, y).toCoordPos();
  var fls = new flash(spos, new vec2(tilesize), col, 10);
  effects.push(fls);

  if (y > 0) setTimeout(function () {
    fallWave(x, y - 1);
  }, game.settings.animStepRate / 2);
}
function addScore(sc) {
  var focus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  score += sc;

  if (seshScore >= 0) seshScore += sc;

  if (focus == null) return;
  effects.push(new splashtxt(focus.toCoordPos().add(new vec2(16, 12)), sc.toString(), 90));
}

function control_left() {
  fallingpiece.bumpLeft();
}
function control_right() {
  fallingpiece.bumpRight();
}
function control_down() {
  if (!fallingpiece.empty()) {
    fallingpiece.bumpDown();
    timetilDrop = curlvl.dropInterval;
  }
}
function control_drop() {
  if (!fallingpiece.empty()) {
    fallingpiece.drop();
  };
}
function control_rotate() {
  fallingpiece.rotate(-1);
}
function control_rotateCC() {
  fallingpiece.rotate(1);
}
function control_mLeft() {
  if (balls.length > 0) balls[0].notifyDirection(vec2.left);
}
function control_mRight() {
  if (balls.length > 0) balls[0].notifyDirection(vec2.right);
}
function control_mUp() {
  if (balls.length > 0) balls[0].notifyDirection(vec2.up);
}
function control_mDown() {
  if (balls.length > 0) balls[0].notifyDirection(vec2.down);
}
function control_pause() {
  game.pauseMusic();
  game.switchMode(gameController.mode_paused);
}

function hookControls() {
  document.addEventListener("keydown", keyDown);
  canvas.addEventListener("mousemove", mouseOver);
  canvas.addEventListener("mousedown", mouseClick);
  canvas.addEventListener("mouseup", mouseUp);
  canvas.addEventListener("mouseout", mouseUp);

  //mobile browsers:
  canvas.addEventListener("touchmove", touchmove);
  canvas.addEventListener("touchstart", touchstart);
  canvas.addEventListener("touchend", mouseUp);
  canvas.addEventListener("touchcancel", mouseUp);
}
function keyDown(event) {
  console.log(event.key + ": " + event.keyCode.toString());
  game.mode_handleControl(event.keyCode);
}
function mouseOver(event) {
  game.mode_handleMouseOver(event);
}
function mouseClick(event) {
  game.mode_handleMouseClick(event);
}
function mouseUp(event) {
  game.mode_handleMouseUp(event);
}
function typeName(event) {
  var acceptedChars = "abcdefghijklmnopqrstuvwxyz0123456789 ";
  if (acceptedChars.includes(event.key)) game.gameoverScreen.name += event.key;else if (event.key === "Backspace") game.gameoverScreen.name = game.gameoverScreen.name.slice(0, game.gameoverScreen.name.length - 1);else if (event.key === "Enter") {
    var sscore = { name: game.gameoverScreen.name, points: score };
    scoreboard.addScore(sscore);
    game.switchMode(gameController.mode_scoreBoard);
    removeEventListener('keydown', typeName);
  }
}

function touchmove(event) {
  var m = new vec2(event.touches[0].clientX - canvas.offsetLeft, event.touches[0].clientY - canvas.offsetTop);
  var ev = { offsetX: m.x, offsetY: m.y };
  mouseOver(ev);
}
function touchstart(event) {
  var m = new vec2(event.touches[0].clientX - canvas.offsetLeft, event.touches[0].clientY - canvas.offsetTop);
  var ev = { offsetX: m.x, offsetY: m.y };
  mouseClick(ev);
}
function touchend() {
  var m = new vec2(event.touches[0].clientX - canvas.offsetLeft, event.touches[0].clientY - canvas.offsetTop);
  var ev = { offsetX: m.x, offsetY: m.y };
  mouseUp(ev);
}

init();