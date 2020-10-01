namespace InputControl {
  let game: Phaser.Game = null;
  let cursors: Phaser.CursorKeys;
  let touchesDown = [];
  let graphics: Phaser.Graphics;
  let keys: Phaser.Key[] = [];

  const size = 25;
  let startY = 160;
  const startX = 0;

  export function Init(g: Phaser.Game) {
    game = g;

    startY = g.height - size * 3;

    graphics = game.add.graphics(0, 0);

    let x = startX,
      y = startY;
    for (let i = 0; i < 9; i++) {
      if (i % 2) {
        graphics.lineStyle(1, 0x00ff00, 1.0);
        graphics.drawRect(x + 0.5, y + 0.5, size, size);
      }
      if (i > 0 && (i + 1) % 3 == 0) {
        x = startX;
        y += size;
      } else x += size;
    }

    cursors = game.input.keyboard.createCursorKeys();

    graphics.visible = game.input.pointer1.active;

    keys["Z"] = game.input.keyboard.addKey(Phaser.KeyCode.Z);
    keys["X"] = game.input.keyboard.addKey(Phaser.KeyCode.X);

    console.log(game.input.pointer1);
  }

  export function Update() {
    let x = startX,
      y = startY;

    if (game.input.pointer1.isDown) {
      if (!graphics.visible) graphics.visible = true;
    }

    for (let i = 0; i < 9; i++) {
      touchesDown[i] = false;
      if (i % 2) {
        if (
          game.input.x >= x &&
          game.input.y >= y &&
          game.input.x <= x + size &&
          game.input.y <= y + size &&
          game.input.pointer1.isDown
        ) {
          touchesDown[i] = true;
        }
      }
      if (i > 0 && (i + 1) % 3 == 0) {
        x = startX;
        y += size;
      } else x += size;
    }

    //game.input.pointer1.isUp
    //game.input.pointer1.isDown
    //game.input.pointer1.isUp

    // console.log(game.input.pointer1);
  }

  export function LeftDown() {
    if (cursors.left.isDown) return true;
    if (touchesDown[3]) return true;
    return false;
  }

  export function RightDown() {
    if (cursors.right.isDown) return true;
    if (touchesDown[5]) return true;
    return false;
  }

  export function UpDown() {
    if (cursors.up.isDown) return true;
    if (touchesDown[1]) return true;
    return false;
  }

  export function DownDown() {
    if (cursors.down.isDown) return true;
    if (touchesDown[7]) return true;
    return false;
  }

  export function Down(code: string) {
    if (keys[code].isDown) return true;
    return false;
  }

  export function JustDown(code: string) {
    if (keys[code].justDown) return true;
    return false;
  }
}
