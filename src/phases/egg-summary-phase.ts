import BattleScene from "#app/battle-scene";
import { Phase } from "#app/phase";
import { Mode } from "#app/ui/ui";
import { EggHatchData } from "#app/data/egg-hatch-data";

/**
 * Class that represents the egg summary phase
 * It does some of the function for updating egg data
 * Phase is handled mostly by the egg-hatch-scene-handler UI
 */
export class EggSummaryPhase extends Phase {
  private eggHatchData: EggHatchData[];

  constructor(scene: BattleScene, eggHatchData: EggHatchData[]) {
    super(scene);
    this.eggHatchData = eggHatchData;
  }

  start() {
    super.start();

    // updates next pokemon once the current update has been completed
    const updateNextPokemon = (i: number) => {
      if (i >= this.eggHatchData.length) {
        this.scene.ui.setModeForceTransition(Mode.EGG_HATCH_SUMMARY, this.eggHatchData).then(() => {
          this.scene.fadeOutBgm(undefined, false);
        });

      } else {
        this.eggHatchData[i].setDex();
        this.eggHatchData[i].updatePokemon().then(() => {
          if (i < this.eggHatchData.length) {
            updateNextPokemon(i + 1);
          }
        });
      }
    };
    updateNextPokemon(0);

  }

  end() {
    // 결과 객체 생성
    const result = {
      phase: "Egg Summary Phase",
      summary: {
        totalHatched: this.eggHatchData.length,
        hatchedPokemon: this.eggHatchData.map((data) => ({
          name: data.pokemon.getName(),
          species: data.pokemon.species.name,
          isShiny: data.pokemon.isShiny(),
          ivs: data.pokemon.ivs,
          eggMoveIndex: data.eggMoveIndex
        }))
      }
    };
    // 결과 출력
    console.log(JSON.stringify(result, null, 2));
    // 기존 종료 동작 호출
    this.scene.time.delayedCall(250, () => this.scene.setModifiersVisible(true));
    this.scene.ui.setModeForceTransition(Mode.MESSAGE).then(() => {
      super.end();
    });
  }
}
