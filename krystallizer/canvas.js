import { config } from "./config.js";

export class Canvas {
  /**
   * @param {import("./system.js").System} system
   */
  constructor(system) {
    this.system = system;
    this.config = config;
    this.screen = { actual: { x: 0, y: 0 }, rounded: { x: 0, y: 0 } };
    this.mouseLast = { x: 0, y: 0 };
  }

  //#region Events

  scroll(x, y) {
    const scale = this.system.scale;
    const { actual, rounded } = this.screen;
    actual.x -= x;
    actual.y -= y;
    rounded.x = Math.round(actual.x * scale) / scale;
    rounded.y = Math.round(actual.y * scale) / scale;
    for (let i = 0; i < this.layers.length; i++) this.layers[i].setScreenPos(actual.x, actual.y);
  }

  drag() {
    const dx = this.input.mouse.x - this.mouseLast.x,
      dy = this.input.mouse.y - this.mouseLast.y;
    this.scroll(dx, dy);
  }

  //#endregion Events

  clear() {
    const { ctx, height, width } = this.system;
    const clearColor = this.config.colors.clear;
    if (clearColor) {
      ctx.fillStyle = clearColor;
      ctx.fillRect(0, 0, width, height);
    } else ctx.clearRect(0, 0, width, height);
  }

  draw() {
    this.clear();
    this.drawLabels();
  }

  drawLabels() {
    const { ctx, height, width, scale } = this.system;
    const { colors, labels } = this.config;

    ctx.fillStyle = colors.primary;
    const step = labels.step;

    let xlabel = this.screen.actual.x - (this.screen.actual.x % step) - step;
    for (let tx = Math.floor(-this.screen.actual.x % step); tx < width; tx += step) {
      xlabel += step;
      ctx.fillText(xlabel, tx * scale, 10);
    }

    let ylabel = this.screen.actual.y - (this.screen.actual.y % step) - step;
    for (let ty = Math.floor(-this.screen.actual.y % step); ty < height; ty += step) {
      ylabel += step;
      ctx.fillText(ylabel, 0, ty * scale + 10);
    }
  }

  update() {}
}
