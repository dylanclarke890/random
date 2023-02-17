import { Register } from "../canvas-game-engine/modules/core/register.js";
import { EntityVoid } from "../canvas-game-engine/modules/lib/entities/void.js";

export class Waypoint extends EntityVoid {}

Register.entityTypes(Waypoint);
