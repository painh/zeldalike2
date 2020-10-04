function CheckCollision(r1, r2) {
    if (r1.x < r2.x + r2.width &&
        r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y) {
        return true;
    }
    return false;
}
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
    constructor(game, objX, objY, name, frame, owner) {
        this.rect = [];
        this.lifeTimeMS = 0;
        this.isDead = false;
        this.dir = 0 /* DOWN */;
        this.state = 0 /* IDLE */;
        this.moved = false;
        this.idx = 0;
        this.idx = GameObject.sidx++;
        this.owner = owner;
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
        this.DrawColRect(0x00ff00);
        this.createAt = Date.now();
    }
    DrawColRect(color) {
        this.colRect.lineStyle(1, color, 1);
        this.colRect.drawRect(this.rect[0] + 0.5, this.rect[1] + 0.5, this.rect[2] - 1, this.rect[3] - 1);
    }
    Release() {
        this.spr.destroy();
        this.colRect.destroy();
    }
    SetDir(dir) {
        this.dir = dir;
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
        if (!this.CanMove()) {
            fx = 0;
            fy = 0;
        }
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
        // this.SetState(OBJ_STATE.MOVE);
    }
    GetMag() {
        return this.force.getMagnitude();
    }
    Moveable() {
        if (this.weight == 255)
            return false;
        let fx = this.force.x;
        let fy = this.force.y;
        const newRect = this.GetRect(fx, fy);
        const list = GameObjectManager.CheckCollision(newRect, this, true);
        if (list.length == 0)
            return true;
        let moveable = true;
        list.forEach((e) => {
            if (e.weight == 255)
                moveable = false;
        });
        return moveable;
    }
    SetState(state) {
        if (this.state == state)
            return;
        // console.log(
        //   GameObjectManager.game.frame,
        //   this.idx,
        //   this.name,
        //   this.idx,
        //   state
        // );
        this.state = state;
        switch (state) {
            case 0 /* IDLE */:
                this.DrawColRect(0x00ff00);
                break;
            case 2 /* MOVE */:
                this.DrawColRect(0x0000ff);
                break;
            case 1 /* ATTACK */:
                this.DrawColRect(0xff0000);
                break;
            case 3 /* DEAD */:
                this.DrawColRect(0x333333);
                break;
        }
    }
    Update() {
        if (this.isDead) {
            return;
        }
        this.moved = false;
        if (this.lifeTimeMS != 0) {
            if (Date.now() - this.createAt >= this.lifeTimeMS) {
                this.isDead = true;
                this.SetState(3 /* DEAD */);
                return true;
            }
        }
        // console.log("player", this.force.getMagnitude(), this.state);
    }
    AfterUpdate() {
        if (this.moved == true) {
            this.SetState(2 /* MOVE */);
        }
        else {
            this.SetState(0 /* IDLE */);
        }
    }
    CanAttack() {
        if (this.state == 0 /* IDLE */ || this.state == 2 /* MOVE */)
            return true;
        return false;
    }
    CanMove() {
        if (this.state == 0 /* IDLE */ || this.state == 2 /* MOVE */)
            return true;
        return false;
    }
    GetAttackX() {
        const rect = this.GetRect(0, 0);
        switch (this.dir) {
            case 0 /* DOWN */:
            case 2 /* UP */:
                return rect.x + rect.width / 2;
            case 1 /* LEFT */:
                return rect.x;
            case 3 /* RIGHT */:
                return rect.x + rect.width;
        }
    }
    GetAttackY() {
        const rect = this.GetRect(0, 0);
        switch (this.dir) {
            case 1 /* LEFT */:
            case 3 /* RIGHT */:
                return rect.y + rect.height / 2;
            case 2 /* UP */:
                return rect.y;
            case 0 /* DOWN */:
                return rect.y + rect.height;
        }
    }
}
GameObject.sidx = 0;
//# sourceMappingURL=gameObject.js.map