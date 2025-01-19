import BattleScene from "#app/battle-scene";
import { ArenaTagType } from "#app/enums/arena-tag-type";
import { MoneyMultiplierModifier } from "#app/modifier/modifier";
import i18next from "i18next";
import * as Utils from "#app/utils";
import { BattlePhase } from "./battle-phase";

export class MoneyRewardPhase extends BattlePhase {
  private moneyMultiplier: number;
  private rewardedMoney: number | null = null; // 로깅용 보상 금액 저장

  constructor(scene: BattleScene, moneyMultiplier: number) {
    super(scene);

    this.moneyMultiplier = moneyMultiplier;
  }

  start() {
    const moneyAmount = new Utils.IntegerHolder(this.scene.getWaveMoneyAmount(this.moneyMultiplier));

    this.scene.applyModifiers(MoneyMultiplierModifier, true, moneyAmount);

    if (this.scene.arena.getTag(ArenaTagType.HAPPY_HOUR)) {
      moneyAmount.value *= 2;
    }

    this.scene.addMoney(moneyAmount.value);
    this.rewardedMoney = moneyAmount.value; // 보상 금액 저장

    const userLocale = navigator.language || "en-US";
    const formattedMoneyAmount = moneyAmount.value.toLocaleString(userLocale);
    const message = i18next.t("battle:moneyWon", { moneyAmount: formattedMoneyAmount });

    this.scene.ui.showText(message, null, () => this.end(), null, true);
  }

  end() {
    // 결과 로깅
    console.log(
      JSON.stringify(
        {
          phase: "MoneyRewardPhase",
          status: "completed",
          rewardedMoney: this.rewardedMoney,
        },
        null,
        2
      )
    );

    super.end();
  }
}
