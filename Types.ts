import type { Direction, Point } from "./Point2d";

/**
 * Defines how the snake reacts when moving into the bounds of the play area.
 */
enum WallBehavior {
  endGame,
  wrap,
}
type EngineConfig = {
  startingDirection: Direction;
  startingLength?: number;
  wallBehavior: WallBehavior;
  startingPellets: number;
  maxPellets: number;
  millisecondsPerUpdate: number;
  startingNodes?: Point[];
};
interface IEngineConfig {
  startingDirection: Direction;
  startingLength?: number;
  wallBehavior: WallBehavior;
  startingPellets: number;
  maxPellets: number;
  millisecondsPerUpdate: number;
  startingNodes?: Point[];
};

export type { EngineConfig, IEngineConfig };
export { WallBehavior };
