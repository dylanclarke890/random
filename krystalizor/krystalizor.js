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

    this.httpClient.api.browse("../assets/", "images").then((imgPaths) => {
      const totalToLoad = imgPaths.length;
      let loaded = 0;
      for (let i = 0; i < imgPaths.length; i++) {
        const path = imgPaths[i];
        this.httpClient.api.file(path, { parseResponse: false }).then((data) => {
          const img = new Image();
          const handle = () => {
            if (++loaded === totalToLoad) this.initModals();
          };
          img.addEventListener("load", handle);
          img.addEventListener("error", handle);
          img.src = data;
        });
      }
    });
  }

  initModals() {
    new Modal({
      id: "modal-save-as",
      title: "Save As",
      body: "<p>Save As?</p> <input />",
      buttonIds: ["level-save-as"],
    });
    new SelectLevelModal(
      {
        id: "modal-load-level",
        title: "Load Level",
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
