import BattleScene from "#app/battle-scene";
import { EnemyPokemon } from "#app/field/pokemon";
import { PartyMemberPokemonPhase } from "./party-member-pokemon-phase";

export abstract class EnemyPartyMemberPokemonPhase extends PartyMemberPokemonPhase {
  constructor(scene: BattleScene, partyMemberIndex: integer) {
    super(scene, partyMemberIndex, false);
  }

  getEnemyPokemon(): EnemyPokemon {
    return super.getPokemon() as EnemyPokemon;
  }

  end(): void {
    // 기존 결과 가져오기
    const result = this.getResult();

    // 추가 정보 로깅
    const logData = {
      ...result,
      phase: "Enemy Party Member Pokemon Phase",
      partyMemberIndex: this.partyMemberIndex,
      fieldIndex: this.fieldIndex,
      enemyPokemon: this.getEnemyPokemon().getName(), // 가상의 getName() 메서드 사용
    };

    console.log(JSON.stringify(logData, null, 2)); // JSON 형식으로 로깅
    super.end(); // 상위 클래스의 end() 호출
  }
}
