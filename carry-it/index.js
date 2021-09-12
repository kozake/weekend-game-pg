/**
 * MAPデータ
 * 0: 通路
 * 1: 壁
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

let screenScale = 1;
let player = null;
let map = null;
let cargos = null;
let input = null;
let moveCargo = null;

class Input {
  constructor() {
    this.pointerPressing = false;
    this.direction = "s";
  }

  onPointerDown(e) {
    this.pointerPressing = true;
    this.direction = this._toDirection(e);
  }

  onPointerMove(e) {
    if (this.pointerPressing) {
      this.direction = this._toDirection(e);
    }
  }

  onPointerUp(e) {
    this.pointerPressing = false;
  }

  _toDirection(e) {
    const distanceX = player.x - e.data.global.x / screenScale;
    const distanceY = player.y - e.data.global.y / screenScale;
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (distanceX > 0) {
        return "w";
      } else {
        return "e";
      }
    } else {
      if (distanceY > 0) {
        return "n";
      } else {
        return "s";
      }
    }
  }
}

class Player extends PIXI.Sprite {
  MOVE_SPEED = 3;

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
}

class Map extends PIXI.Container {
  static TILE_SIZE = 48;

  constructor(mapData) {
    super();
    this.mapData = mapData;

    this._createTile();
  }

  isWall(mapX, mapY) {
    return this.mapData[mapY][mapX] === 1;
  }

  withinMapX(mapX) {
    return 0 <= mapX && mapX < this.mapData[0].length;
  }

  withinMapY(mapY) {
    return 0 <= mapY && mapY < this.mapData.length;
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

function onFrame(frameCnt) {
  if (input.pointerPressing && !player.moving) {
    player.moveDirection = input.direction;
    if (player.moveDirection === "s" && map.withinMapY(player.mapY)) {
      if (!map.isWall(player.mapX, player.mapY + 1)) {
        const cargo = cargos.findCargo(player.mapX, player.mapY + 1);
        if (cargo === null) {
          player.mapY++;
          player.moving = true;
        } else {
          if (
            !map.isWall(player.mapX, player.mapY + 2) &&
            cargos.findCargo(player.mapX, player.mapY + 2) === null
          ) {
            player.mapY++;
            player.moving = true;
            moveCargo = cargo;
            moveCargo.mapY++;
          }
        }
      }
    } else if (player.moveDirection === "n" && player.mapY > 0) {
      if (!map.isWall(player.mapX, player.mapY - 1)) {
        const cargo = cargos.findCargo(player.mapX, player.mapY - 1);
        if (cargo === null) {
          player.mapY--;
          player.moving = true;
        } else {
          if (
            !map.isWall(player.mapX, player.mapY - 2) &&
            cargos.findCargo(player.mapX, player.mapY - 2) === null
          ) {
            player.mapY--;
            player.moving = true;
            moveCargo = cargo;
            moveCargo.mapY--;
          }
        }
      }
    } else if (player.moveDirection === "e" && map.withinMapX(player.mapX)) {
      if (!map.isWall(player.mapX + 1, player.mapY)) {
        const cargo = cargos.findCargo(player.mapX + 1, player.mapY);
        if (cargo === null) {
          player.mapX++;
          player.moving = true;
        } else {
          if (
            !map.isWall(player.mapX + 2, player.mapY) &&
            cargos.findCargo(player.mapX + 2, player.mapY) === null
          ) {
            player.mapX++;
            player.moving = true;
            moveCargo = cargo;
            moveCargo.mapX++;
          }
        }
      }
    } else if (player.moveDirection === "w" && player.mapX > 0) {
      if (!map.isWall(player.mapX - 1, player.mapY)) {
        const cargo = cargos.findCargo(player.mapX - 1, player.mapY);
        if (cargo === null) {
          player.mapX--;
          player.moving = true;
        } else {
          if (
            !map.isWall(player.mapX - 2, player.mapY) &&
            cargos.findCargo(player.mapX - 2, player.mapY) === null
          ) {
            player.mapX--;
            player.moving = true;
            moveCargo = cargo;
            moveCargo.mapX--;
          }
        }
      }
    }
  }
  if (player.moving) {
    const targetX = Map.TILE_SIZE * player.mapX + Map.TILE_SIZE / 2;
    const targetY = Map.TILE_SIZE * player.mapY + Map.TILE_SIZE - 1;

    let walkPattern = Math.floor(frameCnt / 15) % 4;
    walkPattern = walkPattern === 3 ? 1 : walkPattern;
    player.texture = PIXI.Texture.from(
      `actor_${player.moveDirection}${walkPattern}.png`
    );

    if (targetX > player.x) {
      const moveX = Math.min(player.MOVE_SPEED, targetX - player.x);
      player.x += moveX;
      if (moveCargo !== null) {
        moveCargo.x += moveX;
      }
    } else if (targetX < player.x) {
      const moveX = Math.min(player.MOVE_SPEED, player.x - targetX);
      player.x -= moveX;
      if (moveCargo !== null) {
        moveCargo.x -= moveX;
      }
    } else if (targetY > player.y) {
      const moveY = Math.min(player.MOVE_SPEED, targetY - player.y);
      player.y += moveY;
      if (moveCargo !== null) {
        moveCargo.y += moveY;
      }
    } else if (targetY < player.y) {
      const moveY = Math.min(player.MOVE_SPEED, player.y - targetY);
      player.y -= moveY;
      if (moveCargo !== null) {
        moveCargo.y -= moveY;
      }
    }
    if (targetX === player.x && targetY === player.y) {
      player.moving = false;
      moveCargo = null;
    }
  } else {
    player.texture = PIXI.Texture.from(`actor_${player.moveDirection}1.png`);
  }
}

function onResize() {
  const parent = app.view.parentNode;
  screenScale = Math.min(
    parent.clientWidth / app.stage.width,
    parent.clientHeight / app.stage.height
  );
  app.stage.width *= screenScale;
  app.stage.height *= screenScale;
  app.renderer.resize(parent.clientWidth, parent.clientHeight);
}

function onLoad() {
  map = new Map(MAP_DATA);
  app.stage.addChild(map);

  cargos = new Cargos([
    { x: 3, y: 3 },
    { x: 3, y: 4 },
    { x: 3, y: 5 },
    { x: 7, y: 5 },
    { x: 7, y: 6 },
    { x: 7, y: 9 },
  ]);
  app.stage.addChild(cargos);

  player = new Player(5, 5, "s");
  app.stage.addChild(player);

  input = new Input();

  app.stage.interactive = true;
  // 空のコンテナでインタラクションを有効にするにはhitAreaの指定が必要
  app.stage.hitArea = new PIXI.Rectangle(
    0,
    0,
    app.screen.width,
    app.screen.height
  );

  app.stage.on("pointerdown", (e) => input.onPointerDown(e));
  app.stage.on("pointermove", (e) => input.onPointerMove(e));
  app.stage.on("pointerup", (e) => input.onPointerUp(e));
  app.stage.on("pointerupoutside", (e) => input.onPointerUp(e));
  window.addEventListener("resize", () => onResize());
  onResize();

  let frameCnt = 0;
  app.ticker.add(() => {
    frameCnt++;
    onFrame(frameCnt);
  });

  app.start();
}

const app = new PIXI.Application({
  backgroundColor: 0x1099bb,
  width: Map.TILE_SIZE * MAP_DATA[0].length,
  height: Map.TILE_SIZE * MAP_DATA.length,
});
document.body.appendChild(app.view);
app.stop();
app.loader
  .add("actor", "actor.json")
  .add("item", "item.json")
  .add("map", "map.json")
  .load(() => onLoad());
