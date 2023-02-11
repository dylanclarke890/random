import { Entity } from "../canvas-game-engine/modules/core/entity.js";
import { Register } from "../canvas-game-engine/modules/core/register.js";

export class TurretBase extends Entity {}

Register.entityTypes(TurretBase);
