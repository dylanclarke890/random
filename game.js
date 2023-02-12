import { Game } from "./canvas-game-engine/modules/core/game.js";
import { Input } from "./canvas-game-engine/modules/core/input.js";
import { Algorithm, HeuristicType } from "./canvas-game-engine/modules/pathfinding/constants.js";
import { Grid } from "./canvas-game-engine/modules/pathfinding/data-structures.js";
import { PathFinder } from "./canvas-game-engine/modules/pathfinding/pathfinder.js";
import { compressPath, smoothenPath } from "./canvas-game-engine/modules/pathfinding/utils.js";
import { Cannon, Enemy_Pitchfork, TurretSelector } from "./entities/entities.js";
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
    });
    const grid = new Grid({ matrix: this.collisionMap.data });
    this.pathMatrix = compressPath(this.pathfinder.findPath(0, 3, 0, 16, grid));
    console.log(this.pathMatrix);
    this.path = this.pathMatrix.map(([x, y]) => [
      x * TowerDefenseGame.MAP_TILE_SIZE,
      y * TowerDefenseGame.MAP_TILE_SIZE,
    ]);
    this.updateEnemiesWithPath();

    this.turretSelector = this.spawnEntity(TurretSelector, this.input.mouse.x, this.input.mouse.x);
    this.turretSelector.setSelected(Cannon);
  }

  updateEnemiesWithPath() {
    const enemies = this.getEntitiesByType(Enemy_Pitchfork);
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      enemy.setDestination(this.path);
    }
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
