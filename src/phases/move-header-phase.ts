import BattleScene from "#app/battle-scene";
import { applyMoveAttrs, MoveHeaderAttr } from "#app/data/move";
import Pokemon, { PokemonMove } from "#app/field/pokemon";
import { BattlePhase } from "./battle-phase";

export class MoveHeaderPhase extends BattlePhase {
  public pokemon: Pokemon;
  public move: PokemonMove;

  constructor(scene: BattleScene, pokemon: Pokemon, move: PokemonMove) {
    super(scene);

    this.pokemon = pokemon;
    this.move = move;
  }

  canMove(): boolean {
    return this.pokemon.isActive(true) && this.move.isUsable(this.pokemon);
  }

  start() {
    super.start();

    if (this.canMove()) {
      applyMoveAttrs(MoveHeaderAttr, this.pokemon, null, this.move.getMove()).then(() => this.end());
    } else {
      this.end();
    }
  }

  /**
   * 종료 시점에 실행되는 메서드로, Phase 결과를 콘솔로 출력
   */
  public override end(): void {
    const phaseResult = {
      phase: "MoveHeaderPhase",
      status: "completed",
      pokemon: this.pokemon.getName(),
      move: this.move.getMove().name,
      canMove: this.canMove(),
    };

    // 콘솔에 Phase 결과를 JSON 형태로 기록
    console.log(JSON.stringify(phaseResult, null, 2));

    super.end();
  }
}
