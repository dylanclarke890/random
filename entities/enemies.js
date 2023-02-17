import { Register } from "../canvas-game-engine/modules/core/register.js";
import { EntityMover } from "../canvas-game-engine/modules/lib/entities/mover.js";

export class Enemy extends EntityMover {
  maxHealth = 20;
  health = this.maxHealth;
  offset = { x: 32, y: 32 };

  constructor({ spritesheetName, ...opts }) {
    super(opts);
    this.size = { x: 16, y: 16 };
    this.speed = 100;
    this.createAnimationSheet(`assets/spritesheets/${spritesheetName}.png`, { x: 66, y: 58 });

    const threeFrames = (1 / 60) * 3;
    this.addAnim("attack", threeFrames, "[0..19]", false);
    this.addAnim("die", threeFrames, "[20..39]", false);
    this.addAnim("hurt", threeFrames, "[40..59]", false);
    this.addAnim("idle", threeFrames, "[60..79]", false);
    this.addAnim("jump", threeFrames, "[80..99]", false);
    this.addAnim("run", threeFrames, "[100..119]", false);
    this.addAnim("walk", threeFrames, "[120..139]", false);
    this.currentAnim = this.anims.walk;
  }

  draw() {
    if (this.vel.x > 0) this.currentAnim.flip.x = false;
    else if (this.vel.x < 0) this.currentAnim.flip.x = true;
    super.draw();
    this.drawHealthBar();
  }

  drawHealthBar() {
    const { ctx } = this.game.system;
    const w = 32,
      h = 5,
      xOffset = -25,
      yOffset = -20;
    ctx.fillStyle = "red";
    ctx.fillRect(this.pos.x + xOffset, this.pos.y + yOffset, w, h);
    ctx.fillStyle = "green";
    ctx.fillRect(this.pos.x + xOffset, this.pos.y + yOffset, w * (this.health / this.maxHealth), h);
  }
}

export class Enemy_Pitchfork extends Enemy {
  constructor(opts) {
    super({ spritesheetName: "pitchfork_guy", ...opts });
  }
}

Register.entityTypes(Enemy_Pitchfork);
Register.preloadImages("assets/spritesheets/pitchfork_guy.png");
