import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

class Enemy extends Entity {
  static get_sequence(start) {
    start ??= 0;
    return Array.from({ length: 20 }, (_v, i) => i + start);
  }
  static framesToSecs = (frames) => (1 / 60) * frames;

  vel = { x: 10, y: 0 };

  constructor({ spritesheetName, ...opts }) {
    super(opts);
    this.size = { x: 66, y: 58 };
    this.createAnimationSheet(`assets/spritesheets/${spritesheetName}.png`, this.size);

    const defaultDuration = Enemy.framesToSecs(3);
    this.addAnim("attack", defaultDuration, Enemy.get_sequence(0), false);
    this.addAnim("die", defaultDuration, Enemy.get_sequence(20), false);
    this.addAnim("hurt", defaultDuration, Enemy.get_sequence(40), false);
    this.addAnim("idle", defaultDuration, Enemy.get_sequence(60), false);
    this.addAnim("jump", defaultDuration, Enemy.get_sequence(80), false);
    this.addAnim("run", defaultDuration, Enemy.get_sequence(100), false);
    this.addAnim("walk", defaultDuration, Enemy.get_sequence(120), false);
    this.currentAnim = this.anims.walk;
  }
}

export class Enemy_Pitchfork extends Enemy {
  constructor(opts) {
    super({ spritesheetName: "pitchfork_guy", ...opts });
  }
}

Register.entityTypes(Enemy_Pitchfork);
Register.preloadImages("assets/spritesheets/pitchfork_guy.png");
