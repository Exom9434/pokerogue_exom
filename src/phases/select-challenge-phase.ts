import BattleScene from "#app/battle-scene";
import { Phase } from "#app/phase";
import { Mode } from "#app/ui/ui";

export class SelectChallengePhase extends Phase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    this.scene.playBgm("menu");

    this.scene.ui.setMode(Mode.CHALLENGE_SELECT);
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
      phase: "SelectChallengePhase",
      status: "completed",
      bgm: "menu",
      uiMode: Mode.CHALLENGE_SELECT,
    };
  }
}
