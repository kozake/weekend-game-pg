import { InputPad } from "./input.js";

/**
 * MAPデータ
 * 0: 通路
 * 1: 壁
 * 2: ゴール
 */
const MAP_DATA = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 2, 2, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

class Player extends PIXI.Sprite {
  static MOVE_SPEED = 3;

  constructor(mapX, mapY, direction) {
    super();
    this.anchor.x = 0.5;
    this.anchor.y = 1;
    this.texture = PIXI.Texture.from(`actor_s0.png`);
    this.mapX = mapX;
    this.mapY = mapY;
    this.x = Map.TILE_SIZE * this.mapX + Map.TILE_SIZE / 2;
    this.y = Map.TILE_SIZE * this.mapY + Map.TILE_SIZE - 1;
    this.moving = false;
    this.moveDirection = direction;
  }

  move(frameCnt) {
    const moveDistance = { x: 0, y: 0 };
    if (this.moving) {
      const targetX = Map.TILE_SIZE * this.mapX + Map.TILE_SIZE / 2;
      const targetY = Map.TILE_SIZE * this.mapY + Map.TILE_SIZE - 1;

      if (targetX > this.x) {
        moveDistance.x = Math.min(Player.MOVE_SPEED, targetX - this.x);
      } else if (targetX < this.x) {
        moveDistance.x = Math.max(-1 * Player.MOVE_SPEED, targetX - this.x);
      } else if (targetY > this.y) {
        moveDistance.y = Math.min(Player.MOVE_SPEED, targetY - this.y);
      } else if (targetY < this.y) {
        moveDistance.y = Math.max(-1 * Player.MOVE_SPEED, targetY - this.y);
      }

      this._updateWalkPattern(frameCnt);
      this.x += moveDistance.x;
      this.y += moveDistance.y;

      if (targetX === this.x && targetY === this.y) {
        this.moving = false;
      }
    }

    this._updateWalkPattern(frameCnt);
    return moveDistance;
  }

  _updateWalkPattern(frameCnt) {
    if (this.moving) {
      let walkPattern = Math.floor(frameCnt / 15) % 4;
      walkPattern = walkPattern === 3 ? 1 : walkPattern;
      this.texture = PIXI.Texture.from(
        `actor_${this.moveDirection}${walkPattern}.png`
      );
    } else {
      this.texture = PIXI.Texture.from(`actor_${this.moveDirection}1.png`);
    }
  }
}

class Map extends PIXI.Container {
  static TILE_SIZE = 48;

  constructor(mapData) {
    super();
    this.mapData = mapData;

    this._createTile();
  }

  isWall(point) {
    return this.mapData[point.mapY][point.mapX] === 1;
  }

  within(point) {
    return (
      0 <= point.mapX &&
      point.mapX < this.mapData[0].length &&
      0 <= point.mapY &&
      point.mapY < this.mapData.length
    );
  }

  _createTile() {
    const field = PIXI.Texture.from("map_00.png");
    const wall = PIXI.Texture.from("item_01.png");
    const goal = PIXI.Texture.from("map_01.png");

    for (let row = 0; row < this.mapData.length; row++) {
      for (let col = 0; col < this.mapData[0].length; col++) {
        const tile = new PIXI.Sprite();
        if (this.mapData[row][col] === 1) {
          tile.texture = wall;
        } else if (this.mapData[row][col] === 2) {
          tile.texture = goal;
        } else {
          tile.texture = field;
        }
        tile.height = tile.width = Map.TILE_SIZE;
        tile.x = col * Map.TILE_SIZE;
        tile.y = row * Map.TILE_SIZE;

        this.addChild(tile);
      }
    }
  }
}

class Cargo extends PIXI.Sprite {
  constructor(mapX, mapY) {
    super();
    this.texture = PIXI.Texture.from("item_00.png");
    this.height = this.width = Map.TILE_SIZE;
    this.mapX = mapX;
    this.mapY = mapY;
    this.x = mapX * Map.TILE_SIZE;
    this.y = mapY * Map.TILE_SIZE;
  }

  move(moveDistance) {
    this.x += moveDistance.x;
    this.y += moveDistance.y;
  }
}

class Cargos extends PIXI.Container {
  constructor(cargoPoints) {
    super();
    this.cargos = [];
    this.createCargos(cargoPoints);
  }

