import { GameLoop } from "../canvas-game-engine/modules/core/loop.js";
import { System } from "./system.js";

class Canvas {
  /**
   * @param {System} system
   */
  constructor(system) {
    this.system = system;
  }

  draw() {
    const { ctx, height, width } = this.system;
    ctx.clearRect(0, 0, width, height);
    this.drawLabels();
  }

  drawLabels(step) {
    const { ctx, height, width, scale } = this.system;
    ctx.fillStyle = this.config.colors.primary;
    let xlabel = this.screen.actual.x - (this.screen.actual.x % step) - step;
    for (let tx = Math.floor(-this.screen.actual.x % step); tx < width; tx += step) {
      xlabel += step;
      ctx.fillText(xlabel, tx * scale, 0);
    }

    let ylabel = this.screen.actual.y - (this.screen.actual.y % step) - step;
    for (let ty = Math.floor(-this.screen.actual.y % step); ty < height; ty += step) {
      ylabel += step;
      ctx.fillText(ylabel, 0, ty * scale);
    }
  }

  update() {}
}

export class Krystalizor {
  constructor() {
    this.system = new System();
    this.canvas = new Canvas(this.system);
    this.game = this.canvas; // for game loop
    this.loop = new GameLoop({ runner: this });
    this.loop.start();
  }
}
