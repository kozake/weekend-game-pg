const CtrlC = "\u0003";

const Monster = Object.freeze({
  Player: 0,
  Slime: 1,
  Boss: 2,
  Max: 3,
});

const Character = Object.freeze({
  Player: 0,
  Monster: 1,
  Max: 2,
});

const Monsters = Object.freeze([
  Object.freeze({
    hp: 100,
    maxHp: 100,
    mp: 15,
    maxMp: 15,
    attack: 30,
    name: "ゆうしゃ",
    command: 0,
    target: 0,
  }),
  Object.freeze({
    hp: 3,
    maxHp: 3,
    mp: 0,
    maxMp: 0,
    attack: 2,
    name: "スライム",
    aa: "／・Д・＼\n〜〜〜〜〜",
    command: 0,
    target: 0,
  }),
  Object.freeze({
    hp: 255,
    maxHp: 255,
    mp: 0,
    maxMp: 0,
    attack: 50,
    name: "まおう",
    aa: "   A＠A\nΨ (▼皿▼) Ψ",
    command: 0,
    target: 0,
  }),
]);

const Command = Object.freeze({
  Fight: 0,
  Spell: 1,
  Run: 2,
  Max: 3,
});

const CommandNames = Object.freeze(["たたかう", "じゅもん", "にげる"]);
const SpellCost = 3;

const characters = new Array(Character.Max);
characters[Character.Player] = Object.assign({}, Monsters[Monster.Player]);

process.stdin.setEncoding("utf8");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function inputKey(prompt) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const isRow = stdin.isRaw;
    const callBack = (key) => {
      if (key === CtrlC) {
        process.exit(-1);
      }
      stdin.off("data", callBack);
      stdin.pause();
      stdin.setRawMode(isRow);
      resolve(key);
    };
    stdin.setRawMode(true);
    stdin.resume();
    if (prompt) {
      process.stdout.write(prompt);
    }
    stdin.on("data", callBack);
  });
}

function drawBattleScreen() {
  const player = characters[Character.Player];
  const monster = characters[Character.Monster];
  console.clear();
  console.log(player.name);
  console.log(
    `ＨＰ：${player.hp}／${player.maxHp}　ＭＰ：${player.mp}／${player.maxMp}`
  );
  console.log();
  console.log(`${monster.aa}（ＨＰ：${monster.hp}／${monster.maxHp}）\n`);
  console.log();
}

async function selectCommand() {
  const player = characters[Character.Player];
  player.command = Command.Fight;
  while (true) {
    drawBattleScreen();
    for (let i = 0; i < Command.Max; i++) {
      const cursor = player.command === i ? ">" : " ";
      console.log(cursor + CommandNames[i]);
    }
    const key = await inputKey();
    switch (key) {
      case "w":
        player.command--;
        break;
      case "s":
        player.command++;
        break;
      default:
        return;
    }
    player.command = (Command.Max + player.command) % Command.Max;
  }
}

async function battle(monsterNo) {
  characters[Character.Monster] = Object.assign({}, Monsters[monsterNo]);
  const player = characters[Character.Player];
  const monster = characters[Character.Monster];

  player.target = Character.Monster;
  monster.target = Character.Player;
  drawBattleScreen();
  console.log(`${monster.name}が あらわれた！`);

  while (true) {
    for (let i = 0; i < Character.Max; i++) {
      drawBattleScreen();
      if (i === Character.Player) {
        await selectCommand();
      }
      const currentCharacter = characters[i];
      const targetCharacter = characters[currentCharacter.target];
      drawBattleScreen();
      switch (currentCharacter.command) {
        case Command.Fight:
          console.log(`${currentCharacter.name}の こうげき！`);
          await inputKey();

          const damage = 1 + getRandomInt(currentCharacter.attack);
          targetCharacter.hp = Math.max(targetCharacter.hp - damage, 0);
          console.log(`${targetCharacter.name}に ${damage}の ダメージ！`);
          await inputKey();

          break;
        case Command.Spell:
          console.log(`${currentCharacter.name}は ヒール をとなえた！`);
          await inputKey();
          if (currentCharacter.mp < SpellCost) {
            console.log("ＭＰが たりない");
            await inputKey();
            break;
          }

          currentCharacter.hp = currentCharacter.maxHp;
          currentCharacter.mp -= SpellCost;
          drawBattleScreen();
          console.log(`${currentCharacter.name}のきずが かいふくした！`);
          await inputKey();

          break;
        case Command.Run:
          console.log(`${currentCharacter.name}は にげだした！`);
          await inputKey();
          return;

          break;
      }
      if (targetCharacter.hp <= 0) {
        switch (currentCharacter.target) {
          case Character.Player:
            drawBattleScreen();
            console.log(`ゆうしゃは まけました`);
            break;
          case Character.Monster:
            targetCharacter.aa = "\n";
            drawBattleScreen();
            console.log(`${targetCharacter.name}を たおした！`);
            break;
        }
        await inputKey();
        return;
      }
    }
  }
}

function main() {
  battle(Monster.Boss);
}

main();
