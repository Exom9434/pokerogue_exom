import BattleScene from "#app/battle-scene";
import { applyAbAttrs, PostBiomeChangeAbAttr } from "#app/data/ability";
import { getRandomWeatherType } from "#app/data/weather";
import { NextEncounterPhase } from "./next-encounter-phase";

export class NewBiomeEncounterPhase extends NextEncounterPhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  doEncounter(): void {
    this.scene.playBgm(undefined, true);

    for (const pokemon of this.scene.getPlayerParty()) {
      if (pokemon) {
        pokemon.resetBattleData();
      }
    }

    for (const pokemon of this.scene.getPlayerParty().filter(p => p.isOnField())) {
      applyAbAttrs(PostBiomeChangeAbAttr, pokemon, null);
    }

    const enemyField = this.scene.getEnemyField();
    const moveTargets: any[]  = [ this.scene.arenaEnemy, enemyField ];
    const mysteryEncounter = this.scene.currentBattle?.mysteryEncounter?.introVisuals;
    if (mysteryEncounter) {
      moveTargets.push(mysteryEncounter);
    }

    this.scene.tweens.add({
      targets: moveTargets.flat(),
      x: "+=300",
      duration: 2000,
      onComplete: () => {
        if (!this.tryOverrideForBattleSpec()) {
          this.doEncounterCommon();
        }
      }
    });
  }

  /**
   * Set biome weather.
   */
  trySetWeatherIfNewBiome(): void {
    this.scene.arena.trySetWeather(getRandomWeatherType(this.scene.arena), false);
  }
  /**
 * Override to include logging of results before ending phase.
 */
  getResult(): object {
    const battle = this.scene.currentBattle;
    const enemyParty = battle.enemyParty.map((enemy) => ({
      name: enemy.getNameToRender(),
      speciesId: enemy.species.speciesId,
      stats: enemy.stats,
      ability: enemy.getAbility().name,
      isShiny: enemy.isShiny(),
    }));

    return {
      phase: "New Biome Encounter Phase",
      waveIndex: battle.waveIndex,
      enemyCount: enemyParty.length,
      enemyParty,
      biomeType: this.scene.arena.biomeType,
      weather: this.scene.arena.weather,
    };
  }

  /**
   * Override to log the result as JSON before calling the parent class's end method.
   */
  end(): void {
    // Log the result in JSON format
    console.log(JSON.stringify(this.getResult(), null, 2));

    // Call the parent class's end method to continue with the phase logic
    super.end();
  }
}
