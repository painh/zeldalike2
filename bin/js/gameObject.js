var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    GameObjectManager.MakeKey = function (obj1, obj2) {
        var less, greater;
        if (obj1.idx < obj2.idx) {
            less = obj1.idx;
            greater = obj2.idx;
        }
        else {
            less = obj2.idx;
            greater = obj1.idx;
        }
        return less + "-" + greater;
    };
    GameObjectManager.RegisterCollisionChecked = function (obj1, obj2) {
        var key = GameObjectManager.MakeKey(obj1, obj2);
        GameObjectManager.checkedList[key] = true;
    };
    GameObjectManager.CollisionChecked = function (obj1, obj2) {
        var key = GameObjectManager.MakeKey(obj1, obj2);
        return GameObjectManager.checkedList[key];
    };
    GameObjectManager.Init = function (game) {
        GameObjectManager.game = game;
    };
    GameObjectManager.Add = function (objX, objY, name, frame) {
        var obj = new GameObject(GameObjectManager.game.game, objX, objY, name, frame);
        GameObjectManager.list.push(obj);
        return obj;
    };
    GameObjectManager.Update = function () {
        GameObjectManager.checkedList = [];
        InputControl.Update();
        GameObjectManager.list.forEach(function (e, k, list) {
            e.Update();
            if (e.isDead) {
                e.Release();
                list.splice(k, 1);
            }
        });
    };
    GameObjectManager.CheckCollision = function (checkRect, me) {
        var list = [];
        this.list.forEach(function (e) {
            if (e == me)
                return;
            if (CheckCollision(checkRect, e.GetRect(0, 0)))
                list.push(e);
        });
        return list;
    };
    GameObjectManager.list = [];
    GameObjectManager.sprName = "gamesprite";
    GameObjectManager.checkedList = [];
    return GameObjectManager;
}());
var DIR;
(function (DIR) {
    DIR[DIR["DOWN"] = 0] = "DOWN";
    DIR[DIR["LEFT"] = 1] = "LEFT";
    DIR[DIR["UP"] = 2] = "UP";
    DIR[DIR["RIGHT"] = 3] = "RIGHT";
})(DIR || (DIR = {}));
var OBJ_STATE;
(function (OBJ_STATE) {
    OBJ_STATE[OBJ_STATE["IDLE"] = 0] = "IDLE";
    OBJ_STATE[OBJ_STATE["ATTACK"] = 1] = "ATTACK";
    OBJ_STATE[OBJ_STATE["MOVE"] = 2] = "MOVE";
    OBJ_STATE[OBJ_STATE["DEAD"] = 3] = "DEAD";
})(OBJ_STATE || (OBJ_STATE = {}));
var Force = /** @class */ (function (_super) {
    __extends(Force, _super);
    function Force(x, y, owner, reason) {
        var _this = _super.call(this, x, y) || this;
        _this.giver = owner;
        _this.reason = reason;
        return _this;
    }
    return Force;
}(Vector));
var GameObject = /** @class */ (function () {
    function GameObject(game, objX, objY, name, frame) {
        this.rect = [];
        this.lifeTimeMS = 0;
        this.isDead = false;
        this.dir = 0 /* DOWN */;
        this.state = 0 /* IDLE */;
        this.idx = 0;
        this.idx = GameObject.sidx++;
        this.force = new Force(0, 0, this, "init");
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
        this.colRect = game.add.graphics(this.x - TILE_SIZE / 2, this.y - TILE_SIZE / 2);
        this.colRect.lineStyle(1, 0x00ff00, 1);
        this.colRect.drawRect(this.rect[0] + 0.5, this.rect[1] + 0.5, this.rect[2] - 1, this.rect[3] - 1);
        this.createAt = Date.now();
    }
    GameObject.prototype.Release = function () {
        this.spr.destroy();
        this.colRect.destroy();
    };
    GameObject.prototype.SetDir = function (dir) {
        switch (dir) {
            case 0 /* DOWN */:
                return (this.spr.angle = 0);
            case 1 /* LEFT */:
                return (this.spr.angle = 90);
            case 2 /* UP */:
                return (this.spr.angle = 180);
            case 3 /* RIGHT */:
                return (this.spr.angle = -90);
        }
    };
    GameObject.prototype.GetRect = function (fx, fy) {
        return {
            x: this.x + this.rect[0] + fx,
            y: this.y + this.rect[1] + fy,
            width: this.rect[2],
            height: this.rect[3]
        };
    };
    GameObject.prototype.AddForce = function (x, y, forceGiver, reason, setOp) {
        if (this.weight == 255)
            return;
        // console.log(`${x}, ${y} ${forceGiver.name} -> ${this.name} ${reason}`);
        if (setOp) {
            this.force.x = x;
            this.force.y = y;
        }
        else {
            this.force.x += x;
            this.force.y += y;
        }
    };
    GameObject.prototype.GetMag = function () {
        var mag = 0;
        return this.force.getMagnitude();
    };
    GameObject.prototype.Moveable = function () {
        if (this.weight == 255)
            return false;
        var thismag = this.force.getMagnitude();
        var fx = this.force.x;
        var fy = this.force.y;
        var newRect = this.GetRect(fx, fy);
        var list = GameObjectManager.CheckCollision(newRect, this);
        return list.length == 0;
    };
    GameObject.prototype.Update = function () {
        var _this = this;
        if (this.isDead) {
            return;
        }
        if (this.lifeTimeMS != 0) {
            if (Date.now() - this.createAt >= this.lifeTimeMS) {
                this.isDead = true;
                this.state = 3 /* DEAD */;
                return true;
            }
        }
        var thismag = this.force.getMagnitude();
        if (thismag == 0) {
            this.state = 0 /* IDLE */;
        }
        else {
            this.state = 2 /* MOVE */;
        }
        var fx = this.force.x;
        var fy = this.force.y;
        var mag = thismag - this.weight;
        var newRect = this.GetRect(fx, fy);
        var list = GameObjectManager.CheckCollision(newRect, this);
        var moveable = true;
        list.forEach(function (e) {
            if (GameObjectManager.CollisionChecked(e, _this))
                return;
            GameObjectManager.RegisterCollisionChecked(e, _this);
            e.AddForce(fx, fy, _this, "checkCollision", false);
            if (!e.Moveable()) {
                moveable = false;
                console.log(_this.name + " -> " + e.name + " cant!");
            }
        });
        if (moveable) {
            this.x = this.spr.x += fx;
            this.y = this.spr.y += fy;
            this.colRect.x = Math.round(this.x - TILE_SIZE / 2);
            this.colRect.y = Math.round(this.y - TILE_SIZE / 2);
            this.state = 2 /* MOVE */;
        }
        if (mag <= 0.5) {
            mag = 0;
        }
        this.force.setMagnitude(mag);
    };
    GameObject.sidx = 0;
    return GameObject;
}());
var Player = /** @class */ (function () {
    function Player() {
    }
    return Player;
}());
//# sourceMappingURL=gameObject.js.map