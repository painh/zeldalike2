function CheckCollision(r1, r2) {
    if (r1.x < r2.x + r2.width &&
        r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y) {
        return true;
    }
    return false;
}
class GameObjectManager {
    static MakeKey(obj1, obj2) {
        // let less, greater;
        // if (obj1.idx < obj2.idx) {
        //   less = obj1.idx;
        //   greater = obj2.idx;
        // } else {
        //   less = obj2.idx;
        //   greater = obj1.idx;
        // }
        const less = obj1.idx;
        const greater = obj2.idx;
        return `${less}-${greater}`;
    }
    static RegisterCollisionChecked(obj1, obj2) {
        const key = GameObjectManager.MakeKey(obj1, obj2);
        GameObjectManager.checkedList[key] = true;
    }
    static CollisionChecked(obj1, obj2) {
        const key = GameObjectManager.MakeKey(obj1, obj2);
        return GameObjectManager.checkedList[key];
    }
    static Init(game) {
        GameObjectManager.game = game;
    }
    static Add(objX, objY, name, frame) {
        const obj = new GameObject(GameObjectManager.game.game, objX, objY, name, frame);
        GameObjectManager.list.push(obj);
        return obj;
    }
    static Update() {
        GameObjectManager.checkedList = [];
        InputControl.Update();
        let moveList = [];
        GameObjectManager.list.forEach((e, k, list) => {
            e.Update();
            if (e.isDead) {
                e.Release();
                list.splice(k, 1);
            }
            else {
                moveList.push(e);
            }
        });
        let cnt = 0;
        while (cnt < 10) {
            cnt++;
            moveList.forEach((srcObj, k, objList) => {
                let fx = srcObj.force.x;
                let fy = srcObj.force.y;
                if (fx == 0 && fy == 0)
                    return;
                const newRect = srcObj.GetRect(fx, fy);
                const colList = GameObjectManager.CheckCollision(newRect, srcObj);
                colList.forEach((targetObj) => {
                    if (GameObjectManager.CollisionChecked(targetObj, srcObj))
                        return;
                    GameObjectManager.RegisterCollisionChecked(targetObj, srcObj);
                    targetObj.AddForce(fx, fy, srcObj, "checkCollision", false);
                });
                if (colList.length == 0) {
                    srcObj.x = srcObj.spr.x += fx;
                    srcObj.y = srcObj.spr.y += fy;
                    objList.splice(k, 1);
                }
            });
            if (moveList.length == 0)
                break;
            // if (GameObjectManager.CheckMoveDone()) cnt = 99;
        }
        GameObjectManager.list.forEach((gameObj) => {
            const thismag = gameObj.force.getMagnitude();
            let mag = thismag - gameObj.weight;
            gameObj.colRect.x = Math.round(gameObj.x - TILE_SIZE / 2);
            gameObj.colRect.y = Math.round(gameObj.y - TILE_SIZE / 2);
            if (mag <= 0.5) {
                mag = 0;
            }
            gameObj.force.setMagnitude(mag);
        });
    }
    static CheckMoveDone() {
        let done = true;
        GameObjectManager.list.forEach((e) => {
            if (!done)
                return;
            if (!e.MoveDoneThisFrame())
                done = false;
        });
        return done;
    }
    static CheckCollision(checkRect, me) {
        const list = [];
        this.list.forEach((e) => {
            if (e == me)
                return;
            if (CheckCollision(checkRect, e.GetRect(0, 0)))
                list.push(e);
        });
        return list;
    }
}
GameObjectManager.list = [];
GameObjectManager.sprName = "gamesprite";
GameObjectManager.checkedList = [];
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
class Force extends Vector {
    constructor(x, y, owner, reason) {
        super(x, y);
        this.giver = owner;
        this.reason = reason;
    }
}
class GameObject {
    constructor(game, objX, objY, name, frame) {
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
            throw Error(`invalid name ${name}`);
        }
        this.weight = STATIC_OBJ[name].weight;
        this.rect = STATIC_OBJ[name].rect;
        this.colRect = game.add.graphics(this.x - TILE_SIZE / 2, this.y - TILE_SIZE / 2);
        this.colRect.lineStyle(1, 0x00ff00, 1);
        this.colRect.drawRect(this.rect[0] + 0.5, this.rect[1] + 0.5, this.rect[2] - 1, this.rect[3] - 1);
        this.createAt = Date.now();
    }
    Release() {
        this.spr.destroy();
        this.colRect.destroy();
    }
    SetDir(dir) {
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
    }
    GetRect(fx, fy) {
        return {
            x: this.x + this.rect[0] + fx,
            y: this.y + this.rect[1] + fy,
            width: this.rect[2],
            height: this.rect[3],
        };
    }
    AddForce(x, y, forceGiver, reason, setOp) {
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
    }
    GetMag() {
        let mag = 0;
        return this.force.getMagnitude();
    }
    Moveable() {
        if (this.weight == 255)
            return false;
        let fx = this.force.x;
        let fy = this.force.y;
        const newRect = this.GetRect(fx, fy);
        const list = GameObjectManager.CheckCollision(newRect, this);
        if (list.length == 0)
            return true;
        let moveable = true;
        list.forEach((e) => {
            if (e.weight == 255)
                moveable = false;
        });
        return moveable;
    }
    MoveDoneThisFrame() {
        if (this.weight == 255)
            return true;
        let fx = this.force.x;
        let fy = this.force.y;
        if (fx == 0 || fy == 0)
            return true;
        const newRect = this.GetRect(fx, fy);
        const list = GameObjectManager.CheckCollision(newRect, this);
        if (list.length == 0)
            return true;
        let moveable = true;
        list.forEach((e) => {
            if (e.weight == 255)
                moveable = false;
        });
        return moveable;
    }
    Update() {
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
        const thismag = this.force.getMagnitude();
        if (thismag == 0) {
            this.state = 0 /* IDLE */;
        }
        else {
            this.state = 2 /* MOVE */;
        }
        // let fx = this.force.x;
        // let fy = this.force.y;
        // let mag: number = thismag - this.weight;
        // const newRect = this.GetRect(fx, fy);
        // const list: GameObject[] = GameObjectManager.CheckCollision(newRect, this);
        // let moveable = true;
        // list.forEach((e) => {
        //   if (GameObjectManager.CollisionChecked(e, this)) return;
        //   GameObjectManager.RegisterCollisionChecked(e, this);
        //   e.AddForce(fx, fy, this, "checkCollision", false);
        //   if (!e.Moveable()) {
        //     moveable = false;
        //     // console.log(`${this.name} -> ${e.name} cant!`);
        //   }
        // });
        // if (moveable) {
        //   this.x = this.spr.x += fx;
        //   this.y = this.spr.y += fy;
        //   this.colRect.x = Math.round(this.x - TILE_SIZE / 2);
        //   this.colRect.y = Math.round(this.y - TILE_SIZE / 2);
        //   this.state = OBJ_STATE.MOVE;
        // }
        // if (mag <= 0.5) {
        //   mag = 0;
        // }
        // this.force.setMagnitude(mag);
    }
}
GameObject.sidx = 0;
//# sourceMappingURL=gameObject.js.map