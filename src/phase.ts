import BattleScene from "./battle-scene";

export class Phase {
  protected scene: BattleScene;

  constructor(scene: BattleScene) {
    this.scene = scene;
  }

  start() {
    if (this.scene.abilityBar.shown) {
      this.scene.abilityBar.resetAutoHideTimer();
    }
  }

  end() {
    console.log(JSON.stringify(this.getResult(), null, 2)); // JSON 형식으로 출력
    this.scene.shiftPhase();
  }

  getResult(): object {
    return {
      phase: "Generic Phase",
      status: "completed"
    };
  }
}
