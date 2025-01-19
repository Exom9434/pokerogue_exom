import BattleScene from "#app/battle-scene";
import { ModifierType, ModifierTypeFunc, getModifierType } from "#app/modifier/modifier-type";
import i18next from "i18next";
import { BattlePhase } from "./battle-phase";

export class ModifierRewardPhase extends BattlePhase {
  protected modifierType: ModifierType;
  private rewardedModifierName: string | null = null; // 로깅용 보상 이름 저장

  constructor(scene: BattleScene, modifierTypeFunc: ModifierTypeFunc) {
    super(scene);

    this.modifierType = getModifierType(modifierTypeFunc);
  }

  start() {
    super.start();

    this.doReward().then(() => this.end());
  }

  doReward(): Promise<void> {
    return new Promise<void>(resolve => {
      const newModifier = this.modifierType.newModifier();
      this.rewardedModifierName = newModifier?.type.name ?? "Unknown Modifier"; // 보상 이름 저장
      this.scene.addModifier(newModifier).then(() => {
        this.scene.playSound("item_fanfare");
        this.scene.ui.showText(
          i18next.t("battle:rewardGain", { modifierName: newModifier?.type.name }),
          null,
          () => resolve(),
          null,
          true
        );
      });
    });
  }

  end() {
    // 결과 로깅
    console.log(
      JSON.stringify(
        {
          phase: "ModifierRewardPhase",
          status: "completed",
          rewardedModifier: this.rewardedModifierName,
        },
        null,
        2
      )
    );

    super.end();
  }
}
