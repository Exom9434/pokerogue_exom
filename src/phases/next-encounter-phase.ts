import BattleScene from "#app/battle-scene";
import { EncounterPhase } from "./encounter-phase";

export class NextEncounterPhase extends EncounterPhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();
  }

  doEncounter(): void {
    this.scene.playBgm(undefined, true);

    for (const pokemon of this.scene.getPlayerParty()) {
      if (pokemon) {
        pokemon.resetBattleData();
      }
    }

    this.scene.arenaNextEnemy.setBiome(this.scene.arena.biomeType);
    this.scene.arenaNextEnemy.setVisible(true);

    const enemyField = this.scene.getEnemyField();
    const moveTargets: any[] = [ this.scene.arenaEnemy, this.scene.arenaNextEnemy, this.scene.currentBattle.trainer, enemyField, this.scene.lastEnemyTrainer ];
    const lastEncounterVisuals = this.scene.lastMysteryEncounter?.introVisuals;
    if (lastEncounterVisuals) {
      moveTargets.push(lastEncounterVisuals);
    }
    const nextEncounterVisuals = this.scene.currentBattle.mysteryEncounter?.introVisuals;
    if (nextEncounterVisuals) {
      const enterFromRight = nextEncounterVisuals.enterFromRight;
      if (enterFromRight) {
        nextEncounterVisuals.x += 500;
        this.scene.tweens.add({
          targets: nextEncounterVisuals,
          x: "-=200",
          duration: 2000
        });
      } else {
        moveTargets.push(nextEncounterVisuals);
      }
    }

    this.scene.tweens.add({
      targets: moveTargets.flat(),
      x: "+=300",
      duration: 2000,
      onComplete: () => {
        this.scene.arenaEnemy.setBiome(this.scene.arena.biomeType);
        this.scene.arenaEnemy.setX(this.scene.arenaNextEnemy.x);
        this.scene.arenaEnemy.setAlpha(1);
        this.scene.arenaNextEnemy.setX(this.scene.arenaNextEnemy.x - 300);
        this.scene.arenaNextEnemy.setVisible(false);
        if (this.scene.lastEnemyTrainer) {
          this.scene.lastEnemyTrainer.destroy();
        }
        if (lastEncounterVisuals) {
          this.scene.field.remove(lastEncounterVisuals, true);
          this.scene.lastMysteryEncounter!.introVisuals = undefined;
        }

        if (!this.tryOverrideForBattleSpec()) {
          this.doEncounterCommon();
        }
      }
    });
  }

  /**
   * Do nothing (since this is simply the next wave in the same biome).
   */
  trySetWeatherIfNewBiome(): void {
  }
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
      phase: "Next Encounter Phase",
      waveIndex: battle.waveIndex,
      enemyCount: enemyParty.length,
      enemyParty,
      isMysteryEncounter: battle.isBattleMysteryEncounter(),
      biomeType: this.scene.arena.biomeType,
    };
  }

  end(): void {
    // Log the result in JSON format
    console.log(JSON.stringify(this.getResult(), null, 2));

    // Call the base class's `end` method
    super.end();
  }
}
