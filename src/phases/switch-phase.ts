import BattleScene from "#app/battle-scene";
import PartyUiHandler, { PartyOption, PartyUiMode } from "#app/ui/party-ui-handler";
import { Mode } from "#app/ui/ui";
import { SwitchType } from "#enums/switch-type";
import { BattlePhase } from "./battle-phase";
import { PostSummonPhase } from "./post-summon-phase";
import { SwitchSummonPhase } from "./switch-summon-phase";

export class SwitchPhase extends BattlePhase {
  protected readonly fieldIndex: integer;
  private readonly switchType: SwitchType;
  private readonly isModal: boolean;
  private readonly doReturn: boolean;

  constructor(scene: BattleScene, switchType: SwitchType, fieldIndex: integer, isModal: boolean, doReturn: boolean) {
    super(scene);

    this.switchType = switchType;
    this.fieldIndex = fieldIndex;
    this.isModal = isModal;
    this.doReturn = doReturn;
  }

  start() {
    super.start();

    if (this.isModal && !this.scene.getPlayerParty().filter(p => p.isAllowedInBattle() && !p.isActive(true)).length) {
      return super.end();
    }

    if (this.isModal && !this.doReturn && !this.scene.getPlayerParty()[this.fieldIndex].isFainted()) {
      return super.end();
    }

    if (this.isModal && this.scene.getPlayerField().filter(p => p.isAllowedInBattle() && p.isActive(true)).length >= this.scene.currentBattle.getBattlerCount()) {
      return super.end();
    }

    const fieldIndex = this.scene.currentBattle.getBattlerCount() === 1 || this.scene.getPokemonAllowedInBattle().length > 1 ? this.fieldIndex : 0;

    this.scene.ui.setMode(Mode.PARTY, this.isModal ? PartyUiMode.FAINT_SWITCH : PartyUiMode.POST_BATTLE_SWITCH, fieldIndex, (slotIndex: integer, option: PartyOption) => {
      if (slotIndex >= this.scene.currentBattle.getBattlerCount() && slotIndex < 6) {
        this.scene.tryRemovePhase(p => p instanceof PostSummonPhase && p.player && p.fieldIndex === this.fieldIndex);
        const switchType = (option === PartyOption.PASS_BATON) ? SwitchType.BATON_PASS : this.switchType;
        this.scene.unshiftPhase(new SwitchSummonPhase(this.scene, switchType, fieldIndex, slotIndex, this.doReturn));
      }
      this.scene.ui.setMode(Mode.MESSAGE).then(() => super.end());
    }, PartyUiHandler.FilterNonFainted);
  }

  /**
   * Phase 종료 시 결과를 반환.
   */
  getResult(): object {
    return {
      phase: "SwitchPhase",
      fieldIndex: this.fieldIndex,
      switchType: this.switchType,
      isModal: this.isModal,
      doReturn: this.doReturn,
      status: "completed"
    };
  }

  /**
   * Phase 종료 시 결과를 콘솔에 로깅.
   */
  private logResult(): void {
    console.log(JSON.stringify(this.getResult(), null, 2));
  }

  /**
   * Phase 종료 시 호출되는 메서드.
   */
  end(): void {
    this.logResult(); // 결과를 로그
    super.end();
  }
}
