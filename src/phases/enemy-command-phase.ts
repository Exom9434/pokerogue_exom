import BattleScene from "#app/battle-scene";
import { BattlerIndex } from "#app/battle";
import { Command } from "#app/ui/command-ui-handler";
import { FieldPhase } from "./field-phase";
import { Abilities } from "#enums/abilities";
import { BattlerTagType } from "#enums/battler-tag-type";

/**
 * Phase for determining an enemy AI's action for the next turn.
 * During this phase, the enemy decides whether to switch (if it has a trainer)
 * or to use a move from its moveset.
 *
 * For more information on how the Enemy AI works, see docs/enemy-ai.md
 * @see {@linkcode Pokemon.getMatchupScore}
 * @see {@linkcode EnemyPokemon.getNextMove}
 */
export class EnemyCommandPhase extends FieldPhase {
  protected fieldIndex: integer;
  protected skipTurn: boolean = false;

  constructor(scene: BattleScene, fieldIndex: integer) {
    super(scene);

    this.fieldIndex = fieldIndex;
    if (this.scene.currentBattle.mysteryEncounter?.skipEnemyBattleTurns) {
      this.skipTurn = true;
    }
  }

  start() {
    super.start();

    const enemyPokemon = this.scene.getEnemyField()[this.fieldIndex];
    const battle = this.scene.currentBattle;
    const trainer = battle.trainer;

    if (battle.double && enemyPokemon.hasAbility(Abilities.COMMANDER)
        && enemyPokemon.getAlly().getTag(BattlerTagType.COMMANDED)) {
      this.skipTurn = true;
    }

    if (trainer && !enemyPokemon.getMoveQueue().length) {
      const opponents = enemyPokemon.getOpponents();

      if (!enemyPokemon.isTrapped()) {
        const partyMemberScores = trainer.getPartyMemberMatchupScores(enemyPokemon.trainerSlot, true);

        if (partyMemberScores.length) {
          const matchupScores = opponents.map(opp => enemyPokemon.getMatchupScore(opp));
          const matchupScore = matchupScores.reduce((total, score) => total += score, 0) / matchupScores.length;

          const sortedPartyMemberScores = trainer.getSortedPartyMemberMatchupScores(partyMemberScores);

          const switchMultiplier = 1 - (battle.enemySwitchCounter ? Math.pow(0.1, (1 / battle.enemySwitchCounter)) : 0);

          if (sortedPartyMemberScores[0][1] * switchMultiplier >= matchupScore * (trainer.config.isBoss ? 2 : 3)) {
            const index = trainer.getNextSummonIndex(enemyPokemon.trainerSlot, partyMemberScores);

            battle.turnCommands[this.fieldIndex + BattlerIndex.ENEMY] =
                { command: Command.POKEMON, cursor: index, args: [ false ], skip: this.skipTurn };

            battle.enemySwitchCounter++;

            return this.end();
          }
        }
      }
    }

    const nextMove = enemyPokemon.getNextMove();

    this.scene.currentBattle.turnCommands[this.fieldIndex + BattlerIndex.ENEMY] =
        { command: Command.FIGHT, move: nextMove, skip: this.skipTurn };

    this.scene.currentBattle.enemySwitchCounter = Math.max(this.scene.currentBattle.enemySwitchCounter - 1, 0);

    this.end();
  }

  getFieldIndex(): number {
    return this.fieldIndex;
  }

  override end() {
    // 적 명령 정보를 가져옴 (null일 경우 기본 값 제공)
    const command = this.scene.currentBattle.turnCommands[this.fieldIndex + BattlerIndex.ENEMY] ?? { command: null };

    // 결과 객체 생성
    const result = {
      phase: "Enemy Command Phase",
      fieldIndex: this.fieldIndex,
      command: command.command === Command.POKEMON ? "Switch" : command.command === Command.FIGHT ? "Fight" : "None",
      details: command.command === Command.POKEMON
        ? { switchTo: command.cursor }
        : command.command === Command.FIGHT
          ? { move: command.move, skipTurn: command.skip }
          : null
    };
    // 결과 출력
    console.log(JSON.stringify(result, null, 2));
    super.end();
  }
}
