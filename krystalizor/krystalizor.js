import { GameLoop } from "../canvas-game-engine/modules/core/loop.js";

class System {
  constructor() {
    this.tick = 0;
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    const header = document.querySelector("header");
    const panels = document.querySelector("#panels");
    this.canvas.height = window.innerHeight - header.offsetHeight;
    this.canvas.width = window.innerWidth - panels.offsetWidth;
  }
}

class Canvas {
  constructor(system) {
    this.system = system;
  }

  draw() {
    const ctx = this.system.ctx;
    ctx.fillStyle = "orange";
    ctx.clearRect(0, 0, 200, 200);
    ctx.fillRect(0, 0, 200, 200);
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
