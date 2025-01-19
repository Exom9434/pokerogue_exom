import BattleScene from "#app/battle-scene";
import Pokemon from "#app/field/pokemon";
import { FieldPhase } from "./field-phase";

export abstract class PartyMemberPokemonPhase extends FieldPhase {
  protected partyMemberIndex: integer;
  protected fieldIndex: integer;
  protected player: boolean;

  constructor(scene: BattleScene, partyMemberIndex: integer, player: boolean) {
    super(scene);

    this.partyMemberIndex = partyMemberIndex;
    this.fieldIndex = partyMemberIndex < this.scene.currentBattle.getBattlerCount()
      ? partyMemberIndex
      : -1;
    this.player = player;
  }

  getParty(): Pokemon[] {
    return this.player ? this.scene.getPlayerParty() : this.scene.getEnemyParty();
  }

  getPokemon(): Pokemon {
    return this.getParty()[this.partyMemberIndex];
  }

  end(): void {
    // 기존 결과 가져오기
    const result = this.getResult();

    // 추가 정보 로깅
    const logData = {
      ...result,
      phase: "Party Member Pokemon Phase",
      partyMemberIndex: this.partyMemberIndex,
      fieldIndex: this.fieldIndex,
      player: this.player ? "Player" : "Enemy",
      pokemon: this.getPokemon().getName(), // 가상의 getName() 메서드 사용
    };

    console.log(JSON.stringify(logData, null, 2)); // JSON 형식으로 로깅
    super.end(); // 상위 클래스의 end() 호출
  }
}
