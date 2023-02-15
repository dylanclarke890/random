import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

/**
 * Simple Mover that visits all its targets in an ordered fashion. You can use
 * the void entities (or any other) as targets.
 *
 * Keys for LevelEditor:
 *
 * - speed:
 * Traveling speed of the mover in pixels per second.
 * Default: 20
 *
 * target.1, target.2 ... target.n
 * Names of the entities to visit.
 */
export class EntityMover extends Entity {
  size = { x: 24, y: 8 };
  maxVel = { x: 100, y: 100 };

  type = Entity.TYPE.NONE;
  checkAgainst = Entity.TYPE.NONE;
  collides = Entity.COLLIDES.FIXED;

  target = null;
  targets = [];
  currentTarget = 0;
  speed = 20;
  gravityFactor = 0;

  constructor(opts) {
    super(opts);
    this.addAnim("idle", 1, [0]);
    this.createAnimationSheet("assets/entities/mover.png", { x: 24, y: 8 });
    // Transform the target object into an ordered array of targets
    this.targets = Object.keys(this.target).sort();
  }

  update() {
    let oldDistance = 0;
    const target = this.game.getEntityByName(this.targets[this.currentTarget]);
    if (target) {
      oldDistance = this.distanceTo(target);
      const angle = this.angleTo(target);
      this.vel.x = Math.cos(angle) * this.speed;
      this.vel.y = Math.sin(angle) * this.speed;
    } else {
      this.vel.x = 0;
      this.vel.y = 0;
    }

    super.update();

    // Are we close to the target or has the distance actually increased? -> Set new target
    const newDistance = this.distanceTo(target);
    if (target && (newDistance > oldDistance || newDistance < 0.5)) {
      this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
      this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
      this.currentTarget++;
      if (this.currentTarget >= this.targets.length && this.targets.length > 1)
        this.currentTarget = 0;
    }
  }
}

Register.entityType(EntityMover);
Register.preloadAsset("assets/entities/mover.png");
