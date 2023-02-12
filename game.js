import { Game } from "./canvas-game-engine/modules/core/game.js";
import { Cannon } from "./entities/turret.js";
import { baseLevel } from "./levels/baseLevel.js";

export class RandomGame extends Game {
  constructor(opts) {
    super(opts);
    this.loadLevel(baseLevel);
  }
}
