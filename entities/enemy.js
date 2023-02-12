import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

class Enemy extends Entity {
  static get_sequence(start) {
    start ??= 0;
    return Array.from({ length: 20 }, (_v, i) => i + start);
  }
  static threeFrames = 0.03;

  constructor({ spritesheetName, ...opts }) {
    super(opts);
    this.size = { x: 64, y: 64 };
    this.createAnimationSheet(`assets/spritesheets/${spritesheetName}.png`, { x: 64, y: 60 });
    const t = Enemy.threeFrames;
    this.addAnim("attack", t, Enemy.get_sequence(0), false);
    this.addAnim("die", t, Enemy.get_sequence(20), false);
    this.addAnim("hurt", t, Enemy.get_sequence(40), false);
    this.addAnim("idle", t, Enemy.get_sequence(60), false);
    this.addAnim("jump", t, Enemy.get_sequence(80), false);
    this.addAnim("run", t, Enemy.get_sequence(100), false);
    this.addAnim("walk", t, Enemy.get_sequence(120), false);
    this.currentAnim = this.anims.idle;
  }
}

export class Enemy_Pitchfork extends Enemy {
  constructor(opts) {
    super({ spritesheetName: "pitchfork_guy", ...opts });
  }
}

Register.entityTypes(Enemy_Pitchfork);
Register.preloadImages("assets/spritesheets/pitchfork_guy.png");