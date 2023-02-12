import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

class TurretBase extends Entity {
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
    this.base = new TurretBase({ game: this.game }, this.pos);
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

  setAlpha(alpha) {
    this.base.currentAnim.alpha = alpha;
    this.head.currentAnim.alpha = alpha;
  }
}

export class TurretSelector extends Entity {
  /** @type {Entity} */
  selected;

  constructor(opts) {
    super(opts);
  }

  setPosition(pos) {
    if (!this.selected) return;
    this.selected.pos.x = pos.x;
    this.selected.pos.y = pos.y;
  }

  setSelected(turretType) {
    if (this.selected) this.selected.kill();
    this.selected = new turretType({ x: this.pos.x, y: this.pos.y, game: this.game });
    this.selected.setAlpha(0.5);
  }

  draw() {
    if (!this.selected) return;
    this.selected.draw();
    const { ctx } = this.game.system;
    ctx.strokeStyle = "yellow";
    const lineWidth = 2;
    ctx.lineWidth = lineWidth;
    const { x, y } = this.selected.base.pos;
    const x2 = this.selected.base.size.x + lineWidth;
    const y2 = this.selected.base.size.y + lineWidth;
    ctx.strokeRect(x - lineWidth, y - lineWidth, x2, y2);
  }
}

Register.entityTypes(Cannon, TurretSelector);
const turretRoot = "assets/turrets/";
Register.preloadImages(`${turretRoot}Cannon.png`, `${turretRoot}Tower.png`);
