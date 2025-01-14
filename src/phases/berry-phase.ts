import { applyAbAttrs, PreventBerryUseAbAttr, HealFromBerryUseAbAttr } from "#app/data/ability";
import { CommonAnim } from "#app/data/battle-anims";
import { BerryUsedEvent } from "#app/events/battle-scene";
import { getPokemonNameWithAffix } from "#app/messages";
import { BerryModifier } from "#app/modifier/modifier";
import i18next from "i18next";
import * as Utils from "#app/utils";
import { FieldPhase } from "./field-phase";
import { CommonAnimPhase } from "./common-anim-phase";

/** The phase after attacks where the pokemon eat berries */
export class BerryPhase extends FieldPhase {
  private berriesUsedCount: number = 0;

  start() {
    super.start();

    this.executeForAll((pokemon) => {
      const hasUsableBerry = !!this.scene.findModifier((m) => {
        return m instanceof BerryModifier && m.shouldApply(pokemon);
      }, pokemon.isPlayer());

      if (hasUsableBerry) {
        const cancelled = new Utils.BooleanHolder(false);
        pokemon.getOpponents().map((opp) =>
          applyAbAttrs(PreventBerryUseAbAttr, opp, cancelled)
        );

        if (cancelled.value) {
          pokemon.scene.queueMessage(
            i18next.t("abilityTriggers:preventBerryUse", {
              pokemonNameWithAffix: getPokemonNameWithAffix(pokemon),
            })
          );
        } else {
          this.scene.unshiftPhase(
            new CommonAnimPhase(
              this.scene,
              pokemon.getBattlerIndex(),
              pokemon.getBattlerIndex(),
              CommonAnim.USE_ITEM
            )
          );

          for (const berryModifier of this.scene.applyModifiers(
            BerryModifier,
            pokemon.isPlayer(),
            pokemon
          )) {
            if (berryModifier.consumed) {
              berryModifier.consumed = false;
              pokemon.loseHeldItem(berryModifier);
              this.berriesUsedCount++; // 증가: 사용된 베리 수 카운트
            }
            this.scene.eventTarget.dispatchEvent(
              new BerryUsedEvent(berryModifier)
            ); // Announce a berry was used
          }

          this.scene.updateModifiers(pokemon.isPlayer());

          applyAbAttrs(HealFromBerryUseAbAttr, pokemon, new Utils.BooleanHolder(false));
        }
      }
    });

    this.end();
  }

  getResult(): object {
    return {
      phase: "Berry Phase",
      status: "completed",
      berriesUsed: this.berriesUsedCount,
      totalPokemonChecked: this.scene.getField(true).length
    };
  }

  end(): void {
    console.log(JSON.stringify(this.getResult(), null, 2)); // JSON 형식으로 결과 출력
    super.end();
  }
}
