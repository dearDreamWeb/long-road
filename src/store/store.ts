import { action, makeAutoObservable, observable, configure } from 'mobx';
import {
  BgLayoutItemType,
  Status,
  GameResultStatus,
  TextureCacheObj,
} from '@/typings';
import message from '@/components/message/message';
import { GRIDROWS } from '@/const';
import * as PIXI from 'pixi.js';

configure({ enforceActions: 'never' });

const obstacleArr = [
  [5, 0],
  [7, 0],
  [6, 1],
  [7, 1],
  [8, 1],
  [10, 1],
  [11, 1],
  [12, 1],
  [16, 1],
  [17, 1],
  [9, 2],
  [12, 2],
  [13, 2],
  [15, 2],
  [17, 2],
  [0, 3],
  [6, 3],
  [0, 4],
  [1, 4],
  [6, 4],
  [9, 4],
  [10, 4],
  [11, 4],
  [12, 4],
  [13, 4],
  [14, 4],
  [15, 4],
  [16, 4],
  [17, 4],
  [21, 4],
  [2, 5],
  [6, 5],
  [14, 5],
  [2, 6],
  [6, 6],
  [17, 6],
  [18, 6],
  [22, 6],
  [3, 7],
  [6, 7],
  [8, 7],
  [10, 7],
  [14, 7],
  [15, 7],
  [16, 7],
  [19, 7],
  [22, 7],
  [23, 7],
  [2, 8],
  [3, 8],
  [7, 8],
  [12, 8],
  [13, 8],
  [14, 8],
  [18, 8],
  [21, 8],
  [23, 8],
  [1, 9],
  [4, 9],
  [6, 9],
  [8, 9],
  [23, 9],
  [3, 10],
  [10, 10],
  [14, 10],
  [19, 10],
  [22, 10],
  [0, 11],
  [4, 11],
  [8, 11],
  [12, 11],
  [6, 12],
  [13, 12],
  [15, 12],
  [19, 12],
  [0, 13],
  [3, 13],
  [8, 13],
  [9, 13],
  [10, 13],
  [13, 13],
  [14, 13],
  [16, 13],
  [3, 14],
  [6, 14],
  [11, 14],
  [15, 14],
  [16, 14],
  [22, 14],
  [1, 15],
  [5, 15],
  [12, 15],
  [14, 15],
  [17, 15],
  [3, 16],
  [8, 16],
  [9, 16],
  [11, 16],
  [13, 16],
  [15, 16],
  [17, 16],
  [18, 16],
  [19, 16],
  [20, 16],
  [21, 16],
  [0, 17],
  [3, 17],
  [11, 17],
  [12, 17],
  [15, 17],
  [17, 17],
  [22, 17],
  [1, 18],
  [4, 18],
  [6, 18],
  [7, 18],
  [12, 18],
  [13, 18],
  [14, 18],
  [22, 18],
  [5, 19],
  [9, 19],
  [10, 19],
  [14, 19],
  [15, 19],
  [18, 19],
  [21, 19],
  [3, 20],
  [7, 20],
  [10, 20],
  [14, 20],
  [18, 20],
  [21, 20],
  [18, 21],
  [19, 21],
  [20, 21],
  [21, 21],
  [22, 21],
  [9, 22],
  [15, 22],
  [18, 22],
  [21, 22],
  [23, 22],
  [24, 22],
  [10, 23],
  [11, 23],
  [12, 23],
  [13, 23],
  [14, 23],
  [20, 23],
  [18, 24],
];
const duelArr = [
  [13, 24],
  [13, 0],
];
// 最小视野范围
const MINVIEWDISTANCE = 2;

class GlobalStore {
  // 关卡
  leave = 1;
  // 视野距离
  viewDistance = 5;
  // 游戏状态
  status: Status = 0;
  // 二维数组
  bgLayout: BgLayoutItemType[][] = [[]];
  // 障碍物
  obstacleArr: number[][] = obstacleArr;
  // 决斗
  duelArr: number[][] = duelArr;
  // 对局显示
  showGameModal = false;
  // 人物textures
  heroTextures: TextureCacheObj = { left: [], right: [], up: [], down: [] };
  // 人物组帧动画精灵图
  animatedSprite: PIXI.AnimatedSprite | any = {};
  // 人物方向
  direction: keyof TextureCacheObj = 'down';

  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  init() {
    let obstacleAll: BgLayoutItemType[][] = [];
    for (let i = 0; i < GRIDROWS; i++) {
      obstacleAll.push(new Array(25).fill(0));
    }

    this.obstacleArr.forEach((item) => {
      obstacleAll[item[1]][item[0]] = BgLayoutItemType.obstacle;
    });
    this.duelArr.forEach((item) => {
      obstacleAll[item[1]][item[0]] = BgLayoutItemType.duel;
    });
    this.bgLayout = obstacleAll;
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

  /**新的视野范围 */
  getNewView(type: 'add' | 'redunce') {
    if (type === 'add') {
      this.viewDistance++;
      return;
    }
    this.viewDistance = Math.max(this.viewDistance - 1, MINVIEWDISTANCE);
  }

  /**游戏结算 */
  @action
  gameSettlement(status: GameResultStatus) {
    console.log('status', status);
    if (status === GameResultStatus.win) {
      this.getNewView('add');
      message.success('游戏胜利');
      console.log('win');
    } else if (status === GameResultStatus.loss) {
      this.getNewView('redunce');
      message.warning('游戏失败');
      console.log('loss');
    }
    this.showGameModal = false;
    globalStore.status = Status.normal;
  }
}

const globalStore = new GlobalStore();

export default globalStore;
