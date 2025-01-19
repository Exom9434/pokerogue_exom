import BattleScene from "#app/battle-scene";
import { applyPostTurnAbAttrs, PostTurnAbAttr } from "#app/data/ability";
import { BattlerTagLapseType } from "#app/data/battler-tags";
import { TerrainType } from "#app/data/terrain";
import { WeatherType } from "#app/enums/weather-type";
import { TurnEndEvent } from "#app/events/battle-scene";
import Pokemon from "#app/field/pokemon";
import { getPokemonNameWithAffix } from "#app/messages";
import {
  TurnHealModifier,
  EnemyTurnHealModifier,
  EnemyStatusEffectHealChanceModifier,
  TurnStatusEffectModifier,
  TurnHeldItemTransferModifier,
} from "#app/modifier/modifier";
import i18next from "i18next";
import { FieldPhase } from "./field-phase";
import { PokemonHealPhase } from "./pokemon-heal-phase";

export class TurnEndPhase extends FieldPhase {
  private phaseDetails: { pokemon: string; actions: string[] }[] = [];

  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    this.scene.currentBattle.incrementTurn(this.scene);
    this.scene.eventTarget.dispatchEvent(new TurnEndEvent(this.scene.currentBattle.turn));

    const handlePokemon = (pokemon: Pokemon) => {
      const pokemonName = getPokemonNameWithAffix(pokemon);
      const actions: string[] = [];

      if (!pokemon.switchOutStatus) {
        pokemon.lapseTags(BattlerTagLapseType.TURN_END);
        actions.push("Tags lapsed");

        this.scene.applyModifiers(TurnHealModifier, pokemon.isPlayer(), pokemon);
        actions.push("Turn heal modifiers applied");

        if (this.scene.arena.terrain?.terrainType === TerrainType.GRASSY && pokemon.isGrounded()) {
          this.scene.unshiftPhase(
            new PokemonHealPhase(
              this.scene,
              pokemon.getBattlerIndex(),
              Math.max(pokemon.getMaxHp() >> 4, 1),
              i18next.t("battle:turnEndHpRestore", { pokemonName }),
              true
            )
          );
          actions.push("Grassy Terrain HP restored");
        }

        if (!pokemon.isPlayer()) {
          this.scene.applyModifiers(EnemyTurnHealModifier, false, pokemon);
          this.scene.applyModifier(EnemyStatusEffectHealChanceModifier, false, pokemon);
          actions.push("Enemy-specific heal modifiers applied");
        }

        applyPostTurnAbAttrs(PostTurnAbAttr, pokemon);
        actions.push("Post-turn ability attributes applied");
      }

      this.scene.applyModifiers(TurnStatusEffectModifier, pokemon.isPlayer(), pokemon);
      actions.push("Turn status effect modifiers applied");

      this.scene.applyModifiers(TurnHeldItemTransferModifier, pokemon.isPlayer(), pokemon);
      actions.push("Turn held item transfer modifiers applied");

      pokemon.battleSummonData.turnCount++;
      pokemon.battleSummonData.waveTurnCount++;
      actions.push("Turn and wave turn counts incremented");

      this.phaseDetails.push({ pokemon: pokemonName, actions });
    };

    this.executeForAll(handlePokemon);

    this.scene.arena.lapseTags();
    if (this.scene.arena.weather && !this.scene.arena.weather.lapse()) {
      this.scene.arena.trySetWeather(WeatherType.NONE, false);
      this.scene.arena.triggerWeatherBasedFormChangesToNormal();
      this.phaseDetails.push({ pokemon: "Arena", actions: [ "Weather set to NONE" ]});
    }

    if (this.scene.arena.terrain && !this.scene.arena.terrain.lapse()) {
      this.scene.arena.trySetTerrain(TerrainType.NONE, false);
      this.phaseDetails.push({ pokemon: "Arena", actions: [ "Terrain set to NONE" ]});
    }

    this.end();
  }

  getResult(): object {
    return {
      phase: "TurnEndPhase",
      turnNumber: this.scene.currentBattle.turn,
      phaseDetails: this.phaseDetails,
      weather: this.scene.arena.weather?.weatherType || "None",
      terrain: this.scene.arena.terrain?.terrainType || "None",
      status: "completed",
    };
  }

  end() {
    console.log(JSON.stringify(this.getResult(), null, 2)); // Log the phase result
    super.end();
  }
}
