import { GameLoop } from "../krystal-games-engine/modules/core/loop.js";
import { $el } from "../krystal-games-engine/modules/lib/utils/dom.js";
import { Canvas } from "./canvas.js";
import { config } from "./config.js";
import { EditMap } from "./edit-map.js";
import { KrystallizerHttpClient } from "./http-client.js";
import { System } from "./system.js";
import { Modal, SelectLevelModal } from "./ui.js";
import { Undo } from "./undo.js";

export class Krystallizer {
  constructor() {
    this.system = new System();
    this.canvas = new Canvas(this.system);
    this.game = this.canvas; // for game loop
    this.loop = new GameLoop({ runner: this });
    this.httpClient = new KrystallizerHttpClient();
    this.layers = [];
    this.entities = [];
    this.screen = { actual: { x: 0, y: 0 }, rounded: { x: 0, y: 0 } };
    this.undo = new Undo({ editor: this, levels: config.undoLevels });
    this.preloadImages();
    this.DOMElements = {
      layerSettings: {
        name: $el("#name"),
        tileset: $el("#tileset"),
        tilesize: $el("#tilesize"),
        distance: $el("#distance"),
        width: $el("#dimensions-x"),
        height: $el("#dimensions-y"),
        isCollisionLayer: $el("#is-collision-layer"),
        preRender: $el("#pre-render"),
        repeat: $el("#repeat-map"),
        linkWithCollision: $el("#link-with-collision"),
      },
    };
    this.bindEvents();
    this.loop.start();
  }

  bindEvents() {
    const {
      name,
      tileset,
      // tilesize,
      distance,
      // width,
      // height,
      isCollisionLayer,
      preRender,
      repeat,
      linkWithCollision,
    } = this.DOMElements.layerSettings;

    isCollisionLayer.addEventListener("change", () => {
      [name, tileset, distance, preRender, repeat, linkWithCollision].forEach(
        (el) => (el.disabled = isCollisionLayer.checked)
      );
    });
  }

  /**
   * Loads all images from 'config.directories.images' before initialising any modals.
   * This is to prevent blank screens from being drawn for the level previews.
   */
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
    this.levelSelect = new SelectLevelModal(
      {
        id: "modal-load-level",
        triggeredBy: ["#level-load"],
        onSelect: (lvl) => this.loadLevel(lvl?.data),
      },
      this.httpClient
    );
    new Modal({
      id: "modal-save-as",
      title: "Save As",
      body: "<p>Save As?</p> <input />",
      triggeredBy: ["#level-save-as"],
    });
  }

  loadLevel(data) {
    if (!data) return;

    this.layers = [];
    this.entities = [];
    this.screen.actual = { x: 0, y: 0 };
    this.undo.clear();

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
        config,
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
    $("#layers-list").sortable("refresh");

    this.resetModified();
    this.undo.clear();
    this.draw();
  }
}
