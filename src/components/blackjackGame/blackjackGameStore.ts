import { action, makeAutoObservable, observable, configure } from 'mobx';
configure({ enforceActions: 'never' });

interface PlayerInfo {
  cardList: number[];
  count: number;
}

class BlackjackGame {
  playerInfo!: PlayerInfo;
  computerInfo!: PlayerInfo;
  isOver!: boolean;
  isWin!: boolean;
  constructor() {
    makeAutoObservable(this);
    this.resetData();
  }

  @action
  resetData() {
    const playerCount1 = this.getRandomNum();
    const playerCount2 = this.getRandomNum();
    this.playerInfo = {
      cardList: [playerCount1, playerCount2],
      count: playerCount1 + playerCount2,
    };
    const computerCount1 = this.getRandomNum();
    this.computerInfo = {
      cardList: [computerCount1],
      count: computerCount1,
    };
    this.isOver = false;
    this.isWin = false;
  }

  @action
  addCard(isPlayer: boolean, num: number) {
    if (this.isOver) {
      return;
    }
    if (isPlayer) {
      this.playerInfo = {
        cardList: [...this.playerInfo.cardList, num],
        count: this.playerInfo.count + num,
      };
      this.isOver21(isPlayer, this.playerInfo.count);
      return;
    }
    this.computerInfo = {
      cardList: [...this.computerInfo.cardList, num],
      count: this.computerInfo.count + num,
    };
    this.isOver21(isPlayer, this.computerInfo.count);
  }

  isOver21(isPlayer: boolean, num: number) {
    console.log('----', this.playerInfo, this.computerInfo);
    if (num < 21) {
      return;
    }
    this.isOver = true;
    this.isWin = num === 21 ? isPlayer : !isPlayer;
    console.log('--result--', this);
  }

  @action
  getRandomNum() {
    return Math.floor(Math.random() * 10) + 1;
  }

  @action
  async autoCard() {
    if (this.isOver) {
      return;
    }
    if (this.computerInfo.count < this.playerInfo.count) {
      this.addCard(false, this.getRandomNum());
      if (this.isOver) {
        return;
      }
      if (this.computerInfo.count <= this.playerInfo.count) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await this.autoCard();
      } else if (this.computerInfo.count > 21) {
        this.isOver = true;
        this.isWin = true;
        console.log('--result1--', JSON.parse(JSON.stringify(this)));
      } else {
        this.isOver = true;
        this.isWin = false;
        console.log('--result2--', JSON.parse(JSON.stringify(this)));
      }
    } else {
      this.isOver = true;
      this.isWin = false;
      console.log('--result3--', JSON.parse(JSON.stringify(this)));
    }
  }
}
const blackjackGameStore = new BlackjackGame();
export default blackjackGameStore;
