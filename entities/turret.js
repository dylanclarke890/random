import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

class TowerBase extends Entity {
  constructor(opts) {
    super(opts);
    this.size = { x: 48, y: 48 };
    this.createAnimationSheet("assets/turrets/Tower.png", this.size);
  }
}

class BaseTurret extends Entity {
  constructor(opts) {
    super(opts);
    this.size = { x: 48, y: 48 };
    this.towerBase = new TowerBase(opts);
  }

  draw() {
    super.draw();
    this.towerBase.draw();
  }
}

export class Cannon_1 extends BaseTurret {
  constructor(opts) {
    super(opts);
    this.createAnimationSheet("assets/turrets/Cannon.png", this.size);
  }

  draw() {
    super.draw();
  }

  update() {
    super.update();
  }
}

Register.entityTypes(TowerBase, Cannon_1);
const turretRoot = "assets/turrets/";
Register.preloadImages(`${turretRoot}Cannon.png`, `${turretRoot}Tower.png`);
