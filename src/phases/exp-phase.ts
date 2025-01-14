import BattleScene from "#app/battle-scene";
import { getPokemonNameWithAffix } from "#app/messages";
import { ExpBoosterModifier } from "#app/modifier/modifier";
import i18next from "i18next";
import * as Utils from "#app/utils";
import { PlayerPartyMemberPokemonPhase } from "./player-party-member-pokemon-phase";
import { LevelUpPhase } from "./level-up-phase";

export class ExpPhase extends PlayerPartyMemberPokemonPhase {
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

    this.scene.ui.showText(
      i18next.t("battle:expGain", { pokemonName: getPokemonNameWithAffix(pokemon), exp: exp.value }),
      null,
      () => {
        const lastLevel = pokemon.level;
        pokemon.addExp(exp.value);
        const newLevel = pokemon.level;

        if (newLevel > lastLevel) {
          this.scene.unshiftPhase(new LevelUpPhase(this.scene, this.partyMemberIndex, lastLevel, newLevel));
        }

        pokemon.updateInfo().then(() => this.end());
      },
      null,
      true
    );
  }

  override end() {
    // 경험치 및 레벨 변화 결과 객체 생성
    const pokemon = this.getPokemon();
    const result = {
      phase: "Exp Phase",
      pokemon: {
        name: getPokemonNameWithAffix(pokemon),
        level: pokemon.level,
        expGained: this.expValue,
        newExp: pokemon.exp,
        newLevel: pokemon.level
      }
    };

    // 결과 출력
    console.log(JSON.stringify(result, null, 2));

    super.end();
  }
}

