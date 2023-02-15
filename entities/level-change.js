import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

/**
 * This entity calls ig.game.loadLevel() when its triggeredBy() method is called -
 * usually through an EntityTrigger entity.
 *
 * Keys for LevelEditor:
 *
 * - level:
 * Name of the level to load. E.g. "LevelTest1" or just "test1" will load the
 * 'LevelTest1' level.
 */
export class EntityLevelChange extends Entity {
  _levelEditorDrawBox = true;
  _levelEditorBoxColor = "rgba(0, 0, 255, 0.7)";

  size = { x: 8, y: 8 };
  level = null;

  triggeredBy() {
    if (this.level) this.game.loadLevelDeferred(this.level);
  }

  update() {}
}

Register.entityType(EntityLevelChange);
