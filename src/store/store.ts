import { makeAutoObservable } from 'mobx';
import { BgLayoutItemType } from '@/pages/index';

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
  [13, 20],
  [18, 20],
  [21, 20],
  [15, 21],
  [18, 21],
  [19, 21],
  [20, 21],
  [21, 21],
  [22, 21],
  [15, 22],
  [18, 22],
  [21, 22],
  [23, 22],
  [24, 22],
  [15, 23],
  [20, 23],
  [15, 24],
  [18, 24],
];

class GlobalStore {
  WIDTH = 700;
  HEIGHT = 700;
  GRIDROWS = 25;
  GRIDWIDTH = this.WIDTH / this.GRIDROWS;
  GRIDHEIGHT = this.HEIGHT / this.GRIDROWS;
  count = 1;
  // 二维数组
  bgLayout: BgLayoutItemType[][] = [[]];
  // 障碍物
  obstacleArr: number[][] = obstacleArr;

  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  init() {
    let obstacleAll: BgLayoutItemType[][] = [];
    for (let i = 0; i < this.GRIDROWS; i++) {
      obstacleAll.push(new Array(25).fill(0));
    }

    this.obstacleArr.forEach((item) => {
      obstacleAll[item[1]][item[0]] = 1;
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
}

const globalStore = new GlobalStore();

export default globalStore;
