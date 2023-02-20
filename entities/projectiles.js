import { Entity } from "../krystal-games-engine/modules/core/entity.js";
import { Register } from "../krystal-games-engine/modules/core/register.js";

export class Projectile extends Entity {
  zIndex = -10;
  collides = Entity.COLLIDES.LITE;
  size = { x: 32, y: 32 };

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
    this.createAnimationSheet("assets/projectiles/Bullet_Cannon.png", { x: 12, y: 24 });
    this.addAnim("Default", 0.3, [0], false);
  }
}

export class MGBullet extends Projectile {
  constructor(opts) {
    super(opts);
    this.speed = 40;
    this.damage = 2.5;
    this.createAnimationSheet("assets/projectiles/Bullet_MG.png", { x: 20, y: 73 });
    this.addAnim("Default", 0.3, [0], false);
  }
}

export class Missile extends Projectile {
  constructor(opts) {
    super(opts);
    this.speed = 5;
    this.damage = 20;
    this.createAnimationSheet("assets/projectiles/Missile.png", { x: 18, y: 32 });
    this.addAnim("Default", 0.3, [0], false);
  }
}

Register.entityTypes(CannonBullet, MGBullet);
const imgRoot = "assets/projectiles/";
Register.preloadImages(
  `${imgRoot}Bullet_Cannon.png`,
  `${imgRoot}Bullet_MG.png`,
  `${imgRoot}Missile.png`
);
