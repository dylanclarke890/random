import { Game } from "./canvas-game-engine/modules/core/game.js";
import { Input } from "./canvas-game-engine/modules/core/input.js";
import { Cannon, TurretSelector } from "./entities/entities.js";
import { baseLevel } from "./levels/baseLevel.js";

export class RandomGame extends Game {
  static MAP_TILE_SIZE = 32;
  /** @type {TurretSelector}  */
  turretSelector;

  constructor(opts) {
    super(opts);
    this.loadLevel(baseLevel);
    this.input.bind(Input.KEY.MOUSE1, "place_cannon");
    this.turretSelector = this.spawnEntity(TurretSelector, this.input.mouse.x, this.input.mouse.x);
    this.turretSelector.setSelected(Cannon);
  }

  draw() {
    super.draw();
  }

  update() {
    this.turretSelector.setPosition(this.input.mouse);
    if (this.turretSelector.isValidPosition && this.input.pressed("place_cannon")) {
      let { x, y } = this.turretSelector.selected.pos;
      this.spawnEntity(Cannon, x, y);
    }
    super.update();
  }
}
