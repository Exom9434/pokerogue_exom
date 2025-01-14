import BattleScene from "#app/battle-scene";
import { BattlerIndex } from "#app/battle";
import { CommonAnim, CommonBattleAnim } from "#app/data/battle-anims";
import { PokemonPhase } from "./pokemon-phase";

export class CommonAnimPhase extends PokemonPhase {
  private anim: CommonAnim | null;
  private targetIndex: integer | undefined;
  private playOnEmptyField: boolean;

  constructor(scene: BattleScene, battlerIndex?: BattlerIndex, targetIndex?: BattlerIndex | undefined, anim?: CommonAnim, playOnEmptyField: boolean = false) {
    super(scene, battlerIndex);

    this.anim = anim!;
    this.targetIndex = targetIndex;
    this.playOnEmptyField = playOnEmptyField;
  }

  setAnimation(anim: CommonAnim) {
    this.anim = anim;
  }

  start() {
    const target = this.targetIndex !== undefined ? (this.player ? this.scene.getEnemyField() : this.scene.getPlayerField())[this.targetIndex] : this.getPokemon();

    // 애니메이션 시작
    new CommonBattleAnim(this.anim, this.getPokemon(), target).play(this.scene, false, () => {
      console.log("Animation completed."); // 애니메이션 완료 메시지
      this.end();
    });
  }

  end() {
    // 공격자 포켓몬 정보
    const attacker = this.getPokemon();
    const attackerInfo = attacker ? { name: attacker.getName(), hp: attacker.getHP(), status: attacker.getStatus() } : { name: "Unknown", hp: 0, status: "fainted" };

    // 대상 포켓몬 정보
    const target = this.targetIndex !== undefined ? (this.player ? this.scene.getEnemyField() : this.scene.getPlayerField())[this.targetIndex] : null;
    const targetInfo = target ? { name: target.getName(), hp: target.getHP(), status: target.getStatus() } : { name: "None", hp: 0, status: "none" };

    // 결과 출력
    const result = {
      phase: "Common Anim Phase",
      attacker: attackerInfo,
      target: targetInfo,
      animation: this.anim ? this.anim.toString() : "None",
      playOnEmptyField: this.playOnEmptyField
    };

    console.log(JSON.stringify(result, null, 2)); // 결과 출력
    super.end(); // 기존 종료 동작 호출
  }
}
