import { GameLoop } from "../krystal-games-engine/modules/core/loop.js";
import { Register } from "../krystal-games-engine/modules/core/register.js";
import { $el } from "../krystal-games-engine/modules/lib/utils/dom.js";
import {
  formatAsJSON,
  hyphenToCamelCase,
} from "../krystal-games-engine/modules/lib/utils/string.js";
import { Canvas } from "./canvas.js";
import { config } from "./config.js";
import { EditMap } from "./edit-map.js";
import { KrystallizerHttpClient } from "./http-client.js";
import { System } from "./system.js";
import { ConfirmModal, SelectLevelModal } from "./ui.js";
import { Undo } from "./undo.js";

export class Krystallizer {
  constructor() {
    this.system = new System();
    this.canvas = new Canvas(this.system);
    this.game = this.canvas; // for game loop
    this.loop = new GameLoop({ runner: this });

    /** @type {EditMap[]} */
    this.layers = [];
    /** @type {"entities" | EditMap} */
    this.activeLayer;
    this.entities = [];
    this.drawEntities = false;
    this.screen = { actual: { x: 0, y: 0 }, rounded: { x: 0, y: 0 } };

    const { undoDepth, newFileName } = config.general;
    this.undo = new Undo({ editor: this, levels: undoDepth });
    this.fileName = newFileName;
    this.discardChangesConfirmed = false;

    this.httpClient = new KrystallizerHttpClient();
    this.preloadImages();

    this.DOMElements = {
      level: {
        name: $el("#level-name"),
        new: $el("#level-new"),
        load: $el("#level-load"),
        save: $el("#level-save"),
        saveAs: $el("#level-save-as"),
      },
      layers: $el("#layers-list"),
      layerActions: {
        new: $el("#layer-new"),
        delete: $el("#layer-delete"),
        apply: $el("#layer-apply"),
      },
      entities: $el("#entities"),
      entitiesLayer: {
        div: $el("#layer-entities"),
        visibility: $el("#layer-entities > .layer__visibility"),
      },
      entitySettings: {
        div: $el("#entity-settings"),
      },
      layerSettings: {
        div: $el("#layer-settings"),
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
    this.setModified(false);
    this.bindEvents();
    this.loop.start();
  }

  bindEvents() {
    const { layers, level, layerActions, entitiesLayer, layerSettings } = this.DOMElements;

    // eslint-disable-next-line no-undef
    $(layers).sortable({
      cancel: ".layer__visibility",
      update: () => this.reorderLayers(),
    });

    level.new.addEventListener("click", () => this.newLevel());
    level.save.addEventListener("click", () => {
      if (this.fileName === config.general.newFileName) {
        this.modals.saveAs.open();
        return;
      }
      this.saveLevel(this.filePath + this.fileName);
    });

    layerActions.new.addEventListener("click", () => this.addLayer());
    layerActions.apply.addEventListener("click", () => this.saveLayerSettings());
    layerActions.delete.addEventListener("click", () => {
      if (!config.general.confirmDeleteLayer) this.removeLayer();
    });

    const { div, visibility } = entitiesLayer;
    div.addEventListener("click", () => this.setActiveLayer("entities"));
    visibility.addEventListener("click", () => {
      this.drawEntities = !this.drawEntities;
      visibility.dataset.checked = this.drawEntities.toString();
    });

    const { isCollisionLayer } = layerSettings;
    isCollisionLayer.addEventListener("change", () => this.updateCollisionLayerSettings());
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
    const saveAs = new ConfirmModal({
      id: "modal-save-as",
      size: "sm",
      title: "Save As",
      body: "<input name='new-file-name' id='new-file-name'/>",
      triggeredBy: [this.DOMElements.level.saveAs],
      onOpen: () => {
        const fileNameInput = $el("#new-file-name");
        fileNameInput.value = this.fileName;
        fileNameInput.focus();
        fileNameInput.setSelectionRange(0, fileNameInput.value.lastIndexOf(".js"));
      },
      onOk: () => {
        let dir = config.directories.levels;
        if (dir[dir.length - 1] !== "/") dir += "/";
        this.saveLevel(`${dir}${$el("#new-file-name").value}`);
      },
    });
    const confirmDelete = new ConfirmModal({
      id: "modal-delete-layer",
      title: "Delete Layer?",
      body: "<p class='text-center'>Are you sure you wish to delete this layer?</p>",
      triggeredBy: [this.DOMElements.layerActions.delete],
      onOk: () => this.removeLayer(),
    });
    const confirmDiscard = new ConfirmModal({
      id: "modal-discard-changes",
      title: "Discard Changes?",
      body: "<p class='text-center'>You have unsaved changes, which will be lost if you continue. Start a new file?</p>",
      triggeredBy: [this.DOMElements.level.new],
      onOpen: () => {
        if (!this.modified) confirmDiscard.close();
      },
      onOk: () => {
        this.discardChangesConfirmed = true;
        this.newLevel();
      },
    });
    const levelSelect = new SelectLevelModal(
      {
        id: "modal-load-level",
        triggeredBy: [this.DOMElements.level.load],
        onSelect: (lvl) => lvl && this.loadLevel(lvl),
        onLevelsLoaded: (levels) => {
          if (!config.general.loadLastLevel) return;

          let lastLevelPath = localStorage.getItem(config.storageKeys.lastLevel);
          if (!lastLevelPath) return;
          if (lastLevelPath.startsWith("..")) lastLevelPath = lastLevelPath.slice(2);

          const level = levels.find((l) => l.path === lastLevelPath);
          if (!level) return;
          this.loadLevel(level);
        },
      },
      this.httpClient
    );
    this.modals = {
      saveAs,
      levelSelect,
      confirmDiscard: config.general.confirmDiscardChanges && confirmDiscard,
      confirmDelete: config.general.confirmDeleteLayer && confirmDelete,
    };
  }

  draw() {}

  //#region Entity

  spawnEntity(className, x, y, settings) {
    const entityClass = Register.getEntityByType(className);
    if (!entityClass) return null;
    const newEntity = new entityClass({ x, y, game: this, settings });
    newEntity._additionalSettings = {};
    for (let s in settings) newEntity._additionalSettings[s] = settings[s];
    this.entities.push(newEntity);
    if (settings.name) this.namedEntities[settings.name] = newEntity;
    return newEntity;
  }

  //#endregion Entity

  //#region Level

  clearLevel() {
    this.layers.forEach((l) => l.destroy());
    this.layers = [];
    this.screen = { actual: { x: 0, y: 0 }, rounded: { x: 0, y: 0 } };
    this.entities = [];
    this.undo.clear();
    localStorage.removeItem(config.storageKeys.lastLevel);
    this.setActiveLayer("entities");
  }

  newLevel() {
    if (this.modified && this.modals.confirmDiscard && !this.discardChangesConfirmed) return;
    this.clearLevel();
    this.fileName = config.general.newFileName;
    this.filePath = config.directories.levels + this.fileName;
    this.setModified(false);
    this.discardChangesConfirmed = false;
  }

  /**
   * @param {{ path:string, data: {entities: any[], layer: any[]} }}
   */
  loadLevel({ path, data } = {}) {
    if (!data || !path) return;
    this.clearLevel();

    const split = path.lastIndexOf("/");
    this.filePath = path.substring(0, split + 1);
    this.fileName = path.substring(split + 1);
    this.setModified(false);
    localStorage.setItem(config.storageKeys.lastLevel, path);

    for (let i = 0; i < data.entities.length; i++) {
      const { type, x, y, settings } = data.entities[i];
      this.spawnEntity(type, x, y, settings);
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
    this.setModified(false);

    // eslint-disable-next-line no-undef
    $(this.DOMElements.layers).sortable("refresh");
    this.draw();
  }

  saveLevel(path) {
    if (!path.match(/\.js$/)) path += ".js";

    this.filePath = path;
    this.fileName = path.replace(/^.*\//, "");

    const data = {
      entities: this.entities.map((e) => ({
        ...e.pos,
        type: e.constructor.name,
        settings: e._additionalSettings ?? {},
      })),
      layer: this.layers.map((l) => l.getSaveData()),
    };

    let dataString = JSON.stringify(data);
    if (config.general.prettyPrint) dataString = formatAsJSON(dataString);
    const levelName = hyphenToCamelCase(this.fileName.substring(0, this.fileName.lastIndexOf(".")));
    dataString = `export const ${levelName} = /*JSON-BEGIN*/ ${dataString}; /*JSON-END*/`;

    this.httpClient.api
      .save(path, dataString)
      .then((res) => {
        if (res.error) {
          console.error(res.msg);
          return;
        }
        this.setModified(false);
        localStorage.setItem(config.storageKeys.lastLevel, path);
      })
      .catch((err) => console.error(err));
  }

  //#endregion Level

  setModified(/** @type {boolean} */ isModified) {
    this.modified = isModified;
    document.title = `${this.fileName}${isModified ? "*" : ""} | Krystallizer`;
    const levelName = this.DOMElements.level.name;
    levelName.textContent = this.fileName;
    levelName.dataset.unsaved = isModified;
  }

  //#region Layers

  setActiveLayer(/** @type {string} */ name) {
    this.activeLayer = name === "entities" ? name : this.getLayerByName(name);
    const activeClass = "layer-active";
    this.DOMElements.entitiesLayer.div.classList.toggle(activeClass, name === "entities");
    this.DOMElements.layerSettings.div.style.display = name === "entities" ? "none" : "block";
    this.DOMElements.entitySettings.div.style.display = name === "entities" ? "block" : "none";
    this.DOMElements.entities.style.display = name === "entities" ? "block" : "none";
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      layer.DOMElements.div.classList.toggle(activeClass, layer.name === name);
    }
    this.updateLayerSettings();
  }

  reorderLayers() {
    const layers = document.querySelectorAll(".layer__name");
    const newLayers = [];
    let isForegroundLayer = true;
    layers.forEach((el, i) => {
      const name = el.textContent;
      const hotkey = i + 1;

      if (name === "entities") {
        isForegroundLayer = false; // All layers after the entity layer are not foreground layers
        this.DOMElements.entitiesLayer.div.title = `Select Layer (${hotkey})`;
        this.DOMElements.entitiesLayer.visibility.title = `Toggle Visibility (Shift+${hotkey})`;
        return;
      }

      const layer = this.getLayerByName(name);
      if (!layer) return;
      layer.setHotkey(hotkey);
      layer.foreground = isForegroundLayer;
      newLayers.unshift(layer);
    });

    this.layers = newLayers;
    this.setModified(true);
    this.draw();
  }

  getLayerByName(/** @type {string} */ name) {
    return this.layers.find((layer) => layer.name === name);
  }

  addLayer() {
    const name = "new_layer_" + this.layers.length;
    const newLayer = new EditMap({
      config,
      editor: this,
      name,
      system: this.system,
      tilesize: config.layerDefaults.tilesize,
    });

    newLayer.resize(config.layerDefaults.width, config.layerDefaults.height);
    newLayer.setScreenPos(this.screen.actual.x, this.screen.actual.y);

    this.layers.push(newLayer);
    this.setActiveLayer(name);
    this.updateLayerSettings();
    this.reorderLayers();
    // eslint-disable-next-line no-undef
    $(this.DOMElements.layers).sortable("refresh");
  }

  removeLayer() {
    if (this.activeLayer === "entities") return false;
    const name = this.activeLayer.name;
    this.activeLayer.destroy();
    for (let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].name !== name) continue;
      this.layers.splice(i, 1);
      this.reorderLayers();
      // eslint-disable-next-line no-undef
      $(this.DOMElements.layers).sortable("refresh");
      this.setActiveLayer("entities");
      return true;
    }
    return false;
  }

  updateLayerSettings() {
    if (this.activeLayer === "entities") return;
    const {
      name,
      tileset,
      tilesize,
      width,
      height,
      distance,
      preRender,
      repeat,
      linkWithCollision,
      isCollisionLayer,
    } = this.DOMElements.layerSettings;

    name.value = this.activeLayer.name;
    tileset.value = this.activeLayer.tilesetName;
    tilesize.value = this.activeLayer.tilesize ?? 32;
    width.value = this.activeLayer.width ?? 10;
    height.value = this.activeLayer.height ?? 10;
    distance.value = this.activeLayer.distance ?? 1;
    preRender.checked = this.activeLayer.preRender;
    repeat.checked = this.activeLayer.repeat;
    linkWithCollision.checked = this.activeLayer.linkWithCollision;
    isCollisionLayer.checked = this.activeLayer === this.collisionLayer;
    this.updateCollisionLayerSettings();
  }

  updateCollisionLayerSettings() {
    const { isCollisionLayer, name, tileset, distance, preRender, repeat, linkWithCollision } =
      this.DOMElements.layerSettings;
    // only collision-specific inputs should be enabled if 'isCollisionLayer' is checked.
    [name, tileset, distance, preRender, repeat, linkWithCollision].forEach(
      (el) => (el.disabled = isCollisionLayer.checked)
    );
  }

  saveLayerSettings() {
    if (this.activeLayer === "entities") return;

    const { isCollisionLayer, name, width, height, tilesize } = this.DOMElements.layerSettings;
    const isCollision = isCollisionLayer.checked;
    const newName = isCollision ? "collision" : name.value;
    const newWidth = Math.floor(width.value);
    const newHeight = Math.floor(height.value);
    if (newWidth !== this.activeLayer.width || newHeight !== this.activeLayer.height)
      this.activeLayer.resize(newWidth, newHeight);
    this.activeLayer.tilesize = Math.floor(tilesize.value);

    if (isCollision) {
      this.activeLayer.linkWithCollision = false;
      this.activeLayer.distance = 1;
      this.activeLayer.repeat = false;
      this.activeLayer.setCollisionTileset();
    } else {
      const { tileset, linkWithCollision, distance, repeat, preRender } =
        this.DOMElements.layerSettings;
      const newTilesetName = tileset.value;
      if (newTilesetName !== this.activeLayer.tilesetName)
        this.activeLayer.setTileset(newTilesetName);
      this.activeLayer.distance = parseFloat(distance.value);
      this.activeLayer.linkWithCollision = linkWithCollision.checked;
      this.activeLayer.repeat = repeat.checked;
      this.activeLayer.preRender = preRender.checked;
    }

    // Is a collision layer
    if (newName === "collision") this.collisionLayer = this.activeLayer;
    // Was a collision layer, but is no more
    else if (this.activeLayer.name === "collision") this.collisionLayer = undefined;

    this.activeLayer.setName(newName);
    this.setModified(true);
    this.draw();
  }

  //#endregion Layers
}
