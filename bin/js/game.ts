class GameObjectManager {
  static list: GameObject[] = [];
  static game: Game;
  static sprName: string = "gamesprite";

  static Init(game: Game) {
    GameObjectManager.game = game;
  }
  static Add(sprX, sprY, frame): GameObject {
    const obj = new GameObject(
      GameObjectManager.game.game,
      sprX,
      sprY,
      GameObjectManager.sprName,
      frame
    );
    GameObjectManager.list.push(obj);

    return obj;
  }

  static Update() {
    GameObjectManager.list.forEach((e) => {
      e.Update();
    });
  }
}

class Force {
  x: number;
  y: number;
  f: number;
  constructor(x, y, f) {
    this.x = x;
    this.y = y;
    this.f = f;
  }
}

class GameObject {
  x: number;
  y: number;
  spd: number;
  tx: number;
  ty: number;
  spr: Phaser.Sprite;
  forces: Force[] = [];
  weight: number;

  constructor(game: Phaser.Game, sprX, sprY, sprName, frame) {
    this.spr = game.add.sprite(sprX, sprY, sprName);
    this.spr.frame = frame;
    this.spr.anchor.set(0.5);
    this.spr.smoothed = false;
    this.x = sprX;
    this.y = sprY;

    this.weight = 10;
  }

  Move(x, y, spd) {
    this.forces.push(new Force(x, y, spd));
  }

  Update() {
    this.forces.forEach((e, k, list) => {
      this.x += e.x;
      this.y += e.y;
      this.spr.x = this.x;
      this.spr.y = this.y;

      e.f -= this.weight;

      if (e.f <= 0) list.splice(k, 1);
    });
  }
}

class Game {
  ship: GameObject;
  cursors: Phaser.CursorKeys;
  pad1: Phaser.SinglePad;
  map: Phaser.Tilemap;
  game: Phaser.Game;

  constructor() {
    GameObjectManager.Init(this);
    this.game = new Phaser.Game(256, 240, Phaser.CANVAS, "", {
      preload: () => this.preload(),
      init: () => this.init(),
      create: () => this.create(),
      update: () => this.update(),
    });
  }

  preload() {
    this.game.load.tilemap(
      "room1",
      "assets/room1.json",
      null,
      Phaser.Tilemap.TILED_JSON
    );
    this.game.load.spritesheet(
      "gamesprite",
      "assets/16x16_Jerom_CC-BY-SA-3.0.png",
      16,
      16,
      200
    );

    this.game.world.setBounds(0, 0, this.game.width, this.game.height - 16 * 5);
    this.game.stage.disableVisibilityChange = true;
  }

  init() {
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
  }

  makeRoom(name) {
    if (this.map) this.map.destroy();

    this.map = this.game.add.tilemap(name);
    this.map.addTilesetImage("16x16_Jerom_CC-BY-SA-3.0", "gamesprite");
    let layer1 = this.map.createLayer("floor");
    layer1.resizeWorld();
    this.map.setCollision(250, true, "collision");

    console.log(this.map);
    // this.game.physics.p2.convertTilemap(this.map, "collision");

    // @ts-ignore
    if (this.map.objects.object) {
      // @ts-ignore
      const objs = this.map.objects.object;
      objs.forEach((obj) => {
        this.createObj(obj);
      });
    }
  }

  createObj(obj) {
    if (obj.type == "player") {
      this.ship = GameObjectManager.Add(obj.x, obj.y, obj.gid - 1);
      return this.ship;
    }

    let mapObj = GameObjectManager.Add(obj.x, obj.y, obj.gid - 1);
    return mapObj;
  }

  create() {
    // @ts-ignore
    this.game.touchControl = this.game.plugins.add(Phaser.Plugin.TouchControl);
    // @ts-ignore
    this.game.touchControl.inputEnable();
    // @ts-ignore
    this.game.touchControl.settings.maxDistanceInPixels = 32;
    // @ts-ignore
    this.game.touchControl.setPos(50, 200);

    this.makeRoom("room1");

    this.game.input.gamepad.start();
    this.pad1 = this.game.input.gamepad.pad1;
    console.log(this.pad1);

    this.cursors = this.game.input.keyboard.createCursorKeys();
  }

  update() {
    let playerSpeed = 64;

    if (this.pad1.connected) {
      let leftStickX = this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X);
      let leftStickY = this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y);

      // if (leftStickX) {
      //   this.ship.body.moveRight(leftStickX * playerSpeed);
      //   this.ship.body.angle =
      //     360 - (Math.atan2(leftStickX, leftStickY) * 180) / Math.PI;
      // }

      // if (leftStickY) {
      //   this.ship.body.moveDown(leftStickY * playerSpeed);
      //   this.ship.body.angle =
      //     360 - (Math.atan2(leftStickX, leftStickY) * 180) / Math.PI;
      // }

      //ship.body.angle += 10;

      //      console.log(Math.atan2(leftStickX, leftStickY) * 180 / Math.PI);
    }

    // @ts-ignore
    let speed = this.game.touchControl.speed;
    if (speed.x || speed.y) {
      this.ship.spr.angle =
        180 - (Math.atan2(speed.x, speed.y) * 180) / Math.PI;

      this.ship.Move(-speed.x / 100, -speed.y / 100, 10);
    }

    if (this.cursors.left.isDown) {
      this.ship.Move(-1, 0, 10);
    } else if (this.cursors.right.isDown) {
      this.ship.Move(1, 0, 10);
    }

    if (this.cursors.up.isDown) {
      this.ship.Move(0, -1, 10);
    } else if (this.cursors.down.isDown) {
      this.ship.Move(0, 1, 10);
    }

    GameObjectManager.Update();
  }
}

var g_game;
window.onload = function () {
  g_game = new Game();
};
