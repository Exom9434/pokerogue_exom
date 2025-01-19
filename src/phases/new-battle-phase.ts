import { BattlePhase } from "./battle-phase";

export class NewBattlePhase extends BattlePhase {
  start() {
    super.start();

    this.scene.newBattle();

    this.end();
  }
  getResult(): object {
    // Include base result data and add specific information for NewBattlePhase
    return {
      ...super.getResult(),
      phase: "New Battle Phase",
      battleStarted: this.scene.currentBattle.started,
      playerPartySize: this.scene.getPlayerParty().length,
      enemyPartySize: this.scene.getEnemyParty().length
    };
  }

  end(): void {
    // Log the result in JSON format
    console.log(JSON.stringify(this.getResult(), null, 2));
    super.end();
  }
}
