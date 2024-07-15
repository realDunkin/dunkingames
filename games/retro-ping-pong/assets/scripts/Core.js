// ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //
"use strict";

var NORD = function NORD() {};

NORD.rendrer = null;
NORD.interaction = null;
NORD.assetsManager = null;
NORD.definitionsManager = null;
NORD.audioManager = null;
NORD.GUIManager = null;
NORD.app = null;
NORD.game = null;

NORD.run = function () {
  NORD.renderer = PIXI.autoDetectRenderer(100, 100, {
    antialias: true,
    transparent: false,
    resolution: 1,
    autoResize: false,
    roundPixels: false,
  });
  document.getElementById("game_container").appendChild(NORD.renderer.view);
  NORD.renderer.backgroundColor = 0x00003a; // NORD.renderer.backgroundColor = 0xCCCCCC;

  NORD.renderer.view.style.position = "absolute";
  NORD.renderer.view.style.top = "0px";
  NORD.renderer.view.style.left = "0px";
  NORD.app = new NORD.App();
  NORD.interaction = new PIXI.interaction.InteractionManager(NORD.renderer);
  NORD.definitionsManager = new NORD.DefinitionsManager();
  NORD.assetsManager = new AssetsManager(new PIXI.Loader());
  NORD.audioManager = new NORD.AudioManager();
  NORD.GUIManager = new NORD.GUI.GUIManager();
  NORD.renderer.render(NORD.GUIManager.rootContainer);
  NORD.app.init();
  NORD.game = new NORD.Game();
  NORD.app.boot();
  requestAnimationFrame(NORD.app.loop);
};

document.addEventListener("DOMContentLoaded", function () {
  String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
  };

  NORD.run();
}); // ======================================================================================================================================== //
// ======================================================================================================================================== //
// ======================================================================================================================================== //

window.onfocus = function () {
  if (NORD.app != null) NORD.app.windowFocusChange(true);
};

window.onblur = function () {
  if (NORD.app != null) NORD.app.windowFocusChange(false);
};

window.addEventListener("beforeunload", function (e) {
  if (NORD.game.field.state.getState().gamePhase == "GAME") {
    NORD.app.apiCallback("statistics", "exit");
  }
});
