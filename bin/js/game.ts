const TILE_SIZE = 16;

class Game {
  player: GameObject;
  pad1: Phaser.SinglePad;
  map: Phaser.Tilemap;
  game: Phaser.Game;
  frame: number = 0;

  constructor() {
    GameObjectManager.Init(this);
    // this.game = new Phaser.Game(256, 240, Phaser.CANVAS, "", {
    this.game = new Phaser.Game(256, 16 * 10, Phaser.AUTO, "game", {
      preload: () => this.preload(),
      init: () => this.init(),
      create: () => this.create(),
      update: () => this.update(),
      render: () => this.Render(),
    });
  }

  preload() {
    this.game.load.tilemap(
      "room1",
      "assets/map.json",
      null,
      Phaser.Tilemap.TILED_JSON
    );
    this.game.load.spritesheet(
      "gamesprite",
      "assets/16x16_Jerom_CC-BY-SA-3.0.png",
      TILE_SIZE,
      TILE_SIZE,
      200
    );

    this.game.world.setBounds(0, 0, this.game.width, this.game.height - 16 * 5);
    // this.game.stage.disableVisibilityChange = true;
  }

  init() {
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.renderer.renderSession.roundPixels = true;
    // Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
    // Phaser.Canvas.setSmoothingEnabled(this.game.context, false);
    // this.game.context.imageSmoothingEnabled = false;
    // this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    // this.game.scale.setUserScale(3, 3);
  }

  makeRoom(name) {
    if (this.map) this.map.destroy();

    this.map = this.game.add.tilemap(name);
    this.map.addTilesetImage("16x16_Jerom_CC-BY-SA-3.0", "gamesprite");
    let layer1 = this.map.createLayer("base");
    layer1.resizeWorld();
    // this.map.setCollision(250, true, "obj");

    console.log(this.map.objects);
    // this.game.physics.p2.convertTilemap(this.map, "collision");

    // @ts-ignore
    if (this.map.objects.objLayer) {
      // @ts-ignore
      const objs = this.map.objects.objLayer;
      objs.forEach((obj) => {
        if (obj.properties) {
          obj.properties.forEach((e) => {
            obj[e.name] = e.value;
          });
        }
        this.createObj(obj);
      });
    }
  }

  createObj(obj) {
    // console.log(obj);
    if (obj.type == "player") {
      this.player = GameObjectManager.Add(
        obj.x,
        obj.y,
        obj.type,
        obj.gid - 1,
        null
      );
      return this.player;
    }

    let mapObj = GameObjectManager.Add(
      obj.x,
      obj.y,
      obj.type,
      obj.gid - 1,
      null
    );
    return mapObj;
  }

  create() {
    this.game.time.advancedTiming = true;

    this.makeRoom("room1");

    this.game.input.gamepad.start();
    this.pad1 = this.game.input.gamepad.pad1;

    InputControl.Init(this.game);

    const text = this.game.add.text(32, 32, "helloworld 안녕하세요", {
      font: "12px",
      fill: "#000000",
      // fontStyle: "bold",
    });
    text.smoothed = true;

    this.game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
  }

  update() {
    this.frame++;

    let playerSpeed = 10;

    if (this.pad1.connected) {
      let leftStickX = this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X);
      let leftStickY = this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y);

      // if (leftStickX) {
      //   this.player.body.moveRight(leftStickX * playerSpeed);
      //   this.player.body.angle =
      //     360 - (Math.atan2(leftStickX, leftStickY) * 180) / Math.PI;
      // }

      // if (leftStickY) {
      //   this.player.body.moveDown(leftStickY * playerSpeed);
      //   this.player.body.angle =
      //     360 - (Math.atan2(leftStickX, leftStickY) * 180) / Math.PI;
      // }

      // this.player.body.angle += 10;

      console.log((Math.atan2(leftStickX, leftStickY) * 180) / Math.PI);
    }

    if (this.player.CanMove()) {
      if (InputControl.LeftDown()) {
        this.player.AddForce(-1, 0, this.player, "keydown", true);
        this.player.SetDir(DIR.LEFT);
      } else if (InputControl.RightDown()) {
        this.player.AddForce(1, 0, this.player, "keydown", true);
        this.player.SetDir(DIR.RIGHT);
      }

      if (InputControl.UpDown()) {
        this.player.AddForce(0, -1, this.player, "keydown", true);
        this.player.SetDir(DIR.UP);
      } else if (InputControl.DownDown()) {
        this.player.AddForce(0, 1, this.player, "keydown", true);
        this.player.SetDir(DIR.DOWN);
      }

      if (
        this.player.CanAttack() &&
        InputControl.JustDown("Z") &&
        GameObjectManager.GetNameCnt("playerAttack") == 0
      ) {
        const attack: GameObject = GameObjectManager.Add(
          this.player.GetAttackX(),
          this.player.GetAttackY(),
          "playerAttack",
          0,
          this.player
        );
        attack.lifeTimeMS = 1000;
      }
    }

    GameObjectManager.Update();
    GameObjectManager.PUpdate();
    GameObjectManager.AfterUpdate();
  }

  Render() {
    this.game.debug.text(this.game.time.fps.toString(), 2, 14, "#00ff00");
  }
}

var g_game;
window.onload = function () {
  g_game = new Game();
};
