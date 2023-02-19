import { GameLoop } from "../canvas-game-engine/modules/core/loop.js";
import { Canvas } from "./canvas.js";
import { KrystalizorHttpClient } from "./http-client.js";
import { System } from "./system.js";
import { Modal, SelectLevelModal } from "./ui.js";

export class Krystalizor {
  constructor() {
    this.system = new System();
    this.canvas = new Canvas(this.system);
    this.game = this.canvas; // for game loop
    this.loop = new GameLoop({ runner: this });
    this.loop.start();
    this.httpClient = new KrystalizorHttpClient();
    this.httpClient.api.browse("../assets/", "images").then((res) => {
      console.log(res);
    });
    this.initModals();
  }

  initModals() {
    const saveBody = "<p>Save Content?</p>";
    const loadBody = "Load Level?";
    new Modal({
      id: "modal-save-as",
      title: "Save As",
      body: saveBody,
      buttonIds: ["level-save-as"],
    });
    new SelectLevelModal(
      {
        id: "modal-load-level",
        title: "Load Level",
        body: loadBody,
        buttonIds: ["level-load"],
        onSelect: (lvl) => this.loadLevel(lvl),
      },
      this.httpClient
    );
  }

  loadLevel(level) {
    if (!level) return;
  }
}
