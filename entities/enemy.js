import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Guard } from "../canvas-game-engine/modules/lib/guard.js";

class Enemy extends Entity {
  constructor({ assetRoot, ...rest }) {
    super(rest);
    Guard.againstNull({ assetRoot });
  }
}

export class Enemy_Pitchfork extends Enemy {}
