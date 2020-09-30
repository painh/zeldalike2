var InputControl;
(function (InputControl) {
    var game = null;
    var cursors;
    var touchesDown = [];
    function Init(g) {
        game = g;
        var graphics = game.add.graphics(0, 0);
        var size = 25;
        var startY = 160;
        var startX = 0;
        var x = startX, y = startY;
        for (var i = 0; i < 9; i++) {
            if (i % 2) {
                graphics.lineStyle(1, 0x00ff00, 1.0);
                graphics.drawRect(x + 0.5, y + 0.5, size, size);
            }
            if (i > 0 && (i + 1) % 3 == 0) {
                x = startX;
                y += size;
            }
            else
                x += size;
        }
        cursors = game.input.keyboard.createCursorKeys();
    }
    InputControl.Init = Init;
    function Update() {
        var size = 25;
        var startY = 161;
        var startX = 1;
        var x = startX, y = startY;
        for (var i = 0; i < 9; i++) {
            touchesDown[i] = false;
            if (i % 2) {
                if (game.input.x >= x &&
                    game.input.y >= y &&
                    game.input.x <= x + size &&
                    game.input.y <= y + size &&
                    game.input.pointer1.isDown) {
                    touchesDown[i] = true;
                }
            }
            if (i > 0 && (i + 1) % 3 == 0) {
                x = startX;
                y += size;
            }
            else
                x += size;
        }
        //game.input.pointer1.isUp
        //game.input.pointer1.isDown
        //game.input.pointer1.isUp
        // console.log(game.input.pointer1);
    }
    InputControl.Update = Update;
    function LeftDown() {
        if (cursors.left.isDown)
            return true;
        if (touchesDown[3])
            return true;
        return false;
    }
    InputControl.LeftDown = LeftDown;
    function RightDown() {
        if (cursors.right.isDown)
            return true;
        if (touchesDown[5])
            return true;
        return false;
    }
    InputControl.RightDown = RightDown;
    function UpDown() {
        if (cursors.up.isDown)
            return true;
        if (touchesDown[1])
            return true;
        return false;
    }
    InputControl.UpDown = UpDown;
    function DownDown() {
        if (cursors.down.isDown)
            return true;
        if (touchesDown[7])
            return true;
        return false;
    }
    InputControl.DownDown = DownDown;
})(InputControl || (InputControl = {}));
//# sourceMappingURL=inputControl.js.map