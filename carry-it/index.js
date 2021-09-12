const TILE_SIZE = 48;
const MOVE_SPEED = 3;
const MAP_COLS = 16;
const MAP_ROWS = 12;

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
]

const CARGO_DATA = [
  {x: 3, y: 3},
  {x: 3, y: 4},
  {x: 3, y: 5},
  {x: 7, y: 5},
  {x: 7, y: 6},
  {x: 7, y: 9},
]

let screenScale = 1;
let player;
let playerX = 5;
let playerY = 5;
let map;
let cargos = [];
let pointerPressing = false;
let direction = "s";
let playerMoving = false;
let moveDirection = direction;
let moveCargoIndex = -1;

function createMap() {
  map = new PIXI.Container();
  app.stage.addChild(map);

  const field = PIXI.Texture.from("map_00.png");
  const wall = PIXI.Texture.from("item_01.png");
  const goal = PIXI.Texture.from("map_01.png");

  for (let i = 0; i < 192; i++) {
    const row = Math.floor(i / 16);
    const col = (i % 16);

    const tile = new PIXI.Sprite();
    if (MAP_DATA[row][col] === 1) {
      tile.texture = wall;
    } else if (MAP_DATA[row][col] === 2) {
      tile.texture = goal;
    } else {
      tile.texture = field;
    }
    tile.height = tile.width = TILE_SIZE;
    tile.x = col * TILE_SIZE;
    tile.y = row * TILE_SIZE;

    map.addChild(tile);
  }
}

function findCargo(x, y) {
  for (let i = 0; i < CARGO_DATA.length; i++) {
    const cargo = CARGO_DATA[i];
    if (cargo.x === x && cargo.y === y) {
      return i;
    }
  }
  return -1;
}

function createCargos() {
  const cargoContainer = new PIXI.Container();
  app.stage.addChild(cargoContainer);

  const texture = PIXI.Texture.from("item_00.png");
  for (let i = 0; i < CARGO_DATA.length; i++) {
    const cargo = new PIXI.Sprite(texture);
    cargo.height = cargo.width = TILE_SIZE;
    cargo.x = CARGO_DATA[i].x * TILE_SIZE;
    cargo.y = CARGO_DATA[i].y * TILE_SIZE;
    cargoContainer.addChild(cargo);
    cargos.push(cargo);
  }
}

function createPlayer() {
  player = PIXI.Sprite.from(`actor_s0.png`);
  player.anchor.x = 0.5;
  player.anchor.y = 1;
  player.x = TILE_SIZE * playerX + TILE_SIZE / 2;
  player.y = TILE_SIZE * playerY + TILE_SIZE - 1;

  app.stage.addChild(player);
}

