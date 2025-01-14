import type BattleScene from "#app/battle-scene";
import { type BattlerIndex } from "#app/battle";
import { BattleSpec } from "#enums/battle-spec";
import { type DamageResult, HitResult } from "#app/field/pokemon";
import { fixedInt } from "#app/utils";
import { PokemonPhase } from "#app/phases/pokemon-phase";

export class DamageAnimPhase extends PokemonPhase {
  private amount: integer;
  private damageResult: DamageResult;
  private critical: boolean;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, amount: integer, damageResult?: DamageResult, critical: boolean = false) {
    super(scene, battlerIndex);

    this.amount = amount;
    this.damageResult = damageResult || HitResult.EFFECTIVE;
    this.critical = critical;
  }

  start() {
    super.start();

    if (this.damageResult === HitResult.ONE_HIT_KO) {
      if (this.scene.moveAnimations) {
        this.scene.toggleInvert(true);
      }
      this.scene.time.delayedCall(fixedInt(1000), () => {
        this.scene.toggleInvert(false);
        this.applyDamage();
      });
      return;
    }

    this.applyDamage();
  }

  updateAmount(amount: integer): void {
    this.amount = amount;
  }

  applyDamage() {
    switch (this.damageResult) {
      case HitResult.EFFECTIVE:
        this.scene.playSound("se/hit");
        break;
      case HitResult.SUPER_EFFECTIVE:
      case HitResult.ONE_HIT_KO:
        this.scene.playSound("se/hit_strong");
        break;
      case HitResult.NOT_VERY_EFFECTIVE:
        this.scene.playSound("se/hit_weak");
        break;
    }

    if (this.amount) {
      this.scene.damageNumberHandler.add(this.getPokemon(), this.amount, this.damageResult, this.critical);
    }

    if (this.damageResult !== HitResult.OTHER && this.amount > 0) {
      const flashTimer = this.scene.time.addEvent({
        delay: 100,
        repeat: 5,
        startAt: 200,
        callback: () => {
          this.getPokemon().getSprite().setVisible(flashTimer.repeatCount % 2 === 0);
          if (!flashTimer.repeatCount) {
            this.getPokemon().updateInfo().then(() => this.end());
          }
        }
      });
    } else {
      this.getPokemon().updateInfo().then(() => this.end());
    }
  }

  override end() {
    // 공격받은 포켓몬 정보
    const targetPokemon = this.getPokemon();
    const targetInfo = targetPokemon
      ? { name: targetPokemon.getName(), hp: targetPokemon.getHP(), status: targetPokemon.getStatus() }
      : { name: "Unknown", hp: 0, status: "fainted" };

    // 결과 객체 생성
    const result = {
      phase: "Damage Anim Phase",
      target: targetInfo,
      damage: {
        amount: this.amount,
        result: this.damageResult.toString(),
        critical: this.critical
      },
      battle: {
        spec: this.scene.currentBattle.battleSpec.toString()
      }
    };

    // 결과 출력
    console.log(JSON.stringify(result, null, 2));

    // 기존 종료 동작 호출
    if (this.scene.currentBattle.battleSpec === BattleSpec.FINAL_BOSS) {
      this.scene.initFinalBossPhaseTwo(this.getPokemon());
    } else {
      super.end();
    }
  }
}
