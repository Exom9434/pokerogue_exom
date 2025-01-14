import { PostTurnStatusEffectPhase } from "#app/phases/post-turn-status-effect-phase";
import { Phase } from "#app/phase";
import { BattlerIndex } from "#app/battle";
import BattleScene from "#app/battle-scene";

export class CheckStatusEffectPhase extends Phase {
  private order: BattlerIndex[];
  private postTurnStatusCount: number = 0; // 처리된 상태 효과 수 카운트

  constructor(scene: BattleScene, order: BattlerIndex[]) {
    super(scene);
    this.scene = scene;
    this.order = order;
  }

  start() {
    const field = this.scene.getField();
    for (const o of this.order) {
      if (field[o].status && field[o].status.isPostTurn()) {
        this.scene.unshiftPhase(new PostTurnStatusEffectPhase(this.scene, o));
        this.postTurnStatusCount++; // 상태 효과가 있는 포켓몬 수 증가
      }
    }
    this.end();
  }

  getResult(): object {
    return {
      phase: "Check Status Effect Phase",
      status: "completed",
      totalBattlersChecked: this.order.length,
      postTurnStatusCount: this.postTurnStatusCount
    };
  }

  end(): void {
    console.log(JSON.stringify(this.getResult(), null, 2)); // JSON 형식으로 결과 출력
    super.end();
  }
}
