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
    let less, greater;
    if (obj1.idx < obj2.idx) {
      less = obj1.idx;
      greater = obj2.idx;
    } else {
      less = obj2.idx;
      greater = obj1.idx;
    }

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
    GameObjectManager.list.forEach((e, k, list) => {
      e.Update();
      if (e.isDead) {
        e.Release();
        list.splice(k, 1);
      }
    });
  }

  static CheckCollision(checkRect: any, me: GameObject): GameObject[] {
    const list = [];
    this.list.forEach((e) => {
      if (e == me) return;
      if (CheckCollision(checkRect, e.GetRect())) list.push(e);
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
    this.colRect.lineStyle(1, 0x00ff00, 1);

    this.colRect.drawRect(
      this.rect[0] + 0.5,
      this.rect[1] + 0.5,
      this.rect[2] - 1,
      this.rect[3] - 1
    );

    this.createAt = Date.now();
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

  GetRect() {
    return {
      x: this.x + STATIC_OBJ[this.name].rect[0],
      y: this.y + STATIC_OBJ[this.name].rect[1],
      width: this.rect[2],
      height: this.rect[3],
    };
  }

  AddForce(x: number, y: number, forceGiver: GameObject, reason: string) {
    if (this.weight == 255) return;
    console.log(`${x}, ${y} ${forceGiver.name} -> ${this.name} ${reason}`);

    this.force.x += x;
    this.force.y += y;
  }

  GetMag(): number {
    let mag = 0;
    return this.force.getMagnitude();
  }

  Update() {
    if (this.isDead) {
      return;
    }
    if (this.lifeTimeMS != 0) {
      if (Date.now() - this.createAt >= this.lifeTimeMS) {
        this.isDead = true;
        this.state = OBJ_STATE.DEAD;
        return true;
      }
    }

    const thismag = this.force.getMagnitude();

    if (thismag == 0) {
      this.state = OBJ_STATE.IDLE;
    } else {
      this.state = OBJ_STATE.MOVE;
    }

    let fx = this.force.x;
    let fy = this.force.y;
    let mag: number = thismag - this.weight;

    if (mag <= 0.5) {
      mag = 0;
    }
    this.force.setMagnitude(mag);

    const newRect = this.GetRect();
    newRect.x = this.x + fx;
    newRect.y = this.y + fy;

    const list: GameObject[] = GameObjectManager.CheckCollision(newRect, this);
    let newObject = false;

    list.forEach((e) => {
      if (GameObjectManager.CollisionChecked(e, this)) return;
      GameObjectManager.RegisterCollisionChecked(e, this);
      newObject = true;

      e.AddForce(fx, fy, this, "checkCollision");
    });

    if (!newObject) {
      this.x = this.spr.x += fx;
      this.y = this.spr.y += fy;

      this.colRect.x = Math.round(this.x - TILE_SIZE / 2);
      this.colRect.y = Math.round(this.y - TILE_SIZE / 2);
      this.state = OBJ_STATE.MOVE;
    }
  }
}

class Player {}
