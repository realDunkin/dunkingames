"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var menuScreen = function () {
  function menuScreen() {
    _classCallCheck(this, menuScreen);

    this.selectedItem = 0;
    this.buttons = [];
  }

  _createClass(menuScreen, [{
    key: "reset",
    value: function reset() {
      this.selectedItem = 0;
    }
  }, {
    key: "selectionChange",
    value: function selectionChange() {
      var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      game.playSound(sfx.roll);
      this.selectedItem += dir;
    }
  }, {
    key: "setSelection",
    value: function setSelection(sel) {
      if (sel == this.selectedItem) return;
      this.selectedItem = sel;
      game.playSound(sfx.roll);
    }
  }, {
    key: "select",
    value: function select() {
      if (this.buttons.length <= 0) return;
      game.playSound(sfx.rollHit);
      this.selectedButton.select();
    }
  }, {
    key: "arrangeButtons",
    value: function arrangeButtons() {
      var point = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new vec2(width / 2, height / 2);

      for (var i in this.buttons) {
        this.buttons[i].pos = new vec2(point.x, point.y + i * 40);
      }
      return this;
    }
  }, {
    key: "drawBG",
    value: function drawBG(ctx) {
      for (var x = Math.floor(width / tilesize) + 1; x >= -1; x--) {
        for (var y = Math.floor(height / tilesize) + 1; y >= -1; y--) {
          var img = graphics.tile;
          if (x < 0 || y < 0 || x >= Math.floor(width / tilesize) - 1 || y >= Math.floor(height / tilesize)) img = graphics.tile_front;
          var spos = new vec2(x, y).toExpandedPos().add(new vec2(20, 10));
          ctx.drawImage(img, spos.x, spos.y);
        }
      }
    }
  }, {
    key: "draw",
    value: function draw(ctx, font) {
      clrCanvas();
      this.drawBG(ctx);
      this.drawAux();
      for (var i in this.buttons) {
        this.buttons[i].draw(ctx, font);
      }if (this.buttons.length > 0) this.drawSelection(ctx);
    }
  }, {
    key: "drawSelection",
    value: function drawSelection(ctx) {
      var fls = lastTime % 1000 < 500;
      var sprtL = new vec2(16, fls ? 0 : 16);
      var sprtR = new vec2(0, fls ? 0 : 16);
      ctx.drawImage(graphics.arrows, sprtL.x, sprtL.y, 16, 16, this.selectedButton.pos.x - this.selectedButton.size.x / 2 - 16, this.selectedButton.pos.y - 12, 16, 16);
      ctx.drawImage(graphics.arrows, sprtR.x, sprtR.y, 16, 16, this.selectedButton.pos.x + this.selectedButton.size.x / 2, this.selectedButton.pos.y - 12, 16, 16);
    }
  }, {
    key: "drawAux",
    value: function drawAux() {}
  }, {
    key: "draw_mainMenu",
    value: function draw_mainMenu(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 70), "Tubetris", 3);
    }
  }, {
    key: "draw_paused",
    value: function draw_paused(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 80), "pause", 2);
    }
  }, {
    key: "draw_options",
    value: function draw_options(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 80), "options", 2);
    }
  }, {
    key: "draw_scoreBoard",
    value: function draw_scoreBoard(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 40), "scoreboard", 2);

      var spos = new vec2(0, tilesize * 5 + 10);
      for (var i in scoreboard.scores) {
        var score = scoreboard.scores[i];
        if (this.scoreFocus) {
          if (this.scoreFocus === i) {
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.fillRect(0, i * tilesize * 2 + 170, width, tilesize);
          }
        }
        spritefont.drawTextCentered(ctx, new vec2(width / 4, i * tilesize * 2).add(spos), score.name, 1);
        spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, i * tilesize * 2).add(spos), score.points.toString(), 1);
      }
    }
  }, {
    key: "draw_controlsMenu",
    value: function draw_controlsMenu(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 40), "controls", 2);
    }
  }, {
    key: "draw_tutorialMenu",
    value: function draw_tutorialMenu(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 40), "tutorial", 2);
      this.tutScreen.drawAux(ctx);
    }
  }, {
    key: "draw_tutorial_1",
    value: function draw_tutorial_1(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 120), "1 out of 10", 1);

      spritefont.drawTextCentered(ctx, new vec2(width / 2, 5 * tilesize), "Movement:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 7 * tilesize), "falling pieces can be", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 8 * tilesize), "moved with the arrow keys:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 9 * tilesize), "l and r move it sideways", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 10 * tilesize), "down drops it downward", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), "up rotates it", 1);

      spritefont.drawTextCentered(ctx, new vec2(width / 2, 13 * tilesize), "once the falling piece", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 14 * tilesize), "lies on top of a solid", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 15 * tilesize), "block it will be placed", 1);
    }
  }, {
    key: "draw_tutorial_2",
    value: function draw_tutorial_2(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 120), "2 out of 10", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 5 * tilesize), "the goal of the game is to", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 6 * tilesize), "acquire as much points as", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 7 * tilesize), "possible before the tubes", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 8 * tilesize), "stack to the top of the", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 9 * tilesize), "screen", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 10 * tilesize), "every so often a ball", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), "will spawn in place of", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 12 * tilesize), "a piece", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 13 * tilesize), "it will roll through the", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 14 * tilesize), "tubes destroying them and", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 15 * tilesize), "giving you points", 1);
    }
  }, {
    key: "draw_tutorial_3",
    value: function draw_tutorial_3(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 120), "3 out of 10", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 5 * tilesize), "the more tubes you destroy", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 6 * tilesize), "with a single ball", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 7 * tilesize), "the more points you earn", 1);

      spritefont.drawTextCentered(ctx, new vec2(width / 2, 9 * tilesize), "when the ball runs into", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 10 * tilesize), "an intersection", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), "you will choose which way", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 12 * tilesize), "it goes", 1);

      spritefont.drawTextCentered(ctx, new vec2(width / 2, 14 * tilesize), "once the ball leaves the", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 15 * tilesize), "tubes it will disappear", 1);
    }
  }, {
    key: "draw_tutorial_4",
    value: function draw_tutorial_4(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 120), "4 out of 10", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 5 * tilesize), "block types:", 1);
      tile.tube_Horizontal.drawActual(ctx, new vec2(width / 2 - 160, 7 * tilesize), false);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 7 * tilesize), "normal tubes:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 8 * tilesize), "gives a path for the", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 9 * tilesize), "ball to follow", 1);
      new tile(tile.type_Quad).drawActual(ctx, new vec2(width / 2 - 140, 11 * tilesize), false);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), "quad tubes:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 12 * tilesize), "stop the ball and give", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 13 * tilesize), "it extra momentum while", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 14 * tilesize), "you get to choose which", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 15 * tilesize), "way it goes", 1);
    }
  }, {
    key: "draw_tutorial_5",
    value: function draw_tutorial_5(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 120), "5 out of 10", 1);
      new tile(tile.type_Quad).drawActual(ctx, new vec2(width / 2 - 230, 5 * tilesize), false);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 5 * tilesize), "quad tubes continued:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 6 * tilesize), "when placed they will", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 7 * tilesize), "forcefully attach them", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 8 * tilesize), "selves to their neighbors", 1);

      new tile(tile.type_Bomb).drawActual(ctx, new vec2(width / 2 - 100, 10 * tilesize), false);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 10 * tilesize), "bombs:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), "detonate when a", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 12 * tilesize), "ball hits it or when", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 13 * tilesize), "next to another bomb", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 14 * tilesize), "destroyoing all blocks", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 15 * tilesize), "nearby", 1);
    }
  }, {
    key: "draw_tutorial_6",
    value: function draw_tutorial_6(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 120), "6 out of 10", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 6 * tilesize), "overcharging:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 7 * tilesize), "when a horizontal row", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 8 * tilesize), "is filled with blocks", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 9 * tilesize), "it will overcharge the", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 10 * tilesize), "blocks in that row", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), "causing them to burst", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 12 * tilesize), "when a ball rolls through", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 13 * tilesize), "them giving extra points", 1);
    }
  }, {
    key: "draw_tutorial_7",
    value: function draw_tutorial_7(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 120), "7 out of 10", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 5 * tilesize), "HUD:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 6 * tilesize), "your heads up display", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 7 * tilesize), "provides lots of useful", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 8 * tilesize), "information", 1);

      spritefont.drawTextCentered(ctx, new vec2(width / 2, 9 * tilesize), "next:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 10 * tilesize), "displays the next piece", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), "that will be spawned", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 12 * tilesize), "time til:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 13 * tilesize), "displays how many pieces", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 14 * tilesize), "you have to use before", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 15 * tilesize), "the denoted piece spawns", 1);
    }
  }, {
    key: "draw_tutorial_8",
    value: function draw_tutorial_8(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 120), "8 out of 10", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 5 * tilesize), "momentum:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 6 * tilesize), "displays how long the", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 7 * tilesize), "ball can continue rolling", 1);

      spritefont.drawTextCentered(ctx, new vec2(width / 2, 9 * tilesize), "level:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 10 * tilesize), "displays what difficulty", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), "level you are currently", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 12 * tilesize), "on and how many pieces", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 13 * tilesize), "are left in it until you", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 14 * tilesize), "progress", 1);
    }
  }, {
    key: "draw_tutorial_9",
    value: function draw_tutorial_9(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 120), "9 out of 10", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 6 * tilesize), "score:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 7 * tilesize), "displays your current", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 8 * tilesize), "score", 1);

      spritefont.drawTextCentered(ctx, new vec2(width / 2, 10 * tilesize), "high:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), "displays the highest", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 12 * tilesize), "score that is held on", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 13 * tilesize), "the score board", 1);
    }
  }, {
    key: "draw_tutorial_10",
    value: function draw_tutorial_10(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 120), "10 out of 10", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 5 * tilesize), "misc:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 6 * tilesize), "when tubes get destroyed", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 7 * tilesize), "they release steam that", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 8 * tilesize), "loosens up the tubes", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 9 * tilesize), "above them which will", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 10 * tilesize), "then cause those tubes", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), "to fall down", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 13 * tilesize), "spacebar can be used to", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 14 * tilesize), "pause the game and", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 15 * tilesize), "navigate menus", 1);
    }
  }, {
    key: "draw_gameover",
    value: function draw_gameover(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 80), "game over", 2);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 10 * tilesize), "Score:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), score.toString(), 1);
    }
  }, {
    key: "draw_nameEntry",
    value: function draw_nameEntry(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 80), "high score!", 2);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 140), score.toString(), 2);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 10 * tilesize), "enter name:", 1);

      var fchar = lastTime % 1000 < 500 ? ":" : " ";
      if (this.name.length >= 10) {
        fchar = "";
        this.name = this.name.slice(0, 10);
      }
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), this.name + fchar, 1);
    }
  }, {
    key: "draw_credits",
    value: function draw_credits(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 80), "credits", 2);

      spritefont.drawTextCentered(ctx, new vec2(width / 2, 5 * tilesize), "developer:", 1);
      //spritefont.drawTextCentered(ctx, new vec2(width / 2, 6 * tilesize), "technonugget", 1);

      spritefont.drawTextCentered(ctx, new vec2(width / 2, 8 * tilesize), "pixel art:", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 12 * tilesize), "music and sound:", 1);
      //spritefont.drawTextCentered(ctx, new vec2(width / 2, 13 * tilesize), "megajackie", 1);
      //spritefont.drawTextCentered(ctx, new vec2(width / 2, 14 * tilesize), "that one guy", 1);
    }
  }, {
    key: "draw_saveError",
    value: function draw_saveError(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 80), "warning", 2);

      spritefont.drawTextCentered(ctx, new vec2(width / 2, 6 * tilesize), "it appears that your", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 7 * tilesize), "browser settings do not", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 8 * tilesize), "allow local storage of", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 9 * tilesize), "cookies or website data", 1);

      spritefont.drawTextCentered(ctx, new vec2(width / 2, 11 * tilesize), "you can continue but", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 12 * tilesize), "your scores and settings", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 13 * tilesize), "will not be saved", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 14 * tilesize), "please consider changing", 1);
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 15 * tilesize), "your browser settings", 1);
    }
  }, {
    key: "draw_keybinding",
    value: function draw_keybinding(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(width / 2, 80), "key binding", 2);
      spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, 5 * tilesize), keyCodeToName(game.settings.controls.mUp)); //move up
      spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, 6 * tilesize), keyCodeToName(game.settings.controls.mDown)); //move down
      spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, 7 * tilesize), keyCodeToName(game.settings.controls.mLeft)); //move left
      spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, 8 * tilesize), keyCodeToName(game.settings.controls.mRight)); //move right
      spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, 9 * tilesize), keyCodeToName(game.settings.controls.bLeft)); //bump left
      spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, 10 * tilesize), keyCodeToName(game.settings.controls.bRight)); //bump right
      spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, 11 * tilesize), keyCodeToName(game.settings.controls.bDown)); //bump down
      spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, 12 * tilesize), keyCodeToName(game.settings.controls.quickDrop)); //quick drop
      spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, 13 * tilesize), keyCodeToName(game.settings.controls.rotate)); //rotate
      spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, 14 * tilesize), keyCodeToName(game.settings.controls.rotateCC)); //rotate cc
      spritefont.drawTextCentered(ctx, new vec2(width * 3 / 4, 15 * tilesize), keyCodeToName(game.settings.controls.pauseSelect)); //pause select
    }
  }, {
    key: "typeName",
    value: function typeName(event) {}
  }, {
    key: "selectedButton",
    get: function get() {
      this.selectedItem = this.selectedItem % this.buttons.length;
      if (this.selectedItem < 0) this.selectedItem += this.buttons.length;
      return this.buttons[this.selectedItem];
    }
  }], [{
    key: "screen_mainMenu",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_mainMenu(context);
      };
      r.buttons = [new button("start game").setAction(function () {
        startGame();
      }), new button("tutorial").setAction(function () {
        startTutorial();
      }), new button("options").setAction(function () {
        game.switchMode(gameController.mode_options);
      }), new button("scoreboard").setAction(function () {
        resetGame();game.switchMode(gameController.mode_scoreBoard);
      }), new button("credits").setAction(function () {
        game.switchMode(gameController.mode_credits);
      })];
      return r.arrangeButtons();
    }
  }, {
    key: "screen_options",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_options(context);
      };
      var animButton = new button("animation speed:" + game.settingsText_animStepRate(), new vec2(22 * 18 + 8, 40));
      var sfxButton = new button("sound effects:" + game.settings.sfxEnabled.toString());
      var musicButton = new button("music:" + game.settings.musicEnabled.toString());
      r.buttons = [musicButton.setAction(function () {
        game.settingsChange_musicEnabled();musicButton.text = "music:" + game.settings.musicEnabled.toString();game.saveSettings();
      }), sfxButton.setAction(function () {
        game.settingsChange_sfxEnabled();sfxButton.text = "sound effects:" + game.settings.sfxEnabled.toString();game.saveSettings();
      }), animButton.setAction(function () {
        game.settingsChange_animStepRate();animButton.text = "animation speed:" + game.settingsText_animStepRate();game.saveSettings();
      }), new button("edit key bindings").setAction(function () {
        game.switchMode(gameController.mode_keybinding);
      }), new button("main menu").setAction(function () {
        game.switchMode(gameController.mode_mainMenu);game.saveSettings();
      })];
      return r.arrangeButtons();
    }
  }, {
    key: "screen_paused",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_paused(context);
      };
      r.buttons = [new button("resume").setAction(function () {
        game.switchMode(game.lastMode);
      }), new button("quit").setAction(function () {
        resetGame();game.switchMode(gameController.mode_mainMenu);game.stopMusic();game.loadSettings();
      })];
      return r.arrangeButtons();
    }
  }, {
    key: "screen_scoreBoard",
    get: function get() {
      var r = new menuScreen();
      scoreboard.scores = scoreboard.retrieveData();
      r.scoreFocus = scoreboard.highScorePlace(score);
      r.drawAux = function () {
        r.draw_scoreBoard(context);
      };
      r.buttons = [new button("start game").setAction(function () {
        startGame();
      }), new button("main menu").setAction(function () {
        resetGame();game.switchMode(gameController.mode_mainMenu);
      })];
      return r.arrangeButtons(new vec2(width / 2, height - 100));
    }
  }, {
    key: "screen_controlsMenu",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_controlsMenu(context);
      };
      r.buttons = [new button("back").setAction(function () {
        game.switchMode(gameController.mode_options);
      }), new button("main menu").setAction(function () {
        resetGame();game.switchMode(gameController.mode_mainMenu);
      })];
      return r.arrangeButtons(new vec2(width / 2, height - 100));
    }
  }, {
    key: "screen_tutorial",
    get: function get() {
      var r = new menuScreen();
      r.tutScreen = menuScreen.screen_tutorial_1;
      r.drawAux = function () {
        r.draw_tutorialMenu(context);
      };
      var nextButton = new button("next");
      r.buttons = [nextButton.setAction(function () {
        r.tutScreen = menuScreen.screen_tutorial_2;
        nextButton.setAction(function () {
          r.tutScreen = menuScreen.screen_tutorial_3;
          nextButton.setAction(function () {
            r.tutScreen = menuScreen.screen_tutorial_4;
            nextButton.setAction(function () {
              r.tutScreen = menuScreen.screen_tutorial_5;
              nextButton.setAction(function () {
                r.tutScreen = menuScreen.screen_tutorial_6;
                nextButton.setAction(function () {
                  r.tutScreen = menuScreen.screen_tutorial_7;
                  nextButton.setAction(function () {
                    r.tutScreen = menuScreen.screen_tutorial_8;
                    nextButton.setAction(function () {
                      r.tutScreen = menuScreen.screen_tutorial_9;
                      nextButton.setAction(function () {
                        r.tutScreen = menuScreen.screen_tutorial_10;r.buttons.splice(0, 1);r.arrangeButtons(new vec2(width / 2, height - 100));
                      });
                    });
                  });
                });
              });
            });
          });
        });
      }), //r.buttons.splice(0, 1); r.arrangeButtons(new vec2(width / 2, height - 100));
      new button("main menu").setAction(function () {
        resetGame();game.switchMode(gameController.mode_mainMenu);
      })];
      return r.arrangeButtons(new vec2(width / 2, height - 100));
    }
  }, {
    key: "screen_tutorial_1",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_tutorial_1(context);
      };
      return r;
    }
  }, {
    key: "screen_tutorial_2",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_tutorial_2(context);
      };
      return r;
    }
  }, {
    key: "screen_tutorial_3",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_tutorial_3(context);
      };
      return r;
    }
  }, {
    key: "screen_tutorial_4",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_tutorial_4(context);
      };
      return r;
    }
  }, {
    key: "screen_tutorial_5",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_tutorial_5(context);
      };
      return r;
    }
  }, {
    key: "screen_tutorial_6",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_tutorial_6(context);
      };
      return r;
    }
  }, {
    key: "screen_tutorial_7",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_tutorial_7(context);
      };
      return r;
    }
  }, {
    key: "screen_tutorial_8",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_tutorial_8(context);
      };
      return r;
    }
  }, {
    key: "screen_tutorial_9",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_tutorial_9(context);
      };
      return r;
    }
  }, {
    key: "screen_tutorial_10",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_tutorial_10(context);
      };
      return r;
    }
  }, {
    key: "screen_gameover",
    get: function get() {
      var r = new menuScreen();
      if (scoreboard.testHighScore(score)) if (game.settings.savingEnabled) return menuScreen.screen_nameEntry;

      r.drawAux = function () {
        r.draw_gameover(context);
      };
      r.buttons = [new button("restart").setAction(function () {
        startGame();
      }), new button("main menu").setAction(function () {
        resetGame();game.switchMode(gameController.mode_mainMenu);
      })];
      return r.arrangeButtons(new vec2(width / 2, height - 100));
    }
  }, {
    key: "screen_nameEntry",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_nameEntry(context);
      };
      r.name = "";
      addEventListener('keydown', typeName);
      return r;
    }
  }, {
    key: "screen_credits",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_credits(context);
      };
      r.buttons = [new button("technonugget").setPos(new vec2(width / 2, 6 * tilesize + 20)).setAction(function () {
        window.open("https://technostalgic.itch.io");
      }), new button("surt").setPos(new vec2(width / 2, 9 * tilesize + 20)).setAction(function () {
        window.open("http://opengameart.org/users/surt");
      }), new button("j robot").setPos(new vec2(width / 2, 10 * tilesize + 20)).setAction(function () {
        window.open("http://opengameart.org/users/j-robot");
      }), new button("gega").setPos(new vec2(width / 2, 13 * tilesize + 20)).setAction(function () {
        window.open("http://opengameart.org/users/gega");
      }), new button("subspaceaudio").setPos(new vec2(width / 2, 14 * tilesize + 20)).setAction(function () {
        window.open("http://opengameart.org/users/subspaceaudio");
      }), new button("ogrebane").setPos(new vec2(width / 2, 15 * tilesize + 20)).setAction(function () {
        window.open("http://opengameart.org/users/ogrebane");
      }), new button("main menu").setPos(new vec2(width / 2, height - 100)).setAction(function () {
        game.switchMode(gameController.mode_mainMenu);
      })];
      return r;
    }
  }, {
    key: "screen_saveError",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_saveError(context);
      };
      r.buttons = [new button("continue").setAction(function () {
        game.settings.savingEnabled = false;game.switchMode(gameController.mode_mainMenu);
      })];
      return r.arrangeButtons(new vec2(width / 2, height - 100));
    }
  }, {
    key: "screen_keybinding",
    get: function get() {
      var r = new menuScreen();
      r.drawAux = function () {
        r.draw_keybinding(context);
      };
      r.buttons = [new button("move up").setPos(new vec2(width / 4, 5 * tilesize + 20)).setAction(function () {
        setControl(0);
      }), new button("move down").setPos(new vec2(width / 4, 6 * tilesize + 20)).setAction(function () {
        setControl(1);
      }), new button("move left").setPos(new vec2(width / 4, 7 * tilesize + 20)).setAction(function () {
        setControl(2);
      }), new button("move right").setPos(new vec2(width / 4, 8 * tilesize + 20)).setAction(function () {
        setControl(3);
      }), new button("bump left").setPos(new vec2(width / 4, 9 * tilesize + 20)).setAction(function () {
        setControl(4);
      }), new button("bump right").setPos(new vec2(width / 4, 10 * tilesize + 20)).setAction(function () {
        setControl(5);
      }), new button("bump down").setPos(new vec2(width / 4, 11 * tilesize + 20)).setAction(function () {
        setControl(6);
      }), new button("quick drop").setPos(new vec2(width / 4, 12 * tilesize + 20)).setAction(function () {
        setControl(7);
      }), new button("rotate").setPos(new vec2(width / 4, 13 * tilesize + 20)).setAction(function () {
        setControl(8);
      }), new button("rotate cc").setPos(new vec2(width / 4, 14 * tilesize + 20)).setAction(function () {
        setControl(9);
      }), new button("pause select").setPos(new vec2(width / 4, 15 * tilesize + 20)).setAction(function () {
        setControl(10);
      }), new button("defaults").setPos(new vec2(width / 2, height - 120)).setAction(function () {
        game.setDefaultKeybindings();
      }), new button("main menu").setPos(new vec2(width / 2, height - 80)).setAction(function () {
        game.switchMode(gameController.mode_mainMenu);game.saveKeybindings();
      })];
      return r;
    }
  }]);

  return menuScreen;
}();

