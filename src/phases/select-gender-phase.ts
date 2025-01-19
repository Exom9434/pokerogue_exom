import BattleScene from "#app/battle-scene";
import { PlayerGender } from "#app/enums/player-gender";
import { Phase } from "#app/phase";
import { SettingKeys } from "#app/system/settings/settings";
import { Mode } from "#app/ui/ui";
import i18next from "i18next";

export class SelectGenderPhase extends Phase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start(): void {
    super.start();

    this.scene.ui.showText(i18next.t("menu:boyOrGirl"), null, () => {
      this.scene.ui.setMode(Mode.OPTION_SELECT, {
        options: [
          {
            label: i18next.t("settings:boy"),
            handler: () => {
              this.scene.gameData.gender = PlayerGender.MALE;
              this.scene.gameData.saveSetting(SettingKeys.Player_Gender, 0);
              this.scene.gameData.saveSystem().then(() => this.end());
              return true;
            }
          },
          {
            label: i18next.t("settings:girl"),
            handler: () => {
              this.scene.gameData.gender = PlayerGender.FEMALE;
              this.scene.gameData.saveSetting(SettingKeys.Player_Gender, 1);
              this.scene.gameData.saveSystem().then(() => this.end());
              return true;
            }
          }
        ]
      });
    });
  }

  /**
   * Logs the result when the phase ends.
   */
  end(): void {
    console.log(JSON.stringify(this.getResult(), null, 2)); // Log the result
    this.scene.ui.setMode(Mode.MESSAGE);
    super.end();
  }

  /**
   * Returns the result of this phase.
   */
  getResult(): object {
    const gender = this.scene.gameData.gender;
    return {
      phase: "SelectGenderPhase",
      status: "completed",
      selectedGender: gender === PlayerGender.MALE ? "Male" : "Female",
    };
  }
}
