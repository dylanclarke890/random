export class System {
  constructor() {
    this.tick = 0;
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.scale = 1;

    const header = document.querySelector("header");
    const panels = document.querySelector("#panels");

    this.height = window.innerHeight - header.offsetHeight;
    this.width = window.innerWidth - panels.offsetWidth;
    this.canvas.height = this.height;
    this.canvas.width = this.width;
  }
}
