import BattleScene from "#app/battle-scene";
import { Phase } from "#app/phase";
import { Mode } from "#app/ui/ui";
import { LoginPhase } from "./login-phase";

export class UnavailablePhase extends Phase {
  private phaseCompleted: boolean = false;

  constructor(scene: BattleScene) {
    super(scene);
  }

  start(): void {
    this.scene.ui.setMode(Mode.UNAVAILABLE, () => {
      this.scene.unshiftPhase(new LoginPhase(this.scene, true));
      this.phaseCompleted = true;
      this.end();
    });
  }

  getResult(): object {
    return {
      phase: "UnavailablePhase",
      mode: "UNAVAILABLE",
      nextPhase: "LoginPhase",
      phaseCompleted: this.phaseCompleted,
      status: "completed",
    };
  }

  end(): void {
    console.log(JSON.stringify(this.getResult(), null, 2)); // Log the phase result
    super.end();
  }
}
