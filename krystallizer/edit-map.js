import { $new, $el } from "../krystal-games-engine/modules/lib/utils/dom.js";
import { toInt } from "../krystal-games-engine/modules/lib/utils/number.js";
import { Guard } from "../krystal-games-engine/modules/lib/sanity/guard.js";

import { GameImage } from "../krystal-games-engine/modules/core/image.js";
import { BackgroundMap } from "../krystal-games-engine/modules/core/map.js";

import { TileSelect } from "./tile-select.js";

export class EditMap extends BackgroundMap {
  name = "";
  visible = true;
  active = true;
  linkWithCollision = false;

  /** @type {HTMLDivElement} */
  div = null;
  brush = [[0]];
  oldData = null;
  hotkey = -1;
  ignoreLastClick = false;
  tileSelect = null;

  isSelecting = false;
  selectionBegin = null;

  constructor({ name, tilesize, tileset, foreground, system, config, editor }) {
    super({ tilesize, data: [[0]], system, name, foreground, autoset: false });
    Guard.againstNull({ config });
    Guard.againstNull({ editor });
    this.config = config;
    this.editor = editor;

    const div = $new("div");
    div.className = "layer";
    div.id = `layer-${name}`;
    div.addEventListener("click", () => this.click());
    this.construct(div);

    this.setName(name);
    this.setTileset(tileset || "");

    if (this.foreground) $el("#layers-list").prepend(div);
    else $el("#layer-entities").after(div);
    this.tileSelect = new TileSelect({ layer: this, system: this.system, config: this.config });
  }

  construct(div) {
    div.innerHTML = `
      <span class="layer__visibility" title="Toggle Visibility (Shift+${this.hotkey})"
        data-checked="false">
      </span>
      <span class="layer__name">${this.name}</span>
      <span class="layer__size">${this.width}&times;${this.height}</span>
    `;
    this.DOMElements = {
      div,
      visible: div.querySelector(".layer__visibility"),
      name: div.querySelector(".layer__name"),
      size: div.querySelector(".layer__size"),
    };

    this.DOMElements.visible.addEventListener("click", () => {
      if (!this.active) this.ignoreLastClick = true;
      this.toggleVisibility();
    });
  }

  updateDiv() {
    const { div, visible, name, size } = this.DOMElements;
    div.title = `Select Layer (${this.hotkey})`;
    visible.title = `Toggle Visibility (Shift+${this.hotkey})`;
    visible.dataset.checked = !this.visible;
    name.textContent = this.name;
    size.textContent = `${this.width}\u00D7${this.height}`;
  }

  getSaveData() {
    const shared = {
      name: this.name,
      width: this.width,
      height: this.height,
      tilesize: this.tilesize,
      visible: this.visible,
      data: this.data,
    };

    if (this.name === "collision") return shared;
    return {
      ...shared,
      tileset: this.tiles.path,
      linkWithCollision: this.linkWithCollision,
      preRender: this.preRender,
      distance: this.distance,
      repeat: this.repeat,
      foreground: this.foreground,
    };
  }

  /**
   * @param {number} newWidth
   * @param {number} newHeight
   */
  resize(newWidth, newHeight) {
    const newData = new Array(newHeight);
    for (let y = 0; y < newHeight; y++) {
      newData[y] = new Array(newWidth);
      for (let x = 0; x < newWidth; x++)
        newData[y][x] = x < this.width && y < this.height ? this.data[y][x] : 0;
    }

    this.data = newData;
    this.width = newWidth;
    this.height = newHeight;
    this.updateDiv();
  }

  beginEditing() {
    this.oldData = [...this.data];
  }

  getOldTile(x, y) {
    const tx = Math.floor(x / this.tilesize);
    const ty = Math.floor(y / this.tilesize);
    return tx >= 0 && tx < this.width && ty >= 0 && ty < this.height ? this.oldData[ty][tx] : 0;
  }

  setTileset(tileset) {
    if (this.name === "collision") this.setCollisionTileset();
    else super.setTileset(tileset);
  }

  setCollisionTileset() {
    const path = this.config.collisionTiles.path;
    const internalScale = this.tilesize / this.config.collisionTiles.tilesize;
    this.tiles = new AutoResizedImage({
      path,
      internalScale,
      system: this.system,
      config: this.config,
    });
  }

  //#region UI

  setHotkey(hotkey) {
    this.hotkey = hotkey;
    this.setName(this.name);
  }

  setName(name) {
    this.name = name.replace(/[^0-9a-zA-Z]/g, "_");
    this.updateDiv();
  }

  setActive(active) {
    this.active = active;
    this.DOMElements.div.classList.toggle("layer__active", active);
  }

  toggleVisibility() {
    this.visible = !this.visible;
    this.updateDiv();
    this.editor.draw();
  }

  click() {
    if (this.ignoreLastClick) {
      this.ignoreLastClick = false;
      return;
    }
    this.editor.setActiveLayer(this.name);
  }

  destroy() {
    this.DOMElements.div.remove();
  }

  //#endregion UI

  //#region Selecting

  beginSelecting(x, y) {
    this.isSelecting = true;
    this.selectionBegin = { x: x, y: y };
  }

