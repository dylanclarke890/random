import { Register } from "../krystal-games-engine/modules/core/register.js";
import { EntityVoid } from "../krystal-games-engine/modules/lib/entities/void.js";

export class Waypoint extends EntityVoid {}

Register.entityTypes(Waypoint);
