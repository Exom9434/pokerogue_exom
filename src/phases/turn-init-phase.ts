import { BattlerIndex } from "#app/battle";
import BattleScene from "#app/battle-scene";
import {
  handleMysteryEncounterBattleStartEffects,
  handleMysteryEncounterTurnStartEffects,
} from "#app/data/mystery-encounters/utils/encounter-phase-utils";
import { TurnInitEvent } from "#app/events/battle-scene";
import { PlayerPokemon } from "#app/field/pokemon";
import i18next from "i18next";
import { CommandPhase } from "./command-phase";
import { EnemyCommandPhase } from "./enemy-command-phase";
import { FieldPhase } from "./field-phase";
import { GameOverPhase } from "./game-over-phase";
import { ToggleDoublePositionPhase } from "./toggle-double-position-phase";
import { TurnStartPhase } from "./turn-start-phase";

export class TurnInitPhase extends FieldPhase {
  private phaseDetails: { pokemon: string; actions: string[] }[] = [];
  private skippedDueToEncounterEffects: boolean = false;

  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    this.scene.getPlayerField().forEach((p) => {
      const pokemonName = p.name;
      const actions: string[] = [];

      if (p.isOnField() && !p.isAllowedInBattle()) {
        actions.push("Illegal evolution detected");
        this.scene.queueMessage(i18next.t("challenges:illegalEvolution", { pokemon: p.name }), null, true);

        const allowedPokemon = this.scene.getPokemonAllowedInBattle();

        if (!allowedPokemon.length) {
          actions.push("No legal Pokémon left, game over");
          this.scene.clearPhaseQueue();
          this.scene.unshiftPhase(new GameOverPhase(this.scene));
        } else if (
          allowedPokemon.length >= this.scene.currentBattle.getBattlerCount() ||
          (this.scene.currentBattle.double && !allowedPokemon[0].isActive(true))
        ) {
          actions.push("Forcing a switch");
          p.switchOut();
        } else {
          actions.push("Hiding Pokémon");
          p.leaveField();
        }

        if (allowedPokemon.length === 1 && this.scene.currentBattle.double) {
          actions.push("Adjusting double position");
          this.scene.unshiftPhase(new ToggleDoublePositionPhase(this.scene, true));
        }
      }

      if (actions.length) {
        this.phaseDetails.push({ pokemon: pokemonName, actions });
      }
    });

    this.scene.eventTarget.dispatchEvent(new TurnInitEvent());
    handleMysteryEncounterBattleStartEffects(this.scene);

    if (handleMysteryEncounterTurnStartEffects(this.scene)) {
      this.skippedDueToEncounterEffects = true;
      this.end();
      return;
    }

    this.scene.getField().forEach((pokemon, i) => {
      if (pokemon?.isActive()) {
        if (pokemon.isPlayer()) {
          this.scene.currentBattle.addParticipant(pokemon as PlayerPokemon);
        }

        pokemon.resetTurnData();
        this.scene.pushPhase(
          pokemon.isPlayer() ? new CommandPhase(this.scene, i) : new EnemyCommandPhase(this.scene, i - BattlerIndex.ENEMY)
        );
      }
    });

    this.scene.pushPhase(new TurnStartPhase(this.scene));

    this.end();
  }

  getResult(): object {
    return {
      phase: "TurnInitPhase",
      skippedDueToEncounterEffects: this.skippedDueToEncounterEffects,
      phaseDetails: this.phaseDetails,
      activeParticipants: this.scene.currentBattle.playerParticipantIds,
      status: "completed",
    };
  }

  end() {
    console.log(JSON.stringify(this.getResult(), null, 2)); // Log the phase result
    super.end();
  }
}
