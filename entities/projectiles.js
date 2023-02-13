import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

export class Projectile extends Entity {
  zIndex = -10;
  collides = Entity.COLLIDES.LITE;

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }
}

export class CannonBullet extends Projectile {
  constructor(opts) {
    super(opts);
    this.speed = 10;
    this.damage = 10;
    this.createAnimationSheet("assets/projectiles/Bullet_Cannon.png", { x: 26, y: 52 });
    this.addAnim("Default", 0.3, [0], false);
  }
}

export class MGBullet extends Projectile {
  constructor(opts) {
    super(opts);
    this.speed = 40;
    this.damage = 2.5;
    this.createAnimationSheet("assets/projectiles/Bullet_MG.png", { x: 26, y: 52 });
    this.addAnim("Default", 0.3, [0], false);
  }
}

export class Missile extends Projectile {
  constructor(opts) {
    super(opts);
    this.speed = 10;
    this.damage = 10;
    this.createAnimationSheet("assets/projectiles/Missile.png", { x: 26, y: 52 });
    this.addAnim("Default", 0.3, [0], false);
  }
}

Register.entityType(CannonBullet, MGBullet);
const imgRoot = "assets/projectiles/";
Register.preloadImage(
  `${imgRoot}Bullet_Cannon.png`,
  `${imgRoot}Bullet_MG.png`,
  `${imgRoot}Missile.png`
);
