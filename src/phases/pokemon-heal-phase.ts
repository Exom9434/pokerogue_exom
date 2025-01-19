import BattleScene from "#app/battle-scene";
import { BattlerIndex } from "#app/battle";
import { CommonAnim } from "#app/data/battle-anims";
import { getStatusEffectHealText } from "#app/data/status-effect";
import { StatusEffect } from "#app/enums/status-effect";
import { HitResult, DamageResult } from "#app/field/pokemon";
import { getPokemonNameWithAffix } from "#app/messages";
import { HealingBoosterModifier } from "#app/modifier/modifier";
import { HealAchv } from "#app/system/achv";
import i18next from "i18next";
import * as Utils from "#app/utils";
import { CommonAnimPhase } from "./common-anim-phase";
import { BattlerTagType } from "#app/enums/battler-tag-type";
import { HealBlockTag } from "#app/data/battler-tags";

export class PokemonHealPhase extends CommonAnimPhase {
  private hpHealed: integer;
  private message: string | null;
  private showFullHpMessage: boolean;
  private skipAnim: boolean;
  private revive: boolean;
  private healStatus: boolean;
  private preventFullHeal: boolean;
  private fullRestorePP: boolean;

  constructor(scene: BattleScene, battlerIndex: BattlerIndex, hpHealed: integer, message: string | null, showFullHpMessage: boolean, skipAnim: boolean = false, revive: boolean = false, healStatus: boolean = false, preventFullHeal: boolean = false, fullRestorePP: boolean = false) {
    super(scene, battlerIndex, undefined, CommonAnim.HEALTH_UP);

    this.hpHealed = hpHealed;
    this.message = message;
    this.showFullHpMessage = showFullHpMessage;
    this.skipAnim = skipAnim;
    this.revive = revive;
    this.healStatus = healStatus;
    this.preventFullHeal = preventFullHeal;
    this.fullRestorePP = fullRestorePP;
  }

  start() {
    if (!this.skipAnim && (this.revive || this.getPokemon().hp) && !this.getPokemon().isFullHp()) {
      super.start();
    } else {
      this.end();
    }
  }

  end() {
    const pokemon = this.getPokemon();

    if (!pokemon.isOnField() || (!this.revive && !pokemon.isActive())) {
      return super.end();
    }

    const hasMessage = !!this.message;
    const healOrDamage = (!pokemon.isFullHp() || this.hpHealed < 0);
    const healBlock = pokemon.getTag(BattlerTagType.HEAL_BLOCK) as HealBlockTag;
    let lastStatusEffect = StatusEffect.NONE;

    if (healBlock && this.hpHealed > 0) {
      this.scene.queueMessage(healBlock.onActivation(pokemon));
      this.message = null;
      return super.end();
    } else if (healOrDamage) {
      const hpRestoreMultiplier = new Utils.IntegerHolder(1);
      if (!this.revive) {
        this.scene.applyModifiers(HealingBoosterModifier, this.player, hpRestoreMultiplier);
      }
      const healAmount = new Utils.NumberHolder(Math.floor(this.hpHealed * hpRestoreMultiplier.value));
      if (healAmount.value < 0) {
        pokemon.damageAndUpdate(healAmount.value * -1, HitResult.HEAL as DamageResult);
        healAmount.value = 0;
      }
      // Prevent healing to full if specified (in case of healing tokens so Sturdy doesn't cause a softlock)
      if (this.preventFullHeal && pokemon.hp + healAmount.value >= pokemon.getMaxHp()) {
        healAmount.value = (pokemon.getMaxHp() - pokemon.hp) - 1;
      }
      healAmount.value = pokemon.heal(healAmount.value);
      if (healAmount.value) {
        this.scene.damageNumberHandler.add(pokemon, healAmount.value, HitResult.HEAL);
      }
      if (pokemon.isPlayer()) {
        this.scene.validateAchvs(HealAchv, healAmount);
        if (healAmount.value > this.scene.gameData.gameStats.highestHeal) {
          this.scene.gameData.gameStats.highestHeal = healAmount.value;
        }
      }
      if (this.healStatus && !this.revive && pokemon.status) {
        lastStatusEffect = pokemon.status.effect;
        pokemon.resetStatus();
      }
      if (this.fullRestorePP) {
        for (const move of this.getPokemon().getMoveset()) {
          if (move) {
            move.ppUsed = 0;
          }
        }
      }
      pokemon.updateInfo().then(() => super.end());
    } else if (this.healStatus && !this.revive && pokemon.status) {
      lastStatusEffect = pokemon.status.effect;
      pokemon.resetStatus();
      pokemon.updateInfo().then(() => super.end());
    } else if (this.showFullHpMessage) {
      this.message = i18next.t("battle:hpIsFull", { pokemonName: getPokemonNameWithAffix(pokemon) });
    }

    if (this.message) {
      this.scene.queueMessage(this.message);
    }

    if (this.healStatus && lastStatusEffect && !hasMessage) {
      this.scene.queueMessage(getStatusEffectHealText(lastStatusEffect, getPokemonNameWithAffix(pokemon)));
    }

    if (!healOrDamage && !lastStatusEffect) {
      console.log(JSON.stringify(this.getResult(), null, 2));
      super.end();
    }
  }
  /**
   * Returns the result of this phase.
   */
  getResult(): object {
    const pokemon = this.getPokemon();
    return {
      phase: "PokemonHealPhase",
      status: "completed",
      pokemon: {
        name: pokemon.getName(),
        hp: pokemon.hp,
        maxHp: pokemon.getMaxHp(),
        isFullHp: pokemon.isFullHp(),
        status: pokemon.status ? pokemon.status.effect : "Healthy",
        moves: pokemon.getMoveset().map((move) => ({
          name: move!.getMove(),
          ppUsed: move!.ppUsed,
          maxPP: move!.getMovePp(),
        })),
      },
      hpHealed: this.hpHealed,
      message: this.message,
      revive: this.revive,
      healStatus: this.healStatus,
      preventFullHeal: this.preventFullHeal,
      fullRestorePP: this.fullRestorePP,
    };
  }
}
