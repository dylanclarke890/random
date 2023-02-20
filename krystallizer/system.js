import { config } from "./config.js";

export class System {
  constructor() {
    this.tick = 0;

    const header = document.querySelector("header");
    const panels = document.querySelector("#panels");
    this.height = window.innerHeight - header.offsetHeight - 1;
    this.width = window.innerWidth - panels.offsetWidth;
    this.canvas = document.querySelector("canvas");

    this.ctx = this.canvas.getContext("2d");
    this.ctx.textBaseline = "top";
    this.ctx.font = config.labels.font;

    this.canvas.height = this.height;
    this.canvas.width = this.width;
    this.scale = 1;
  }
}
