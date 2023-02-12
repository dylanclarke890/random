import { TowerDefenseGame } from "./game.js";
import { GameRunner } from "./canvas-game-engine/modules/core/runner.js";

new GameRunner({
  canvasId: "play-area",
  gameClass: TowerDefenseGame,
  fps: 60,
  width: 768,
  height: 640,
  debugMode: true,
  fonts: { standard: "assets/arcade-classic.TTF" },
});
