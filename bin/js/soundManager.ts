declare var createjs: any;
namespace SoundManager {
  let ininted: boolean = false;

  export function Init(soundList) {
    if (ininted) {
      console.log("sound manager init skip");
      return;
    }

    soundList.forEach((e) => {
      createjs.Sound.registerSound(soundList.id, soundList.path);
    });

    console.log("sound manager init finished");
  }

  export function Play(id: string) {
    createjs.Sound.play(id);
  }
}
