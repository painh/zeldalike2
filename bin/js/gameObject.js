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
    GameObjectManager.Add = function (objX, objY, name, frame) {
        var obj = new GameObject(GameObjectManager.game.game, objX, objY, name, frame);
        GameObjectManager.list.push(obj);
        return obj;
    };
    GameObjectManager.Update = function () {
        InputControl.Update();
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
var GameObject = /** @class */ (function () {
    function GameObject(game, objX, objY, name, frame) {
        this.forces = [];
        this.rect = [];
        this.name = name;
        this.spr = game.add.sprite(objX, objY, GameObjectManager.sprName);
        this.spr.frame = frame;
        this.spr.anchor.set(0.5);
        this.spr.smoothed = false;
        this.x = objX;
        this.y = objY;
        if (!STATIC_OBJ[name]) {
            throw Error("invalid name " + name);
        }
        this.weight = STATIC_OBJ[name].weight;
        this.rect = STATIC_OBJ[name].rect;
        this.colRect = game.add.graphics(0, 0);
        this.colRect.lineStyle(1, 0x00ff00, 1);
        this.colRect.drawRect(this.rect[0] + 0.5, this.rect[1] + 0.5, this.rect[2] - 1, this.rect[3] - 1);
        this.colRect.x = this.x - TILE_SIZE / 2;
        this.colRect.y = this.y - TILE_SIZE / 2;
        console.log(this);
    }
    GameObject.prototype.GetRect = function () {
        return {
            x: this.x + STATIC_OBJ[this.name].rect[0],
            y: this.y + STATIC_OBJ[this.name].rect[1],
            width: this.rect[2],
            height: this.rect[3]
        };
    };
    GameObject.prototype.Move = function (x, y) {
        if (this.weight == 255)
            return;
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
            this.colRect.x = this.x - TILE_SIZE / 2;
            this.colRect.y = this.y - TILE_SIZE / 2;
        }
        else {
            list.forEach(function (e) {
                e.Move(fx, fy);
            });
        }
    };
    return GameObject;
}());
//# sourceMappingURL=gameObject.js.map