var button = function () {
  function button() {
    var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "button";
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new vec2(text.length * 18 + 8, 40);

    _classCallCheck(this, button);

    this.pos = new vec2();
    this.size = size;
    this.text = text;
  }

  _createClass(button, [{
    key: "select",
    value: function select() {}
  }, {
    key: "setPos",
    value: function setPos(pos) {
      this.pos = pos;
      return this;
    }
  }, {
    key: "setAction",
    value: function setAction(func) {
      this.select = func;
      return this;
    }
  }, {
    key: "containsPoint",
    value: function containsPoint(point) {
      var tl = this.pos.add(this.size.multiply(-0.5));
      var br = tl.add(this.size);
      return point.x >= tl.x && point.x <= br.x && point.y >= tl.y && point.y <= br.y;
    }
  }, {
    key: "draw",
    value: function draw(ctx, font) {
      font.drawTextCentered(ctx, this.pos.add(new vec2(0, this.size.y / -2)), this.text);
    }
  }]);

  return button;
}();

var font = function () {
  function font(fontsheet, charwidth, charheigth) {
    var spacing = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : charwidth;

    _classCallCheck(this, font);

    this.imgdata = fontsheet;
    this.w = charwidth;
    this.dw = spacing;
    this.h = charheigth;
  }

  _createClass(font, [{
    key: "charSprites",
    value: function charSprites(text) {
      var r = [];
      for (var i in text) {
        if (text.charCodeAt(i) < 128) r.push(this.charSprite(text.charCodeAt(i)));
      }
      return r;
    }
  }, {
    key: "charSprite",
    value: function charSprite(charbyte) {
      if (charbyte >= 48 && charbyte < 58) return new vec2(this.w * (charbyte - 48), 0);else if (charbyte >= 65 && charbyte < 91) {
        var byte = charbyte - 65;
        if (byte < 13) return new vec2(this.w * byte, this.h);
        return new vec2(this.w * (byte - 13), this.h * 2);
      } else if (charbyte >= 97 && charbyte < 123) {
        var byte = charbyte - 97;
        if (byte < 13) return new vec2(this.w * byte, this.h);
        return new vec2(this.w * (byte - 13), this.h * 2);
      } else if (charbyte == 58) return new vec2(this.w * 11, 0);

      return new vec2(this.w * 12, 0);
    }
  }, {
    key: "drawText",
    value: function drawText(ctx, pos, text) {
      var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      var csp = this.charSprites(text);
      for (var i in csp) {
        var spos = pos.add(new vec2(i * this.dw * size, 0));
        ctx.drawImage(this.imgdata, csp[i].x, csp[i].y, this.w, this.h, spos.x, spos.y, this.w * size, this.h * size);
      }
    }
  }, {
    key: "drawTextCentered",
    value: function drawTextCentered(ctx, pos, text) {
      var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      pos = pos.add(new vec2(this.dw * size * text.length * -.5, 0));
      this.drawText(ctx, pos, text, size);
    }
  }], [{
    key: "loadGameFont",
    value: function loadGameFont() {
      var img = new Image();
      img.src = "BlockFont.png";
      return new font(img, 18, 32);
    }
  }, {
    key: "loadSmallFont",
    value: function loadSmallFont() {
      var compressed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      var img = new Image();
      img.src = "font.png";
      return new font(img, 12, 8, compressed ? 8 : 10);
    }
  }]);

  return font;
}();

