const TILE_SIZE = 16;
class Game {
    constructor() {
        this.frame = 0;
        GameObjectManager.Init(this);
        // this.game = new Phaser.Game(256, 240, Phaser.CANVAS, "", {
        this.game = new Phaser.Game(256, 16 * 10, Phaser.CANVAS, "game", {
            preload: () => this.preload(),
            init: () => this.init(),
            create: () => this.create(),
            update: () => this.update(),
        });
    }
    preload() {
        this.game.load.tilemap("room1", "assets/map.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.spritesheet("gamesprite", "assets/16x16_Jerom_CC-BY-SA-3.0.png", TILE_SIZE, TILE_SIZE, 200);
        this.game.world.setBounds(0, 0, this.game.width, this.game.height - 16 * 5);
        // this.game.stage.disableVisibilityChange = true;
    }
    init() {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
    }
    makeRoom(name) {
        if (this.map)
            this.map.destroy();
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
        console.log(obj);
        if (obj.type == "player") {
            this.player = GameObjectManager.Add(obj.x, obj.y, obj.type, obj.gid - 1);
            return this.player;
        }
        let mapObj = GameObjectManager.Add(obj.x, obj.y, obj.type, obj.gid - 1);
        return mapObj;
    }
    create() {
        this.makeRoom("room1");
        this.game.input.gamepad.start();
        this.pad1 = this.game.input.gamepad.pad1;
        InputControl.Init(this.game);
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
        // if (this.player.state == OBJ_STATE.IDLE)
        {
            if (InputControl.LeftDown()) {
                this.player.AddForce(-1, 0, this.player, "keydown", true);
                this.player.SetDir(1 /* LEFT */);
            }
            else if (InputControl.RightDown()) {
                this.player.AddForce(1, 0, this.player, "keydown", true);
                this.player.SetDir(3 /* RIGHT */);
            }
            if (InputControl.UpDown()) {
                this.player.AddForce(0, -1, this.player, "keydown", true);
                this.player.SetDir(2 /* UP */);
            }
            else if (InputControl.DownDown()) {
                this.player.AddForce(0, 1, this.player, "keydown", true);
                this.player.SetDir(0 /* DOWN */);
            }
            if (InputControl.JustDown("Z")) {
                const attack = GameObjectManager.Add(this.player.x, this.player.y, "playerAttack", 0);
                attack.lifeTimeMS = 1000;
            }
        }
        GameObjectManager.Update();
    }
}
var g_game;
window.onload = function () {
    g_game = new Game();
};
//# sourceMappingURL=game.js.map