class GameObjectManager {}
class GameObject {}

class Game {
  ship;
  cursors;
  pad1;
  map;
  game: Phaser.Game;

  constructor() {
    let self = this;
    this.game = new Phaser.Game(256, 240, Phaser.CANVAS, "", {
      preload: () => self.preload(),
      init: () => self.init(),
      create: () => self.create(),
      update: () => self.update(),
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
    //this.game.stage.disableVisibilityChange = true;
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
    this.game.physics.p2.convertTilemap(this.map, "collision");

    if (this.map.objects.object) {
      const objs = this.map.objects.object;
      objs.forEach((obj) => {
        this.createObj(obj);
      });
    }
  }

  createObj(obj) {
    if (obj.type == "player") {
      this.ship = this.game.add.sprite(obj.x, obj.y, "gamesprite");
      this.ship.frame = obj.gid - 1;
      this.ship.anchor.set(0.5);
      this.ship.smoothed = false;

      this.game.physics.p2.enable(this.ship);

      this.ship.body.fixedRotation = true;
      this.ship.body.collideWorldBounds = true;
      return this.ship;
    }

    let mapObj = this.game.add.sprite(obj.x, obj.y, "gamesprite");
    this.game.physics.p2.enable(mapObj);
    mapObj.frame = obj.gid - 1;
    mapObj.body.setRectangle(obj.width, obj.height);
    mapObj.body.fixedRotation = true;
    mapObj.anchor.set(0.5);
    mapObj.smoothed = false;
    mapObj.body.collideWorldBounds = true;
    mapObj.body.applyDamping(0.9);
    mapObj.body.debug = true;
    mapObj.body.setZeroDamping();
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

    this.game.physics.startSystem(Phaser.Physics.P2JS);
    console.log(this);
    this.makeRoom("room1");

    this.game.physics.p2.restitution = 0.7;
    this.game.physics.p2.applyDamping = true;
    // @ts-ignore
    this.game.physics.p2.gravity = 0;

    this.game.input.gamepad.start();
    this.pad1 = this.game.input.gamepad.pad1;
    console.log(this.pad1);

    this.cursors = this.game.input.keyboard.createCursorKeys();
  }

  update() {
    this.ship.body.setZeroVelocity();
    let playerSpeed = 64;

    if (this.pad1.connected) {
      let leftStickX = this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X);
      let leftStickY = this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y);

      if (leftStickX) {
        this.ship.body.moveRight(leftStickX * playerSpeed);
        this.ship.body.angle =
          360 - (Math.atan2(leftStickX, leftStickY) * 180) / Math.PI;
      }

      if (leftStickY) {
        this.ship.body.moveDown(leftStickY * playerSpeed);
        this.ship.body.angle =
          360 - (Math.atan2(leftStickX, leftStickY) * 180) / Math.PI;
      }

      //ship.body.angle += 10;

      //      console.log(Math.atan2(leftStickX, leftStickY) * 180 / Math.PI);
    }

    // @ts-ignore
    let speed = this.game.touchControl.speed;
    if (speed.y) {
      this.ship.body.moveUp(speed.y);
      this.ship.body.angle =
        180 - (Math.atan2(speed.x, speed.y) * 180) / Math.PI;
    }
    if (speed.x) {
      this.ship.body.moveLeft(speed.x);
      this.ship.body.angle =
        180 - (Math.atan2(speed.x, speed.y) * 180) / Math.PI;
    }

    if (this.cursors.left.isDown) {
      this.ship.body.moveLeft(playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.ship.body.moveRight(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.ship.body.moveUp(playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.ship.body.moveDown(playerSpeed);
    }
  }
}

var g_game;
window.onload = function () {
  g_game = new Game();
};
