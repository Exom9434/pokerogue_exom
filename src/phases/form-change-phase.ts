import BattleScene from "../battle-scene";
import * as Utils from "../utils";
import { achvs } from "../system/achv";
import { SpeciesFormChange, getSpeciesFormChangeMessage } from "../data/pokemon-forms";
import { PlayerPokemon } from "../field/pokemon";
import { Mode } from "../ui/ui";
import PartyUiHandler from "../ui/party-ui-handler";
import { getPokemonNameWithAffix } from "../messages";
import { EndEvolutionPhase } from "./end-evolution-phase";
import { EvolutionPhase } from "./evolution-phase";
import { BattlerTagType } from "#app/enums/battler-tag-type";
import { SpeciesFormKey } from "#enums/species-form-key";

export class FormChangePhase extends EvolutionPhase {
  private formChange: SpeciesFormChange;
  private modal: boolean;

  constructor(scene: BattleScene, pokemon: PlayerPokemon, formChange: SpeciesFormChange, modal: boolean) {
    super(scene, pokemon, null, 0);

    this.formChange = formChange;
    this.modal = modal;
  }

  validate(): boolean {
    return !!this.formChange;
  }

  setMode(): Promise<void> {
    if (!this.modal) {
      return super.setMode();
    }
    return this.scene.ui.setOverlayMode(Mode.EVOLUTION_SCENE);
  }

  doEvolution(): void {
    const preName = getPokemonNameWithAffix(this.pokemon);

    this.pokemon.getPossibleForm(this.formChange).then(transformedPokemon => {

      [ this.pokemonEvoSprite, this.pokemonEvoTintSprite ].map(sprite => {
        const spriteKey = transformedPokemon.getSpriteKey(true);
        try {
          sprite.play(spriteKey);
        } catch (err: unknown) {
          console.error(`Failed to play animation for ${spriteKey}`, err);
        }

        sprite.setPipelineData("ignoreTimeTint", true);
        sprite.setPipelineData("spriteKey", transformedPokemon.getSpriteKey());
        sprite.setPipelineData("shiny", transformedPokemon.shiny);
        sprite.setPipelineData("variant", transformedPokemon.variant);
        [ "spriteColors", "fusionSpriteColors" ].map(k => {
          if (transformedPokemon.summonData?.speciesForm) {
            k += "Base";
          }
          sprite.pipelineData[k] = transformedPokemon.getSprite().pipelineData[k];
        });
      });

      this.scene.time.delayedCall(250, () => {
        this.scene.tweens.add({
          targets: this.evolutionBgOverlay,
          alpha: 1,
          delay: 500,
          duration: 1500,
          ease: "Sine.easeOut",
          onComplete: () => {
            this.scene.time.delayedCall(1000, () => {
              this.scene.tweens.add({
                targets: this.evolutionBgOverlay,
                alpha: 0,
                duration: 250
              });
              this.evolutionBg.setVisible(true);
              this.evolutionBg.play();
            });
            this.scene.playSound("se/charge");
            this.doSpiralUpward();
            this.scene.tweens.addCounter({
              from: 0,
              to: 1,
              duration: 2000,
              onUpdate: t => {
                this.pokemonTintSprite.setAlpha(t.getValue());
              },
              onComplete: () => {
                this.pokemonSprite.setVisible(false);
                this.scene.time.delayedCall(1100, () => {
                  this.scene.playSound("se/beam");
                  this.doArcDownward();
                  this.scene.time.delayedCall(1000, () => {
                    this.pokemonEvoTintSprite.setScale(0.25);
                    this.pokemonEvoTintSprite.setVisible(true);
                    this.doCycle(1, 1).then(_success => {
                      this.scene.playSound("se/sparkle");
                      this.pokemonEvoSprite.setVisible(true);
                      this.doCircleInward();
                      this.scene.time.delayedCall(900, () => {
                        this.pokemon.changeForm(this.formChange).then(() => {
                          if (!this.modal) {
                            this.scene.unshiftPhase(new EndEvolutionPhase(this.scene));
                          }

                          this.scene.playSound("se/shine");
                          this.doSpray();
                          this.scene.tweens.add({
                            targets: this.evolutionOverlay,
                            alpha: 1,
                            duration: 250,
                            easing: "Sine.easeIn",
                            onComplete: () => {
                              this.evolutionBgOverlay.setAlpha(1);
                              this.evolutionBg.setVisible(false);
                              this.scene.tweens.add({
                                targets: [ this.evolutionOverlay, this.pokemonEvoTintSprite ],
                                alpha: 0,
                                duration: 2000,
                                delay: 150,
                                easing: "Sine.easeIn",
                                onComplete: () => {
                                  this.scene.tweens.add({
                                    targets: this.evolutionBgOverlay,
                                    alpha: 0,
                                    duration: 250,
                                    onComplete: () => {
                                      this.scene.time.delayedCall(250, () => {
                                        this.pokemon.cry();
                                        this.scene.time.delayedCall(1250, () => {
                                          let playEvolutionFanfare = false;
                                          if (this.formChange.formKey.indexOf(SpeciesFormKey.MEGA) > -1) {
                                            this.scene.validateAchv(achvs.MEGA_EVOLVE);
                                            playEvolutionFanfare = true;
                                          } else if (this.formChange.formKey.indexOf(SpeciesFormKey.GIGANTAMAX) > -1 || this.formChange.formKey.indexOf(SpeciesFormKey.ETERNAMAX) > -1) {
                                            this.scene.validateAchv(achvs.GIGANTAMAX);
                                            playEvolutionFanfare = true;
                                          }

                                          const delay = playEvolutionFanfare ? 4000 : 1750;
                                          this.scene.playSoundWithoutBgm(playEvolutionFanfare ? "evolution_fanfare" : "minor_fanfare");

                                          transformedPokemon.destroy();
                                          this.scene.ui.showText(getSpeciesFormChangeMessage(this.pokemon, this.formChange, preName), null, () => this.end(), null, true, Utils.fixedInt(delay));
                                          this.scene.time.delayedCall(Utils.fixedInt(delay + 250), () => this.scene.playBgm());
                                        });
                                      });
                                    }
                                  });
                                }
                              });
                            }
                          });
                        });
                      });
                    });
                  });
                });
              }
            });
          }
        });
      });
    });
  }

  end(): void {
    // 결과 객체 생성
    const result = {
      phase: "Form Change Phase",
      pokemon: {
        name: getPokemonNameWithAffix(this.pokemon),
        species: this.pokemon.species.name,
        form: this.formChange.formKey,
        level: this.pokemon.level,
        isShiny: this.pokemon.isShiny(),
        variant: this.pokemon.variant
      },
      battle: {
        mode: this.scene.ui.getMode().toString(),
        isModal: this.modal
      }
    };

    // 결과 출력
    console.log(JSON.stringify(result, null, 2));

    // 폼 체인지 관련 처리
    this.pokemon.findAndRemoveTags(t => t.tagType === BattlerTagType.AUTOTOMIZED);
    if (this.modal) {
      this.scene.ui.revertMode().then(() => {
        if (this.scene.ui.getMode() === Mode.PARTY) {
          const partyUiHandler = this.scene.ui.getHandler() as PartyUiHandler;
          partyUiHandler.clearPartySlots();
          partyUiHandler.populatePartySlots();
        }

        super.end();
      });
    } else {
      super.end();
    }
  }

}
