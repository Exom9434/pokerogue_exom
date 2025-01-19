import BattleScene from "#app/battle-scene";
import { getPokemonNameWithAffix } from "#app/messages";
import i18next from "i18next";
import { SummonPhase } from "./summon-phase";

export class SummonMissingPhase extends SummonPhase {
  constructor(scene: BattleScene, fieldIndex: integer) {
    super(scene, fieldIndex);
  }

  preSummon(): void {
    this.scene.ui.showText(i18next.t("battle:sendOutPokemon", { pokemonName: getPokemonNameWithAffix(this.getPokemon()) }));
    this.scene.time.delayedCall(250, () => this.summon());
  }
  end(): void {
    // 결과를 JSON 형식으로 콘솔에 출력
    console.log(JSON.stringify(this.getResult(), null, 2));
    super.end();
  }

  /**
   * SummonMissingPhase의 결과를 반환.
   */
  getResult(): object {
    const pokemon = this.getPokemon();
    return {
      phase: "SummonMissingPhase",
      fieldIndex: this.fieldIndex,
      pokemon: getPokemonNameWithAffix(pokemon),
      isSummoned: pokemon.isOnField(),
      status: "completed",
    };
  }
}
