import { RectInt, type IPoint2d } from "./Point2d";

/* enum SnakeAssetType {
  head,
  body,
  pellet,
  obstacle,
  background,
  border,
}
class SnakeAsset {
  private constructor(
    public readonly identifier: string,
    public readonly url: string,
    public readonly sourceRect: RectInt,
    public readonly type: SnakeAssetType,
  ) {}
} */

class SnakeImage {
  // public static readonly imgMap = new Map<string, HTMLImageElement | undefined>();
  // public static readonly imgMap = new Map<string, SnakeImage | undefined>();
  private static readonly imgMap = new Map<string, SnakeImage>();
  private _isLoaded = false;
  public get isLoaded() { return this._isLoaded; }
  private readonly _promise: Promise<SnakeImage>;
  public get promise() { return this._promise; }

  public readonly image: HTMLImageElement;
  private constructor(
    public readonly identifier: string,
    public readonly url: string,
    public readonly sourceRect: RectInt,
  ) {
    this.image = new Image();
    this._promise = new Promise<SnakeImage>((resolve, _reject) => {
      this.image.addEventListener("load", (e) => {
        this.onLoad(e);
        resolve(this);
      });
    });
    SnakeImage.imgMap.set(this.identifier, this);
  }

  public static promiseFromRect(
    identifier: string,
    url: string,
    sourceRect: RectInt,
  ) { return new SnakeImage(identifier, url, sourceRect).promise; }

  public static promiseFromDimensions(
    identifier: string,
    url: string,
    dimensions: IPoint2d = { x: 0, y: 0 },
  ) { return new SnakeImage(identifier, url, RectInt.fromDimensionsAndMin(dimensions.x, dimensions.y)).promise; }

  private onLoad(_e: Event) { this._isLoaded = true; }

  public static tryDrawImage(ctx: CanvasRenderingContext2D, identifier: string, x: number, y: number, dimensions?: IPoint2d) {
    const i = this.imgMap.get(identifier);
    if (i?.isLoaded) {
      ctx.drawImage(
        i.image,
        i.sourceRect.xMin,
        i.sourceRect.yMin,
        i.sourceRect.width,
        i.sourceRect.height,
        x,
        y,
        dimensions === undefined ? i.sourceRect.width : dimensions.x,
        dimensions === undefined ? i.sourceRect.height : dimensions.y,
      );
      return true;
    }
    return false;
  }
}

class SnakeAssetPack {
  public readonly promise: Promise<SnakeImage[]>;
  private static toPromise(identifier: string, e: { url: string; dimensions: RectInt | IPoint2d }) {
    return e.dimensions instanceof RectInt ? SnakeImage.promiseFromRect(identifier, e.url, e.dimensions) : SnakeImage.promiseFromDimensions(identifier, e.url, e.dimensions);
  }

  constructor(
    public readonly head: { url: string; dimensions: RectInt | IPoint2d },
    public readonly body: { url: string; dimensions: RectInt | IPoint2d },
    public readonly pellet: { url: string; dimensions: RectInt | IPoint2d },
  ) {
    this.promise = Promise.all([
      SnakeAssetPack.toPromise("head", head),
      SnakeAssetPack.toPromise("body", body),
      SnakeAssetPack.toPromise("pellet", pellet),
    ]);
  }
}

export {
  SnakeImage,
};
