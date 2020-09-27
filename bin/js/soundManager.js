var SoundManager;
(function (SoundManager) {
    var ininted = false;
    function Init(soundList) {
        if (ininted) {
            console.log("sound manager init skip");
            return;
        }
        soundList.forEach(function (e) {
            createjs.Sound.registerSound(soundList.id, soundList.path);
        });
        console.log("sound manager init finished");
    }
    SoundManager.Init = Init;
    function Play(id) {
        createjs.Sound.play(id);
    }
    SoundManager.Play = Play;
})(SoundManager || (SoundManager = {}));
//# sourceMappingURL=soundManager.js.map