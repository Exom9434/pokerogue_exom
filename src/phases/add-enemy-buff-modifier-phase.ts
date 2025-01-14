import BattleScene from "#app/battle-scene";
import { ModifierTier } from "#app/modifier/modifier-tier";
import {
  regenerateModifierPoolThresholds,
  ModifierPoolType,
  getEnemyBuffModifierForWave
} from "#app/modifier/modifier-type";
import { EnemyPersistentModifier } from "#app/modifier/modifier";
import { Phase } from "#app/phase";

export class AddEnemyBuffModifierPhase extends Phase {
  private waveIndex: number = 0;
  private appliedBuffCount: number = 0;
  private buffTier: string = "";

  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    this.waveIndex = this.scene.currentBattle.waveIndex;
    const tier = !(this.waveIndex % 1000)
      ? ModifierTier.ULTRA
      : !(this.waveIndex % 250)
        ? ModifierTier.GREAT
        : ModifierTier.COMMON;

    regenerateModifierPoolThresholds(
      this.scene.getEnemyParty(),
      ModifierPoolType.ENEMY_BUFF
    );

    this.appliedBuffCount = Math.ceil(this.waveIndex / 250);
    this.buffTier = ModifierTier[tier];

    for (let i = 0; i < this.appliedBuffCount; i++) {
      this.scene.addEnemyModifier(
        getEnemyBuffModifierForWave(
          tier,
          this.scene.findModifiers(
            (m) => m instanceof EnemyPersistentModifier,
            false
          ),
          this.scene
        ),
        true,
        true
      );
    }

    // 버프 적용 후 Phase 종료
    this.scene.updateModifiers(false, true).then(() => this.end());
  }

  getResult(): object {
    return {
      phase: "AddEnemyBuffModifierPhase",
      status: "completed",
      waveIndex: this.waveIndex,
      appliedBuffCount: this.appliedBuffCount,
      buffTier: this.buffTier
    };
  }

  end(): void {
    console.log(JSON.stringify(this.getResult(), null, 2)); // JSON 형식으로 결과 출력
    super.end();
  }
}
