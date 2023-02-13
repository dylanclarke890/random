import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";
import { EventChain } from "../canvas-game-engine/modules/lib/event-chain.js";
import { toRad } from "../canvas-game-engine/modules/lib/number-utils.js";
import { TowerDefenseGame } from "../game.js";
import { Enemy_Pitchfork, Bullet_Cannon } from "./entities.js";

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

class TurretRange extends Entity {
  r = 100;
  alpha = 0.5;

  constructor(opts) {
    super(opts);
  }

  draw() {
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

class Cannon_Head extends Entity {
  target;
  angleToTarget;
  fireRate = 1;

  static NINETY_DEGREES = toRad(90);

  constructor(opts) {
    super(opts);
    this.size = { x: 32, y: 32 };
    this.createAnimationSheet("assets/turrets/Cannon.png", { x: 35, y: 64 });
    this.addAnim("Default", 1, [0], false);
    this.chain = new EventChain()
      .waitUntil(() => this.target != null)
      .waitUntil(() => this.target == null)
      .whilst(() => {
        this.currentAnim.angle = this.angleToTarget + Cannon_Head.NINETY_DEGREES;
      })
      .every(this.fireRate, () => {
        // Shoot projectile.
        const bullet = this.game.spawnEntity(Bullet_Cannon, this.pos.x, this.pos.y);
        const a = bullet.angleTo(this.target);
        bullet.currentAnim.angle = a + Cannon_Head.NINETY_DEGREES;
        bullet.vel.x = Math.floor(Math.cos(a) * 20);
        bullet.vel.y = Math.floor(Math.sin(a) * 20);
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

export class Cannon extends Entity {
  constructor(opts) {
    super(opts);
    this.size = { x: 64, y: 64 };
    this.base = new TurretBase({ game: this.game });
    this.head = new Cannon_Head({ game: this.game });
    this.range = new TurretRange({ game: this.game });
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
  /** @type {typeof Entity} */
  turretType;
  isValidPosition = true;

  /** @type {number[][]} */
  buildPositions;
  mapWidth;
  mapHeight;

  constructor(opts) {
    super(opts);
    this.buildPositions = this.game.backgroundMaps?.find((map) => map.name === "build_sites")?.data;
    if (this.buildPositions) {
      this.mapHeight = this.buildPositions.length;
      this.mapWidth = this.buildPositions[0].length;
    }
  }

  snapToGrip(val) {
    return TowerDefenseGame.MAP_TILE_SIZE * Math.round(val / TowerDefenseGame.MAP_TILE_SIZE);
  }

  setPosition({ x, y }) {
    if (!this.selected) return;

    // Center the selected turret on the mouse position
    x = x - this.selected.size.x / 2;
    y = y - this.selected.size.y / 2;

    // Snap the selected turret to the grid to grid
    x = this.snapToGrip(x);
    y = this.snapToGrip(y);

    this.selected.pos.x = x;
    this.selected.pos.y = y;

    // Check if the selected turret is in a valid area by comparing its position with the map data's
    x /= TowerDefenseGame.MAP_TILE_SIZE;
    y /= TowerDefenseGame.MAP_TILE_SIZE;
    this.isValidPosition = true;

    // Check if any of the positions of the selected turret are on invalid tiles
    const positions = [
      this.buildPositions[y]?.[x],
      this.buildPositions[y]?.[x + 1],
      this.buildPositions[y + 1]?.[x],
      this.buildPositions[y + 1]?.[x + 1],
    ];
    this.isValidPosition = !positions.some((pos) => pos !== 1);
    if (!this.isValidPosition) return;

    // Check if there are any turrets where the selected turret is about to be placed
    const currentlyPlacedTurrets = this.game.getEntitiesByType(this.turretType);
    for (let i = 0; i < currentlyPlacedTurrets.length; i++) {
      const current = currentlyPlacedTurrets[i];
      if (this.selected.touches(current)) {
        this.isValidPosition = false;
        return;
      }
    }
  }

  setSelected(turretType) {
    this.turretType = turretType;
    this.selected = new turretType({ x: this.pos.x, y: this.pos.y, game: this.game });
    this.selected.setAlpha(0.5);
  }

  draw() {
    if (!this.selected) return;
    this.selected.draw();

    const { ctx } = this.game.system;
    ctx.strokeStyle = this.isValidPosition ? "green" : "red";
    const lineWidth = 2;
    ctx.lineWidth = lineWidth;

    const { x, y } = this.selected.pos;
    const x2 = this.selected.size.x + lineWidth;
    const y2 = this.selected.size.y + lineWidth;
    ctx.strokeRect(x - lineWidth, y - lineWidth, x2, y2);
  }

  update() {
    return; // not needed.
  }
}

Register.entityTypes(Cannon, TurretSelector);
const turretRoot = "assets/turrets/";
Register.preloadImages(`${turretRoot}Cannon.png`, `${turretRoot}Tower.png`);
