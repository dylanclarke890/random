import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { map } from "../canvas-game-engine/modules/lib/number-utils.js";
import { Timer } from "../canvas-game-engine/modules/lib/timer.js";

/**
 * Base entity class for particle entities. Subclass your own particles from
 * this class. See the EntityDebrisParticle in debris.js for an example.
 *
 * Particle entities will kill themselfs after #lifetime# seconds. #fadetime#
 * seconds before the #lifetime# ends, they will start to fade out.
 *
 * The velocity of a particle is randomly determined by its initial .vel
 * properties. Its Animation will start at a random frame.
 */
export class EntityParticle extends Entity {
  size = { x: 4, y: 4 };
  offset = { x: 0, y: 0 };
  maxVel = { x: 160, y: 160 };
  minBounceVelocity = 0;

  type = Entity.TYPE.NONE;
  checkAgainst = Entity.TYPE.NONE;
  collides = Entity.COLLIDES.LITE;

  lifetime = 5;
  fadetime = 1;
  bounciness = 0.6;
  friction = { x: 20, y: 0 };

  constructor(opts) {
    super(opts);
    this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
    this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
    this.idleTimer = new Timer();
  }

  randomiseParticle() {
    this.currentAnim.flip.x = Math.random() > 0.5;
    this.currentAnim.flip.y = Math.random() > 0.5;
    this.currentAnim.gotoRandomFrame();
  }

  update() {
    if (this.idleTimer.delta() > this.lifetime) {
      this.kill();
      return;
    }

    const lt = this.lifetime;
    this.currentAnim.alpha = map(this.idleTimer.delta(), lt - this.fadetime, lt, 1, 0);
    super.update();
  }
}
