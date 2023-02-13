import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

export class Bullet_Cannon extends Entity {
  speed = 10;

  constructor(opts) {
    super(opts);
    this.createAnimationSheet("assets/projectiles/Bullet_Cannon.png", { x: 26, y: 52 });
    this.addAnim("Default", 0.3, [0], false);
  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }
}

Register.entityType(Bullet_Cannon);
Register.preloadImage("assets/projectiles/Bullet_Cannon.png");
