import Pokemon from "#app/field/pokemon";
import { BattlePhase } from "./battle-phase";

type PokemonFunc = (pokemon: Pokemon) => void;

export abstract class FieldPhase extends BattlePhase {
  executeForAll(func: PokemonFunc): void {
    const field = this.scene.getField(true).filter(p => p.summonData);
    field.forEach(pokemon => func(pokemon));
  }
  getResult(): object {
    const field = this.scene.getField(true);
    return {
      phase: "Field Phase",
      status: "completed",
      totalPokemon: field.length,
      pokemonWithSummonData: field.filter(p => p.summonData).length
    };
  }

  end(): void {
    console.log(JSON.stringify(this.getResult(), null, 2)); // JSON 형식으로 로깅
    super.end();
  }
}
