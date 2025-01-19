import BattleScene from "#app/battle-scene";
import { PlayerGender } from "#app/enums/player-gender";
import { BattlePhase } from "./battle-phase";

export class ShowTrainerPhase extends BattlePhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    this.scene.trainer.setVisible(true);

    this.scene.trainer.setTexture(`trainer_${this.scene.gameData.gender === PlayerGender.FEMALE ? "f" : "m"}_back`);

    this.scene.tweens.add({
      targets: this.scene.trainer,
      x: 106,
      duration: 1000,
      onComplete: () => this.end()
    });
  }

  /**
   * Logs the result when the phase ends.
   */
  end() {
    console.log(JSON.stringify(this.getResult(), null, 2)); // Log the result
    super.end();
  }

  /**
   * Returns the result of this phase.
   */
  getResult(): object {
    return {
      phase: "ShowTrainerPhase",
      status: "completed",
      trainerVisible: this.scene.trainer.visible,
      trainerTexture: this.scene.trainer.texture.key,
      trainerPositionX: this.scene.trainer.x,
      playerGender: this.scene.gameData.gender === PlayerGender.FEMALE ? "Female" : "Male"
    };
  }
}
