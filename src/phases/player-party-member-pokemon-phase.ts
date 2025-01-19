import BattleScene from "#app/battle-scene";
import { PlayerPokemon } from "#app/field/pokemon";
import { PartyMemberPokemonPhase } from "./party-member-pokemon-phase";

export abstract class PlayerPartyMemberPokemonPhase extends PartyMemberPokemonPhase {
  constructor(scene: BattleScene, partyMemberIndex: integer) {
    super(scene, partyMemberIndex, true);
  }

  getPlayerPokemon(): PlayerPokemon {
    return super.getPokemon() as PlayerPokemon;
  }

  /**
   * Override end method to log results
   */
  end() {
    console.log(JSON.stringify(this.getResult(), null, 2));
    super.end();
  }

  /**
   * Returns phase results
   */
  getResult(): object {
    const playerPokemon = this.getPlayerPokemon();
    return {
      phase: "PlayerPartyMemberPokemonPhase",
      status: "completed",
      pokemon: {
        name: playerPokemon.getName(),
        hp: playerPokemon.hp,
        maxHp: playerPokemon.getMaxHp(),
        status: playerPokemon.status ?? "Healthy",
        moves: playerPokemon.moveset.map((move) => ({
          name: move!.getMove(),
          ppUsed: move!.ppUsed,
          maxPP: move!.getMovePp(),
        })),
      },
    };
  }
}
