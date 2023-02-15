import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";
import { TowerDefenseGame } from "../game.js";
import { Turret } from "./turret.js";

export class TurretSelector extends Entity {
  /** @type {Entity} */
  selected;
  /** @type {typeof Entity} */
  turretType;
  isValidPosition = true;

  /** @type {number[][]} */
  buildPositions;

  constructor(opts) {
    super(opts);
    this.buildPositions = this.game.backgroundMaps?.find((map) => map.name === "build_sites")?.data;
  }

  snapToGrid(val) {
    return TowerDefenseGame.MAP_TILE_SIZE * Math.round(val / TowerDefenseGame.MAP_TILE_SIZE);
  }

  setPosition({ x, y }) {
    if (!this.selected) return;

    // Center the selected turret on the mouse position
    x = x - this.selected.size.x / 2;
    y = y - this.selected.size.y / 2;

    // Snap the selected turret to the grid to grid
    x = this.snapToGrid(x);
    y = this.snapToGrid(y);

    this.selected.pos.x = x;
    this.selected.pos.y = y;

    // Check if the selected turret is in a valid area by comparing its position with the map data's
    x /= TowerDefenseGame.MAP_TILE_SIZE;
    y /= TowerDefenseGame.MAP_TILE_SIZE;
    this.isValidPosition = true;

    // Check if any of the positions of the selected turret are on invalid tiles
    const positions = [
      this.buildPositions[y]?.[x],
      this.buildPositions[y]?.[x + 1],
      this.buildPositions[y + 1]?.[x],
      this.buildPositions[y + 1]?.[x + 1],
    ];
    this.isValidPosition = !positions.some((pos) => pos !== 1);
    if (!this.isValidPosition) return;

    // Check if there are any turrets where the selected turret is about to be placed
    const currentlyPlacedTurrets = this.game.getEntitiesByType(Turret);
    for (let i = 0; i < currentlyPlacedTurrets.length; i++) {
      const current = currentlyPlacedTurrets[i];
      if (this.selected.touches(current)) {
        this.isValidPosition = false;
        return;
      }
    }
  }

  setSelected(turretType) {
    this.turretType = turretType;
    this.selected = new turretType({ x: this.pos.x, y: this.pos.y, game: this.game });
    this.selected.setAlpha(0.5);
    this.selected._clickableIgnore = true;
    this.selected.range.show = true;
  }

  draw() {
    if (!this.selected || this.game.mode !== this.game.MODE.placeTurret) return;
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

Register.entityType(TurretSelector);
