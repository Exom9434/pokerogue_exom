import BattleScene from "#app/battle-scene";
import { TrainerSlot } from "#app/data/trainer-config";
import { Phase } from "#app/phase";

export class BattlePhase extends Phase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  showEnemyTrainer(trainerSlot: TrainerSlot = TrainerSlot.NONE): void {
    const sprites = this.scene.currentBattle.trainer?.getSprites()!; // TODO: is this bang correct?
    const tintSprites = this.scene.currentBattle.trainer?.getTintSprites()!; // TODO: is this bang correct?
    for (let i = 0; i < sprites.length; i++) {
      const visible = !trainerSlot || !i === (trainerSlot === TrainerSlot.TRAINER) || sprites.length < 2;
      [ sprites[i], tintSprites[i] ].map(sprite => {
        if (visible) {
          sprite.x = trainerSlot || sprites.length < 2 ? 0 : i ? 16 : -16;
        }
        sprite.setVisible(visible);
        sprite.clearTint();
      });
      sprites[i].setVisible(visible);
      tintSprites[i].setVisible(visible);
      sprites[i].clearTint();
      tintSprites[i].clearTint();
    }
    this.scene.tweens.add({
      targets: this.scene.currentBattle.trainer,
      x: "-=16",
      y: "+=16",
      alpha: 1,
      ease: "Sine.easeInOut",
      duration: 750
    });
  }

  hideEnemyTrainer(): void {
    this.scene.tweens.add({
      targets: this.scene.currentBattle.trainer,
      x: "+=16",
      y: "-=16",
      alpha: 0,
      ease: "Sine.easeInOut",
      duration: 750
    });
  }
  getResult(): object {
    return {
      phase: "Battle Phase",
      status: "completed",
      enemyTrainerVisible: true,
      spritesCount: this.scene.currentBattle.trainer?.getSprites().length || 0
    };
  }

  end(): void {
    console.log(JSON.stringify(this.getResult(), null, 2)); // JSON 형식으로 출력
    super.end();
  }
}