  endSelecting(x, y) {
    const r = this.getSelectionRect(x, y);

    const brush = [];
    for (let ty = r.y; ty < r.y + r.h; ty++) {
      const row = [];
      for (let tx = r.x; tx < r.x + r.w; tx++) {
        if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) row.push(0);
        else row.push(this.data[ty][tx]);
      }
      brush.push(row);
    }
    this.isSelecting = false;
    this.selectionBegin = null;
    return brush;
  }

  getSelectionRect(x, y) {
    const sx = this.selectionBegin ? this.selectionBegin.x : x,
      sy = this.selectionBegin ? this.selectionBegin.y : y;
    const txb = Math.floor((sx + this.scroll.x) / this.tilesize),
      tyb = Math.floor((sy + this.scroll.y) / this.tilesize),
      txe = Math.floor((x + this.scroll.x) / this.tilesize),
      tye = Math.floor((y + this.scroll.y) / this.tilesize);

    return {
      x: Math.min(txb, txe),
      y: Math.min(tyb, tye),
      w: Math.abs(txb - txe) + 1,
      h: Math.abs(tyb - tye) + 1,
    };
  }

  //#endregion Selecting

  //#region Drawing

  draw() {
    const { view, colors } = this.config;
    // For performance reasons, repeated background maps are not drawn when zoomed out
    if (this.visible && !(view.zoom < 1 && this.repeat)) this.drawTiled();

    const { drawPosition, scale, ctx, realHeight, realWidth } = this.system;
    if (this.active && view.grid) {
      let x = -drawPosition(this.scroll.x % this.tilesize) - 0.5;
      let y = -drawPosition(this.scroll.y % this.tilesize) - 0.5;
      const step = this.tilesize * scale;

      ctx.beginPath();
      for (x; x < realWidth; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, realHeight);
      }
      for (y; y < realHeight; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(realWidth, y);
      }
      ctx.strokeStyle = colors.secondary;
      ctx.stroke();
      ctx.closePath();
    }

    // Bounds
    if (this.active) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.primary;
      ctx.strokeRect(
        -drawPosition(this.scroll.x) - 0.5,
        -drawPosition(this.scroll.y) - 0.5,
        this.width * this.tilesize * scale + 1,
        this.height * this.tilesize * scale + 1
      );
    }
  }

  getCursorOffset() {
    const w = this.brush[0].length;
    const h = this.brush.length;
    return {
      x: toInt(w / 2 - 0.5) * this.tilesize,
      y: toInt(h / 2 - 0.5) * this.tilesize,
    };
  }

  drawCursor(x, y) {
    const { scale, ctx, drawPosition } = this.system;
    if (this.isSelecting) {
      const r = this.getSelectionRect(x, y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = this.config.colors.selection;
      ctx.strokeRect(
        (r.x * this.tilesize - this.scroll.x) * scale - 0.5,
        (r.y * this.tilesize - this.scroll.y) * scale - 0.5,
        r.w * this.tilesize * scale + 1,
        r.h * this.tilesize * scale + 1
      );
      return;
    }

    const w = this.brush[0].length;
    const h = this.brush.length;
    const co = this.getCursorOffset();
    const cx =
      Math.floor((x + this.scroll.x) / this.tilesize) * this.tilesize - this.scroll.x - co.x;
    const cy =
      Math.floor((y + this.scroll.y) / this.tilesize) * this.tilesize - this.scroll.y - co.y;

    ctx.lineWidth = 1;
    ctx.strokeStyle = this.config.colors.primary;
    ctx.strokeRect(
      drawPosition(cx) - 0.5,
      drawPosition(cy) - 0.5,
      w * this.tilesize * scale + 1,
      h * this.tilesize * scale + 1
    );

    ctx.globalAlpha = 0.5;
    for (let ty = 0; ty < h; ty++) {
      for (let tx = 0; tx < w; tx++) {
        const t = this.brush[ty][tx];
        if (!t) continue;
        const px = cx + tx * this.tilesize;
        const py = cy + ty * this.tilesize;
        this.tiles.drawTile(px, py, t - 1, this.tilesize);
      }
    }
    ctx.globalAlpha = 1;
  }

  // #endregion Drawing
}

export class AutoResizedImage extends GameImage {
  internalScale = 1;

  constructor({ path, internalScale, system }) {
    super({ system, path });
    this.internalScale = internalScale || 1;
  }

  onload() {
    this.width = Math.ceil(this.data.width * this.internalScale);
    this.height = Math.ceil(this.data.height * this.internalScale);

    if (this.internalScale !== 1) {
      const scaled = $new("canvas");
      scaled.width = this.width;
      scaled.height = this.height;
      const scaledCtx = scaled.getContext("2d");

      scaledCtx.drawImage(
        this.data,
        0,
        0,
        this.data.width,
        this.data.height,
        0,
        0,
        this.width,
        this.height
      );
      this.data = scaled;
    }

    this.loaded = true;
    if (this.system.scale !== 1) this.resize(this.system.scale);
    if (this.loadCallback) this.loadCallback(this.path, true);
  }
}
