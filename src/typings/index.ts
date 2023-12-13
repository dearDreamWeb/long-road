import * as PIXI from 'pixi.js';

/**决斗，输了路径去除回到原点，赢了获取开墙道具；保护道具；回到原点陷阱 */
export enum BgLayoutItemType {
  empty = 0, // 可以走
  obstacle = 1, // 障碍物
  main = 2, //主角
  end = 3, // 终点
  route = 4, // 走过的路径
  duel = 5, // 决斗
  protect = 6, // 保护卡
  backTo = 7, // 回到原点
}

/**游戏状态 */
export enum Status {
  normal = 0,
  stop = 1,
}

/**游戏结果 */
export enum GameResultStatus {
  // 赢
  win = 0,
  // 输
  loss = 1,
  // 平
  tie = 2,
}

/**人物材质 */
export interface TextureCacheObj {
  left: PIXI.Texture<PIXI.Resource>[];
  right: PIXI.Texture<PIXI.Resource>[];
  up: PIXI.Texture<PIXI.Resource>[];
  down: PIXI.Texture<PIXI.Resource>[];
}

/**惩罚 */
export enum PunishEnum {
  // 减少视野
  reduceView = 0,
  // 方向是反的
  reverse = 1,
}

/**奖励 */
export enum AwardEnum {
  // 增加视野
  addView = 0,
  // 方向正常
  reverse = 1,
  // 净化
  purify = 2,
}
