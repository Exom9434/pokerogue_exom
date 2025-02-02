import BattleScene from "#app/battle-scene";
import * as Utils from "#app/utils";
import { BattlePhase } from "./battle-phase";

export class PartyHealPhase extends BattlePhase {
  private resumeBgm: boolean;

  constructor(scene: BattleScene, resumeBgm: boolean) {
    super(scene);

    this.resumeBgm = resumeBgm;
  }

  start() {
    super.start();

    const bgmPlaying = this.scene.isBgmPlaying();
    if (bgmPlaying) {
      this.scene.fadeOutBgm(1000, false);
    }
    this.scene.ui.fadeOut(1000).then(() => {
      for (const pokemon of this.scene.getPlayerParty()) {
        pokemon.hp = pokemon.getMaxHp();
        pokemon.resetStatus();
        for (const move of pokemon.moveset) {
            move!.ppUsed = 0; // TODO: is this bang correct?
        }
        pokemon.updateInfo(true);
      }
      const healSong = this.scene.playSoundWithoutBgm("heal");
      this.scene.time.delayedCall(Utils.fixedInt(healSong.totalDuration * 1000), () => {
        healSong.destroy();
        if (this.resumeBgm && bgmPlaying) {
          this.scene.playBgm();
        }
        this.scene.ui.fadeIn(500).then(() => this.end());
      });
    });
  }
  end() {
    console.log(JSON.stringify(this.getResult(), null, 2));
    super.end();
  }

  /**
   * Returns the result of this phase.
   */
  getResult(): object {
    const playerParty = this.scene.getPlayerParty().map((pokemon) => ({
      name: pokemon.getName(),
      hp: pokemon.hp,
      maxHp: pokemon.getMaxHp(),
      status: pokemon.status ?? "Healthy",
      moves: pokemon.moveset.map((move) => ({
        name: move!.getMove(),
        ppUsed: move!.ppUsed,
        maxPP: move!.getMovePp(),
      })),
    }));

    return {
      phase: "PartyHealPhase",
      status: "completed",
      resumeBgm: this.resumeBgm,
      playerParty,
    };
  }
}
