import BattleScene from "#app/battle-scene";
import { BattlerIndex } from "#app/battle";
import Pokemon from "#app/field/pokemon";
import { FieldPhase } from "./field-phase";

export abstract class PokemonPhase extends FieldPhase {
  protected battlerIndex: BattlerIndex | integer;
  public player: boolean;
  public fieldIndex: integer;

  constructor(scene: BattleScene, battlerIndex?: BattlerIndex | integer) {
    super(scene);

    if (battlerIndex === undefined) {
      battlerIndex = scene.getField().find(p => p?.isActive())!.getBattlerIndex(); // TODO: is the bang correct here?
    }

    this.battlerIndex = battlerIndex;
    this.player = battlerIndex < 2;
    this.fieldIndex = battlerIndex % 2;
  }

  getPokemon(): Pokemon {
    if (this.battlerIndex > BattlerIndex.ENEMY_2) {
      return this.scene.getPokemonById(this.battlerIndex)!; // TODO: is this bang correct?
    }
    return this.scene.getField()[this.battlerIndex]!; // TODO: is this bang correct?
  }

  /**
   * 종료 시점에 실행되는 메서드로, Phase 이름과 상태를 로그로 출력
   */
  end() {
    console.log(JSON.stringify({
      phase: this.getPhaseName(),
      status: "completed"
    }, null, 2));

    // 상위 클래스의 end 메서드 호출
    super.end();
  }

  /**
   * Phase 이름을 반환하는 메서드. 서브 클래스에서 오버라이딩하여 사용.
   */
  protected getPhaseName(): string {
    return "PokemonPhase";
  }
}
