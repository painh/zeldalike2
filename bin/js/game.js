var TILE_SIZE = 16;
function CheckCollision(r1, r2) {
    if (r1.x < r2.x + r2.width &&
        r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y) {
        return true;
    }
    return false;
}
var GameObjectManager = /** @class */ (function () {
    function GameObjectManager() {
    }
    GameObjectManager.Init = function (game) {
        GameObjectManager.game = game;
    };
    GameObjectManager.Add = function (sprX, sprY, frame) {
        var obj = new GameObject(GameObjectManager.game.game, sprX, sprY, GameObjectManager.sprName, frame);
        GameObjectManager.list.push(obj);
        return obj;
    };
    GameObjectManager.Update = function () {
        GameObjectManager.list.forEach(function (e) {
            e.Update();
        });
    };
    GameObjectManager.CheckCollision = function (checkRect, me) {
        var list = [];
        this.list.forEach(function (e) {
            if (e == me)
                return;
            if (CheckCollision(checkRect, e.GetRect()))
                list.push(e);
        });
        return list;
    };
    GameObjectManager.list = [];
    GameObjectManager.sprName = "gamesprite";
    return GameObjectManager;
}());
var Force = /** @class */ (function () {
    function Force(x, y, f) {
        this.x = x;
        this.y = y;
        this.f = f;
    }
    return Force;
}());
var GameObject = /** @class */ (function () {
    function GameObject(game, sprX, sprY, sprName, frame) {
        this.forces = [];
        this.spr = game.add.sprite(sprX, sprY, sprName);
        this.spr.frame = frame;
        this.spr.anchor.set(0.5);
        this.spr.smoothed = false;
        this.x = sprX;
        this.y = sprY;
        this.weight = 10;
    }
    GameObject.prototype.GetRect = function () {
        return {
            x: this.x,
            y: this.y,
            width: TILE_SIZE - 5,
            height: TILE_SIZE - 5
        };
    };
    GameObject.prototype.Move = function (x, y) {
        this.forces.push(new Vector(x, y));
    };
    GameObject.prototype.Update = function () {
        var _this = this;
        var fx = 0;
        var fy = 0;
        var allf = 0;
        if (this.forces.length == 0)
            return;
        this.forces.forEach(function (e, k, list) {
            fx += e.x;
            fy += e.y;
            var mag = e.getMagnitude() - _this.weight;
            if (mag <= 0) {
                list.splice(k, 1);
            }
            else
                e.setMagnitude(mag);
        });
        var newRect = this.GetRect();
        newRect.x = this.x + fx;
        newRect.y = this.y + fy;
        var list = GameObjectManager.CheckCollision(newRect, this);
        if (list.length == 0) {
            this.x = this.spr.x += fx;
            this.y = this.spr.y += fy;
        }
        else {
            list.forEach(function (e) {
                e.Move(fx, fy);
            });
        }
    };
    return GameObject;
}());
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        GameObjectManager.Init(this);
        this.game = new Phaser.Game(256, 240, Phaser.CANVAS, "", {
            preload: function () { return _this.preload(); },
            init: function () { return _this.init(); },
            create: function () { return _this.create(); },
            update: function () { return _this.update(); }
        });
    }
    Game.prototype.preload = function () {
        this.game.load.tilemap("room1", "assets/room1.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.spritesheet("gamesprite", "assets/16x16_Jerom_CC-BY-SA-3.0.png", TILE_SIZE, TILE_SIZE, 200);
        this.game.world.setBounds(0, 0, this.game.width, this.game.height - 16 * 5);
        this.game.stage.disableVisibilityChange = true;
    };
    Game.prototype.init = function () {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
    };
    Game.prototype.makeRoom = function (name) {
        var _this = this;
        if (this.map)
            this.map.destroy();
        this.map = this.game.add.tilemap(name);
        this.map.addTilesetImage("16x16_Jerom_CC-BY-SA-3.0", "gamesprite");
        var layer1 = this.map.createLayer("floor");
        layer1.resizeWorld();
        this.map.setCollision(250, true, "collision");
        console.log(this.map);
        // this.game.physics.p2.convertTilemap(this.map, "collision");
        // @ts-ignore
        if (this.map.objects.object) {
            // @ts-ignore
            var objs = this.map.objects.object;
            objs.forEach(function (obj) {
                _this.createObj(obj);
            });
        }
    };
    Game.prototype.createObj = function (obj) {
        if (obj.type == "player") {
            this.player = GameObjectManager.Add(obj.x, obj.y, obj.gid - 1);
            return this.player;
        }
        var mapObj = GameObjectManager.Add(obj.x, obj.y, obj.gid - 1);
        return mapObj;
    };
    Game.prototype.create = function () {
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
    };
    Game.prototype.update = function () {
        var playerSpeed = 10;
        if (this.pad1.connected) {
            var leftStickX = this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X);
            var leftStickY = this.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y);
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
        var control = this.game.touchControl;
        var speed = control.speed;
        if (speed.x || speed.y) {
            this.player.spr.angle =
                180 - (Math.atan2(speed.x, speed.y) * 180) / Math.PI;
            this.player.Move(-speed.x / 100, -speed.y / 100);
        }
        if (this.cursors.left.isDown) {
            this.player.Move(-1, 0);
        }
        else if (this.cursors.right.isDown) {
            this.player.Move(1, 0);
        }
        if (this.cursors.up.isDown) {
            this.player.Move(0, -1);
        }
        else if (this.cursors.down.isDown) {
            this.player.Move(0, 1);
        }
        GameObjectManager.Update();
    };
    return Game;
}());
var g_game;
window.onload = function () {
    g_game = new Game();
};
//# sourceMappingURL=game.js.map