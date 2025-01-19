import BattleScene from "#app/battle-scene";
import { BattlerIndex } from "#app/battle";
import { BattlerTagLapseType } from "#app/data/battler-tags";
import { PokemonPhase } from "./pokemon-phase";

export class MoveEndPhase extends PokemonPhase {
  constructor(scene: BattleScene, battlerIndex: BattlerIndex) {
    super(scene, battlerIndex);
  }

  start() {
    super.start();

    const pokemon = this.getPokemon();
    if (pokemon.isActive(true)) {
      pokemon.lapseTags(BattlerTagLapseType.AFTER_MOVE);
    }

    this.scene.arena.setIgnoreAbilities(false);

    this.end();
  }
  public override end(): void {
    const pokemon = this.getPokemon();
    const phaseResult = {
      phase: this.getPhaseName(),
      status: "completed",
      pokemon: pokemon ? pokemon.getName() : "Unknown",
      battlerIndex: this.battlerIndex,
    };

    // 콘솔에 Phase 결과를 JSON 형태로 기록
    console.log(JSON.stringify(phaseResult, null, 2));

    super.end();
  }

  /**
   * Phase 이름을 반환하는 메서드
   */
  protected override getPhaseName(): string {
    return "MoveEndPhase";
  }
}
