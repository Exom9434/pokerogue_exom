import BattleScene from "#app/battle-scene";
import { getCharVariantFromDialogue } from "#app/data/dialogue";
import { TrainerType } from "#app/enums/trainer-type";
import { modifierTypes } from "#app/modifier/modifier-type";
import { vouchers } from "#app/system/voucher";
import i18next from "i18next";
import * as Utils from "#app/utils";
import { BattlePhase } from "./battle-phase";
import { ModifierRewardPhase } from "./modifier-reward-phase";
import { MoneyRewardPhase } from "./money-reward-phase";
import { TrainerSlot } from "#app/data/trainer-config";
import { Biome } from "#app/enums/biome";
import { achvs } from "#app/system/achv";

export class TrainerVictoryPhase extends BattlePhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    this.scene.disableMenu = true;

    this.scene.playBgm(this.scene.currentBattle.trainer?.config.victoryBgm);

    this.scene.unshiftPhase(new MoneyRewardPhase(this.scene, this.scene.currentBattle.trainer?.config.moneyMultiplier!));

    const modifierRewardFuncs = this.scene.currentBattle.trainer?.config.modifierRewardFuncs!;
    for (const modifierRewardFunc of modifierRewardFuncs) {
      this.scene.unshiftPhase(new ModifierRewardPhase(this.scene, modifierRewardFunc));
    }

    if (this.scene.eventManager.isEventActive()) {
      for (const rewardFunc of this.scene.currentBattle.trainer?.config.eventRewardFuncs!) {
        this.scene.unshiftPhase(new ModifierRewardPhase(this.scene, rewardFunc));
      }
    }

    const trainerType = this.scene.currentBattle.trainer?.config.trainerType!;
    if (vouchers.hasOwnProperty(TrainerType[trainerType])) {
      if (!this.scene.validateVoucher(vouchers[TrainerType[trainerType]]) && this.scene.currentBattle.trainer?.config.isBoss) {
        this.scene.unshiftPhase(new ModifierRewardPhase(this.scene, [
          modifierTypes.VOUCHER,
          modifierTypes.VOUCHER,
          modifierTypes.VOUCHER_PLUS,
          modifierTypes.VOUCHER_PREMIUM,
        ][vouchers[TrainerType[trainerType]].voucherType]));
      }
    }

    if (this.scene.arena.biomeType === Biome.SPACE
      && (trainerType === TrainerType.BREEDER || trainerType === TrainerType.EXPERT_POKEMON_BREEDER)) {
      this.scene.validateAchv(achvs.BREEDERS_IN_SPACE);
    }

    this.scene.ui.showText(
      i18next.t("battle:trainerDefeated", { trainerName: this.scene.currentBattle.trainer?.getName(TrainerSlot.NONE, true) }),
      null,
      () => {
        const victoryMessages = this.scene.currentBattle.trainer?.getVictoryMessages()!;
        let message: string;
        this.scene.executeWithSeedOffset(() => (message = Utils.randSeedItem(victoryMessages)), this.scene.currentBattle.waveIndex);
        message = message!;

        const showMessage = () => {
          const originalFunc = showMessageOrEnd;
          showMessageOrEnd = () =>
            this.scene.ui.showDialogue(
              message,
              this.scene.currentBattle.trainer?.getName(TrainerSlot.TRAINER, true),
              null,
              originalFunc
            );

          showMessageOrEnd();
        };
        let showMessageOrEnd = () => this.end();
        if (victoryMessages?.length) {
          if (this.scene.currentBattle.trainer?.config.hasCharSprite && !this.scene.ui.shouldSkipDialogue(message)) {
            const originalFunc = showMessageOrEnd;
            showMessageOrEnd = () =>
              this.scene.charSprite
                .hide()
                .then(() => this.scene.hideFieldOverlay(250).then(() => originalFunc()));
            this.scene
              .showFieldOverlay(500)
              .then(() =>
                this.scene.charSprite
                  .showCharacter(
                    this.scene.currentBattle.trainer?.getKey()!,
                    getCharVariantFromDialogue(victoryMessages[0])
                  )
                  .then(() => showMessage())
              );
          } else {
            showMessage();
          }
        } else {
          showMessageOrEnd();
        }
      },
      null,
      true
    );

    this.showEnemyTrainer();
  }

  getResult(): object {
    const trainer = this.scene.currentBattle.trainer;
    return {
      phase: "TrainerVictoryPhase",
      trainerName: trainer?.getName(TrainerSlot.NONE, true) ?? "Unknown Trainer",
      biome: this.scene.arena.biomeType,
      isBoss: trainer?.config.isBoss ?? false,
      rewards: {
        moneyMultiplier: trainer?.config.moneyMultiplier ?? 0,
        modifiers: trainer?.config.modifierRewardFuncs?.length ?? 0,
      },
      status: "completed",
    };
  }

  end() {
    console.log(JSON.stringify(this.getResult(), null, 2)); // Log the result
    super.end();
  }
}
