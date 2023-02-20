import { GameLoop } from "../krystal-games-engine/modules/core/loop.js";
import { Canvas } from "./canvas.js";
import { config } from "./config.js";
import { KrystallizerHttpClient } from "./http-client.js";
import { System } from "./system.js";
import { Modal, SelectLevelModal } from "./ui.js";

export class Krystallizer {
  constructor() {
    this.system = new System();
    this.canvas = new Canvas(this.system);
    this.game = this.canvas; // for game loop
    this.loop = new GameLoop({ runner: this });
    this.httpClient = new KrystallizerHttpClient();
    this.layers = [];
    this.entities = [];
    this.preloadImages();
    this.loop.start();
  }

  preloadImages() {
    this.httpClient.api.browse(config.directories.images, "images").then((paths) => {
      const totalToLoad = paths.length;
      let loaded = 0;
      for (let i = 0; i < paths.length; i++) {
        this.httpClient.api.file(paths[i], { parseResponse: false }).then((data) => {
          const handle = () => {
            if (++loaded === totalToLoad) this.initModals();
          };
          const img = new Image();
          img.addEventListener("load", handle);
          img.addEventListener("error", handle); // don't care if it fails; probably not important
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
    this.levelSelect = new SelectLevelModal(
      {
        id: "modal-load-level",
        buttonIds: ["level-load"],
        onSelect: (lvl) => this.loadLevel(lvl),
      },
      this.httpClient
    );
  }

  loadLevel(data) {
    if (!data) return;

    this.layers = [];
    this.entities = [];
    this.screen.actual = { x: 0, y: 0 };

    for (let i = 0; i < data.entities.length; i++) {
      const entity = data.entities[i];
      this.entities.spawnEntity(entity.type, entity.x, entity.y, entity.settings);
    }

    for (let i = 0; i < data.layer.length; i++) {
      const layer = data.layer[i];
      const newLayer = new EditMap({
        name: layer.name,
        tilesize: layer.tilesize,
        tileset: layer.tilesetName || layer.tileset,
        foreground: !!layer.foreground,
        system: this.system,
        config: this.config,
        editor: this,
      });
      newLayer.resize(layer.width || layer.data[0].length, layer.height || layer.data.length);
      newLayer.linkWithCollision = layer.linkWithCollision;
      newLayer.repeat = layer.repeat;
      newLayer.preRender = !!layer.preRender;
      newLayer.distance = layer.distance;
      newLayer.visible = !layer.visible;
      newLayer.data = layer.data;
      newLayer.toggleVisibility();
      this.layers.push(newLayer);

      if (layer.name === "collision") this.collisionLayer = newLayer;
      this.setActiveLayer(layer.name);
    }

    this.setActiveLayer("entities");
    this.reorderLayers();
    // eslint-disable-next-line no-undef
    $("#layers").sortable("refresh");

    this.resetModified();
    this.undo.clear();
    this.draw();
  }
}
