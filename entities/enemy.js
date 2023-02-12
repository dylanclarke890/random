import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

class Enemy extends Entity {
  static get_sequence(start) {
    start ??= 0;
    return Array.from({ length: 20 }, (_v, i) => i + start);
  }
  static framesToSecs = (frames) => (1 / 60) * frames;

  vel = { x: 10, y: 0 };
  /** @type {number[][]} */
  targetPath;
  currentPoint = 0;

  constructor({ spritesheetName, ...opts }) {
    super(opts);
    this.size = { x: 32, y: 64 };
    this.createAnimationSheet(`assets/spritesheets/${spritesheetName}.png`, { x: 66, y: 58 });

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

  setDestination(path) {
    this.targetPath = [...path];
  }

  update() {
    super.update();
    if (this.targetPath) {
      const [x, y] = this.targetPath[this.currentPoint];
      console.log(x, y);
    }
  }
}

export class Enemy_Pitchfork extends Enemy {
  constructor(opts) {
    super({ spritesheetName: "pitchfork_guy", ...opts });
  }
}

Register.entityTypes(Enemy_Pitchfork);
Register.preloadImages("assets/spritesheets/pitchfork_guy.png");
