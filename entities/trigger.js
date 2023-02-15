import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";
import { Timer } from "../canvas-game-engine/modules/lib/timer.js";

/**
 * This entity calls the triggeredBy( entity, trigger ) method of each of its
 * targets. #entity# is the entity that triggered this trigger and #trigger#
 * is the trigger entity itself.
 *
 * Keys for LevelEditor:
 * checks:
 * Specifies which type of entity can trigger this trigger. A, B or BOTH
 * Default: A
 *
 * wait:
 * Time in seconds before this trigger can be triggered again. Set to -1
 * to specify "never" - e.g. the trigger can only be triggered once.
 * Default: -1
 *
 * target.1, target.2 ... target.n
 * Names of the entities whose triggeredBy() method will be called.
 */
export class EntityTrigger extends Entity {
  size = { x: 16, y: 16 };

  _levelEditorIsScalable = true;
  _levelEditorDrawBox = true;
  _levelEditorBoxColor = "rgba(196, 255, 0, 0.7)";

  target = null;
  wait = -1;
  waitTimer = null;
  canFire = true;

  type = Entity.TYPE.NONE;
  checkAgainst = Entity.TYPE.A;
  collides = Entity.COLLIDES.NEVER;

  constructor({ settings = {}, ...rest }) {
    if (settings.checks) {
      settings.checkAgainst = Entity.TYPE[settings.checks.toUpperCase()] || Entity.TYPE.A;
      delete settings.check;
    }
    super({ settings, ...rest });
    this.waitTimer = new Timer();
  }

  check(other) {
    if (!this.canFire || this.waitTimer.delta() < 0) return;

    if (typeof this.target === "object") {
      for (const target in this.target) {
        const entity = this.game.getEntityByName(this.target[target]);
        if (!entity && typeof entity.triggeredBy !== "function") continue;
        entity.triggeredBy(other, this);
      }
    }

    if (this.wait === -1) this.canFire = false;
    else this.waitTimer.set(this.wait);
  }

  update() {}
}

Register.entityType(EntityTrigger);