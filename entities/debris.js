import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Timer } from "../canvas-game-engine/modules/lib/timer.js";
import { EntityParticle } from "./particle.js";

/**
 * The EntityDebris will randomly spawn a certain count of EntityDebrisParticle
 * entities for a certain duration.
 *
 * The spawn position of the EntityDebrisParticle is inside the area occupied
 * by the EntityDebris entity. I.e. make the EntityDebris larger in Weltmeister
 * to increase the area in which particles will spawn.
 *
 * Keys for LevelEditor:
 *
 * duration
 * Duration in seconds over which to spawn EntityDebrisParticle entities.
 * Default: 5
 * count
 * Total count of particles to spawn during the #duration# time span.
 * Default: 5
 */
export class EntityDebris extends Entity {
  _levelEditorIsScalable = true;
  _levelEditorDrawBox = true;
  _levelEditorBoxColor = "rgba(255, 170, 66, 0.7)";

  size = { x: 8, y: 8 };
  duration = 5;
  count = 5;

  durationTimer = null;
  nextEmit = null;

  constructor(opts) {
    super(opts);
    this.durationTimer = new Timer();
    this.nextEmit = new Timer();
  }

  // eslint-disable-next-line no-unused-vars
  triggeredBy(entity, trigger) {
    this.durationTimer.set(this.duration);
    this.nextEmit.set(0);
  }

  update() {
    if (this.durationTimer.delta() < 0 && this.nextEmit.delta() >= 0) {
      this.nextEmit.set(this.duration / this.count);

      var x = Math.random().map(0, 1, this.pos.x, this.pos.x + this.size.x);
      var y = Math.random().map(0, 1, this.pos.y, this.pos.y + this.size.y);
      this.game.spawnEntity(EntityDebrisParticle, x, y);
    }
  }
}

/**
 * The particles to spawn by the EntityDebris. See particle.js for more details.
 */
export class EntityDebrisParticle extends EntityParticle {
  lifetime = 2;
  fadetime = 1;
  bounciness = 0.6;
  vel = { x: 60, y: 20 };

  constructor(opts) {
    super(opts);
    this.createAnimationSheet("media/debris.png", { x: 4, y: 4 }); // TODO - add media
    this.addAnim("idle", 5, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    this.randomiseParticle();
  }
}
