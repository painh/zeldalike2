class GameObjectManager {
  static list: GameObject[] = [];
  static game: Game;
  static sprName: string = "gamesprite";
  static checkedList = [];
  static objMoved: boolean;

  static MakeKey(obj1: GameObject, obj2: GameObject) {
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

  static RegisterCollisionChecked(obj1: GameObject, obj2: GameObject) {
    const key = GameObjectManager.MakeKey(obj1, obj2);
    GameObjectManager.checkedList[key] = true;
  }

  static CollisionChecked(obj1: GameObject, obj2: GameObject) {
    const key = GameObjectManager.MakeKey(obj1, obj2);
    return GameObjectManager.checkedList[key];
  }

  static Init(game: Game) {
    GameObjectManager.game = game;
  }
  static Add(
    objX: number,
    objY: number,
    name: string,
    frame: number,
    owner: GameObject
  ): GameObject {
    let obj = null;

    switch (name) {
      case "player":
        obj = new Player(GameObjectManager.game.game, objX, objY, name, frame);
        break;

      case "playerAttack":
        obj = new PlayerAttack(
          GameObjectManager.game.game,
          objX,
          objY,
          name,
          frame,
          owner
        );
        break;

      default:
        obj = new GameObject(
          GameObjectManager.game.game,
          objX,
          objY,
          name,
          frame
        );

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
      } else {
        moveList.push(e);
      }
    });
  }

  static Move(gameObj: GameObject): boolean {
    if (gameObj.isDead) return false;
    if (gameObj.moved) return false;
    if (gameObj.GetMag() == 0) return false;
    if (gameObj.weight == 255) return false;

    let fx = gameObj.force.x;
    let fy = gameObj.force.y;
    const newRect = gameObj.GetRect(fx, fy);
    const colList: GameObject[] = GameObjectManager.CheckCollision(
      newRect,
      gameObj
    );

    if (colList.length == 0) {
      gameObj.x = gameObj.spr.x += fx;
      gameObj.y = gameObj.spr.y += fy;
      gameObj.moved = true;
      GameObjectManager.objMoved = true;

      return true;
    }

    for (let i in colList) {
      const targetObj: GameObject = colList[i];

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

      GameObjectManager.list.forEach((srcObj: GameObject) => {
        GameObjectManager.Move(srcObj);
      });

      if (GameObjectManager.objMoved) continue;
      break;
    }

    GameObjectManager.list.forEach((gameObj) => {
      const thismag = gameObj.force.getMagnitude();
      let mag: number = thismag - gameObj.weight;

      gameObj.colRect.x = Math.round(gameObj.x - TILE_SIZE / 2);
      gameObj.colRect.y = Math.round(gameObj.y - TILE_SIZE / 2);

      if (mag <= 0.5) {
        mag = 0;
      }
      gameObj.force.setMagnitude(mag);
    });
  }

  // static PUpdate() {
  //   let moveList = [];
  //   GameObjectManager.list.forEach((e, k, list) => {
  //     if (!e.isDead) {
  //       moveList.push(e);
  //     }
  //   });

  //   let cnt = 0;
  //   while (cnt < 10) {
  //     cnt++;
  //     moveList.forEach((srcObj: GameObject, k, objList) => {
  //       let fx = srcObj.force.x;
  //       let fy = srcObj.force.y;
  //       if (fx == 0 && fy == 0) return;
  //       const newRect = srcObj.GetRect(fx, fy);
  //       const colList: GameObject[] = GameObjectManager.CheckCollision(
  //         newRect,
  //         srcObj
  //       );
  //       colList.forEach((targetObj) => {
  //         if (GameObjectManager.CollisionChecked(targetObj, srcObj)) return;
  //         GameObjectManager.RegisterCollisionChecked(targetObj, srcObj);
  //         targetObj.AddForce(fx, fy, srcObj, "checkCollision", false);
  //       });
  //       if (colList.length == 0) {
  //         srcObj.x = srcObj.spr.x += fx;
  //         srcObj.y = srcObj.spr.y += fy;
  //         srcObj.moved = true;

  //         objList.splice(k, 1);
  //       }
  //     });

  //     if (moveList.length == 0) break;

  //     // if (GameObjectManager.CheckMoveDone()) cnt = 99;
  //   }

  //   GameObjectManager.list.forEach((gameObj) => {
  //     const thismag = gameObj.force.getMagnitude();
  //     let mag: number = thismag - gameObj.weight;

  //     gameObj.colRect.x = Math.round(gameObj.x - TILE_SIZE / 2);
  //     gameObj.colRect.y = Math.round(gameObj.y - TILE_SIZE / 2);

  //     if (mag <= 0.5) {
  //       mag = 0;
  //     }
  //     gameObj.force.setMagnitude(mag);
  //   });
  // }

  static AfterUpdate() {
    GameObjectManager.list.forEach((e, k, list) => {
      e.AfterUpdate();
    });
  }

  static CheckMoveDone() {
    let done = true;
    GameObjectManager.list.forEach((e) => {
      if (!done) return;
      if (!e.MoveDoneThisFrame()) done = false;
    });

    return done;
  }

  static CheckCollision(checkRect: any, me: GameObject): GameObject[] {
    const list = [];
    this.list.forEach((e) => {
      if (e == me) return;
      if (CheckCollision(checkRect, e.GetRect(0, 0))) list.push(e);
    });

    return list;
  }
}