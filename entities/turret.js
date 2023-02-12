import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

class TowerBase extends Entity {
  _levelEditorIgnore = true;
  constructor(opts) {
    super(opts);
    this.size = { x: 64, y: 64 };
    this.createAnimationSheet("assets/turrets/Tower.png", this.size);
    this.addAnim("Constant", 1, [0], false);
  }

  setPosition(pos) {
    this.pos.x = pos.x;
    this.pos.y = pos.y;
  }
}

class Cannon_Head extends Entity {
  constructor(opts) {
    super(opts);
    this.size = { x: 35, y: 64 };
    this.createAnimationSheet("assets/turrets/Cannon.png", this.size);
    this.addAnim("Default", 1, [0], false);
  }

  setPosition(pos) {
    this.pos.x = pos.x + 16;
    this.pos.y = pos.y - 16;
  }
}

export class Cannon extends Entity {
  constructor(opts) {
    super(opts);
    this.size = { x: 64, y: 64 };
    this.base = new TowerBase({ game: this.game }, this.pos);
    this.head = new Cannon_Head({ game: this.game }, this.pos);
  }

  draw() {
    this.base.setPosition(this.pos);
    this.head.setPosition(this.pos);
    this.base.draw();
    this.head.draw();
  }

  update() {
    this.base.update();
    this.head.update();
  }
}

Register.entityTypes(Cannon);
const turretRoot = "assets/turrets/";
Register.preloadImages(`${turretRoot}Cannon.png`, `${turretRoot}Tower.png`);
