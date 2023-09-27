import { action, makeAutoObservable, observable, configure } from 'mobx';
import {
  BgLayoutItemType,
  Status,
  GameResultStatus,
  PunishEnum,
} from '@/typings';
import message from '@/components/message/message';
import { GRIDROWS, MINVIEWDISTANCE } from '@/const';
import * as PIXI from 'pixi.js';
import roleStore from './roleStore';
import level1 from '@/assets/levels/level-1.json';
import level2 from '@/assets/levels/level-2.json';

configure({ enforceActions: 'never' });

const levelMap: any = {
  1: level1,
  2: level2,
};

class GlobalStore {
  // 关卡
  level = 1;
  // 游戏状态
  status: Status = 0;
  // 二维数组
  bgLayout: BgLayoutItemType[][] = [[]];
  // 对局显示
  showGameModal = false;
  // 对局是否结束
  isEnd = false;

  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  init() {
    const dataJson = levelMap[this.level];
    for (let i = 0; i < dataJson.length; i++) {
      for (let j = 0; j < dataJson[i].length; j++) {
        if (dataJson[i][j] === BgLayoutItemType.main) {
          roleStore.mainPosition = { x: j, y: i };
        } else if (dataJson[i][j] === BgLayoutItemType.end) {
          roleStore.endRect = { x: j, y: i };
        }
      }
    }
    this.bgLayout = dataJson;
  }

  /**
   * 是否可以走
   * @param x
   * @param y
   * @returns
   */
  isCanWalk = (x: number, y: number) => {
    if (!this.bgLayout[y]) {
      return false;
    }
    const type = this.bgLayout[y][x];
    return typeof type === 'number' && type !== BgLayoutItemType.obstacle;
  };

  /**失败处理 */
  failHandler() {
    let valuesArr = Object.values(PunishEnum);
    valuesArr.splice(0, valuesArr.length / 2);
    console.log(3333, [...valuesArr]);
    if (roleStore.viewDistance <= MINVIEWDISTANCE) {
      valuesArr.splice(valuesArr.indexOf(PunishEnum.reduceView), 1);
    }
    if (roleStore.isReverse) {
      valuesArr.splice(valuesArr.indexOf(PunishEnum.reverse), 1);
    }
    console.log(valuesArr, roleStore.isReverse);
    if (!valuesArr.length) {
      return;
    }
    const len = valuesArr.length;
    const index = Math.floor(Math.random() * len);
    const value = valuesArr[index];

    if (value === PunishEnum.reduceView) {
      roleStore.getNewView('reduce');
      message.warning('视野范围减小');
    } else if (value === PunishEnum.reverse) {
      message.warning('方向混乱');
      roleStore.isReverse = true;
    }
    console.log('Punish---', value);
  }

  /**游戏结算 */
  @action
  gameSettlement(status: GameResultStatus) {
    console.log('status', status);
    if (status === GameResultStatus.win) {
      roleStore.getNewView('add');
    } else if (status === GameResultStatus.loss) {
      this.failHandler();
    }
    this.isEnd = true;
    // this.showGameModal = false;
    this.status = Status.normal;
  }

  @action
  winGame() {
    // this.status = Status.stop;
    this.level++;
    this.init();
    message.success('恭喜通关');
  }
}

const globalStore = new GlobalStore();

export default globalStore;
