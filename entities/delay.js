import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";
import { Timer } from "../canvas-game-engine/modules/lib/timer.js";

/**
 * This entity passes through all calls to triggeredBy() to its own targets
 * after a delay of n seconds.
 *
 * E.g.: Set an EntityDelay as the target of an EntityTrigger and connect the
 * entities that should be triggered after the delay as targets to the
 * EntityDelay.
 *
 * Keys for LevelEditor:
 *
 * delay
 * Delay in seconds after which the targets should be triggered.
 * default: 1
 *
 * target.1, target.2 ... target.n
 * Names of the entities whose triggeredBy() method will be called after
 * the delay.
 */
export class EntityDelay extends Entity {
  _levelEditorDrawBox = true;
  _levelEditorBoxColor = "rgba(255, 100, 0, 0.7)";

  size = { x: 8, y: 8 };
  delay = 1;
  delayTimer = null;
  triggerEntity = null;

  constructor(opts) {
    super(opts);
    this.delayTimer = new Timer();
  }

  // eslint-disable-next-line no-unused-vars
  triggeredBy(entity, _trigger) {
    this.fire = true;
    this.delayTimer.set(this.delay);
    this.triggerEntity = entity;
  }

  update() {
    if (!this.fire || this.delayTimer.delta() < 0) return;

    this.fire = false;
    for (const t in this.target) {
      const entity = this.game.getEntityByName(this.target[t]);
      if (!entity && typeof entity.triggeredBy !== "function") continue;
      entity.triggeredBy(this.triggerEntity, this);
    }
  }
}

Register.entityType(EntityDelay);