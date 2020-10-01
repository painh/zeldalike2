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
}

class GameObject {
  x: number;
  y: number;
  spd: number;
  tx: number;
  ty: number;
  spr: Phaser.Sprite;
  colRect: Phaser.Graphics;
  forces: Vector[] = [];
  weight: number;
  rect: number[] = [];
  name: string;
  createAt: number;
  lifeTimeMS: number = 0;
  isDead: boolean = false;
  dir: DIR = DIR.DOWN;
  state: OBJ_STATE = OBJ_STATE.IDLE;

  constructor(
    game: Phaser.Game,
    objX: number,
    objY: number,
    name: string,
    frame: number
  ) {
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

    console.log(this);
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
        return (this.spr.angle = -90);
      case DIR.RIGHT:
        return (this.spr.angle = 180);
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

  Move(x, y) {
    if (this.weight == 255) return;

    this.forces.push(new Vector(x, y));
  }

  Update() {
    if (this.isDead) {
      return;
    }
    if (this.lifeTimeMS != 0) {
      if (Date.now() - this.createAt >= this.lifeTimeMS) {
        this.isDead = true;
        return true;
      }
    }
    let fx = 0;
    let fy = 0;
    let allf = 0;
    if (this.forces.length == 0) return;

    this.forces.forEach((e, k, list) => {
      fx += e.x;
      fy += e.y;

      const mag = e.getMagnitude() - this.weight;

      if (mag <= 0) {
        list.splice(k, 1);
      } else e.setMagnitude(mag);
    });

    const newRect = this.GetRect();
    newRect.x = this.x + fx;
    newRect.y = this.y + fy;

    const list: GameObject[] = GameObjectManager.CheckCollision(newRect, this);

    if (list.length == 0) {
      this.x = this.spr.x += fx;
      this.y = this.spr.y += fy;

      this.colRect.x = this.x - TILE_SIZE / 2;
      this.colRect.y = this.y - TILE_SIZE / 2;
    } else {
      list.forEach((e) => {
        e.Move(fx, fy);
      });
    }
  }
}

class Player {}
