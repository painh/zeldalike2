function CheckCollision(r1, r2) {
  if (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  ) {
    return true;
  }

  return false;
}
class GameObjectManager {
  static list: GameObject[] = [];
  static game: Game;
  static sprName: string = "gamesprite";
  static checkedList = [];

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
    frame: number
  ): GameObject {
    const obj = new GameObject(
      GameObjectManager.game.game,
      objX,
      objY,
      name,
      frame
    );
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

  static PUpdate() {
    let moveList = [];
    GameObjectManager.list.forEach((e, k, list) => {
      if (!e.isDead) {
        moveList.push(e);
      }
    });

    let cnt = 0;
    while (cnt < 5) {
      cnt++;
      moveList.forEach((srcObj: GameObject, k, objList) => {
        let fx = srcObj.force.x;
        let fy = srcObj.force.y;
        if (srcObj.GetMag() == 0) return;
        const newRect = srcObj.GetRect(fx, fy);
        const colList: GameObject[] = GameObjectManager.CheckCollision(
          newRect,
          srcObj
        );
        colList.forEach((targetObj) => {
          if (GameObjectManager.CollisionChecked(targetObj, srcObj)) return;
          GameObjectManager.RegisterCollisionChecked(targetObj, srcObj);
          targetObj.AddForce(fx, fy, srcObj, "checkCollision", false);
        });
        if (colList.length == 0) {
          srcObj.x = srcObj.spr.x += fx;
          srcObj.y = srcObj.spr.y += fy;
          srcObj.moved = true;

          srcObj.SetState(OBJ_STATE.MOVE);

          objList.splice(k, 1);
        }
      });

      if (moveList.length == 0) break;

      // if (GameObjectManager.CheckMoveDone()) cnt = 99;
    }
    console.log(moveList.length);

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

const enum DIR {
  DOWN = 0,
  LEFT = 1,
  UP = 2,
  RIGHT = 3,
}

const enum OBJ_STATE {
  IDLE = 0,
  ATTACK = 1,
  MOVE = 2,
  DEAD = 3,
}

class Force extends Vector {
  giver: GameObject;
  reason: string;
  constructor(x: number, y: number, owner: GameObject, reason: string) {
    super(x, y);
    this.giver = owner;
    this.reason = reason;
  }
}

class GameObject {
  x: number;
  y: number;
  spd: number;
  tx: number;
  ty: number;
  spr: Phaser.Sprite;
  colRect: Phaser.Graphics;
  // forces: Force[] = [];
  force: Force;
  weight: number;
  rect: number[] = [];
  name: string;
  createAt: number;
  lifeTimeMS: number = 0;
  isDead: boolean = false;
  dir: DIR = DIR.DOWN;
  state: OBJ_STATE = OBJ_STATE.IDLE;
  moved: boolean = false;

  static sidx: number = 0;
  idx: number = 0;

  constructor(
    game: Phaser.Game,
    objX: number,
    objY: number,
    name: string,
    frame: number
  ) {
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

    this.colRect = game.add.graphics(
      this.x - TILE_SIZE / 2,
      this.y - TILE_SIZE / 2
    );

    this.DrawColRect(0x00ff00);
    this.createAt = Date.now();
  }

  DrawColRect(color) {
    this.colRect.lineStyle(1, color, 1);

    this.colRect.drawRect(
      this.rect[0] + 0.5,
      this.rect[1] + 0.5,
      this.rect[2] - 1,
      this.rect[3] - 1
    );
  }

  Release() {
    this.spr.destroy();
    this.colRect.destroy();
  }

  SetDir(dir: DIR) {
    switch (dir) {
      case DIR.DOWN:
        return (this.spr.angle = 0);
      case DIR.LEFT:
        return (this.spr.angle = 90);
      case DIR.UP:
        return (this.spr.angle = 180);
      case DIR.RIGHT:
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

  AddForce(
    x: number,
    y: number,
    forceGiver: GameObject,
    reason: string,
    setOp
  ) {
    if (this.weight == 255) return;
    // console.log(`${x}, ${y} ${forceGiver.name} -> ${this.name} ${reason}`);

    if (setOp) {
      this.force.x = x;
      this.force.y = y;
    } else {
      this.force.x += x;
      this.force.y += y;
    }

    this.SetState(OBJ_STATE.MOVE);
  }

  GetMag(): number {
    return this.force.getMagnitude();
  }

  Moveable(): boolean {
    if (this.weight == 255) return false;

    let fx = this.force.x;
    let fy = this.force.y;

    const newRect = this.GetRect(fx, fy);

    const list: GameObject[] = GameObjectManager.CheckCollision(newRect, this);

    if (list.length == 0) return true;
    let moveable = true;
    list.forEach((e) => {
      if (e.weight == 255) moveable = false;
    });

    return moveable;
  }

  MoveDoneThisFrame(): boolean {
    if (this.weight == 255) return true;

    let fx = this.force.x;
    let fy = this.force.y;

    if (fx == 0 || fy == 0) return true;

    const newRect = this.GetRect(fx, fy);

    const list: GameObject[] = GameObjectManager.CheckCollision(newRect, this);

    if (list.length == 0) return true;
    let moveable = true;
    list.forEach((e) => {
      if (e.weight == 255) moveable = false;
    });

    return moveable;
  }

  SetState(state: OBJ_STATE) {
    if (this.state == state) return;
    this.state = state;
    switch (state) {
      case OBJ_STATE.IDLE:
        this.DrawColRect(0x00ff00);
        break;
      case OBJ_STATE.MOVE:
        this.DrawColRect(0x0000ff);
        break;
      case OBJ_STATE.ATTACK:
        this.DrawColRect(0xff0000);
        break;
      case OBJ_STATE.DEAD:
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
        this.SetState(OBJ_STATE.DEAD);
        return true;
      }
    }

    // console.log("player", this.force.getMagnitude(), this.state);
    if (this.force.getMagnitude() == 0) {
      this.SetState(OBJ_STATE.IDLE);
    }
  }

  CanAttack() {
    if (this.state == OBJ_STATE.IDLE || this.state == OBJ_STATE.MOVE)
      return true;

    return false;
  }

  CanMove() {
    if (this.state == OBJ_STATE.IDLE || this.state == OBJ_STATE.MOVE)
      return true;

    return false;
  }
}
