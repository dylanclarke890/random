import { GameLoop } from "../canvas-game-engine/modules/core/loop.js";

export class Krystalizor {
  constructor() {
    this.loop = new GameLoop({ runner: this });
  }

  update() {}
  draw() {}
}
