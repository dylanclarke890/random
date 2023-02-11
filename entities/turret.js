import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

class TowerBase extends Entity {
  constructor(opts) {
    super(opts);
    this.createAnimationSheet("assets/turrets/Tower.png");
  }
}

class BaseTurret extends Entity {
  constructor(opts) {
    super(opts);
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
    this.createAnimationSheet("assets/turrets/Cannon.png");
  }

  draw() {
    super.draw();
  }

  update() {
    super.update();
  }
}

Register.entityTypes(TowerBase, Cannon_1);
