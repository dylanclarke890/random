import { RandomGame } from "./game.js";
import { GameRunner } from "./canvas-game-engine/modules/core/runner.js";

new GameRunner({
  canvasId: "play-area",
  gameClass: RandomGame,
  fps: 60,
  width: 768,
  height: 640,
  debugMode: false,
  fonts: { standard: "assets/arcade-classic.TTF" },
});
