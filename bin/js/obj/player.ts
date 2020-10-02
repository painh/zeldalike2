class PlayerAttack extends GameObject {
  owner: GameObject;
  constructor(
    game: Phaser.Game,
    objX: number,
    objY: number,
    name: string,
    frame: number,
    owner: GameObject
  ) {
    super(game, objX, objY, name, frame);
    this.owner = owner;

    const thick = 5;

    this.spr.destroy();
    if (owner.dir == DIR.UP || owner.dir == DIR.DOWN)
      this.rect = [thick, 0, 16 - thick * 2, 16];
    else this.rect = [0, thick, 16, 16 - thick * 2];

    console.log(owner.dir);

    this.x -= this.rect[0] + this.rect[2] / 2;
    this.y -= this.rect[1] + this.rect[3] / 2;

    this.colRect.destroy();
    this.colRect = game.add.graphics(
      this.x - TILE_SIZE / 2,
      this.y - TILE_SIZE / 2
    );

    this.DrawColRect(0xff0000);
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
}
class Player extends GameObject {}
