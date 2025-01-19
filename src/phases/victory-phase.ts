import BattleScene from "#app/battle-scene";
import { BattlerIndex, BattleType, ClassicFixedBossWaves } from "#app/battle";
import { CustomModifierSettings, modifierTypes } from "#app/modifier/modifier-type";
import { BattleEndPhase } from "./battle-end-phase";
import { NewBattlePhase } from "./new-battle-phase";
import { PokemonPhase } from "./pokemon-phase";
import { AddEnemyBuffModifierPhase } from "./add-enemy-buff-modifier-phase";
import { EggLapsePhase } from "./egg-lapse-phase";
import { GameOverPhase } from "./game-over-phase";
import { ModifierRewardPhase } from "./modifier-reward-phase";
import { SelectModifierPhase } from "./select-modifier-phase";
import { TrainerVictoryPhase } from "./trainer-victory-phase";
import { handleMysteryEncounterVictory } from "#app/data/mystery-encounters/utils/encounter-phase-utils";

export class VictoryPhase extends PokemonPhase {
  /** If true, indicates that the phase is intended for EXP purposes only, and not to continue a battle to next phase */
  isExpOnly: boolean;
  private phaseDetails: { expAwarded: number; modifiers: string[] } = { expAwarded: 0, modifiers: []};

  constructor(scene: BattleScene, battlerIndex: BattlerIndex | integer, isExpOnly: boolean = false) {
    super(scene, battlerIndex);
    this.isExpOnly = isExpOnly;
  }

  start() {
    super.start();

    const isMysteryEncounter = this.scene.currentBattle.isBattleMysteryEncounter();

    if (!isMysteryEncounter || !this.scene.currentBattle.mysteryEncounter?.preventGameStatsUpdates) {
      this.scene.gameData.gameStats.pokemonDefeated++;
    }

    const expValue = this.getPokemon().getExpValue();
    this.phaseDetails.expAwarded = expValue;
    this.scene.applyPartyExp(expValue, true);

    if (isMysteryEncounter) {
      handleMysteryEncounterVictory(this.scene, false, this.isExpOnly);
      return this.end();
    }

    const remainingEnemies = this.scene
      .getEnemyParty()
      .filter((p) =>
        this.scene.currentBattle.battleType === BattleType.WILD ? p.isOnField() : !p?.isFainted(true)
      );

    if (remainingEnemies.length === 0) {
      this.scene.pushPhase(new BattleEndPhase(this.scene, true));
      if (this.scene.currentBattle.battleType === BattleType.TRAINER) {
        this.scene.pushPhase(new TrainerVictoryPhase(this.scene));
      }
      if (this.scene.gameMode.isEndless || !this.scene.gameMode.isWaveFinal(this.scene.currentBattle.waveIndex)) {
        this.scene.pushPhase(new EggLapsePhase(this.scene));
        if (this.scene.gameMode.isClassic && this.scene.currentBattle.waveIndex === ClassicFixedBossWaves.EVIL_BOSS_2) {
          this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierTypes.LOCK_CAPSULE));
          this.phaseDetails.modifiers.push("LOCK_CAPSULE");
        }
        if (this.scene.currentBattle.waveIndex % 10) {
          const customModifiers = this.getFixedBattleCustomModifiers();
          if (customModifiers) {
            this.phaseDetails.modifiers.push(...Object.keys(customModifiers));
          }
          this.scene.pushPhase(new SelectModifierPhase(this.scene, undefined, undefined, customModifiers));
        } else if (this.scene.gameMode.isDaily) {
          this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierTypes.EXP_CHARM));
          this.phaseDetails.modifiers.push("EXP_CHARM");
          if (this.scene.currentBattle.waveIndex > 10 && !this.scene.gameMode.isWaveFinal(this.scene.currentBattle.waveIndex)) {
            this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierTypes.GOLDEN_POKEBALL));
            this.phaseDetails.modifiers.push("GOLDEN_POKEBALL");
          }
        } else {
          const superExpWave = !this.scene.gameMode.isEndless ? (this.scene.offsetGym ? 0 : 20) : 10;
          if (this.scene.gameMode.isEndless && this.scene.currentBattle.waveIndex === 10) {
            this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierTypes.EXP_SHARE));
            this.phaseDetails.modifiers.push("EXP_SHARE");
          }
          if (
            this.scene.currentBattle.waveIndex <= 750 &&
            (this.scene.currentBattle.waveIndex <= 500 || this.scene.currentBattle.waveIndex % 30 === superExpWave)
          ) {
            const modifierType =
              this.scene.currentBattle.waveIndex % 30 !== superExpWave || this.scene.currentBattle.waveIndex > 250
                ? modifierTypes.EXP_CHARM
                : modifierTypes.SUPER_EXP_CHARM;
            this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierType));
            this.phaseDetails.modifiers.push(modifierType.name);
          }
          if (this.scene.currentBattle.waveIndex <= 150 && !(this.scene.currentBattle.waveIndex % 50)) {
            this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierTypes.GOLDEN_POKEBALL));
            this.phaseDetails.modifiers.push("GOLDEN_POKEBALL");
          }
          if (this.scene.gameMode.isEndless && !(this.scene.currentBattle.waveIndex % 50)) {
            const modifierType =
              !(this.scene.currentBattle.waveIndex % 250) ? modifierTypes.VOUCHER_PREMIUM : modifierTypes.VOUCHER_PLUS;
            this.scene.pushPhase(new ModifierRewardPhase(this.scene, modifierType));
            this.phaseDetails.modifiers.push(modifierType.name);
            this.scene.pushPhase(new AddEnemyBuffModifierPhase(this.scene));
          }
        }
        this.scene.pushPhase(new NewBattlePhase(this.scene));
      } else {
        this.scene.currentBattle.battleType = BattleType.CLEAR;
        this.scene.score += this.scene.gameMode.getClearScoreBonus();
        this.scene.updateScoreText();
        this.scene.pushPhase(new GameOverPhase(this.scene, true));
      }
    }

    this.end();
  }

  getFixedBattleCustomModifiers(): CustomModifierSettings | undefined {
    const gameMode = this.scene.gameMode;
    const waveIndex = this.scene.currentBattle.waveIndex;
    if (gameMode.isFixedBattle(waveIndex)) {
      return gameMode.getFixedBattle(waveIndex).customModifierRewardSettings;
    }

    return undefined;
  }

  getResult(): object {
    return {
      phase: "VictoryPhase",
      pokemon: this.getPokemon()?.name,
      expAwarded: this.phaseDetails.expAwarded,
      modifiersAwarded: this.phaseDetails.modifiers,
      isExpOnly: this.isExpOnly,
      status: "completed",
    };
  }

  end(): void {
    console.log(JSON.stringify(this.getResult(), null, 2)); // Log the phase result
    super.end();
  }
}
