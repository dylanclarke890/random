import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";
import { RandomGame } from "../game.js";

class TurretBase extends Entity {
  _levelEditorIgnore = true;
  constructor(opts) {
    super(opts);
    this.size = { x: 64, y: 64 };
    this.createAnimationSheet("assets/turrets/Tower.png", this.size);
    this.addAnim("Constant", 1, [0], false);
  }

  setPosition(pos) {
    this.pos.x = pos.x;
    this.pos.y = pos.y;
  }
}

class Cannon_Head extends Entity {
  constructor(opts) {
    super(opts);
    this.size = { x: 35, y: 64 };
    this.createAnimationSheet("assets/turrets/Cannon.png", this.size);
    this.addAnim("Default", 1, [0], false);
  }

  setPosition(pos) {
    this.pos.x = pos.x + 16;
    this.pos.y = pos.y - 16;
  }
}

export class Cannon extends Entity {
  constructor(opts) {
    super(opts);
    this.size = { x: 64, y: 64 };
    this.base = new TurretBase({ game: this.game }, this.pos);
    this.head = new Cannon_Head({ game: this.game }, this.pos);
  }

  draw() {
    this.base.setPosition(this.pos);
    this.head.setPosition(this.pos);
    this.base.draw();
    this.head.draw();
  }

  update() {
    this.base.update();
    this.head.update();
  }

  setAlpha(alpha) {
    this.base.currentAnim.alpha = alpha;
    this.head.currentAnim.alpha = alpha;
  }
}

/** @inheritdoc */
export class TurretSelector extends Entity {
  /** @type {Entity} */
  selected;
  isValidPosition = true;

  collides = Entity.COLLIDES.LITE;
  /** @type {number[][]} */
  buildPositions;
  mapWidth;
  mapHeight;

  constructor(opts) {
    super(opts);
    this.buildPositions = this.game.backgroundMaps.find((map) => map.name === "build_sites").data;
    this.mapHeight = this.buildPositions.length;
    this.mapWidth = this.buildPositions[0].length;
  }

  snapToGrip(val) {
    return RandomGame.MAP_TILE_SIZE * Math.round(val / RandomGame.MAP_TILE_SIZE);
  }

  setPosition({ x, y }) {
    if (!this.selected) return;
    // Center the selected turret on the mouse position
    x = x - this.selected.size.x / 2;
    y = y - this.selected.size.y / 2;

    // Snap to grid
    x = this.snapToGrip(x);
    y = this.snapToGrip(y);

    this.selected.pos.x = x;
    this.selected.pos.y = y;

    // Check if the selector is in a valid area by comparing its position with the map data's
    x /= RandomGame.MAP_TILE_SIZE;
    y /= RandomGame.MAP_TILE_SIZE;

    this.isValidPosition = true;

    if (x < 0 || y < 0 || x > this.mapWidth || y > this.mapHeight) {
      this.isValidPosition = false;
      return;
    }
    x = Math.abs(x);
    y = Math.abs(y);

    const positions = [
      this.buildPositions[y][x],
      this.buildPositions[y][x + 1],
      this.buildPositions[y + 1][x],
      this.buildPositions[y + 1][x + 1],
    ];
    this.isValidPosition = !positions.some((pos) => pos !== 1);
  }

  setSelected(turretType) {
    this.selected = new turretType({ x: this.pos.x, y: this.pos.y, game: this.game });
    this.selected.setAlpha(0.5);
  }

  draw() {
    if (!this.selected) return;
    this.selected.draw();
    const { ctx } = this.game.system;
    ctx.strokeStyle = this.isValidPosition ? "green" : "red";
    const lineWidth = 2;
    ctx.lineWidth = lineWidth;
    const { x, y } = this.selected.pos;
    const x2 = this.selected.size.x + lineWidth;
    const y2 = this.selected.size.y + lineWidth;
    ctx.strokeRect(x - lineWidth, y - lineWidth, x2, y2);
  }

  update() {
    return; // not needed.
  }
}

Register.entityTypes(Cannon, TurretSelector);
const turretRoot = "assets/turrets/";
Register.preloadImages(`${turretRoot}Cannon.png`, `${turretRoot}Tower.png`);