var hud = function () {
  function hud() {
    _classCallCheck(this, hud);
  }

  _createClass(hud, [{
    key: "drawBorder",
    value: function drawBorder(ctx) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";

      //draw shadow:
      var shadowsize = new vec2(4, 2);
      var pos = new vec2(0, 0).toCoordPos();
      var size = boardsize.toExpandedPos();
      ctx.fillRect(pos.x, pos.y, size.x, shadowsize.y);
      ctx.fillRect(pos.x + size.x - shadowsize.x, pos.y + shadowsize.y, shadowsize.x, size.y - shadowsize.y);

      //draw border:
      for (var x = -1; x < width / tilesize; x++) {
        var pos = new vec2(x, -1).toCoordPos();
        ctx.drawImage(graphics.tile_front, pos.x, pos.y);
      }
      ctx.fillRect(0, boardsize.toExpandedPos().y + boardTop, width, height); //bottom border
      for (var x = -1; x < width / tilesize; x++) {
        var pos = new vec2(x, boardsize.y).toCoordPos();
        ctx.drawImage(graphics.tile_front, pos.x, pos.y);
      }
      for (var y = 0; y < height / tilesize; y++) {
        var pos = new vec2(-1, y).toCoordPos();
        ctx.drawImage(graphics.tile_front, pos.x, pos.y);
      }
      for (var x = boardsize.x; x < width / tilesize; x++) {
        for (var y = 0; y < boardsize.y; y++) {
          var pos = new vec2(x, y).toCoordPos();
          ctx.drawImage(graphics.tile_front, pos.x, pos.y);
        }
      } //draw slot for next piece
      for (var x = boardsize.x + 1; x < width / tilesize - 2; x++) {
        for (var y = 1; y <= 2; y++) {
          var pos = new vec2(x, y).toCoordPos();
          ctx.drawImage(graphics.tile, pos.x, pos.y);
        }
      }this.drawNextPiece(ctx); //I wonder what this could be
      //draw slot shadow
      var pos = new vec2(boardsize.x + 1, 1).toCoordPos();
      var size = new vec2(4, 2).toExpandedPos();
      ctx.fillRect(pos.x, pos.y, size.x, shadowsize.y);
      ctx.fillRect(pos.x + size.x - shadowsize.x, pos.y + shadowsize.y, shadowsize.x, size.y - shadowsize.y);
    }
  }, {
    key: "drawNextPiece",
    value: function drawNextPiece(ctx) {
      if (nextpiece) nextpiece.drawCentered(ctx, new vec2(boardsize.x + 3, 2).toCoordPos(), false);
    }
  }, {
    key: "drawText",
    value: function drawText(ctx) {
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 0).toCoordPos(), "Next:");
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 4).toCoordPos(), "Time til:");
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 5).toCoordPos(), "Ball:" + curlvl.tilBall);
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 6).toCoordPos(), "Bonus:" + curlvl.tilBonus);
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 7).toCoordPos(), "Bomb:" + curlvl.tilBomb);
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 9).toCoordPos(), "Momentum:");
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, 10).toCoordPos(), balls.length <= 0 ? "none" : (balls[0].speed * 4).toString());
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 7).toCoordPos(), "Level " + curlvl.num);
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 6).toCoordPos(), "Pieces:" + curlvl.pieces);
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 4).toCoordPos(), "Score:");
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 3).toCoordPos(), score.toString());
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 2).toCoordPos(), "High:");
      spritefont.drawTextCentered(ctx, new vec2(boardsize.x + 3, boardsize.y - 1).toCoordPos(), scoreboard.scores[0].points.toString());
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      this.drawBorder(ctx);
      this.drawText(ctx);
    }
  }]);

  return hud;
}();