function onFrame(frameCnt) {
  if (pointerPressing && !playerMoving) {
    moveDirection = direction;
    if (direction === "s" && playerY < MAP_ROWS - 1) {
      if (MAP_DATA[playerY + 1][playerX] !== 1) {
        const cargoIndex = findCargo(playerX, playerY + 1);
        if (cargoIndex === -1) {
          playerY++;
          playerMoving = true;
        } else {
          const nextCargoIndex = findCargo(playerX, playerY + 2);
          if (MAP_DATA[playerY + 2][playerX] !== 1 && nextCargoIndex === -1) {
            playerY++;
            playerMoving = true;
            moveCargoIndex = cargoIndex;
            CARGO_DATA[moveCargoIndex].y++;
          }
        }
      }
    } else if (direction === "n" && playerY > 0) {
      if (MAP_DATA[playerY - 1][playerX] !== 1) {
        const cargoIndex = findCargo(playerX, playerY - 1);
        if (cargoIndex === -1) {
          playerY--;
          playerMoving = true;
        } else {
          const nextCargoIndex = findCargo(playerX, playerY - 2);
          if (MAP_DATA[playerY - 2][playerX] !== 1 && nextCargoIndex === -1) {
            playerY--;
            playerMoving = true;
            moveCargoIndex = cargoIndex;
            CARGO_DATA[moveCargoIndex].y--;
          }
        }
      }
    } else if (direction === "e" && playerX < MAP_COLS - 1) {
      if (MAP_DATA[playerY][playerX + 1] !== 1) {
        const cargoIndex = findCargo(playerX + 1, playerY);
        if (cargoIndex === -1) {
          playerX++;
          playerMoving = true;
        } else {
          const nextCargoIndex = findCargo(playerX + 2, playerY);
          if (MAP_DATA[playerY][playerX + 2] !== 1 && nextCargoIndex === -1) {
            playerX++;
            playerMoving = true;
            moveCargoIndex = cargoIndex;
            CARGO_DATA[moveCargoIndex].x++;
          }
        }
      }
    } else if (direction === "w" && playerX > 0) {
      if (MAP_DATA[playerY][playerX - 1] !== 1) {
        const cargoIndex = findCargo(playerX - 1, playerY);
        if (cargoIndex === -1) {
          playerX--;
          playerMoving = true;
        } else {
          const nextCargoIndex = findCargo(playerX - 2, playerY);
          if (MAP_DATA[playerY][playerX - 2] !== 1 && nextCargoIndex === -1) {
            playerX--;
            playerMoving = true;
            moveCargoIndex = cargoIndex;
            CARGO_DATA[moveCargoIndex].x--;
          }
        }
      }
    }
  }
  if (playerMoving) {
    const targetX = TILE_SIZE * playerX + TILE_SIZE / 2;
    const targetY = TILE_SIZE * playerY + TILE_SIZE - 1;

    let walkPattern = Math.floor(frameCnt / 15) % 4;
    walkPattern = walkPattern === 3 ? 1 : walkPattern;
    player.texture = PIXI.Texture.from(`actor_${moveDirection}${walkPattern}.png`);

    if (targetX > player.x) {
      const moveX = Math.min(MOVE_SPEED, targetX - player.x);
      player.x += moveX;
      if (moveCargoIndex != -1) {
        cargos[moveCargoIndex].x += moveX;
      }
    } else if (targetX < player.x) {
      const moveX = Math.min(MOVE_SPEED, player.x - targetX);
      player.x -= moveX;
      if (moveCargoIndex != -1) {
        cargos[moveCargoIndex].x -= moveX;
      }
    } else if (targetY > player.y) {
      const moveY = Math.min(MOVE_SPEED, targetY - player.y);
      player.y += moveY;
      if (moveCargoIndex != -1) {
        cargos[moveCargoIndex].y += moveY;
      }
    } else if (targetY < player.y) {
      const moveY = Math.min(MOVE_SPEED, player.y - targetY);
      player.y -= moveY;
      if (moveCargoIndex != -1) {
        cargos[moveCargoIndex].y -= moveY;
      }
    }
    if (targetX === player.x && targetY === player.y) {
      playerMoving = false;
      moveCargoIndex = -1;
    }
  } else {
    player.texture = PIXI.Texture.from(`actor_${moveDirection}1.png`);
  }
}

function toDirection(e) {
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

function onPointerDown(e) {
  pointerPressing = true;
  direction = toDirection(e);
}

function onPointerMove(e) {
  if (pointerPressing) {
    direction = toDirection(e);
  }
}

function onPointerUp(e) {
  pointerPressing = false;
}

function onResize() {
  const parent = app.view.parentNode;
  screenScale = Math.min(parent.clientWidth / app.stage.width, parent.clientHeight / app.stage.height);
  app.stage.width *= screenScale;
  app.stage.height *= screenScale;
  app.renderer.resize(parent.clientWidth, parent.clientHeight);
}

function onLoad() {
  createMap();
  createCargos();
  createPlayer();

  app.stage.interactive = true;
  // 空のコンテナでインタラクションを有効にするにはhitAreaの指定が必要
  app.stage.hitArea = new PIXI.Rectangle(
    0,
    0,
    app.screen.width,
    app.screen.height
  );

  app.stage.on("pointerdown", (e) => onPointerDown(e));
  app.stage.on("pointermove", (e) => onPointerMove(e));
  app.stage.on("pointerup", (e) => onPointerUp(e));
  app.stage.on("pointerupoutside", (e) => onPointerUp(e));
  window.addEventListener('resize', () => onResize());
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
  width: TILE_SIZE * MAP_COLS,
  height: TILE_SIZE * MAP_ROWS,
});
document.body.appendChild(app.view);
app.stop();
app.loader
  .add("actor", "actor.json")
  .add("item", "item.json")
  .add("map", "map.json")
  .load(() => onLoad());
