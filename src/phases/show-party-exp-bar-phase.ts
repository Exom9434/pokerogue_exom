import BattleScene from "#app/battle-scene";
import { ExpGainsSpeed } from "#app/enums/exp-gains-speed";
import { ExpNotification } from "#app/enums/exp-notification";
import { ExpBoosterModifier } from "#app/modifier/modifier";
import * as Utils from "#app/utils";
import { HidePartyExpBarPhase } from "./hide-party-exp-bar-phase";
import { LevelUpPhase } from "./level-up-phase";
import { PlayerPartyMemberPokemonPhase } from "./player-party-member-pokemon-phase";

export class ShowPartyExpBarPhase extends PlayerPartyMemberPokemonPhase {
  private expValue: number;

  constructor(scene: BattleScene, partyMemberIndex: integer, expValue: number) {
    super(scene, partyMemberIndex);

    this.expValue = expValue;
  }

  start() {
    super.start();

    const pokemon = this.getPokemon();
    const exp = new Utils.NumberHolder(this.expValue);
    this.scene.applyModifiers(ExpBoosterModifier, true, exp);
    exp.value = Math.floor(exp.value);

    const lastLevel = pokemon.level;
    pokemon.addExp(exp.value);
    const newLevel = pokemon.level;
    if (newLevel > lastLevel) {
      this.scene.unshiftPhase(new LevelUpPhase(this.scene, this.partyMemberIndex, lastLevel, newLevel));
    }
    this.scene.unshiftPhase(new HidePartyExpBarPhase(this.scene));
    pokemon.updateInfo();

    if (this.scene.expParty === ExpNotification.SKIP) {
      this.end();
    } else if (this.scene.expParty === ExpNotification.ONLY_LEVEL_UP) {
      if (newLevel > lastLevel) {
        this.scene.partyExpBar.showPokemonExp(pokemon, exp.value, this.scene.expParty === ExpNotification.ONLY_LEVEL_UP, newLevel).then(() => {
          setTimeout(() => this.end(), 800 / Math.pow(2, this.scene.expGainsSpeed));
        });
      } else {
        this.end();
      }
    } else if (this.scene.expGainsSpeed < ExpGainsSpeed.SKIP) {
      this.scene.partyExpBar.showPokemonExp(pokemon, exp.value, false, newLevel).then(() => {
        setTimeout(() => this.end(), 500 / Math.pow(2, this.scene.expGainsSpeed));
      });
    } else {
      this.end();
    }
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
      phase: "ShowPartyExpBarPhase",
      status: "completed",
      pokemon: pokemon ? pokemon.getName() : "None",
      expGained: this.expValue,
      currentExp: pokemon?.exp || 0,
      level: pokemon?.level || 0,
      newLevelReached: pokemon?.level > pokemon?.battleData?.level,
      expNotification: this.scene.expParty,
      expGainsSpeed: this.scene.expGainsSpeed,
    };
  }
}
