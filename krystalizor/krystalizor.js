import { GameLoop } from "../canvas-game-engine/modules/core/loop.js";
import { Canvas } from "./canvas.js";
import { System } from "./system.js";
import { Modal } from "./ui.js";

export class Krystalizor {
  constructor() {
    this.system = new System();
    this.canvas = new Canvas(this.system);
    this.game = this.canvas; // for game loop
    this.loop = new GameLoop({ runner: this });
    this.loop.start();
    this.initDialogs();
  }

  initDialogs() {
    new Modal({ id: "modal-save-as", body: "Save As", buttonIds: ["level-save-as"] });
    new Modal({ id: "modal-load-level", title: "Load", buttonIds: ["level-load"] });
  }
}