  createCargos(cargoPoints) {
    for (let i = 0; i < cargoPoints.length; i++) {
      const cargo = new Cargo(cargoPoints[i].x, cargoPoints[i].y);
      this.addCargo(cargo);
    }
  }

  addCargo(cargo) {
    this.addChild(cargo);
    this.cargos.push(cargo);
  }

  getCargo(index) {
    return this.cargos[index];
  }

  findCargo(mapX, mapY) {
    for (let cargo of this.cargos) {
      if (cargo.mapX === mapX && cargo.mapY === mapY) {
        return cargo;
      }
    }
    return null;
  }
}

const SCREEN_WIDTH = Map.TILE_SIZE * MAP_DATA[0].length;
const SCREEN_HEIGHT = Map.TILE_SIZE * MAP_DATA.length;

class Game {
  app = null;
  screenScale = 1;
  player = null;
  map = null;
  cargos = null;
  input = null;
  moveCargo = null;

  onResize() {
    this.screenScale = Math.min(
      document.body.clientWidth / SCREEN_WIDTH,
      document.body.clientHeight / SCREEN_HEIGHT
    );
    this.app.stage.width = SCREEN_WIDTH * this.screenScale;
    this.app.stage.height = SCREEN_HEIGHT * this.screenScale;
    this.app.renderer.resize(document.body.clientWidth, document.body.clientHeight);
  }

  onLoad() {
    this.map = new Map(MAP_DATA);
    this.app.stage.addChild(this.map);

    this.cargos = new Cargos([
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 7, y: 5 },
      { x: 7, y: 6 },
      { x: 7, y: 9 },
    ]);
    this.app.stage.addChild(this.cargos);

    this.player = new Player(5, 5, "s");
    this.app.stage.addChild(this.player);

    this.input = new InputPad(200, 200, this.app);
    this.input.x = 10;
    this.input.y = 360;
    this.app.stage.addChild(this.input);

    this.app.stage.interactive = true;
    // 空のコンテナでインタラクションを有効にするにはhitAreaの指定が必要
    this.app.stage.hitArea = new PIXI.Rectangle(
      0,
      0,
      this.app.screen.width,
      this.app.screen.height
    );

    window.addEventListener("resize", () => this.onResize());
    this.onResize();

    let frameCnt = 0;
    this.app.ticker.add(() => {
      frameCnt++;
      this.onFrame(frameCnt);
    });

    this.app.start();
  }

  start() {
    this.app = new PIXI.Application({
      backgroundColor: 0x1099bb,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });
    document.body.appendChild(this.app.view);
    this.app.stop();
    this.app.loader
      .add("actor", "actor.json")
      .add("item", "item.json")
      .add("map", "map.json")
      .load(() => this.onLoad());
  }

  onFrame(frameCnt) {
    if (this.input.pointerPressing && !this.player.moving) {
      this.player.moveDirection = this.input.direction;
      const target = { mapX: this.player.mapX, mapY: this.player.mapY };
      const check = { ...target };

      if (this.player.moveDirection === "s") {
        target.mapY += 1;
        check.mapY += 2;
      } else if (this.player.moveDirection === "n") {
        target.mapY -= 1;
        check.mapY -= 2;
      } else if (this.player.moveDirection === "e") {
        target.mapX += 1;
        check.mapX += 2;
      } else if (this.player.moveDirection === "w") {
        target.mapX -= 1;
        check.mapX -= 2;
      }

      if (this.map.within(target)) {
        if (!this.map.isWall(target)) {
          const cargo = this.cargos.findCargo(target.mapX, target.mapY);
          if (cargo === null) {
            this.player.mapX = target.mapX;
            this.player.mapY = target.mapY;
            this.player.moving = true;
          } else {
            if (
              !this.map.isWall(check) &&
              this.cargos.findCargo(check) === null
            ) {
              this.player.mapX = target.mapX;
              this.player.mapY = target.mapY;
              this.player.moving = true;
              this.moveCargo = cargo;
              this.moveCargo.mapX = check.mapX;
              this.moveCargo.mapY = check.mapY;
            }
          }
        }
      }
    }

    const moveDistance = this.player.move(frameCnt);
    if (this.moveCargo !== null) {
      this.moveCargo.move(moveDistance);
    }
    if (!this.player.moving) {
      this.moveCargo = null;
    }
  }
}

const $game = new Game();
$game.start();
