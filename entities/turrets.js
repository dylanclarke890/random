import { Entity } from "../krystal-games-engine/modules/core/entity.js";
import { Register } from "../krystal-games-engine/modules/core/register.js";
import { removeItem } from "../krystal-games-engine/modules/lib/utils/array.js";
import { toRad } from "../krystal-games-engine/modules/lib/utils/number.js";
import { EventChain } from "../krystal-games-engine/modules/lib/event-chain.js";
import { ClickableMixin } from "../krystal-games-engine/modules/lib/mixins/clickable.js";
import { mix } from "../krystal-games-engine/modules/lib/mixin.js";

import { Enemy_Pitchfork, CannonBullet, MGBullet, Missile } from "./index.js";
import { TowerDefenseGame } from "../game.js";

const NINETY_DEGREES = toRad(90);

class TurretBase extends Entity {
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

class TurretRange extends Entity {
  constructor(opts) {
    super(opts);
    this.show ??= false;
    this.alpha ??= 0.5;
    this.r ??= 100;
  }

  draw() {
    if (!this.show) return;
    const { ctx } = this.game.system;
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  setPosition(pos) {
    this.pos.x = pos.x + TowerDefenseGame.MAP_TILE_SIZE;
    this.pos.y = pos.y + TowerDefenseGame.MAP_TILE_SIZE;
  }

  getEnemiesInRange() {
    const enemies = this.game.getEntitiesByType(Enemy_Pitchfork);
    const res = [];
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (this.touches(enemy)) res.push(enemy);
    }
    return res;
  }

  touches(other) {
    return !(
      this.pos.x - this.r >= other.pos.x + other.size.x ||
      this.pos.x + this.r <= other.pos.x ||
      this.pos.y - this.r >= other.pos.y + other.size.y ||
      this.pos.y + this.r <= other.pos.y
    );
  }
}

class TurretHead extends Entity {
  constructor(opts) {
    super(opts);
    this.target = null;
    this.angleToTarget = null;
    this.fireRate ??= 1;
    this.size = { x: 32, y: 32 };
    this.chain = new EventChain()
      .waitUntil(() => this.target != null)
      .waitUntil(() => this.target == null)
      .whilst(() => {
        this.currentAnim.angle = this.angleToTarget + NINETY_DEGREES;
      })
      .every(this.fireRate, () => {
        // Shoot projectile.
        const bullet = this.game.spawnEntity(this.bulletType, this.pos.x, this.pos.y);
        const a = bullet.angleTo(this.target);
        bullet.currentAnim.angle = a + NINETY_DEGREES;
        bullet.vel.x = Math.floor(Math.cos(a) * bullet.speed);
        bullet.vel.y = Math.floor(Math.sin(a) * bullet.speed);
        this.turret.onBulletFired(bullet);
        this.game.sortEntitiesDeferred();
      })
      .repeat();
  }

  update() {
    this.chain.update();
    super.update();
  }

  setPosition(pos) {
    this.pos.x = pos.x + TowerDefenseGame.MAP_TILE_SIZE / 2;
    this.pos.y = pos.y;
  }
}

export class Turret extends mix(Entity).with(ClickableMixin) {
  activeBullets = [];

  constructor(opts) {
    super(opts);
    this.size = { x: 64, y: 64 };
    const turretOpts = { game: this.game, settings: { turret: this } };
    this.base = new TurretBase(turretOpts);
    this.range = new TurretRange(turretOpts);
    this.head = new this.turretType(turretOpts);
  }

  draw() {
    this.base.setPosition(this.pos);
    this.head.setPosition(this.pos);
    this.range.setPosition(this.pos);
    this.range.draw();
    this.base.draw();
    this.head.draw();
  }

  update() {
    const inRange = this.range.getEnemiesInRange();
    if (inRange.length) {
      this.head.target = inRange.sort((a, b) => b.currentWaypoint - a.currentWaypoint)[0];
      this.head.angleToTarget = this.angleTo(this.head.target);
    } else this.head.target = null;
    const enemies = this.game.getEntitiesByType(Enemy_Pitchfork);
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      for (let j = 0; j < this.activeBullets.length; j++) {
        const bullet = this.activeBullets[j];
        if (!enemy.touches(bullet)) continue;
        enemy.receiveDamage(bullet.damage);
        bullet.kill();
        removeItem(this.activeBullets, bullet);
      }
    }
    this.base.update();
    this.head.update();
  }

  setAlpha(alpha) {
    this.base.currentAnim.alpha = alpha;
    this.head.currentAnim.alpha = alpha;
  }

  onBulletFired(bullet) {
    this.activeBullets.push(bullet);
  }

  onClick() {
    this.game.enterMode(this.game.MODE.selectTurret);
    if (this.game.selected) this.game.selected.range.show = false;
    this.game.selected = this;
    this.game.selected.range.show = true;
  }
}

class CannonTurretHead extends TurretHead {
  constructor({ settings = {}, ...rest }) {
    super({ ...rest, settings: { ...settings, bulletType: CannonBullet, fireRate: 1 } });
    this.createAnimationSheet("assets/turrets/Cannon.png", { x: 35, y: 64 });
    this.addAnim("Default", 1, [0], false);
  }
}

class MachineGunTurretHead extends TurretHead {
  constructor({ settings = {}, ...rest }) {
    super({ ...rest, settings: { ...settings, bulletType: MGBullet, fireRate: 0.3 } });
    this.createAnimationSheet("assets/turrets/MG.png", { x: 31, y: 64 });
    this.addAnim("Default", 1, [0], false);
  }
}

class RPGTurretHead extends TurretHead {
  constructor({ settings = {}, ...rest }) {
    super({ ...rest, settings: { ...settings, bulletType: Missile, fireRate: 2.5 } });
    this.createAnimationSheet("assets/turrets/Missile_Launcher.png", { x: 39, y: 64 });
    this.addAnim("Default", 1, [0], false);
  }
}

export class Cannon extends Turret {
  constructor({ settings = {}, ...rest }) {
    super({ ...rest, settings: { ...settings, turretType: CannonTurretHead } });
  }
}

export class MachineGun extends Turret {
  constructor({ settings = {}, ...rest }) {
    super({ ...rest, settings: { ...settings, turretType: MachineGunTurretHead } });
  }
}

export class RPG extends Turret {
  constructor({ settings = {}, ...rest }) {
    super({ ...rest, settings: { ...settings, turretType: RPGTurretHead } });
  }
}

Register.entityTypes(Cannon, MachineGun, RPG, Turret);
const turretRoot = "assets/turrets/";
Register.preloadImages(
  `${turretRoot}Cannon.png`,
  `${turretRoot}Tower.png`,
  `${turretRoot}MG.png`,
  `${turretRoot}Missile_Launcher.png`
);
