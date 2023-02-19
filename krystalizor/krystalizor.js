import { GameLoop } from "../canvas-game-engine/modules/core/loop.js";
import { Canvas } from "./canvas.js";
import { System } from "./system.js";

export class Krystalizor {
  constructor() {
    this.system = new System();
    this.canvas = new Canvas(this.system);
    this.game = this.canvas; // for game loop
    this.loop = new GameLoop({ runner: this });
    this.loop.start();
  }
}
