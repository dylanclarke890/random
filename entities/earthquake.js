import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";
import { Timer } from "../canvas-game-engine/modules/lib/timer.js";

/**
 * This entity shakes the screen when its triggeredBy() method is called - usually
 * through an EntityTrigger entity.
 *
 * Keys for LevelEditor:
 * - strength:
 * max amount of screen movement in pixels
 * default: 8
 * - duration:
 * duration of the screen shaking in seconds
 * default: 1
 */
export class Earthquake extends Entity {
  _levelEditorDrawBox = true;
  _levelEditorBoxColor = "rgba(80, 130, 170, 0.7)";

  size = { x: 8, y: 8 };

  duration = 1;
  strength = 8;
  quakeTimer = null;

  constructor(opts) {
    super(opts);
    this.quakeTimer = new Timer();
  }

  triggeredBy() {
    this.quakeTimer.set(this.duration);
  }

  update() {
    const delta = this.quakeTimer.delta();
    if (delta >= -0.1) return;

    const s = this.strength * Math.pow(-delta / this.duration, 2);
    if (s <= 0.5) return;

    this.game.screen.x += Math.random().map(0, 1, -s, s);
    this.game.screen.y += Math.random().map(0, 1, -s, s);
  }
}

Register.entityType(Earthquake);