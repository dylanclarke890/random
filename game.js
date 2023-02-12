import { Game } from "./canvas-game-engine/modules/core/game.js";
import { Input } from "./canvas-game-engine/modules/core/input.js";
import { Algorithm, HeuristicType } from "./canvas-game-engine/modules/pathfinding/constants.js";
import { Grid } from "./canvas-game-engine/modules/pathfinding/data-structures.js";
import { PathFinder } from "./canvas-game-engine/modules/pathfinding/pathfinder.js";
import { Cannon, TurretSelector } from "./entities/entities.js";
import { baseLevel } from "./levels/baseLevel.js";

export class TowerDefenseGame extends Game {
  static MAP_TILE_SIZE = 32;
  /** @type {TurretSelector}  */
  turretSelector;
  /** @type {PathFinder}  */
  pathfinder;
  /** @type {number[][]}  */
  path;

  constructor(opts) {
    super(opts);
    this.loadLevel(baseLevel);
    this.input.bind(Input.KEY.MOUSE1, "place_cannon");

    this.pathfinder = new PathFinder({
      algorithm: Algorithm.AStar,
      heuristic: HeuristicType.Octile,
      allowDiagonal: true,
      unitSize: { x: 1, y: 2 },
    });

    const grid = new Grid({ matrix: this.collisionMap.data });
    const pathMatrix = this.pathfinder.findPath(0, 2, 0, 16, grid);
    this.path = pathMatrix.map(([x, y]) => [
      x * TowerDefenseGame.MAP_TILE_SIZE,
      y * TowerDefenseGame.MAP_TILE_SIZE,
    ]);

    this.turretSelector = this.spawnEntity(TurretSelector, this.input.mouse.x, this.input.mouse.x);
    this.turretSelector.setSelected(Cannon);
  }

  draw() {
    super.draw();
    this.drawPath();
  }

  drawPath() {
    const { ctx } = this.system;
    const start = this.path[0];
    ctx.lineWidth = 2;
    ctx.strokeStyle = "orange";
    ctx.beginPath();
    ctx.moveTo(start[0], start[1]);
    for (let i = 1; i < this.path.length; i++) {
      const [x, y] = this.path[i];
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  update() {
    this.turretSelector.setPosition(this.input.mouse);
    if (this.turretSelector.isValidPosition && this.input.pressed("place_cannon")) {
      let { x, y } = this.turretSelector.selected.pos;
      this.spawnEntity(Cannon, x, y);
    }
    super.update();
  }
}
