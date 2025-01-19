import BattleScene from "#app/battle-scene";
import { Biome } from "#app/enums/biome";
import { getBiomeKey } from "#app/field/arena";
import { BattlePhase } from "./battle-phase";

export class SwitchBiomePhase extends BattlePhase {
  private nextBiome: Biome;

  constructor(scene: BattleScene, nextBiome: Biome) {
    super(scene);

    this.nextBiome = nextBiome;
  }

  start() {
    super.start();

    if (this.nextBiome === undefined) {
      return this.end();
    }

    this.scene.tweens.add({
      targets: [ this.scene.arenaEnemy, this.scene.lastEnemyTrainer ],
      x: "+=300",
      duration: 2000,
      onComplete: () => {
        this.scene.arenaEnemy.setX(this.scene.arenaEnemy.x - 600);

        this.scene.newArena(this.nextBiome);

        const biomeKey = getBiomeKey(this.nextBiome);
        const bgTexture = `${biomeKey}_bg`;
        this.scene.arenaBgTransition.setTexture(bgTexture);
        this.scene.arenaBgTransition.setAlpha(0);
        this.scene.arenaBgTransition.setVisible(true);
        this.scene.arenaPlayerTransition.setBiome(this.nextBiome);
        this.scene.arenaPlayerTransition.setAlpha(0);
        this.scene.arenaPlayerTransition.setVisible(true);

        this.scene.tweens.add({
          targets: [ this.scene.arenaPlayer, this.scene.arenaBgTransition, this.scene.arenaPlayerTransition ],
          duration: 1000,
          delay: 1000,
          ease: "Sine.easeInOut",
          alpha: (target: any) => target === this.scene.arenaPlayer ? 0 : 1,
          onComplete: () => {
            this.scene.arenaBg.setTexture(bgTexture);
            this.scene.arenaPlayer.setBiome(this.nextBiome);
            this.scene.arenaPlayer.setAlpha(1);
            this.scene.arenaEnemy.setBiome(this.nextBiome);
            this.scene.arenaEnemy.setAlpha(1);
            this.scene.arenaNextEnemy.setBiome(this.nextBiome);
            this.scene.arenaBgTransition.setVisible(false);
            this.scene.arenaPlayerTransition.setVisible(false);
            if (this.scene.lastEnemyTrainer) {
              this.scene.lastEnemyTrainer.destroy();
            }

            this.end();
          }
        });
      }
    });
  }
  /**
 * Phase 종료 시 결과를 반환.
 */
  getResult(): object {
    return {
      phase: "SwitchBiomePhase",
      nextBiome: this.nextBiome,
      currentBiome: this.scene.arena.biomeType,
      status: "completed"
    };
  }

  /**
   * Phase 종료 시 결과를 콘솔에 로깅.
   */
  private logResult(): void {
    console.log(JSON.stringify(this.getResult(), null, 2));
  }

  /**
   * Phase 종료 시 호출되는 메서드.
   */
  end(): void {
    this.logResult(); // 결과를 로그
    super.end();
  }
}

