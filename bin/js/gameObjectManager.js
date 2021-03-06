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
    static GetNameCnt(name) {
        let cnt = 0;
        GameObjectManager.list.forEach((e) => {
            if (e.name == name)
                cnt++;
        });
        return cnt;
    }
    static Init(game) {
        GameObjectManager.game = game;
    }
    static Add(objX, objY, name, frame, owner) {
        let obj = null;
        switch (name) {
            case "player":
                obj = new Player(GameObjectManager.game.game, objX, objY, name, frame, owner);
                break;
            case "playerAttack":
                obj = new PlayerAttack(GameObjectManager.game.game, objX, objY, name, frame, owner);
                break;
            default:
                obj = new GameObject(GameObjectManager.game.game, objX, objY, name, frame, owner);
                break;
        }
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
    }
    static Move(gameObj) {
        if (gameObj.isDead)
            return false;
        if (gameObj.moved)
            return false;
        if (gameObj.GetMag() == 0)
            return false;
        if (gameObj.weight == 255)
            return false;
        let fx = gameObj.force.x;
        let fy = gameObj.force.y;
        const newRect = gameObj.GetRect(fx, fy);
        const colList = GameObjectManager.CheckCollision(newRect, gameObj, true);
        if (colList.length == 0 && gameObj.CanMove()) {
            const moveVector = new Vector(fx, fy);
            if (moveVector.getMagnitude() >= 1)
                moveVector.setMagnitude(1);
            gameObj.x = gameObj.spr.x += moveVector.x;
            gameObj.y = gameObj.spr.y += moveVector.y;
            gameObj.moved = true;
            GameObjectManager.objMoved = true;
            console.log(this.name);
            return true;
        }
        for (let i in colList) {
            const targetObj = colList[i];
            if (!GameObjectManager.CollisionChecked(targetObj, gameObj)) {
                GameObjectManager.RegisterCollisionChecked(targetObj, gameObj);
                targetObj.AddForce(fx, fy, gameObj, "checkCollision", false);
                GameObjectManager.Move(targetObj);
            }
        }
        return false;
    }
    static PUpdate() {
        while (true) {
            GameObjectManager.objMoved = false;
            GameObjectManager.list.forEach((srcObj) => {
                GameObjectManager.Move(srcObj);
            });
            if (GameObjectManager.objMoved)
                continue;
            break;
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
    static AfterUpdate() {
        GameObjectManager.list.forEach((e, k, list) => {
            e.AfterUpdate();
        });
    }
    static CheckCollision(checkRect, me, checkOwner) {
        const list = [];
        this.list.forEach((e) => {
            if (e == me)
                return;
            if (checkOwner && (me.owner == e || e.owner == me)) {
                console.log(e.name, me.name, "owner!");
                return;
            }
            if (CheckCollision(checkRect, e.GetRect(0, 0)))
                list.push(e);
        });
        return list;
    }
}
GameObjectManager.list = [];
GameObjectManager.sprName = "gamesprite";
GameObjectManager.checkedList = [];
//# sourceMappingURL=gameObjectManager.js.map