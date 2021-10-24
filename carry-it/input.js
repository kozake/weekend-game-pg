const LINE_SIZE = 6;
const COLOR = 0xfeeb77;

export class InputPad extends PIXI.Container {
  constructor(width, height, app) {
    super();

    this.ring = new PIXI.Graphics();
    this.ring.lineStyle(LINE_SIZE, COLOR, 0.5);
    this.ring.beginFill(COLOR, 0.1);
    this.ring.drawCircle(
      width / 2 + LINE_SIZE / 2,
      height / 2 + LINE_SIZE / 2,
      Math.min(width, height) / 2
    );
    this.ring.endFill();
    this.addChild(this.ring);

    this.stick = new PIXI.Graphics();
    this._updateStick();
    this.addChild(this.stick);

    this.interactive = true;
    this.pointerPressing = false;
    this.direction = "n";

    app.stage.on("pointerdown", (event) => this._onPointerDown(event));
    app.stage.on("pointermove", (event) => this._onPointerMove(event));
    app.stage.on("pointerup", (event) => this._onPointerUp(event));
    app.stage.on("pointerupoutside", (event) => this._onPointerUp(event));
  }

  _onPointerDown(event) {
    const radius = Math.min(this.width, this.height) / 2;

    // 入力パッド内での座標を取得
    const pos = event.data.getLocalPosition(this);

    // 中心を(0,0)としたx座標とy座標を求める
    const posX = pos.x - this.width / 2;
    const posY = pos.y - this.height / 2;

    // 中心からの距離を算出
    const distance = Math.sqrt(Math.pow(posX, 2) + Math.pow(posY, 2));

    if (distance < radius) {
      this.pointerPressing = true;
      this._updateStick(event);
    }
  }

  _onPointerMove(event) {
    this._updateStick(event);
  }

  _onPointerUp(event) {
    this.pointerPressing = false;
    this._updateStick(event);
  }

  _updateStick(event) {
    // スティックの半径
    const radius = Math.min(this.width, this.height) / 4 - LINE_SIZE / 2;

    this.stick.clear();
    this.stick.lineStyle(6, COLOR, 0.5);
    if (this.pointerPressing) {
      // 入力パッド内での座標を取得
      const pos = event.data.getLocalPosition(this);

      // 中心を(0,0)としたx座標とy座標を求める
      const posX = pos.x - this.width / 2;
      const posY = pos.y - this.height / 2;

      // 中心からの距離を算出
      const distance = Math.sqrt(Math.pow(posX, 2) + Math.pow(posY, 2));

      // 円の中心を算出
      const radians = Math.atan2(posY, posX);
      const centerX =
        Math.cos(radians) * Math.min(distance, radius) + this.width / 2;
      const centerY =
        Math.sin(radians) * Math.min(distance, radius) + this.height / 2;

      this.stick.drawCircle(centerX, centerY, radius);
      this.direction = this._toDirection(posX, posY);
    } else {
      this.stick.drawCircle(this.width / 2, this.height / 2, radius);
      this.direction = this._toDirection(0, 0);
    }
  }

  _toDirection(posX, posY) {
    if (Math.abs(posX) > Math.abs(posY)) {
      if (posX > 0) {
        return "e";
      } else {
        return "w";
      }
    } else {
      if (posY > 0) {
        return "s";
      } else {
        return "n";
      }
    }
  }
}
