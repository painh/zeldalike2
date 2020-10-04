class PlayerAttack extends GameObject {
    constructor(game, objX, objY, name, frame, owner) {
        super(game, objX, objY, name, frame, owner);
        const thick = 5;
        this.spr.destroy();
        if (owner.dir == 2 /* UP */ || owner.dir == 0 /* DOWN */)
            this.rect = [thick, 0, 16 - thick * 2, 16];
        else
            this.rect = [0, thick, 16, 16 - thick * 2];
        this.x -= this.rect[0] + this.rect[2] / 2;
        this.y -= this.rect[1] + this.rect[3] / 2;
        this.colRect.destroy();
        this.colRect = game.add.graphics(this.x - TILE_SIZE / 2, this.y - TILE_SIZE / 2);
        this.DrawColRect(0xff0000);
        const power = 10;
        switch (owner.dir) {
            case 1 /* LEFT */:
                this.force = new Force(-power, 0, owner, "attack-L");
                break;
            case 3 /* RIGHT */:
                this.force = new Force(power, 0, owner, "attack-R");
                break;
            case 2 /* UP */:
                this.force = new Force(0, -power, owner, "attack-U");
                break;
            case 0 /* DOWN */:
                this.force = new Force(0, power, owner, "attack-D");
                break;
        }
    }
    CanMove() {
        return false;
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
}
class Player extends GameObject {
}
//# sourceMappingURL=player.js.map