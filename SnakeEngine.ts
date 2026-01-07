import { SnakeEvent } from "./Events";
import { InputHandler, type IInputHandler } from "./InputHandler";
import { Direction, Point, Rect } from "./Point2d";
import Snake from "./Snake";
import { type EngineConfig, WallBehavior, type IEngineConfig } from "./Types";

class Runner {
  private requestId?: number;
  private initialTime?: number;
  private priorTime?: number;
  private timeSinceLastUpdate?: number;

  constructor(private engine: SnakeEngine, public onUpdate?: () => void, public onInit?: () => void, public onStop?: () => void) {}

  init() {
    if (this.onInit) {
      this.onInit();
      return;
    }
    this.engine.initGame();
    // this.requestId = requestAnimationFrame(this.onUpdate || (e => this.update));
    setInterval(this.onUpdate || (() => this.update()), this.engine.config.millisecondsPerUpdate);
  }

  update() {
    this.engine.advance();
  }
}
interface GameStateEvent {
  engine: SnakeEngine;
}
interface GameOverEvent extends GameStateEvent {
  collision: Point[];
}
interface PelletEatenEvent extends GameStateEvent {
  /** The length of the snake after the pellet has been eaten. */
  snakeLength: number;
  pelletCoordinates: Point;
}
class SnakeEngine {
  static readonly defaultConfig: EngineConfig = {
    startingDirection: Direction.up,
    startingLength: 5,
    wallBehavior: WallBehavior.endGame,
    startingPellets: 1,
    maxPellets: 1,
    millisecondsPerUpdate: 1 / 60,
    startingNodes: undefined,
  };

  public inputHandler: IInputHandler = new InputHandler();

  // #region Events
  public readonly onGameOver = new SnakeEvent<GameOverEvent>();
  public readonly onPelletEaten = new SnakeEvent<GameStateEvent>();
  public readonly onTickCompleted = new SnakeEvent<GameStateEvent>();
  // #endregion Events

  // #region Game State
  private timestamp?: number;

  private _isGameOver: boolean;
  public get isGameOver(): boolean { return this._isGameOver; }
  // #endregion Game State

  private pellets: Point[] = [];
  private getValidPelletLocations() {
    const ret: Point[] = [];
    const lineSegments = this.snake.segments;
    for (let x = this.playfieldRect.xMin; x <= this.playfieldRect.xMax; x++) {
      for (let y = this.playfieldRect.yMin; y <= this.playfieldRect.yMax; y++) {
        const p = new Point(x, y);
        if (!this.pellets.includes(p) && !lineSegments.find(e => p.intersects(e[0]!, e[1]!)))
          ret.push(p);
      }
    }
    return ret;
  }

  public readonly playfieldRect: Rect;
  public currentDirection!: Direction;
  public snake: Snake;

  constructor(
    width: number,
    height: number,
    public readonly config: IEngineConfig = SnakeEngine.defaultConfig,
  ) {
    this.playfieldRect = Rect.fromDimensionsAndMin(width, height);
    this.snake = Snake.fromPreferences(this, this.playfieldRect);
    // TODO: Start with 2 points in _turn for head & tail
    this._isGameOver = false;

    this.initGame();
  }

  public initGame() {
    /* this._snakeNodes.push(new Point(0, 0));
    this._snakeNodes.push(new Point(this._snakeLength, 0)); */
    const t = this.getValidPelletLocations();
    const max = Math.min(t.length, this.config.startingPellets);
    for (let i = 0; i < max; i++) {
      const index = Math.round(Math.random() * t.length);
      this.pellets.push(t[index]!);
      t.splice(Math.round(Math.random() * t.length), 1);
    }

    // requestAnimationFrame(this.update);
  }

  public update() {
    // 1. Inputs
    const keys = this.inputHandler.getKeysDown();
    const d = keys.map(e => e.direction).includes(this.snake.lastDirection) ? this.snake.lastDirection : (keys[0]?.direction || this.snake.lastDirection);
    // 2. Update
    this.advance(d);
  }

  private generatePellet() {
    const t = this.getValidPelletLocations();
    const index = Math.round(Math.random() * t.length);
    this.pellets.push(t[index]!);
  }

  /**
   *
   * @param d The direction the snake is moving in.
   * @returns The line segment of collision if the snake collided with itself, `undefined` if it stayed alive.
   */
  public advance(d = this.currentDirection) {
    const projectedPosition = Point.add(this.snake.head, d);
    // Which pellet was eaten, if any.
    const eatenIndex = this.pellets.findIndex(e => e === projectedPosition);
    const intersection = this.snake.advance(d, eatenIndex > -1);
    if (intersection) {
      this._isGameOver = true;
      this.onGameOver.fire({ engine: this, collision: intersection });
    } else if (eatenIndex > -1) {
      const args: PelletEatenEvent = {
        engine: this,
        pelletCoordinates: this.pellets.splice(eatenIndex, 1)[0]!,
        snakeLength: this.snake.snakeLength,
      };
      this.generatePellet();
      this.onPelletEaten.fire(args);
    }
  }
}
export {
  SnakeEngine
};
export type {
  EngineConfig,
  IEngineConfig
};
