import BattleScene from "#app/battle-scene";
import { Phase } from "#app/phase";
import { Mode } from "#app/ui/ui";

export class EndEvolutionPhase extends Phase {

  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    this.scene.ui.setModeForceTransition(Mode.MESSAGE).then(() => this.end());
  }

  override end() {
    // 결과 객체 생성
    const result = {
      phase: "End Evolution Phase",
      status: "Evolution completed"
    };
    // 결과 출력
    console.log(JSON.stringify(result, null, 2));

    super.end();
  }
}
