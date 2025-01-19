import BattleScene from "#app/battle-scene";
import { BattlerIndex } from "#app/battle";
import { PokemonPhase } from "./pokemon-phase";

export class ShowAbilityPhase extends PokemonPhase {
  private passive: boolean;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, passive: boolean = false) {
    super(scene, battlerIndex);

    this.passive = passive;
  }

  start() {
    super.start();

    const pokemon = this.getPokemon();

    if (pokemon) {
      this.scene.abilityBar.showAbility(pokemon, this.passive);

      if (pokemon?.battleData) {
        pokemon.battleData.abilityRevealed = true;
      }
    }

    this.end();
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
    const pokemon = this.getPokemon();
    return {
      phase: "ShowAbilityPhase",
      status: "completed",
      pokemon: pokemon ? pokemon.getName() : "None",
      ability: pokemon?.getAbility()?.name || "Unknown",
      passive: this.passive,
      abilityRevealed: pokemon?.battleData?.abilityRevealed || false,
    };
  }
}