var arrow = function () {
  function arrow(dir) {
    _classCallCheck(this, arrow);

    this.dir = dir;
  }

  _createClass(arrow, [{
    key: "getSprt",
    value: function getSprt() {
      if (this.dir.equals(vec2.left)) return new vec2(0, 0);else if (this.dir.equals(vec2.right)) return new vec2(16, 0);else if (this.dir.equals(vec2.up)) return new vec2(32, 0);else return new vec2(48, 0);
    }
  }, {
    key: "draw",
    value: function draw(ctx, pos) {
      var blink = lastTime % 500 < 250;
      var sprt = this.getSprt();
      pos = pos.rounded();
      ctx.drawImage(graphics.arrows, sprt.x, sprt.y + blink ? 16 : 0, 16, 16, pos.x - 8, pos.y - 8, 16, 16);
    }
  }]);

  return arrow;
}();

var scoreboard = function () {
  function scoreboard() {
    _classCallCheck(this, scoreboard);
  }

  _createClass(scoreboard, null, [{
    key: "load",
    value: function load() {
      scoreboard.scores = scoreboard.retrieveData();
    }
  }, {
    key: "testHighScore",
    value: function testHighScore(points) {
      for (var i in scoreboard.scores) {
        var score = scoreboard.scores[i];
        if (points >= score.points) return true;
      }
      return false;
    }
  }, {
    key: "highScorePlace",
    value: function highScorePlace(points) {
      for (var i in scoreboard.scores) {
        var score = scoreboard.scores[i];
        if (points >= score.points) return i;
      }
      return null;
    }
  }, {
    key: "addScore",
    value: function addScore(newscore) {
      for (var i = 0; i < scoreboard.scores.length; i++) {
        var score = scoreboard.scores[i];
        if (newscore.points >= score.points) {
          scoreboard.scores.splice(i, 0, newscore);
          scoreboard.scores.pop();
          scoreboard.setData();
          return;
        }
      }
    }
  }, {
    key: "setData",
    value: function setData() {
      if (!game.settings.savingEnabled) return;
      try {
        var str = "";
        for (var i in scoreboard.scores) {
          var score = scoreboard.scores[i];
          str += score.name + "&" + score.points.toString() + "|";
        }
        str = str.substr(0, str.length - 1);
        localStorage.setItem("sdev_tubetris_scoreboard", str);
      } catch (err) {
        game.warnStorageDisabled();
      }
    }
  }, {
    key: "retrieveData",
    value: function retrieveData() {
      if (!game.settings.savingEnabled) return scoreboard.defaultScores();
      try {
        var strdata = localStorage.getItem("sdev_tubetris_scoreboard");
        if (!strdata) {
          return scoreboard.defaultScores();
        }
        strdata = strdata.split('|');
        if (strdata.length < 5) return scoreboard.defaultScores();
        var r = [];
        for (var i in strdata) {
          var strscore = strdata[i].split('&');
          r.push({ name: strscore[0], points: Number.parseInt(strscore[1]) });
        }
      } catch (err) {
        game.warnStorageDisabled();
        return scoreboard.defaultScores();
      }
      return r;
    }
  }, {
    key: "defaultScores",
    value: function defaultScores() {
      var r = [{ name: "techno", points: 25000 }, { name: "nugget", points: 20000 }, { name: "soundless", points: 15000 }, { name: "dev", points: 10000 }, { name: "ty4playing", points: 5000 }];
      return r;
    }
  }]);

  return scoreboard;
}();